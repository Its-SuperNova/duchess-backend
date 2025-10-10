import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";
import { getUserAddresses } from "@/lib/address-utils";
import { calculateOptimizedDeliveryCharge } from "@/lib/optimized-delivery-calculation";

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

    // Use the totalAmount from the request body
    const orderValue = body.totalAmount;

    // Fetch address data and calculate delivery fee if address is provided
    let deliveryFee = 0;
    let addressData = null;
    let distance = null;
    let duration = null;

    if (body.selectedAddressId) {
      try {
        console.log("🏠 Fetching address data for ID:", body.selectedAddressId);
        const addresses = await getUserAddresses(body.selectedAddressId);
        addressData = addresses.find(
          (addr) => addr.id === body.selectedAddressId
        );

        if (addressData) {
          distance = addressData.distance;
          duration = addressData.duration;

          console.log("📍 Address data found:", {
            id: addressData.id,
            distance: addressData.distance,
            duration: addressData.duration,
            area: addressData.area,
            fullAddress: addressData.full_address,
          });

          // Calculate delivery fee based on distance
          if (addressData.distance) {
            const distanceInKm = addressData.distance; // Distance is already stored in km
            const deliveryResult = await calculateOptimizedDeliveryCharge(
              distanceInKm,
              orderValue
            );

            deliveryFee = deliveryResult.deliveryCharge;

            console.log(
              "🚚 Delivery fee calculated during checkout creation:",
              {
                distanceInKm,
                orderValue,
                deliveryFee,
                isFreeDelivery: deliveryResult.isFreeDelivery,
                calculationMethod: deliveryResult.calculationMethod,
                details: deliveryResult.details,
                addressInfo: {
                  id: addressData.id,
                  fullAddress: addressData.full_address,
                  distance: addressData.distance,
                  duration: addressData.duration,
                  zone: addressData.area,
                },
                breakdown: {
                  subtotal: orderValue,
                  deliveryCharge: deliveryFee,
                  total: orderValue + deliveryFee,
                },
              }
            );
          }
        } else {
          console.log("⚠️ Address not found for ID:", body.selectedAddressId);
        }
      } catch (error) {
        console.error("❌ Error fetching address data:", error);
        // Continue with default values if address fetch fails
      }
    }

    // Update total amount to include delivery fee
    const finalTotalAmount = orderValue + deliveryFee;

    console.log("💰 Final totals:", {
      orderValue,
      deliveryFee,
      finalTotalAmount,
      originalTotalAmount: body.totalAmount,
    });

    // Create checkout session
    const checkoutSession = await CheckoutStore.createSession({
      userId: body.userId || null,
      userEmail: body.userEmail || null,
      items: body.items,
      subtotal: body.subtotal || orderValue,
      discount: body.discount || 0,
      deliveryFee: deliveryFee, // Use calculated delivery fee
      totalAmount: finalTotalAmount, // Use total including delivery fee
      cgstAmount: body.cgstAmount || 0,
      sgstAmount: body.sgstAmount || 0,
      addressText: body.addressText || addressData?.full_address || "",
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
      distance: distance || undefined,
      duration: duration || undefined,
    });

    console.log("✅ Checkout session created with delivery fee:", {
      checkoutId: checkoutSession.checkoutId,
      totalAmount: checkoutSession.totalAmount,
      deliveryFee: checkoutSession.deliveryFee,
      itemsCount: checkoutSession.items.length,
      distance: checkoutSession.distance,
      duration: checkoutSession.duration,
      addressText: checkoutSession.addressText,
      selectedAddressId: checkoutSession.selectedAddressId,
      financialBreakdown: {
        orderValue,
        deliveryFee: checkoutSession.deliveryFee,
        finalTotal: checkoutSession.totalAmount,
        originalTotal: body.totalAmount,
      },
    });

    // Log initial checkout session creation (receiver details will be added later)
    console.log("🛒 INITIAL CHECKOUT SESSION CREATED:", {
      checkoutId: checkoutSession.checkoutId,
      sessionInfo: {
        // Basic order information available at creation
        orderItems: checkoutSession.items.map((item) => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          variant: item.variant || "Standard",
        })),

        // Financial information
        financialSummary: {
          subtotal: checkoutSession.subtotal,
          discount: checkoutSession.discount,
          deliveryFee: checkoutSession.deliveryFee,
          cgstAmount: checkoutSession.cgstAmount || 0,
          sgstAmount: checkoutSession.sgstAmount || 0,
          totalAmount: checkoutSession.totalAmount,
          couponCode: checkoutSession.couponCode || "No coupon applied",
        },

        // User information
        userInfo: {
          userId: checkoutSession.userId || "Guest user",
          userEmail: checkoutSession.userEmail || "No email provided",
        },

        // Address information (if provided during creation)
        addressInfo: {
          addressText:
            checkoutSession.addressText || "Will be added during checkout",
          selectedAddressId:
            checkoutSession.selectedAddressId ||
            "Will be selected during checkout",
          distance: checkoutSession.distance
            ? `${checkoutSession.distance.toFixed(2)} km`
            : "Will be calculated during checkout",
          duration: checkoutSession.duration
            ? `${Math.round(checkoutSession.duration / 60)} minutes`
            : "Will be calculated during checkout",
        },
      },

      // Receiver details that will be added later via PATCH requests
      receiverDetailsToBeAdded: {
        note: "Receiver details (contact info, delivery address, timing, customization) will be added during the checkout process via PATCH requests to /api/checkout/[checkoutId]",
        expectedUpdates: [
          "Contact Information (name, phone, alternate phone)",
          "Delivery Address (full address, distance, duration)",
          "Delivery Timing (date, time slot, estimated delivery)",
          "Special Requests (notes, cake text, message card)",
          "Customization Options (knife, candles, message card)",
        ],
      },

      // Database storage details
      databaseStorage: {
        tableName: "checkout_sessions",
        expiresAt: checkoutSession.expiresAt,
        paymentStatus: checkoutSession.paymentStatus,
        createdAt: checkoutSession.createdAt,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutId: checkoutSession.checkoutId,
      message: "Checkout session created successfully",
      deliveryFee: checkoutSession.deliveryFee,
      totalAmount: checkoutSession.totalAmount,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
