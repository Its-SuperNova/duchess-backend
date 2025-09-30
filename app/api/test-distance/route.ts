import { NextRequest, NextResponse } from "next/server";
import { SHOP_LOCATION } from "@/lib/shop-config";

export async function POST(request: NextRequest) {
  try {
    const { pincode, area } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Maps API key not configured",
        },
        { status: 500 }
      );
    }

    // Test with the same pincode that's showing 21km in Google Maps
    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
    const destination = `${
      area || "Sulur SO"
    }, ${pincode}, Coimbatore, Tamil Nadu, India`;

    console.log("🧪 Testing distance calculation:");
    console.log("📍 Origin:", origin);
    console.log("📍 Destination:", destination);

    // Google Maps Distance Matrix API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(
      destination
    )}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${apiKey}`;

    console.log("🔗 API URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("📊 Full Google Maps Response:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      return NextResponse.json({
        error: `Google Maps API status: ${data.status}`,
        fullResponse: data,
      });
    }

    if (!data.rows || data.rows.length === 0) {
      return NextResponse.json({
        error: "No route data returned",
        fullResponse: data,
      });
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK") {
      return NextResponse.json({
        error: `Route status: ${element.status}`,
        fullResponse: data,
      });
    }

    // Extract all distance and duration data
    const distanceText = element.distance?.text || "";
    const distanceValue = element.distance?.value || 0; // in meters
    const durationText = element.duration?.text || "";
    const durationValue = element.duration?.value || 0; // in seconds

    // Convert to our format
    const distanceKm = Math.round((distanceValue / 1000) * 10) / 10; // Convert to km, round to 1 decimal
    const durationMin = Math.round(durationValue / 60); // Convert to minutes

    return NextResponse.json({
      success: true,
      distance: distanceKm,
      duration: durationMin,
      distanceText,
      durationText,
      rawDistanceValue: distanceValue,
      rawDurationValue: durationValue,
      origin,
      destination,
      fullResponse: data,
    });
  } catch (error) {
    console.error("❌ Test distance calculation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}

