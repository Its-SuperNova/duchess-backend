import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    // Get checkout session
    const session = await CheckoutStore.getSession(checkoutId);

    if (!session) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    // Determine session status for better UX handling
    let status: "active" | "expired" | "completed" | "failed" = "active";

    if (new Date() > new Date(session.expiresAt)) {
      status = "expired";
    } else if (session.paymentStatus === "paid" && session.databaseOrderId) {
      status = "completed";
    } else if (
      session.paymentStatus === "failed" ||
      session.paymentStatus === "cancelled"
    ) {
      status = "failed";
    }

    // Return session data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      status,
      checkout: {
        checkoutId: session.checkoutId,
        items: session.items,
        subtotal: session.subtotal,
        discount: session.discount,
        deliveryFee: session.deliveryFee,
        totalAmount: session.totalAmount,
        cgstAmount: session.cgstAmount,
        sgstAmount: session.sgstAmount,
        addressText: session.addressText,
        selectedAddressId: session.selectedAddressId,
        couponCode: session.couponCode,
        customizationOptions: session.customizationOptions,
        cakeText: session.cakeText,
        messageCardText: session.messageCardText,
        contactInfo: session.contactInfo,
        notes: session.notes,
        deliveryTiming: session.deliveryTiming,
        deliveryDate: session.deliveryDate,
        deliveryTimeSlot: session.deliveryTimeSlot,
        estimatedDeliveryTime: session.estimatedDeliveryTime,
        distance: session.distance,
        duration: session.duration,
        deliveryZone: session.deliveryZone,
        paymentStatus: session.paymentStatus,
        databaseOrderId: session.databaseOrderId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching checkout session:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkout session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = body;

    console.log("🔧 PATCH request to update checkout session:", {
      checkoutId,
      updates,
    });

    // Debug: Log financial data being updated
    if (updates.deliveryFee !== undefined || updates.subtotal !== undefined) {
      console.log("💰 Financial data in checkout update:", {
        subtotal: updates.subtotal,
        discount: updates.discount,
        deliveryFee: updates.deliveryFee,
        cgstAmount: updates.cgstAmount,
        sgstAmount: updates.sgstAmount,
        totalAmount: updates.totalAmount,
        addressText: updates.addressText,
        selectedAddressId: updates.selectedAddressId,
      });
    }

    // Update checkout session
    const updatedSession = await CheckoutStore.updateSession(
      checkoutId,
      updates
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    // Determine session status for better UX handling
    let status: "active" | "expired" | "completed" | "failed" = "active";

    if (new Date() > new Date(updatedSession.expiresAt)) {
      status = "expired";
    } else if (
      updatedSession.paymentStatus === "paid" &&
      updatedSession.databaseOrderId
    ) {
      status = "completed";
    } else if (
      updatedSession.paymentStatus === "failed" ||
      updatedSession.paymentStatus === "cancelled"
    ) {
      status = "failed";
    }

    return NextResponse.json({
      success: true,
      status,
      checkout: {
        checkoutId: updatedSession.checkoutId,
        items: updatedSession.items,
        subtotal: updatedSession.subtotal,
        discount: updatedSession.discount,
        deliveryFee: updatedSession.deliveryFee,
        totalAmount: updatedSession.totalAmount,
        cgstAmount: updatedSession.cgstAmount,
        sgstAmount: updatedSession.sgstAmount,
        addressText: updatedSession.addressText,
        selectedAddressId: updatedSession.selectedAddressId,
        couponCode: updatedSession.couponCode,
        customizationOptions: updatedSession.customizationOptions,
        cakeText: updatedSession.cakeText,
        messageCardText: updatedSession.messageCardText,
        contactInfo: updatedSession.contactInfo,
        notes: updatedSession.notes,
        deliveryTiming: updatedSession.deliveryTiming,
        deliveryDate: updatedSession.deliveryDate,
        deliveryTimeSlot: updatedSession.deliveryTimeSlot,
        estimatedDeliveryTime: updatedSession.estimatedDeliveryTime,
        distance: updatedSession.distance,
        duration: updatedSession.duration,
        deliveryZone: updatedSession.deliveryZone,
        paymentStatus: updatedSession.paymentStatus,
        databaseOrderId: updatedSession.databaseOrderId,
        createdAt: updatedSession.createdAt,
        expiresAt: updatedSession.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error updating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to update checkout session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    // Delete checkout session
    const deleted = await CheckoutStore.deleteSession(checkoutId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Checkout session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting checkout session:", error);
    return NextResponse.json(
      { error: "Failed to delete checkout session" },
      { status: 500 }
    );
  }
}
