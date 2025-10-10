import { NextRequest, NextResponse } from "next/server";
import { calculateOptimizedDeliveryCharge } from "@/lib/optimized-delivery-calculation";
import { getUserAddresses } from "@/lib/address-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, orderValue, checkoutId, addressText, distance } = body;

    console.log("🚀 Calculate Delivery API called with:");
    console.log("  - Order Value: ₹", orderValue);
    console.log("  - Distance: ", distance, "km");
    console.log("  - Address ID: ", addressId);
    console.log("  - Address Text: ", addressText);
    console.log("  - Checkout ID: ", checkoutId);
    console.log("  - Distance type:", typeof distance);
    console.log("  - Distance value:", distance);

    if (!orderValue) {
      return NextResponse.json(
        { error: "Order value is required" },
        { status: 400 }
      );
    }

    // Get address information and distance
    let address = null;
    let distanceInKm = distance; // Use provided distance if available

    if (addressId) {
      try {
        console.log("🏠 Fetching address data for ID:", addressId);
        const addresses = await getUserAddresses(addressId);
        address = addresses.find((addr) => addr.id === addressId);

        if (address) {
          // Use the actual distance from the address if no distance was provided
          if (!distanceInKm && address.distance) {
            distanceInKm = address.distance; // Distance is already stored in km, no conversion needed
            console.log("📍 Using distance from address:", {
              addressId: address.id,
              distanceInKm: address.distance,
              finalDistanceInKm: distanceInKm,
            });
          }
        } else {
          console.log("⚠️ Address not found for ID:", addressId);
        }
      } catch (error) {
        console.error("❌ Error fetching address data:", error);
      }
    }

    // If no distance is available, use a default
    if (!distanceInKm) {
      distanceInKm = 5; // Default fallback distance
      console.log("⚠️ Using default distance:", distanceInKm, "km");
    }

    console.log("🔍 Distance processing in API:", {
      providedDistance: distance,
      addressId: addressId,
      addressDistance: address?.distance,
      finalDistanceInKm: distanceInKm,
      hasAddress: !!address,
    });

    const result = await calculateOptimizedDeliveryCharge(
      distanceInKm,
      orderValue
    );

    console.log("✅ Delivery calculation result:", {
      deliveryCharge: result.deliveryCharge,
      isFreeDelivery: result.isFreeDelivery,
      calculationMethod: result.calculationMethod,
      details: result.details,
      distanceInKm: distanceInKm,
      orderValue: orderValue,
    });

    return NextResponse.json({
      success: true,
      deliveryCharge: result.deliveryCharge,
      isFreeDelivery: result.isFreeDelivery,
      calculationMethod: result.calculationMethod,
      details: result.details,
      address: address
        ? {
            id: address.id,
            fullAddress: address.full_address || addressText,
            distance: address.distance, // Distance is already in km, no conversion needed
            distanceInKm: distanceInKm,
            zone: address.area || "Zone A",
          }
        : addressId
        ? {
            id: addressId,
            fullAddress: addressText,
            distance: distanceInKm, // Distance is already in km, no conversion needed
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
