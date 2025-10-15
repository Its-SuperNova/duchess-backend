import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";
import { supabase } from "@/lib/supabase";

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

    // Debug: Log contact info updates specifically
    if (updates.contactInfo) {
      console.log("📞 Contact info update received:", {
        contactInfo: updates.contactInfo,
        name: updates.contactInfo?.name,
        phone: updates.contactInfo?.phone,
        alternatePhone: updates.contactInfo?.alternatePhone,
      });
    }

    // Debug: Log note updates specifically
    if (updates.note !== undefined || updates.notes !== undefined) {
      console.log("📝 Note update received:", {
        note: updates.note,
        notes: updates.notes,
        noteType: typeof updates.note,
        notesType: typeof updates.notes,
        noteLength: updates.note?.length || 0,
        notesLength: updates.notes?.length || 0,
      });
    }

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

    // ============================================================================
    // FREE DELIVERY LOGIC - Check if order qualifies for free delivery
    // ============================================================================
    let processedUpdates = { ...updates };

    if (updates.subtotal !== undefined) {
      try {
        // Fetch free delivery threshold from database
        const { data: orderValueCharge, error: orderValueError } =
          await supabase
            .from("delivery_charges")
            .select("*")
            .eq("type", "order_value")
            .eq("is_active", true)
            .single();

        if (
          orderValueCharge &&
          !orderValueError &&
          orderValueCharge.delivery_type === "free"
        ) {
          const orderValueThreshold = orderValueCharge.order_value_threshold;

          if (updates.subtotal >= orderValueThreshold) {
            // Order qualifies for free delivery
            processedUpdates.deliveryFee = 0;
            processedUpdates.freeDeliveryQualified = true;

            // Recalculate totalAmount with free delivery
            const subtotal = updates.subtotal || 0;
            const discount = updates.discount || 0;
            const cgstAmount = updates.cgstAmount || 0;
            const sgstAmount = updates.sgstAmount || 0;
            const freeDeliveryFee = 0;

            processedUpdates.totalAmount =
              subtotal - discount + cgstAmount + sgstAmount + freeDeliveryFee;

            console.log(
              "✅ Order qualifies for free delivery in checkout update:",
              {
                subtotal: updates.subtotal,
                threshold: orderValueThreshold,
                originalDeliveryFee: updates.deliveryFee || "not provided",
                finalDeliveryFee: 0,
                freeDeliveryQualified: true,
                originalTotalAmount: updates.totalAmount,
                recalculatedTotalAmount: processedUpdates.totalAmount,
                calculation: `${subtotal} - ${discount} + ${cgstAmount} + ${sgstAmount} + ${freeDeliveryFee} = ${processedUpdates.totalAmount}`,
                updatesKeys: Object.keys(updates),
                allUpdates: updates,
              }
            );
          } else {
            processedUpdates.freeDeliveryQualified = false;

            console.log("ℹ️ Order does not qualify for free delivery:", {
              subtotal: updates.subtotal,
              threshold: orderValueThreshold,
              deliveryFee: updates.deliveryFee || "not provided",
              freeDeliveryQualified: false,
            });
          }
        }
      } catch (error) {
        console.error("❌ Error checking free delivery qualification:", error);
        // Continue with original updates if free delivery check fails
      }
    }

    // Log items data being updated
    if (processedUpdates.items) {
      console.log(
        "📦 CHECKOUT UPDATE: Items being saved to session:",
        JSON.stringify(processedUpdates.items, null, 2)
      );
      console.log(
        "📦 CHECKOUT UPDATE: Discount fields in items:",
        processedUpdates.items.map((item: any) => ({
          product_id: item.product_id,
          unit_price: item.unit_price,
          original_price: item.original_price,
          discount_amount: item.discount_amount,
          coupon_applied: item.coupon_applied,
        }))
      );
    }

    // Update checkout session
    const updatedSession = await CheckoutStore.updateSession(
      checkoutId,
      processedUpdates
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    // Log the updated session items
    if (updatedSession.items) {
      console.log(
        "✅ CHECKOUT UPDATE: Session updated, items in session:",
        updatedSession.items.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          unit_price: item.unit_price,
          original_price: item.original_price,
          discount_amount: item.discount_amount,
          coupon_applied: item.coupon_applied,
          quantity: item.quantity,
          total_price: item.total_price,
          // Show coupon discount calculation if coupon is applied
          ...(item.coupon_applied && {
            couponDiscountCalculation: {
              originalTotal:
                (item.original_price || item.unit_price) * item.quantity,
              discountedTotal: item.total_price,
              savings:
                ((item.original_price || item.unit_price) - item.unit_price) *
                item.quantity,
            },
          }),
        }))
      );
    }

    // Log coupon application summary if coupon is applied
    if (updates.couponCode && updatedSession.items) {
      const couponAppliedItems = updatedSession.items.filter(
        (item: any) => item.coupon_applied && item.coupon_applied !== false
      );
      if (couponAppliedItems.length > 0) {
        console.log("🎟️ COUPON APPLICATION SUMMARY:", {
          couponCode: updates.couponCode,
          couponApplied: true,
          totalItemsWithCoupon: couponAppliedItems.length,
          couponDetails: couponAppliedItems.map((item: any) => ({
            productId: item.product_id,
            productName: item.product_name,
            originalPrice: item.original_price || item.unit_price,
            discountedPrice: item.unit_price,
            discountAmount: item.discount_amount || 0,
            quantity: item.quantity,
            totalOriginalPrice:
              (item.original_price || item.unit_price) * item.quantity,
            totalDiscountedPrice: item.total_price,
            totalSavings:
              ((item.original_price || item.unit_price) - item.unit_price) *
              item.quantity,
          })),
          totalSavings: couponAppliedItems.reduce(
            (total: number, item: any) =>
              total +
              ((item.original_price || item.unit_price) - item.unit_price) *
                item.quantity,
            0
          ),
        });
      }
    }

    // Log receiver details being added/updated in checkout session
    console.log("📋 RECEIVER DETAILS ADDED/UPDATED IN CHECKOUT SESSION:", {
      checkoutId: checkoutId,
      updateType: "PATCH",
      receiverDetailsAdded: {
        // Contact Information
        contactInfo: updates.contactInfo
          ? {
              name: updates.contactInfo.name,
              phone: updates.contactInfo.phone,
              alternatePhone:
                updates.contactInfo.alternatePhone || "Not provided",
              status: "Added/Updated",
            }
          : "No contact info update",

        // Delivery Address
        deliveryAddress: {
          addressText: updates.addressText || "No address update",
          selectedAddressId:
            updates.selectedAddressId || "No address ID update",
          distance: updates.distance
            ? `${(updates.distance / 1000).toFixed(2)} km`
            : "No distance update",
          duration: updates.duration
            ? `${Math.round(updates.duration / 60)} minutes`
            : "No duration update",
          status: updates.addressText ? "Added/Updated" : "No update",
        },

        // Delivery Timing
        deliveryTiming: {
          timing: updates.deliveryTiming || "No timing update",
          deliveryDate: updates.deliveryDate || "No date update",
          deliveryTimeSlot: updates.deliveryTimeSlot || "No time slot update",
          estimatedDeliveryTime:
            updates.estimatedDeliveryTime || "No estimated time update",
          status: updates.deliveryTiming ? "Added/Updated" : "No update",
        },

        // Special Requests & Customization
        customization: {
          notes: updates.note || updates.notes || "No notes update",
          cakeText: updates.cakeText || "No cake text update",
          messageCardText: updates.messageCardText || "No message card update",
          customizationOptions:
            updates.customizationOptions || "No customization update",
          status:
            updates.note ||
            updates.notes ||
            updates.cakeText ||
            updates.messageCardText ||
            updates.customizationOptions
              ? "Added/Updated"
              : "No update",
        },

        // Financial Updates
        financialUpdates: {
          subtotal: updates.subtotal || "No subtotal update",
          discount: updates.discount || "No discount update",
          deliveryFee: processedUpdates.deliveryFee || "No delivery fee update",
          freeDeliveryQualified:
            processedUpdates.freeDeliveryQualified !== undefined
              ? processedUpdates.freeDeliveryQualified
              : "No free delivery status",
          cgstAmount: updates.cgstAmount || "No CGST update",
          sgstAmount: updates.sgstAmount || "No SGST update",
          totalAmount: updates.totalAmount || "No total amount update",
          couponCode: updates.couponCode || "No coupon update",
          couponApplied: updates.couponCode ? true : false,
          couponDetails: updates.couponCode
            ? (updatedSession.items || [])
                .filter(
                  (item: any) =>
                    item.coupon_applied && item.coupon_applied !== false
                )
                .map((item: any) => ({
                  productId: item.product_id,
                  productName: item.product_name,
                  originalPrice: item.original_price || item.unit_price,
                  discountedPrice: item.unit_price,
                  discountAmount: item.discount_amount || 0,
                  quantity: item.quantity,
                  totalDiscount: (item.discount_amount || 0) * item.quantity,
                }))
            : [],
          status:
            updates.subtotal ||
            updates.discount ||
            updates.deliveryFee ||
            updates.totalAmount
              ? "Updated"
              : "No financial update",
        },
      },

      // Complete updated session data
      completeUpdatedSession: {
        checkoutId: updatedSession.checkoutId,
        contactInfo: updatedSession.contactInfo,
        addressText: updatedSession.addressText,
        selectedAddressId: updatedSession.selectedAddressId,
        distance: updatedSession.distance,
        duration: updatedSession.duration,
        deliveryTiming: updatedSession.deliveryTiming,
        deliveryDate: updatedSession.deliveryDate,
        deliveryTimeSlot: updatedSession.deliveryTimeSlot,
        estimatedDeliveryTime: updatedSession.estimatedDeliveryTime,
        notes: updatedSession.notes,
        cakeText: updatedSession.cakeText,
        messageCardText: updatedSession.messageCardText,
        customizationOptions: updatedSession.customizationOptions,
        subtotal: updatedSession.subtotal,
        discount: updatedSession.discount,
        deliveryFee: updatedSession.deliveryFee,
        freeDeliveryQualified: updatedSession.freeDeliveryQualified,
        cgstAmount: updatedSession.cgstAmount,
        sgstAmount: updatedSession.sgstAmount,
        totalAmount: updatedSession.totalAmount,
        couponCode: updatedSession.couponCode,
        paymentStatus: updatedSession.paymentStatus,
        expiresAt: updatedSession.expiresAt,
      },

      // Database storage info
      databaseStorage: {
        tableName: "checkout_sessions",
        action: "UPDATE",
        updatedFields: Object.keys(updates),
        expiresAt: updatedSession.expiresAt,
        paymentStatus: updatedSession.paymentStatus,
      },
    });

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
        freeDeliveryQualified: updatedSession.freeDeliveryQualified,
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
