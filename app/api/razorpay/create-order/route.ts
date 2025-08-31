import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// Helper function to save order to database
async function saveOrderToDB(orderData: any) {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (error) {
      console.error("Error saving order to DB:", error);
      throw error;
    }

    return order;
  } catch (error) {
    console.error("Failed to save order:", error);
    throw error;
  }
}

// Helper function to save payment to database
async function savePaymentToDB(paymentData: any) {
  try {
    const { data: payment, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select("id")
      .single();

    if (error) {
      console.error("Error saving payment to DB:", error);
      throw error;
    }

    return payment;
  } catch (error) {
    console.error("Failed to save payment:", error);
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

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      amountInRupees,
      currency = "INR",
      receipt,
      notes,
      orderMetadata = {}, // Additional order data like items, address, etc.
      // Complete order data from checkout
      subtotalAmount,
      discountAmount,
      deliveryFee,
      totalAmount,
      note,
      addressText,
      couponCode,
      couponId,
      contactInfo,
      deliveryAddressId,
      contactName,
      contactNumber,
      contactAlternateNumber,
      customizationOptions,
      itemTotal,
      cgstAmount,
      sgstAmount,
      paymentMethod,
      specialInstructions,
      // Cart items for order_items table
      cartItems,
    } = body;

    if (!amountInRupees || amountInRupees <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert rupees to paise (Razorpay expects amount in smallest currency unit)
    const amount = Math.round(amountInRupees * 100);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Create Razorpay order
    const orderOptions = {
      amount, // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // 1 to auto-capture payment
      notes: {
        ...notes,
        user_id: user.id,
        ...orderMetadata,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save order to our database with status "created"
    const localOrder = await saveOrderToDB({
      user_id: user.id,
      order_number: `ORD-${Date.now()}`,
      status: "pending",
      payment_status: "pending",
      // Financial information
      item_total: itemTotal || amountInRupees,
      delivery_charge: deliveryFee || 0,
      discount_amount: discountAmount || 0,
      cgst: cgstAmount || 0,
      sgst: sgstAmount || 0,
      total_amount: totalAmount || amountInRupees,
      // Customer notes and special requests
      notes: JSON.stringify({
        ...notes,
        specialInstructions: specialInstructions || note,
        customizationOptions: customizationOptions || {},
        addressText: addressText,
        deliveryAddressId: deliveryAddressId,
      }),
      // Customization options
      is_knife: customizationOptions?.addKnife || false,
      is_candle: customizationOptions?.addCandles || false,
      is_text_on_card: customizationOptions?.addTextOnCake || false,
      // Delivery timing
      delivery_timing: "same_day",
      // Contact information
      contact_name: contactName || session.user.name || "Customer",
      contact_number: contactNumber || "1234567890",
      // Coupon information
      is_coupon: !!couponCode,
      // Payment information
      payment_method: paymentMethod || "online",
      // Additional contact info
      contact_alternate_number: contactAlternateNumber,
      // Coupon details
      coupon_id: couponId,
      coupon_code: couponCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Save payment record to payments table
    const payment = await savePaymentToDB({
      order_id: localOrder.id,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInRupees,
      currency: currency,
      payment_status: "pending",
      payment_method: "razorpay",
      signature_verified: false,
      webhook_received: false,
      notes: {
        ...notes,
        user_id: user.id,
        ...orderMetadata,
      },
    });

    // Create order items if cart items are provided
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      console.log("Creating order items...");

      const orderItemsPayload = cartItems.map((item: any) => ({
        order_id: localOrder.id,
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
          customizationOptions || item.customization_options || {},

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
        // Try to rollback order and payment creation
        await supabase.from("payments").delete().eq("id", payment.id);
        await supabase.from("orders").delete().eq("id", localOrder.id);
        throw new Error("Failed to create order items");
      }

      console.log("Order items created successfully");
    }

    // Update order with payment reference
    await supabase
      .from("orders")
      .update({ latest_payment_id: payment.id })
      .eq("id", localOrder.id);

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      localOrderId: localOrder.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // only expose the public key
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
