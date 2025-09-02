import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// Helper function to handle different webhook events
async function handleWebhookEvent(event: any) {
  console.log("Processing webhook event:", event.event, event.payload);

  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload);
        break;

      case "order.paid":
        await handleOrderPaid(event.payload);
        break;

      case "refund.processed":
        await handleRefundProcessed(event.payload);
        break;

      case "refund.failed":
        await handleRefundFailed(event.payload);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    throw error;
  }
}

// Handle payment captured event
async function handlePaymentCaptured(payload: any) {
  const { payment } = payload.payment.entity;
  const { order_id } = payload.payment.entity;

  // Check if payment record exists (it might not if order was created after verification)
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("razorpay_order_id", order_id)
    .single();

  if (paymentError || !paymentRecord) {
    console.log(
      "Payment record not found for order_id:",
      order_id,
      "This is expected if order was created after verification"
    );
    return; // Don't throw error, just log and return
  }

  // Update payment record
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      razorpay_payment_id: payment.id,
      payment_status: "captured",
      webhook_received: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.id);

  if (updatePaymentError) {
    console.error(
      "Error updating payment for payment.captured:",
      updatePaymentError
    );
    throw updatePaymentError;
  }

  // Update order status
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      latest_payment_id: paymentRecord.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.order_id);

  if (orderError) {
    console.error("Error updating order for payment.captured:", orderError);
    throw orderError;
  }

  console.log("Payment and order updated for payment.captured:", order_id);
}

// Handle payment failed event
async function handlePaymentFailed(payload: any) {
  const { payment } = payload.payment.entity;
  const { order_id } = payload.payment.entity;

  // Check if payment record exists (it might not if order was created after verification)
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("razorpay_order_id", order_id)
    .single();

  if (paymentError || !paymentRecord) {
    console.log(
      "Payment record not found for order_id:",
      order_id,
      "This is expected if order was created after verification"
    );
    return; // Don't throw error, just log and return
  }

  // Update payment record
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      razorpay_payment_id: payment.id,
      payment_status: "failed",
      webhook_received: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.id);

  if (updatePaymentError) {
    console.error(
      "Error updating payment for payment.failed:",
      updatePaymentError
    );
    throw updatePaymentError;
  }

  // Update order status
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      status: "cancelled",
      latest_payment_id: paymentRecord.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.order_id);

  if (orderError) {
    console.error("Error updating order for payment.failed:", orderError);
    throw orderError;
  }

  console.log("Payment and order updated for payment.failed:", order_id);
}

// Handle order paid event
async function handleOrderPaid(payload: any) {
  const { order } = payload.order.entity;

  // Check if payment record exists (it might not if order was created after verification)
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("razorpay_order_id", order.id)
    .single();

  if (paymentError || !paymentRecord) {
    console.log(
      "Payment record not found for order_id:",
      order.id,
      "This is expected if order was created after verification"
    );
    return; // Don't throw error, just log and return
  }

  // Update payment record
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      payment_status: "captured",
      webhook_received: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.id);

  if (updatePaymentError) {
    console.error("Error updating payment for order.paid:", updatePaymentError);
    throw updatePaymentError;
  }

  // Update order status
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      latest_payment_id: paymentRecord.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.order_id);

  if (orderError) {
    console.error("Error updating order for order.paid:", orderError);
    throw orderError;
  }

  console.log("Payment and order updated for order.paid:", order.id);
}

// Handle refund processed event
async function handleRefundProcessed(payload: any) {
  const { refund } = payload.refund.entity;
  const { order_id } = payload.refund.entity;

  // Check if payment record exists (it might not if order was created after verification)
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("razorpay_order_id", order_id)
    .single();

  if (paymentError || !paymentRecord) {
    console.log(
      "Payment record not found for order_id:",
      order_id,
      "This is expected if order was created after verification"
    );
    return; // Don't throw error, just log and return
  }

  // Update payment record
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      razorpay_refund_id: refund.id,
      payment_status: "refunded",
      webhook_received: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.id);

  if (updatePaymentError) {
    console.error(
      "Error updating payment for refund.processed:",
      updatePaymentError
    );
    throw updatePaymentError;
  }

  // Update order status
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      status: "cancelled",
      latest_payment_id: paymentRecord.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRecord.order_id);

  if (orderError) {
    console.error("Error updating order for refund.processed:", orderError);
    throw orderError;
  }

  console.log("Payment and order updated for refund.processed:", order_id);
}

// Handle refund failed event
async function handleRefundFailed(payload: any) {
  const { refund } = payload.refund.entity;
  const { order_id } = payload.refund.entity;

  console.log("Refund failed for order:", order_id, "Refund ID:", refund.id);
  // You might want to log this or send notifications
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    if (!signature) {
      console.error("No signature found in webhook request");
      return new NextResponse("No signature found", { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Webhook signature mismatch", {
        expectedSignature,
        signature,
        bodyLength: rawBody.length,
      });
      return new NextResponse("Signature mismatch", { status: 400 });
    }

    // Parse the webhook payload
    const event = JSON.parse(rawBody);

    // Process the webhook event
    await handleWebhookEvent(event);

    // Respond with 200 to acknowledge receipt
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
