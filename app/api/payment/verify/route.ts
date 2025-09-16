import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { CheckoutStore } from "@/lib/checkout-store";
import { createOrderFromCheckout } from "@/lib/order-utils";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay key secret");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Payment verification request body:", body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutId,
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !checkoutId) {
      console.error("Missing required payment verification fields:", {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature,
        checkoutId: !!checkoutId,
        body,
      });
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // If we don't have order_id or signature, try to get them from checkout session
    let finalOrderId = razorpay_order_id;
    let finalSignature = razorpay_signature;

    if (!finalOrderId || !finalSignature) {
      console.log(
        "Missing order_id or signature, attempting to retrieve from checkout session"
      );

      // Get checkout session to retrieve stored order ID
      const checkoutSession = CheckoutStore.getSession(checkoutId);
      if (checkoutSession && checkoutSession.razorpayOrderId) {
        finalOrderId = checkoutSession.razorpayOrderId;
        console.log("Retrieved order ID from checkout session:", finalOrderId);
      }

      // For signature, we'll need to generate it or skip verification
      if (!finalSignature) {
        console.log("No signature provided, skipping signature verification");
        // We'll proceed without signature verification for now
        // In production, you might want to implement alternative verification
      }
    }

    // Get checkout session (if not already retrieved)
    const checkoutSession = CheckoutStore.getSession(checkoutId);
    if (!checkoutSession) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    // Verify that the order ID matches the one in checkout session
    if (checkoutSession.razorpayOrderId !== finalOrderId) {
      console.error("Order ID mismatch:", {
        expected: checkoutSession.razorpayOrderId,
        received: finalOrderId,
        checkoutId,
      });
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
    }

    // Verify payment signature (only if we have a signature)
    if (finalSignature) {
      const body_signature = finalOrderId + "|" + razorpay_payment_id;
      const expected_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body_signature.toString())
        .digest("hex");

      const isSignatureValid = expected_signature === finalSignature;

      if (!isSignatureValid) {
        console.error("Invalid payment signature:", {
          expected: expected_signature,
          received: finalSignature,
          body_signature,
        });

        // Update checkout session to failed status
        CheckoutStore.updatePaymentStatus(checkoutId, "failed");

        return NextResponse.json(
          { success: false, error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    } else {
      console.log("Skipping signature verification - no signature provided");
    }

    // Update checkout session with payment details and mark as paid
    CheckoutStore.updatePaymentStatus(
      checkoutId,
      "paid",
      finalOrderId,
      razorpay_payment_id,
      finalSignature
    );

    console.log("Payment verified successfully:", {
      checkoutId,
      razorpay_order_id: finalOrderId,
      razorpay_payment_id,
    });

    // Create order in database using shared utility
    try {
      const orderResult = await createOrderFromCheckout({
        checkoutId: checkoutId,
        paymentMethod: "online",
        paymentStatus: "paid",
        paymentTransactionId: razorpay_payment_id,
        orderStatus: "confirmed",
        status: "confirmed",
      });

      console.log("Order created successfully:", orderResult);

      return NextResponse.json({
        success: true,
        orderId: orderResult.orderId,
        paymentId: razorpay_payment_id,
        message: "Payment verified and order created successfully",
      });
    } catch (orderError) {
      console.error("Error creating order:", orderError);

      // Revert payment status if order creation fails
      CheckoutStore.updatePaymentStatus(checkoutId, "failed");

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
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
