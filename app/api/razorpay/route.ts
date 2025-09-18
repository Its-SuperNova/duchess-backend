import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", checkoutId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay key secret");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create a shorter receipt ID (max 40 characters for Razorpay)
    const receiptId = checkoutId
      ? `rcpt_${checkoutId.slice(-20)}` // Use last 20 chars of checkoutId
      : `rcpt_${Date.now().toString().slice(-10)}`; // Use last 10 digits of timestamp

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency,
      receipt: receiptId,
      notes: {
        checkoutId: checkoutId || "direct_payment",
      },
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created:", order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
