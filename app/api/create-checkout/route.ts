import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating checkout session with data:", body);

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!body.totalAmount || body.totalAmount <= 0) {
      return NextResponse.json(
        { error: "Valid total amount is required" },
        { status: 400 }
      );
    }

    // Create checkout session
    const checkoutSession = await CheckoutStore.createSession({
      userId: body.userId || null,
      userEmail: body.userEmail || null,
      items: body.items,
      subtotal: body.subtotal || 0,
      discount: body.discount || 0,
      deliveryFee: body.deliveryFee || 0,
      totalAmount: body.totalAmount,
      cgstAmount: body.cgstAmount || 0,
      sgstAmount: body.sgstAmount || 0,
      addressText: body.addressText || "",
      selectedAddressId: body.selectedAddressId || null,
      couponCode: body.couponCode || null,
      customizationOptions: body.customizationOptions || {},
      cakeText: body.cakeText || null,
      messageCardText: body.messageCardText || null,
      contactInfo: body.contactInfo || null,
      notes: body.notes || null,
      deliveryTiming: body.deliveryTiming || "same_day",
      deliveryDate: body.deliveryDate || null,
      deliveryTimeSlot: body.deliveryTimeSlot || null,
      estimatedDeliveryTime: body.estimatedDeliveryTime || null,
      distance: body.distance || null,
      duration: body.duration || null,
      deliveryZone: body.deliveryZone || null,
    });

    // Pre-create Razorpay order for instant payment modal
    let razorpayOrderId = null;
    try {
      console.log(
        "Pre-creating Razorpay order for checkout:",
        checkoutSession.checkoutId
      );

      const razorpayOrderData = {
        amount: Math.round(body.totalAmount * 100), // Convert to paise
        currency: "INR",
        receipt: `rcpt_${checkoutSession.checkoutId.substring(
          0,
          8
        )}_${Date.now().toString().slice(-8)}`,
        notes: {
          checkoutId: checkoutSession.checkoutId,
          userEmail: body.userEmail || "unknown@example.com",
        },
      };

      const razorpayResponse = await fetch(
        "https://api.razorpay.com/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64")}`,
          },
          body: JSON.stringify(razorpayOrderData),
        }
      );

      if (razorpayResponse.ok) {
        const orderData = await razorpayResponse.json();
        razorpayOrderId = orderData.id;
        console.log("Razorpay order pre-created:", orderData.id);

        // Store Razorpay order ID in checkout session
        await CheckoutStore.updateSession(checkoutSession.checkoutId, {
          razorpayOrderId: razorpayOrderId,
        });
      } else {
        console.warn(
          "Failed to pre-create Razorpay order, will create on demand"
        );
      }
    } catch (error) {
      console.warn("Error pre-creating Razorpay order:", error);
      // Don't fail checkout creation if Razorpay order creation fails
    }

    console.log("Checkout session created:", {
      checkoutId: checkoutSession.checkoutId,
      totalAmount: checkoutSession.totalAmount,
      itemsCount: checkoutSession.items.length,
    });

    return NextResponse.json({
      success: true,
      checkoutId: checkoutSession.checkoutId,
      message: "Checkout session created successfully",
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
