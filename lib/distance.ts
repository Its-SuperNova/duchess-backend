/**
 * OSRM Route Response Types
 */
interface OSRMRoute {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: string;
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

/**
 * Convert an address object to coordinates using Nominatim
 * Prioritizes pincode-based geocoding for better reliability
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
  console.log("Geocoding address with pincode priority:", {
    street,
    district,
    pincode,
    state,
    country,
  });

  // First try: Pincode-based geocoding (most reliable for Indian addresses)
  try {
    const pincodeQuery = `${pincode}, ${district}, ${state}, ${country}`;
    const pincodeEncoded = encodeURIComponent(pincodeQuery);
    const pincodeUrl = `https://nominatim.openstreetmap.org/search?q=${pincodeEncoded}&format=json&limit=1`;

    console.log("Attempting pincode-based geocoding:", pincodeQuery);

    const pincodeRes = await fetch(pincodeUrl, {
      headers: {
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (pincodeRes.ok) {
      const pincodeData = await pincodeRes.json();

      if (pincodeData && pincodeData.length > 0) {
        const { lat, lon } = pincodeData[0];
        const coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };

        console.log("Pincode-based geocoding successful:", coordinates);
        return coordinates;
      }
    }
  } catch (error) {
    console.log("Pincode-based geocoding failed, trying full address:", error);
  }

  // Second try: Full address geocoding (fallback)
  try {
    const fullAddressQuery = `${street}, ${district}, ${state}, ${pincode}, ${country}`;
    const fullAddressEncoded = encodeURIComponent(fullAddressQuery);
    const fullAddressUrl = `https://nominatim.openstreetmap.org/search?q=${fullAddressEncoded}&format=json&limit=1`;

    console.log("Attempting full address geocoding:", fullAddressQuery);

    const fullAddressRes = await fetch(fullAddressUrl, {
      headers: {
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!fullAddressRes.ok) {
      throw new Error(
        `Nominatim request failed: ${fullAddressRes.status} ${fullAddressRes.statusText}`
      );
    }

    const fullAddressData = await fullAddressRes.json();

    if (!fullAddressData || fullAddressData.length === 0) {
      throw new Error("No coordinates found for the given address.");
    }

    const { lat, lon } = fullAddressData[0];
    const coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };

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
 * Calculate road distance using OSRM
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
  // Validate input coordinates
  if (!isValidLatitude(lat1) || !isValidLatitude(lat2)) {
    throw new Error("Invalid latitude values. Must be between -90 and 90.");
  }

  if (!isValidLongitude(lon1) || !isValidLongitude(lon2)) {
    throw new Error("Invalid longitude values. Must be between -180 and 180.");
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

  console.log("Requesting road distance from OSRM API:", url);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OSRM API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.code !== "Ok") {
      throw new Error(`OSRM API error: ${data.code}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between the given coordinates.");
    }

    const distanceInMeters = data.routes[0].distance;

    if (distanceInMeters === undefined || distanceInMeters < 0) {
      throw new Error("Invalid distance returned from OSRM API");
    }

    const distanceInKm = distanceInMeters / 1000;

    console.log(
      `OSRM road distance: ${distanceInKm.toFixed(2)}km (${distanceInMeters}m)`
    );
    return distanceInKm;
  } catch (error) {
    console.error("OSRM API failed:", error);
    throw new Error(
      "Failed to calculate distance: " + (error as Error).message
    );
  }
}

/**
 * Calculate road distance and duration using OSRM
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

  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

  console.log("Requesting road distance and duration from OSRM API:", url);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OSRM API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.code !== "Ok") {
      throw new Error(`OSRM API error: ${data.code}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between the given coordinates.");
    }

    const distanceInMeters = data.routes[0].distance;
    const durationInSeconds = data.routes[0].duration;

    if (distanceInMeters === undefined || distanceInMeters < 0) {
      throw new Error("Invalid distance returned from OSRM API");
    }

    if (durationInSeconds === undefined || durationInSeconds < 0) {
      throw new Error("Invalid duration returned from OSRM API");
    }

    const distanceInKm = distanceInMeters / 1000;
    const durationInMinutes = Math.round(durationInSeconds / 60);

    console.log(
      `OSRM road distance: ${distanceInKm.toFixed(
        2
      )}km, duration: ${durationInMinutes}min`
    );

    return {
      distance: distanceInKm,
      duration: durationInMinutes,
    };
  } catch (error) {
    console.error("OSRM API failed:", error);
    throw new Error(
      "Failed to calculate distance and duration: " + (error as Error).message
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

    // Calculate road distance from shop
    const distance = await getRoadDistanceInKm(
      SHOP_LOCATION.coordinates.lat,
      SHOP_LOCATION.coordinates.lon,
      userCoords.lat,
      userCoords.lon
    );

    // Calculate realistic travel time
    const duration = calculateRealisticTravelTime(distance, true);

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
 * Shop location configuration
 */
export const SHOP_LOCATION = {
  name: "Duchess Pastries",
  address:
    "Door No : 7/68-62-B, Street 1, Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham",
  coordinates: {
    lat: 11.106207,
    lon: 77.001487,
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
      return `${hours}h ${remainingMinutes}min`;
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
 * Convert pincode to coordinates using Nominatim
 * Most reliable method for Indian addresses
 * @param pincode Indian pincode
 * @param district District name (optional, for better accuracy)
 * @param state State name (defaults to Tamil Nadu)
 * @returns Coordinates { lat: number; lon: number }
 */
export async function getCoordinatesFromPincode(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<{ lat: number; lon: number }> {
  const query = district
    ? `${pincode}, ${district}, ${state}, India`
    : `${pincode}, ${state}, India`;

  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

  console.log("Geocoding pincode:", query);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Nominatim request failed: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error(`No coordinates found for pincode: ${pincode}`);
    }

    const { lat, lon } = data[0];
    const coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };

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
 * Calculate delivery distance using only pincode (most reliable for Indian addresses)
 * @param pincode Customer pincode
 * @param district District name (optional, for better accuracy)
 * @param state State name (defaults to Tamil Nadu)
 * @returns Delivery result with realistic travel time and delivery status
 */
export async function calculateDeliveryDistanceByPincode(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<DeliveryResult> {
  try {
    console.log("Starting pincode-based delivery distance calculation for:", {
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

    // Calculate road distance from shop
    const distance = await getRoadDistanceInKm(
      SHOP_LOCATION.coordinates.lat,
      SHOP_LOCATION.coordinates.lon,
      userCoords.lat,
      userCoords.lon
    );

    // Calculate realistic travel time
    const duration = calculateRealisticTravelTime(distance, true);

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

    console.log("Pincode-based delivery calculation result:", result);
    return result;
  } catch (error) {
    console.error("Pincode-based delivery distance calculation failed:", error);
    throw error;
  }
}

/**
 * Test function for pincode-based delivery calculation
 * @param pincode Test pincode
 * @param district District name (optional)
 * @param state State name (defaults to Tamil Nadu)
 */
export async function testPincodeDeliveryCalculation(
  pincode: string,
  district?: string,
  state: string = "Tamil Nadu"
): Promise<void> {
  try {
    console.log("=== Pincode-based Delivery Distance Calculation Test ===");
    console.log("Shop location:", SHOP_LOCATION);
    console.log("Test pincode:", { pincode, district, state });

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
    console.log("=== Pincode Test Complete ===");
  } catch (error) {
    console.error("Pincode test failed:", error);
  }
}
