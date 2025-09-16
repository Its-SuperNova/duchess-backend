import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { checkoutId } = body;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    // Get checkout session
    const checkoutSession = await CheckoutStore.getSession(checkoutId);
    if (!checkoutSession) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    // Reset payment status to pending
    await CheckoutStore.updateSession(checkoutId, {
      paymentStatus: "pending",
      razorpayOrderId: undefined,
      razorpayPaymentId: undefined,
      razorpaySignature: undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Payment status reset successfully",
    });
  } catch (error) {
    console.error("Error resetting payment status:", error);
    return NextResponse.json(
      { error: "Failed to reset payment status" },
      { status: 500 }
    );
  }
}
