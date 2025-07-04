import { SHOP_LOCATION as SHOP_CONFIG } from "./shop-config";

/**
 * Google Maps Distance Matrix API Response Types
 */
interface GoogleMapsDistanceElement {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  status: string;
}

interface GoogleMapsDistanceRow {
  elements: GoogleMapsDistanceElement[];
}

interface GoogleMapsDistanceResponse {
  status: string;
  rows: GoogleMapsDistanceRow[];
}

/**
 * Calculate road distance and duration using Google Maps API
 * @param lat1 Starting latitude
 * @param lon1 Starting longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 * @returns Object containing distance in km and duration in minutes
 */
export async function getRoadDistanceAndDuration(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<{ distance: number; duration: number }> {
  // Validate input coordinates
  if (!isValidLatitude(lat1) || !isValidLatitude(lat2)) {
    throw new Error("Invalid latitude values. Must be between -90 and 90.");
  }

  if (!isValidLongitude(lon1) || !isValidLongitude(lon2)) {
    throw new Error("Invalid longitude values. Must be between -180 and 180.");
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  const origin = `${lat1},${lon1}`;
  const destination = `${lat2},${lon2}`;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${apiKey}`;

  console.log(
    "Requesting road distance and duration from Google Maps API:",
    url
  );

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Maps API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: GoogleMapsDistanceResponse = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    if (!data.rows || data.rows.length === 0) {
      throw new Error("No route found between the given coordinates.");
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK") {
      throw new Error(`Route status: ${element.status}`);
    }

    const distanceInMeters = element.distance.value;
    const durationInSeconds = element.duration.value;

    if (distanceInMeters === undefined || distanceInMeters < 0) {
      throw new Error("Invalid distance returned from Google Maps API");
    }

    if (durationInSeconds === undefined || durationInSeconds < 0) {
      throw new Error("Invalid duration returned from Google Maps API");
    }

    const distanceInKm = distanceInMeters / 1000;
    const durationInMinutes = Math.round(durationInSeconds / 60);

    console.log(
      `Google Maps road distance: ${distanceInKm.toFixed(
        2
      )}km, duration: ${durationInMinutes}min`
    );

    return {
      distance: distanceInKm,
      duration: durationInMinutes,
    };
  } catch (error) {
    console.error("Google Maps API failed:", error);
    throw new Error(
      "Failed to calculate distance and duration: " + (error as Error).message
    );
  }
}

/**
 * Calculate road distance using Google Maps API
 * @param lat1 Starting latitude
 * @param lon1 Starting longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 * @returns Road distance in kilometers
 */
export async function getRoadDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  const result = await getRoadDistanceAndDuration(lat1, lon1, lat2, lon2);
  return result.distance;
}

/**
 * Get coordinates from address using Google Maps Geocoding API
 * @param addressParts Address components
 * @returns Coordinates { lat: number; lon: number }
 */
export async function getCoordinatesFromAddressParts({
  street,
  district,
  pincode,
  state = "Tamil Nadu",
  country = "India",
}: {
  street: string;
  district: string;
  pincode: string;
  state?: string;
  country?: string;
}): Promise<{ lat: number; lon: number }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  console.log("Geocoding address with Google Maps:", {
    street,
    district,
    pincode,
    state,
    country,
  });

  // Try pincode-based geocoding first (most reliable for Indian addresses)
  try {
    const pincodeQuery = `${pincode}, ${district}, ${state}, ${country}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      pincodeQuery
    )}&key=${apiKey}`;

    console.log("Attempting pincode-based geocoding:", pincodeQuery);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Maps Geocoding API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const coordinates = { lat: location.lat, lon: location.lng };

      console.log("Pincode-based geocoding successful:", coordinates);
      return coordinates;
    }
  } catch (error) {
    console.log("Pincode-based geocoding failed, trying full address:", error);
  }

  // Fallback to full address geocoding
  try {
    const fullAddressQuery = `${street}, ${district}, ${state}, ${pincode}, ${country}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddressQuery
    )}&key=${apiKey}`;

    console.log("Attempting full address geocoding:", fullAddressQuery);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Maps Geocoding API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error("No coordinates found for the given address.");
    }

    const location = data.results[0].geometry.location;
    const coordinates = { lat: location.lat, lon: location.lng };

    console.log("Full address geocoding successful:", coordinates);
    return coordinates;
  } catch (error) {
    console.error("Both pincode and full address geocoding failed:", error);
    throw new Error(
      "Address to coordinates failed: " + (error as Error).message
    );
  }
}

/**
 * Get coordinates from pincode using Google Maps Geocoding API
 * @param pincode Pincode to geocode
 * @param district Optional district name
 * @param state State name (default: Tamil Nadu)
 * @returns Coordinates { lat: number; lon: number }
 */
export async function getCoordinatesFromPincode(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<{ lat: number; lon: number }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  console.log("Geocoding pincode with Google Maps:", {
    pincode,
    district,
    state,
  });

  // Construct address query
  const addressParts = [pincode];
  if (district) addressParts.push(district);
  addressParts.push(state, "India");

  const addressQuery = addressParts.join(", ");
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    addressQuery
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Maps Geocoding API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error(`No coordinates found for pincode ${pincode}`);
    }

    const location = data.results[0].geometry.location;
    const coordinates = { lat: location.lat, lon: location.lng };

    console.log("Pincode geocoding successful:", coordinates);
    return coordinates;
  } catch (error) {
    console.error("Pincode geocoding failed:", error);
    throw new Error(
      "Pincode to coordinates failed: " + (error as Error).message
    );
  }
}

/**
 * Calculate realistic travel time based on distance and location type
 * @param distance Distance in kilometers
 * @param isCityArea Whether the destination is in city area
 * @returns Travel time in minutes
 */
export function calculateRealisticTravelTime(
  distance: number,
  isCityArea: boolean = true
): number {
  let averageSpeed: number;

  if (isCityArea) {
    // City traffic speeds
    if (distance <= 5) {
      averageSpeed = 15; // Very slow city traffic
    } else if (distance <= 10) {
      averageSpeed = 20; // Slow city traffic
    } else if (distance <= 20) {
      averageSpeed = 25; // Moderate city traffic
    } else if (distance <= 30) {
      averageSpeed = 30; // Mixed city and highway
    } else {
      averageSpeed = 35; // Highway speeds
    }
  } else {
    // Rural/highway speeds
    if (distance <= 10) {
      averageSpeed = 25;
    } else if (distance <= 30) {
      averageSpeed = 40;
    } else {
      averageSpeed = 50;
    }
  }

  // Calculate time and add some buffer for traffic, stops, etc.
  const baseTime = (distance / averageSpeed) * 60;
  const bufferTime = Math.max(5, baseTime * 0.2); // 20% buffer or minimum 5 minutes

  return Math.round(baseTime + bufferTime);
}

/**
 * Validate latitude value
 * @param lat Latitude value
 * @returns True if valid, false otherwise
 */
function isValidLatitude(lat: number): boolean {
  return typeof lat === "number" && lat >= -90 && lat <= 90 && !isNaN(lat);
}

/**
 * Validate longitude value
 * @param lon Longitude value
 * @returns True if valid, false otherwise
 */
function isValidLongitude(lon: number): boolean {
  return typeof lon === "number" && lon >= -180 && lon <= 180 && !isNaN(lon);
}

/**
 * Complete distance calculation from address parts with delivery checking
 * @param addressParts Customer address parts
 * @returns Delivery result with realistic travel time and delivery status
 */
export async function calculateDeliveryDistance(addressParts: {
  street: string;
  district: string;
  pincode: string;
  state?: string;
  country?: string;
}): Promise<DeliveryResult> {
  try {
    console.log("Starting delivery distance calculation for:", addressParts);

    // Get coordinates from address
    const userCoords = await getCoordinatesFromAddressParts(addressParts);

    // Calculate road distance from shop using Google Maps
    const { distance, duration } = await getRoadDistanceAndDuration(
      SHOP_LOCATION.coordinates.lat,
      SHOP_LOCATION.coordinates.lon,
      userCoords.lat,
      userCoords.lon
    );

    // Check if within delivery radius
    const isDeliverable = distance <= DELIVERY_RADIUS_KM;
    let deliveryMessage: string | undefined;

    if (!isDeliverable) {
      if (distance <= DELIVERY_RADIUS_KM + 5) {
        deliveryMessage =
          "Address is slightly outside our current delivery range. We're working on expanding our service area!";
      } else if (distance <= DELIVERY_RADIUS_KM + 20) {
        deliveryMessage =
          "Address is outside our delivery range. We're planning to expand our service area soon!";
      } else {
        deliveryMessage = `Address is outside our delivery range. We currently deliver within ${DELIVERY_RADIUS_KM}km of Coimbatore.`;
      }
    }

    const result: DeliveryResult = {
      distance,
      distanceMiles: kmToMiles(distance),
      duration,
      formattedDistance: formatDistance(distance),
      formattedDuration: formatDuration(duration),
      isDeliverable,
      deliveryMessage,
      coordinates: userCoords,
    };

    console.log("Delivery calculation result:", result);
    return result;
  } catch (error) {
    console.error("Delivery distance calculation failed:", error);
    throw error;
  }
}

/**
 * Calculate delivery distance from address object (for backward compatibility)
 * @param customerAddress Customer address object
 * @returns Delivery result or null if calculation fails
 */
export async function calculateDeliveryFromAddress(customerAddress: {
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
}): Promise<DeliveryResult | null> {
  try {
    const addressParts = {
      street: customerAddress.full_address,
      district: customerAddress.city,
      pincode: customerAddress.zip_code,
      state: customerAddress.state,
      country: "India",
    };

    return await calculateDeliveryDistance(addressParts);
  } catch (error) {
    console.error("Error calculating delivery from address:", error);
    return null;
  }
}

/**
 * Calculate delivery distance from pincode with Google Maps
 * @param pincode Customer pincode
 * @param district Optional district name
 * @param state State name (default: Tamil Nadu)
 * @returns Delivery result
 */
export async function calculateDeliveryDistanceByPincode(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<DeliveryResult> {
  try {
    console.log("Starting delivery distance calculation by pincode:", {
      pincode,
      district,
      state,
    });

    // Get coordinates from pincode
    const userCoords = await getCoordinatesFromPincode(
      pincode,
      district,
      state
    );

    // Calculate road distance from shop using Google Maps
    const { distance, duration } = await getRoadDistanceAndDuration(
      SHOP_LOCATION.coordinates.lat,
      SHOP_LOCATION.coordinates.lon,
      userCoords.lat,
      userCoords.lon
    );

    // Check if within delivery radius
    const isDeliverable = distance <= DELIVERY_RADIUS_KM;
    let deliveryMessage: string | undefined;

    if (!isDeliverable) {
      if (distance <= DELIVERY_RADIUS_KM + 5) {
        deliveryMessage =
          "Address is slightly outside our current delivery range. We're working on expanding our service area!";
      } else if (distance <= DELIVERY_RADIUS_KM + 20) {
        deliveryMessage =
          "Address is outside our delivery range. We're planning to expand our service area soon!";
      } else {
        deliveryMessage = `Address is outside our delivery range. We currently deliver within ${DELIVERY_RADIUS_KM}km of Coimbatore.`;
      }
    }

    const result: DeliveryResult = {
      distance,
      distanceMiles: kmToMiles(distance),
      duration,
      formattedDistance: formatDistance(distance),
      formattedDuration: formatDuration(duration),
      isDeliverable,
      deliveryMessage,
      coordinates: userCoords,
    };

    console.log("Delivery calculation by pincode result:", result);
    return result;
  } catch (error) {
    console.error("Delivery distance calculation by pincode failed:", error);
    throw error;
  }
}

/**
 * Test function for pincode-based delivery calculation
 * @param pincode Test pincode
 * @param district Optional district
 * @param state State name
 */
export async function testPincodeDeliveryCalculation(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<void> {
  try {
    console.log("=== Pincode Delivery Distance Calculation Test ===");
    console.log("Shop location:", SHOP_LOCATION);
    console.log("Pincode:", pincode, "District:", district, "State:", state);

    const result = await calculateDeliveryDistanceByPincode(
      pincode,
      district,
      state
    );

    console.log("Distance:", result.formattedDistance);
    console.log("Duration:", result.formattedDuration);
    console.log("Is Deliverable:", result.isDeliverable);
    console.log("Coordinates:", result.coordinates);
    if (result.deliveryMessage) {
      console.log("Message:", result.deliveryMessage);
    }
    console.log("=== Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

/**
 * Test function to verify the complete flow
 * @param addressParts Test address
 */
export async function testDeliveryCalculation(addressParts: {
  street: string;
  district: string;
  pincode: string;
  state?: string;
  country?: string;
}): Promise<void> {
  try {
    console.log("=== Delivery Distance Calculation Test ===");
    console.log("Shop location:", SHOP_LOCATION);
    console.log("Address parts:", addressParts);

    const result = await calculateDeliveryDistance(addressParts);

    console.log("Distance:", result.formattedDistance);
    console.log("Duration:", result.formattedDuration);
    console.log("Is Deliverable:", result.isDeliverable);
    console.log("Coordinates:", result.coordinates);
    if (result.deliveryMessage) {
      console.log("Message:", result.deliveryMessage);
    }
    console.log("=== Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

/**
 * Shop location configuration (unified with shop-config.ts)
 */
export const SHOP_LOCATION = {
  name: SHOP_CONFIG.name,
  address: SHOP_CONFIG.address,
  coordinates: {
    lat: SHOP_CONFIG.latitude,
    lon: SHOP_CONFIG.longitude,
  },
};

// Delivery radius in kilometers
export const DELIVERY_RADIUS_KM = 30;

// Shop pincode
export const SHOP_PINCODE = "641035";

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${Math.round(remainingMinutes)}min`;
    }
  }
}

/**
 * Delivery result interface
 */
export interface DeliveryResult {
  distance: number; // in kilometers
  distanceMiles: number; // in miles
  duration: number; // in minutes
  formattedDistance: string;
  formattedDuration: string;
  isDeliverable: boolean;
  deliveryMessage?: string;
  coordinates?: { lat: number; lon: number };
}

/**
 * Route result interface for API compatibility
 */
export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  success: boolean;
  error?: string;
}

/**
 * Calculate distance and time using Google Maps API (via server)
 * This function calls our API route which handles Google Maps API calls
 * @param area Area name (can be empty)
 * @param pincode Pincode for destination
 * @returns Route result with distance and duration
 */
export async function calculateDistanceAndTime(
  area: string,
  pincode: string
): Promise<RouteResult> {
  try {
    console.log("Calculating distance and time via API route:", {
      area,
      pincode,
    });

    const response = await fetch("/api/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area, pincode }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      distance: Number(data.distance) || 15, // Ensure it's a number
      duration: Number(data.duration) || 30, // Ensure it's a number
      success: data.success || false,
      error: data.error,
    };
  } catch (error) {
    console.error("Distance calculation API call failed:", error);
    return {
      distance: 15, // Default fallback
      duration: 30, // Default fallback
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate distance and time for full address using server-side API
 * This avoids CORS issues by using our server-side API route
 * @param fullAddress Full address string
 * @param city City name
 * @param state State name
 * @param zipCode ZIP code
 * @returns Route result with distance and duration
 */
export async function calculateDistanceForAddress(
  fullAddress: string,
  city: string,
  state: string,
  zipCode: string
): Promise<RouteResult> {
  try {
    console.log("Calculating distance for full address via API route:", {
      fullAddress,
      city,
      state,
      zipCode,
    });

    // Extract area from full address or use city as fallback
    const area = fullAddress.split(",")[0]?.trim() || city;

    const response = await fetch("/api/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area,
        pincode: zipCode,
        fullAddress: `${fullAddress}, ${city}, ${state} ${zipCode}, India`,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      distance: Number(data.distance) || 15, // Ensure it's a number
      duration: Number(data.duration) || 30, // Ensure it's a number
      success: data.success || false,
      error: data.error,
    };
  } catch (error) {
    console.error("Distance calculation API call failed:", error);
    return {
      distance: 15, // Default fallback
      duration: 30, // Default fallback
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
