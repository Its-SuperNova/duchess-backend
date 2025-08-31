import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// Helper function to update payment and order status in database
async function markPaymentVerified(
  localOrderId: string, 
  razorpayPaymentId: string, 
  razorpayOrderId: string,
  paymentAmount: number
) {
  try {
    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: razorpayPaymentId,
        payment_status: "captured",
        signature_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", localOrderId)
      .eq("razorpay_order_id", razorpayOrderId)
      .select("id")
      .single();

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
      throw paymentError;
    }

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        latest_payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", localOrderId)
      .select("id")
      .single();

    if (orderError) {
      console.error("Error updating order:", orderError);
      throw orderError;
    }

    return { payment, order };
  } catch (error) {
    console.error("Failed to update payment and order:", error);
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
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      localOrderId,
    } = body;

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

        // Signature verified - update payment and order status
    // Get payment record to verify amount
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("amount, order_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get order to verify user ownership
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", payment.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify user owns this order
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user || user.id !== order.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update payment and order status
    await markPaymentVerified(
      payment.order_id, 
      razorpay_payment_id, 
      razorpay_order_id,
      payment.amount
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      localOrderId: payment.order_id, // Return the local order ID
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
