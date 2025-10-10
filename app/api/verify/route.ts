import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrderFromCheckout } from "@/lib/order-utils";
import { CheckoutStore } from "@/lib/checkout-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
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

    // Verify payment signature
    const body_signature = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body_signature.toString())
      .digest("hex");

    const isSignatureValid = expected_signature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Invalid payment signature:", {
        expected: expected_signature,
        received: razorpay_signature,
        body_signature,
      });
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    console.log("Payment verified successfully:", {
      razorpay_order_id,
      razorpay_payment_id,
      checkoutId,
    });

    // If checkoutId is provided, create order in database
    if (checkoutId) {
      try {
        // First, update the checkout session payment status to "paid"
        const updatedSession = await CheckoutStore.updatePaymentStatus(
          checkoutId,
          "paid"
        );

        if (!updatedSession) {
          throw new Error("Failed to update checkout session payment status");
        }

        console.log("Checkout session payment status updated to 'paid'");

        // Now create the order
        const orderResult = await createOrderFromCheckout({
          checkoutId: checkoutId,
          paymentMethod: "online",
          paymentStatus: "paid",
          paymentTransactionId: razorpay_payment_id,
          orderStatus: "confirmed",
          status: "confirmed",
        });

        console.log("Order created successfully:", orderResult);

        // Debug: Log delivery fee data for debugging
        console.log("🔍 Delivery Fee Debug - Order Created:", {
          orderId: orderResult.orderId,
          deliveryFeeStored: orderResult.deliveryFeeData,
          message: "Delivery fee successfully stored in database",
        });

        return NextResponse.json({
          success: true,
          orderId: orderResult.orderId,
          paymentId: razorpay_payment_id,
          deliveryFeeData: orderResult.deliveryFeeData,
          message: "Payment verified and order created successfully",
        });
      } catch (orderError) {
        console.error("Error creating order:", orderError);
        return NextResponse.json(
          {
            success: false,
            error: `Payment verified but order creation failed: ${
              orderError instanceof Error ? orderError.message : "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }
    }

    // If no checkoutId, just return verification success
    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
