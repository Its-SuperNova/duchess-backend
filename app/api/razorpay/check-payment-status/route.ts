import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id } = await request.json();

    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: "Razorpay order ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking payment status for order:", razorpay_order_id);

    // First check if we have a payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from("payments")
      .select("id, payment_status, razorpay_payment_id, order_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (paymentError) {
      console.log("No payment record found for order:", razorpay_order_id);
      return NextResponse.json(
        {
          status: "pending",
          message: "Payment record not found, payment may still be processing",
        },
        { status: 200 }
      );
    }

    // Check payment status
    if (paymentRecord.payment_status === "captured") {
      return NextResponse.json({
        status: "success",
        message: "Payment completed successfully",
        orderId: paymentRecord.order_id,
        paymentId: paymentRecord.razorpay_payment_id,
      });
    } else if (paymentRecord.payment_status === "authorized") {
      return NextResponse.json({
        status: "authorized",
        message: "Payment authorized but not yet captured",
        orderId: paymentRecord.order_id,
        paymentId: paymentRecord.razorpay_payment_id,
      });
    } else if (paymentRecord.payment_status === "failed") {
      return NextResponse.json({
        status: "failed",
        message: "Payment failed",
        orderId: paymentRecord.order_id,
        paymentId: paymentRecord.razorpay_payment_id,
      });
    } else {
      return NextResponse.json({
        status: "pending",
        message: "Payment is still processing",
        orderId: paymentRecord.order_id,
        paymentId: paymentRecord.razorpay_payment_id,
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
