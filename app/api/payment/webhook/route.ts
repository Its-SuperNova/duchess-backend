import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { CheckoutStore } from "@/lib/checkout-store";
import { createOrderFromCheckout } from "@/lib/order-utils";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("Missing Razorpay webhook secret");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing Razorpay signature in webhook");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature:", {
        expected: expectedSignature,
        received: signature,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Razorpay webhook received:", event);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Find checkout session by Razorpay order ID
      const checkoutSession =
        CheckoutStore.getSessionByRazorpayOrderId(orderId);

      if (!checkoutSession) {
        console.error("Checkout session not found for order ID:", orderId);
        return NextResponse.json(
          { error: "Checkout session not found" },
          { status: 404 }
        );
      }

      // Check if order is already marked as paid (idempotency)
      if (checkoutSession.paymentStatus === "paid") {
        console.log(
          "Payment already processed for checkout:",
          checkoutSession.checkoutId
        );
        return NextResponse.json({
          success: true,
          message: "Already processed",
        });
      }

      // Update payment status to paid
      CheckoutStore.updatePaymentStatus(
        checkoutSession.checkoutId,
        "paid",
        orderId,
        payment.id,
        payment.signature
      );

      console.log("Payment captured and marked as paid:", {
        checkoutId: checkoutSession.checkoutId,
        paymentId: payment.id,
        orderId: orderId,
      });

      // If order doesn't exist in database yet, create it
      if (!checkoutSession.databaseOrderId) {
        try {
          const orderResult = await createOrderFromCheckout({
            checkoutId: checkoutSession.checkoutId,
            paymentMethod: "online",
            paymentStatus: "paid",
            paymentTransactionId: payment.id,
            orderStatus: "confirmed",
            status: "confirmed",
          });

          console.log("Order created via webhook:", orderResult.orderId);
        } catch (orderError) {
          console.error("Error creating order via webhook:", orderError);
        }
      }

      return NextResponse.json({ success: true });
    }

    // Handle other events if needed
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      const checkoutSession =
        CheckoutStore.getSessionByRazorpayOrderId(orderId);
      if (checkoutSession) {
        CheckoutStore.updatePaymentStatus(checkoutSession.checkoutId, "failed");
        console.log("Payment failed for checkout:", checkoutSession.checkoutId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
