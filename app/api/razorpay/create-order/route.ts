import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount: amountInRupees,
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
        user_id: session.user.email,
        ...orderMetadata,
        // Store all order data in Razorpay notes for later use
        orderData: {
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
          cartItems,
        },
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // IMPORTANT: Do NOT save order or payment to database yet
    // Only create the Razorpay order and return the order ID
    // The actual order and payment will be created only after successful payment verification

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      // Return the Razorpay order ID as the temporary identifier
      // This will be used to link the payment verification with the order data
      razorpayOrderId: razorpayOrder.id,
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
