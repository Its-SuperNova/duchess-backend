import { NextRequest, NextResponse } from "next/server";
import { calculateOptimizedDeliveryCharge } from "@/lib/optimized-delivery-calculation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, orderValue, checkoutId, addressText, distance } = body;

    if (!orderValue) {
      return NextResponse.json(
        { error: "Order value is required" },
        { status: 400 }
      );
    }

    // If distance is provided directly, use it
    let distanceInKm = distance;

    // If addressId is provided, we need to get the distance from the address
    if (addressId && !distanceInKm) {
      // For now, we'll use a fallback calculation
      // In a real implementation, you'd fetch the address from the database
      distanceInKm = 5; // Default fallback distance
    }

    // If no distance is available, use a default
    if (!distanceInKm) {
      distanceInKm = 5; // Default fallback distance
    }

    const result = await calculateOptimizedDeliveryCharge(
      distanceInKm,
      orderValue
    );

    return NextResponse.json({
      success: true,
      deliveryCharge: result.deliveryCharge,
      isFreeDelivery: result.isFreeDelivery,
      calculationMethod: result.calculationMethod,
      details: result.details,
      address: addressId
        ? {
            id: addressId,
            fullAddress: addressText,
            distance: distanceInKm * 1000, // Convert back to meters
            distanceInKm: distanceInKm,
            zone: "Zone A", // Default zone
          }
        : undefined,
      orderValue: orderValue,
      breakdown: {
        subtotal: orderValue,
        deliveryCharge: result.deliveryCharge,
        total: orderValue + result.deliveryCharge,
      },
    });
  } catch (error) {
    console.error("Error calculating delivery charge:", error);
    return NextResponse.json(
      { error: "Failed to calculate delivery charge" },
      { status: 500 }
    );
  }
}
