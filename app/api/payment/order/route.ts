import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay configuration");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = "INR", checkoutId } = body;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Get checkout session
    const checkoutSession = await CheckoutStore.getSession(checkoutId);
    if (!checkoutSession) {
      console.warn(
        "Checkout session not found, proceeding with basic order creation:",
        {
          checkoutId,
          amount: Math.round(amount / 100),
        }
      );

      // If checkout session is not found, we'll proceed with basic order creation
      // This can happen if the session expired or if database storage is not working
    } else {
      // Validate amount matches checkout session
      if (Math.round(amount / 100) !== checkoutSession.totalAmount) {
        console.error("Amount mismatch:", {
          provided: Math.round(amount / 100),
          expected: checkoutSession.totalAmount,
        });
        return NextResponse.json(
          { error: "Amount mismatch with checkout session" },
          { status: 400 }
        );
      }
    }

    // Create Razorpay order
    const razorpayOrderData = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `rcpt_${checkoutId.substring(0, 8)}_${Date.now()
        .toString()
        .slice(-8)}`, // Keep under 40 chars
      notes: {
        checkoutId: checkoutId,
        userEmail: checkoutSession?.userEmail || "unknown@example.com",
      },
    };

    console.log("Creating Razorpay order:", razorpayOrderData);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64")}`,
      },
      body: JSON.stringify(razorpayOrderData),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay order creation failed:", errorData);
      return NextResponse.json(
        { error: "Failed to create payment order" },
        { status: 500 }
      );
    }

    const orderData = await razorpayResponse.json();
    console.log("Razorpay order created:", orderData);

    // Store Razorpay order ID in checkout session (if session exists)
    if (checkoutSession) {
      await CheckoutStore.updateSession(checkoutId, {
        razorpayOrderId: orderData.id,
      });
    }

    // Return Razorpay order data
    return NextResponse.json({
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: orderData.status,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
