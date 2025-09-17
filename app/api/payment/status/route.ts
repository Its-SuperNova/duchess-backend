import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CheckoutStore } from "@/lib/checkout-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const checkoutId = searchParams.get("checkoutId");

    if (!orderId || !checkoutId) {
      return NextResponse.json(
        { error: "Order ID and Checkout ID are required" },
        { status: 400 }
      );
    }

    console.log("🔍 [Payment Status] Checking payment status for:", {
      orderId,
      checkoutId,
    });

    // First, check checkout session status (fastest check)
    try {
      const checkoutSession = await CheckoutStore.getSession(checkoutId);
      if (checkoutSession && checkoutSession.paymentStatus === "paid") {
        console.log(
          "✅ [Payment Status] Payment confirmed in checkout session:",
          checkoutSession.checkoutId
        );
        return NextResponse.json({
          status: "paid",
          orderId: checkoutSession.databaseOrderId || orderId,
          paymentStatus: "paid",
          message: "Payment confirmed via checkout session",
          source: "checkout_session",
        });
      }
    } catch (error) {
      console.log("Checkout session check failed:", error);
    }

    // Check if order exists in database (indicates successful payment)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.log(
        "📋 [Payment Status] Order not found in database:",
        orderError
      );
    } else if (order && order.payment_status === "paid") {
      console.log("✅ [Payment Status] Payment confirmed in database:", order);
      return NextResponse.json({
        status: "paid",
        orderId: order.id,
        paymentStatus: order.payment_status,
        message: "Payment confirmed via database",
        source: "database",
      });
    }

    // If order exists but payment not confirmed, check Razorpay directly
    try {
      const razorpay = require("razorpay");
      const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      // Get payment details from Razorpay
      const payments = await instance.orders.fetchPayments(orderId);

      if (payments && payments.items && payments.items.length > 0) {
        const payment = payments.items[0];
        if (payment.status === "captured") {
          console.log(
            "✅ [Payment Status] Payment confirmed via Razorpay API:",
            payment
          );

          // Update checkout session if payment is confirmed
          try {
            await CheckoutStore.updateSession(checkoutId, {
              paymentStatus: "paid",
              razorpayOrderId: orderId,
            });
          } catch (updateError) {
            console.log("Failed to update checkout session:", updateError);
          }

          return NextResponse.json({
            status: "paid",
            orderId: orderId,
            paymentId: payment.id,
            paymentStatus: "captured",
            message: "Payment confirmed via Razorpay API",
            source: "razorpay_api",
          });
        }
      }
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
    }

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
