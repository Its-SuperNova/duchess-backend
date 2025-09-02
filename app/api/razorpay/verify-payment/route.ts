import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import Razorpay from "razorpay";

// Helper function to create order and payment records after successful payment
async function createOrderAndPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  paymentAmount: number,
  orderData: any,
  userId: string
) {
  try {
    // Create the order first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        status: "confirmed",
        payment_status: "paid",
        // Financial information
        item_total: orderData.itemTotal || paymentAmount,
        delivery_charge: orderData.deliveryFee || 0,
        discount_amount: orderData.discountAmount || 0,
        cgst: orderData.cgstAmount || 0,
        sgst: orderData.sgstAmount || 0,
        total_amount: orderData.totalAmount || paymentAmount,
        // Customer notes and special requests
        notes: JSON.stringify({
          specialInstructions: orderData.specialInstructions || orderData.note,
          customizationOptions: orderData.customizationOptions || {},
          addressText: orderData.addressText,
          deliveryAddressId: orderData.deliveryAddressId,
        }),
        // Customization options
        is_knife: orderData.customizationOptions?.addKnife || false,
        is_candle: orderData.customizationOptions?.addCandles || false,
        is_text_on_card: orderData.customizationOptions?.addTextOnCake || false,
        // Delivery timing
        delivery_timing: "same_day",
        // Contact information
        contact_name: orderData.contactName || "Customer",
        contact_number: orderData.contactNumber || "1234567890",
        // Coupon information
        is_coupon: !!orderData.couponCode,
        // Payment information
        payment_method: orderData.paymentMethod || "online",
        // Additional contact info
        contact_alternate_number: orderData.contactAlternateNumber,
        // Coupon details
        coupon_id: orderData.couponId,
        coupon_code: orderData.couponCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount: paymentAmount,
        currency: "INR",
        payment_status: "captured",
        payment_method: "razorpay",
        signature_verified: true,
        webhook_received: false,
        notes: {
          orderData: orderData,
          user_id: userId,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error("Error creating payment:", paymentError);
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("Failed to create payment");
    }

    // Update order with payment reference
    await supabase
      .from("orders")
      .update({ latest_payment_id: payment.id })
      .eq("id", order.id);

    // Create order items if cart items are provided
    if (
      orderData.cartItems &&
      Array.isArray(orderData.cartItems) &&
      orderData.cartItems.length > 0
    ) {
      console.log("Creating order items...");

      const orderItemsPayload = orderData.cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || item.id,

        // Product information (snapshot at time of order)
        product_name: item.name || item.product_name,
        product_image: item.image || item.product_image || null,
        product_description:
          item.description || item.product_description || null,
        category: item.category || null,

        // Quantity and pricing
        quantity: item.quantity,
        unit_price: item.price || item.unit_price || 0,
        total_price: (item.price || item.unit_price || 0) * item.quantity,

        // Product variant/customization
        variant: item.variant || null,
        customization_options:
          orderData.customizationOptions || item.customization_options || {},

        // Cake-specific customizations
        cake_text: item.cake_text || null,
        cake_flavor: item.cake_flavor || null,
        cake_size: item.cake_size || null,
        cake_weight: item.cake_weight || null,

        // Additional services for this item
        item_has_knife: item.add_knife || item.item_has_knife || false,
        item_has_candle: item.add_candles || item.item_has_candle || false,
        item_has_message_card:
          item.add_message_card || item.item_has_message_card || false,
        item_message_card_text:
          item.gift_card_text || item.item_message_card_text || null,

        // Item status tracking
        item_status: "pending",
        preparation_notes: null,
      }));

      console.log("Order items payload:", orderItemsPayload);
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (orderItemsError) {
        console.error("Failed to insert order items:", orderItemsError);
        // Rollback order and payment creation
        await supabase.from("payments").delete().eq("id", payment.id);
        await supabase.from("orders").delete().eq("id", order.id);
        throw new Error("Failed to create order items");
      }

      console.log("Order items created successfully");
    }

    return { payment, order };
  } catch (error) {
    console.error("Failed to create order and payment:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify signature using HMAC SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Construct expected signature: hmac_sha256(order_id + "|" + payment_id, key_secret)
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Signature mismatch", {
        generatedSignature,
        razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order data from Razorpay order notes
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (error) {
      console.error("Failed to fetch Razorpay order:", error);
      return NextResponse.json(
        { error: "Failed to fetch order details" },
        { status: 500 }
      );
    }

    // Extract order data from Razorpay notes
    const orderData = razorpayOrder.notes?.orderData;
    if (!orderData) {
      console.error("Order data not found in Razorpay notes");
      return NextResponse.json(
        { error: "Order data not found" },
        { status: 400 }
      );
    }

    // Get payment amount from Razorpay order
    const paymentAmount = (Number(razorpayOrder.amount) || 0) / 100; // Convert from paise to rupees

    // Create order and payment records in our database
    const { payment, order } = await createOrderAndPayment(
      razorpay_payment_id,
      razorpay_order_id,
      paymentAmount,
      orderData,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      localOrderId: order.id, // Return the newly created local order ID
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
