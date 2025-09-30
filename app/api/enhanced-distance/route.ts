import { NextRequest, NextResponse } from "next/server";
import { SHOP_LOCATION } from "@/lib/shop-config";
import { distanceCache } from "@/lib/distance-cache";
import { distanceFallbackSystem } from "@/lib/distance-fallbacks";
import { usageMonitor } from "@/lib/usage-monitor";

export async function POST(request: NextRequest) {
  try {
    const { coordinates, address, pincode, area, accuracy } =
      await request.json();

    console.log("🎯 Enhanced distance calculation request:", {
      coordinates,
      address,
      pincode,
      area,
      accuracy,
    });

    // Try fallback system first to minimize API calls
    try {
      const fallbackResult =
        await distanceFallbackSystem.calculateDistanceWithFallbacks({
          coordinates,
          address,
          pincode,
          area,
        });

      console.log("✅ Fallback system result:", fallbackResult);

      // Record usage for monitoring
      usageMonitor.recordUsage(
        fallbackResult.method === "api" ? 1 : 0, // API calls
        fallbackResult.method === "cached" ? 1 : 0, // Cached requests
        {
          gps: fallbackResult.method === "gps" ? 1 : 0,
          address: fallbackResult.method === "api" && address ? 1 : 0,
          pincode: fallbackResult.method === "pincode_lookup" ? 1 : 0,
          cached: fallbackResult.method === "cached" ? 1 : 0,
        }
      );

      return NextResponse.json({
        distance: fallbackResult.distance,
        duration: fallbackResult.duration,
        success: true,
        accuracy: fallbackResult.accuracy,
        method: fallbackResult.method,
        confidence: fallbackResult.confidence,
        costOptimized: true,
      });
    } catch (fallbackError) {
      console.log(
        "⚠️ Fallback system failed, using Google Maps API:",
        fallbackError
      );
    }

    // Fallback to Google Maps API if fallback system fails
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Construct origin (shop location)
    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;

    console.log("🏪 Shop location:", {
      latitude: SHOP_LOCATION.latitude,
      longitude: SHOP_LOCATION.longitude,
      name: SHOP_LOCATION.name,
    });

    // Determine destination based on available data
    let destination: string;
    let locationType: string;

    if (coordinates && coordinates.lat && coordinates.lng) {
      // Method 1: GPS Coordinates (Most Accurate)
      destination = `${coordinates.lat},${coordinates.lng}`;
      locationType = "GPS Coordinates";
      console.log("📍 Using GPS coordinates:", destination);
    } else if (address && address.trim()) {
      // Method 2: Full Address
      destination = address.trim();
      locationType = "Full Address";
      console.log("🏠 Using full address:", destination);
    } else if (area && pincode) {
      // Method 3: Area + Pincode (Current method)
      destination = `${area}, ${pincode}, Coimbatore, Tamil Nadu, India`;
      locationType = "Area + Pincode";
      console.log("📮 Using area + pincode:", destination);
    } else if (pincode) {
      // Method 4: Pincode only (Fallback)
      destination = `${pincode}, Coimbatore, Tamil Nadu, India`;
      locationType = "Pincode Only";
      console.log("📮 Using pincode only:", destination);
    } else {
      return NextResponse.json(
        {
          error: "No location data provided",
          success: false,
        },
        { status: 400 }
      );
    }

    console.log(`🗺️ Google Maps API call - ${locationType}`);
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
      `✅ Enhanced distance calculation result: ${distanceKm}km (${distanceText}), ${durationMin}min (${durationText})`
    );
    console.log("🔍 Raw Google Maps data:", {
      distanceValue,
      distanceText,
      durationValue,
      durationText,
      distanceKm,
      durationMin,
      locationType,
      accuracy,
    });

    // Record API usage
    usageMonitor.recordUsage(
      1, // API call made
      0, // No cached requests
      {
        gps: coordinates ? 1 : 0,
        address: address ? 1 : 0,
        pincode: pincode ? 1 : 0,
        cached: 0,
      }
    );

    // Cache the result for future use
    if (coordinates) {
      distanceCache.setCachedDistance(
        { lat: SHOP_LOCATION.latitude, lng: SHOP_LOCATION.longitude },
        coordinates,
        distanceKm,
        durationMin,
        accuracy
      );
    } else if (address) {
      const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
      distanceCache.setCachedDistance(
        origin,
        address,
        distanceKm,
        durationMin,
        accuracy
      );
    }

    return NextResponse.json({
      distance: distanceKm,
      duration: durationMin,
      success: true,
      distanceText,
      durationText,
      rawDistanceValue: distanceValue,
      rawDurationValue: durationValue,
      locationType,
      accuracy,
      origin,
      destination,
      costOptimized: false, // Used Google Maps API
    });
  } catch (error) {
    console.error("❌ Enhanced distance calculation error:", error);

    return NextResponse.json(
      {
        distance: 15, // Default fallback
        duration: 30, // Default fallback
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Distance calculation failed",
        locationType: "Unknown",
        accuracy: "approximate",
      },
      { status: 500 }
    );
  }
}
