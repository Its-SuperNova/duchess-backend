import { NextRequest, NextResponse } from "next/server";
import {
  calculateDeliveryDistance,
  calculateDeliveryDistanceByPincode,
  testPincodeDeliveryCalculation,
} from "@/lib/distance";
import { SHOP_LOCATION } from "@/lib/shop-config";

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      message: "Distance calculation API is working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test environment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { area, pincode, fullAddress } = await request.json();

    console.log("📥 Received request:", {
      area,
      pincode,
      fullAddress,
      pincodeType: typeof pincode,
    });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Validate inputs
    const cleanPincode = pincode ? pincode.toString().trim() : "";
    console.log("🔍 Pincode validation:", {
      pincode,
      cleanPincode,
      isValid: /^\d{6}$/.test(cleanPincode),
    });

    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json({
        distance: 15,
        duration: 30,
        success: false,
        error: "Invalid pincode",
      });
    }

    // Construct origin and destination
    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;

    console.log("🏪 Shop location:", {
      latitude: SHOP_LOCATION.latitude,
      longitude: SHOP_LOCATION.longitude,
      name: SHOP_LOCATION.name,
      address: SHOP_LOCATION.address,
    });

    // Use full address if provided, otherwise construct from parts
    let destination: string;
    if (fullAddress && fullAddress.trim()) {
      destination = fullAddress.trim();
    } else {
      // Handle empty area gracefully
      const destinationParts = [
        cleanPincode,
        "Coimbatore",
        "Tamil Nadu",
        "India",
      ];
      if (area && area.trim()) {
        destinationParts.unshift(area.trim());
      }
      destination = destinationParts.join(", ");
    }

    console.log(`🗺️ Server-side Google Maps API call`);
    console.log(`📍 Origin: ${origin}`);
    console.log(`📍 Destination: ${destination}`);

    // Google Maps Distance Matrix API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(
      destination
    )}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${apiKey}`;

    console.log("🔗 Google Maps API URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 Google Maps API Response:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      throw new Error(`Google Maps API status: ${data.status}`);
    }

    if (!data.rows || data.rows.length === 0) {
      throw new Error("No route data returned");
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK") {
      throw new Error(`Route status: ${element.status}`);
    }

    // Extract distance and duration
    const distanceText = element.distance?.text || "";
    const distanceValue = element.distance?.value || 0; // in meters
    const durationText = element.duration?.text || "";
    const durationValue = element.duration?.value || 0; // in seconds

    // Convert to our format
    const distanceKm = Math.round((distanceValue / 1000) * 10) / 10; // Convert to km, round to 1 decimal
    const durationMin = Math.round(durationValue / 60); // Convert to minutes

    console.log(
      `✅ Google Maps result: ${distanceKm}km (${distanceText}), ${durationMin}min (${durationText})`
    );
    console.log("🔍 Raw Google Maps data:", {
      distanceValue,
      distanceText,
      durationValue,
      durationText,
      distanceKm,
      durationMin,
    });

    return NextResponse.json({
      distance: distanceKm,
      duration: durationMin,
      success: true,
      distanceText,
      durationText,
      rawDistanceValue: distanceValue,
      rawDurationValue: durationValue,
    });
  } catch (error) {
    console.error("❌ Google Maps distance calculation error:", error);

    return NextResponse.json({
      distance: 15, // Default fallback
      duration: 30, // Default fallback
      success: false,
      error:
        error instanceof Error ? error.message : "Distance calculation failed",
    });
  }
}
