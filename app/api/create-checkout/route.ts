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
