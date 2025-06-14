// Google Maps API integration for accurate distance and time calculation

export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  success: boolean;
  error?: string;
}

import { SHOP_LOCATION } from "./shop-config";

// Main function to calculate distance and time using Google Maps Distance Matrix API
export async function calculateDistanceAndTime(
  area: string,
  pincode: string
): Promise<RouteResult> {
  console.log(
    `🗺️ Calculating route using Google Maps: Shop -> ${area} (${pincode})`
  );

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("❌ Google Maps API key not found");
      return {
        distance: 0,
        duration: 0,
        success: false,
        error: "Google Maps API key not configured",
      };
    }

    // Construct origin and destination
    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
    const destination = `${area}, ${pincode}, Coimbatore, Tamil Nadu, India`;

    console.log(`📍 Origin: ${origin}`);
    console.log(`📍 Destination: ${destination}`);

    // Google Maps Distance Matrix API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(
      destination
    )}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${apiKey}`;

    console.log("🚗 Calling Google Maps Distance Matrix API...");

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

    return {
      distance: distanceKm,
      duration: durationMin,
      success: true,
    };
  } catch (error) {
    console.error("❌ Google Maps distance calculation error:", error);

    // Fallback to simple estimate
    console.log("⚠️ Using fallback estimate...");
    return {
      distance: 15, // Default estimate for Coimbatore area
      duration: 30, // Default estimate
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Google Maps calculation failed",
    };
  }
}

// Legacy functions for compatibility (no longer used)
export function setShopLocation() {}
export function getShopLocation() {
  return SHOP_LOCATION;
}
export function addAreaCoordinates() {}
