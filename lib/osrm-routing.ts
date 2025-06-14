// Google Maps API integration via server-side API route

export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  success: boolean;
  error?: string;
}

import { SHOP_LOCATION } from "./shop-config";

// Main function to calculate distance and time using our server-side API
export async function calculateDistanceAndTime(
  area: string,
  pincode: string
): Promise<RouteResult> {
  console.log(
    `🗺️ Calculating route via server API: Shop -> ${area} (${pincode})`
  );

  try {
    console.log("🚗 Calling server-side distance API...");

    const response = await fetch("/api/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area,
        pincode,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 Server API Response:", data);

    if (data.success) {
      console.log(
        `✅ Distance calculation successful: ${data.distance}km, ${data.duration}min`
      );
      return {
        distance: data.distance,
        duration: data.duration,
        success: true,
      };
    } else {
      console.log(`⚠️ API returned success: false, using fallback`);
      return {
        distance: data.distance || 15,
        duration: data.duration || 30,
        success: false,
        error: data.error || "Distance calculation failed",
      };
    }
  } catch (error) {
    console.error("❌ Distance calculation error:", error);

    // Fallback to simple estimate
    console.log("⚠️ Using fallback estimate...");
    return {
      distance: 15, // Default estimate for Coimbatore area
      duration: 30, // Default estimate
      success: false,
      error:
        error instanceof Error ? error.message : "Distance calculation failed",
    };
  }
}

// Legacy functions for compatibility (no longer used)
export function setShopLocation() {}
export function getShopLocation() {
  return SHOP_LOCATION;
}
export function addAreaCoordinates() {}
