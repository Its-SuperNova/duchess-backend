import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    console.log("Checking payment status for:", { orderId, checkoutId });

    // Check if order exists in database (indicates successful payment)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.log("Order not found in database:", orderError);
      return NextResponse.json({ status: "pending" });
    }

    if (order && order.payment_status === "paid") {
      console.log("Payment confirmed in database:", order);
      return NextResponse.json({
        status: "paid",
        orderId: order.id,
        paymentStatus: order.payment_status,
        message: "Payment confirmed",
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
          console.log("Payment confirmed via Razorpay:", payment);
          return NextResponse.json({
            status: "paid",
            orderId: orderId,
            paymentId: payment.id,
            paymentStatus: "captured",
            message: "Payment confirmed via Razorpay",
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
