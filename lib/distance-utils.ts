// Distance calculation utilities for shop-to-customer address distance

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ShopLocation {
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface DistanceResult {
  distance: number; // in kilometers
  distanceMiles: number; // in miles
  duration?: number; // estimated travel time in minutes
  formattedDistance: string;
  formattedDuration?: string;
}

// Default shop location - Duchess Pastries actual location
export const DEFAULT_SHOP_LOCATION: ShopLocation = {
  name: "Duchess Pastries",
  address:
    "Door No : 7/68-62-B, Street 1, Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham",
  coordinates: {
    latitude: 11.106207, // Actual shop coordinates
    longitude: 77.001487,
  },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

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
 * Estimate travel time based on distance
 * Assumes average speed of 30 km/h in city areas
 */
export function estimateTravelTime(distance: number): number {
  const averageSpeed = 30; // km/h
  return Math.round((distance / averageSpeed) * 60); // Convert to minutes
}

/**
 * Get shop location from environment or use default
 */
export function getShopLocation(): ShopLocation {
  // You can add environment variables for shop location
  const shopLat = process.env.SHOP_LATITUDE
    ? parseFloat(process.env.SHOP_LATITUDE)
    : DEFAULT_SHOP_LOCATION.coordinates.latitude;

  const shopLng = process.env.SHOP_LONGITUDE
    ? parseFloat(process.env.SHOP_LONGITUDE)
    : DEFAULT_SHOP_LOCATION.coordinates.longitude;

  const shopName = process.env.SHOP_NAME || DEFAULT_SHOP_LOCATION.name;
  const shopAddress = process.env.SHOP_ADDRESS || DEFAULT_SHOP_LOCATION.address;

  return {
    name: shopName,
    address: shopAddress,
    coordinates: {
      latitude: shopLat,
      longitude: shopLng,
    },
  };
}

/**
 * Calculate distance from shop to a given address
 * @param addressCoordinates Customer address coordinates
 * @returns Distance result with formatted strings
 */
export function calculateDistanceFromShop(
  addressCoordinates: Coordinates
): DistanceResult {
  const shopLocation = getShopLocation();
  const distance = calculateDistance(
    shopLocation.coordinates,
    addressCoordinates
  );
  const distanceMiles = kmToMiles(distance);
  const duration = estimateTravelTime(distance);

  return {
    distance,
    distanceMiles,
    duration,
    formattedDistance: formatDistance(distance),
    formattedDuration: formatDuration(duration),
  };
}

/**
 * Geocode an address to get coordinates using Google Maps Geocoding API
 * @param address Full address string
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  try {
    console.log("Geocoding address:", address);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API key available:", !!apiKey);

    if (!apiKey) {
      console.warn("Google Maps API key not found. Using fallback geocoding.");
      return await fallbackGeocode(address);
    }

    // Try multiple address formats for better geocoding success
    const addressFormats = [
      address, // Original format
      address.replace(/,/g, " "), // Remove commas
      address.replace(/\s+/g, " ").trim(), // Normalize spaces
    ];

    for (const addressFormat of addressFormats) {
      try {
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressFormat
        )}&key=${apiKey}&region=in`; // Add region bias for India

        console.log("Trying geocoding with format:", addressFormat);

        const response = await fetch(geocodingUrl);

        console.log("Geocoding response status:", response.status);

        if (!response.ok) {
          console.error(
            "Geocoding request failed with status:",
            response.status
          );
          continue; // Try next format
        }

        const data = await response.json();
        console.log("Geocoding response data:", data);

        if (data.status === "OK" && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          console.log("Geocoding successful, coordinates:", location);
          return {
            latitude: location.lat,
            longitude: location.lng,
          };
        }

        console.log(
          "Geocoding failed with status:",
          data.status,
          "for format:",
          addressFormat
        );
      } catch (error) {
        console.error("Error with address format:", addressFormat, error);
        continue; // Try next format
      }
    }

    console.error("All Google Maps geocoding attempts failed");
    console.log("Falling back to Nominatim geocoding...");
    return await fallbackGeocode(address);
  } catch (error) {
    console.error("Geocoding error:", error);
    console.log("Falling back to Nominatim geocoding...");
    return await fallbackGeocode(address);
  }
}

/**
 * Fallback geocoding using Nominatim (OpenStreetMap) - free but less accurate
 */
async function fallbackGeocode(address: string): Promise<Coordinates | null> {
  try {
    console.log("Using fallback geocoding for address:", address);

    // Try multiple address formats for better geocoding success
    const addressFormats = [
      address, // Original format
      address.replace(/,/g, " "), // Remove commas
      address.replace(/\s+/g, " ").trim(), // Normalize spaces
      `${address}, India`, // Add country
      address.replace(/,/g, " ") + ", India", // Remove commas and add country
    ];

    for (const addressFormat of addressFormats) {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressFormat
        )}&limit=1&countrycodes=in&addressdetails=1`;

        console.log("Trying Nominatim with format:", addressFormat);

        const response = await fetch(nominatimUrl, {
          headers: {
            "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
          },
        });

        console.log("Nominatim response status:", response.status);

        if (!response.ok) {
          console.error(
            "Nominatim request failed with status:",
            response.status
          );
          continue; // Try next format
        }

        const data = await response.json();
        console.log("Nominatim response data:", data);

        if (data.length > 0) {
          const coordinates = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
          console.log(
            "Fallback geocoding successful, coordinates:",
            coordinates
          );
          return coordinates;
        }

        console.log("No results found in Nominatim for format:", addressFormat);
      } catch (error) {
        console.error("Error with Nominatim format:", addressFormat, error);
        continue; // Try next format
      }
    }

    console.error("All Nominatim geocoding attempts failed");
    return null;
  } catch (error) {
    console.error("Fallback geocoding error:", error);
    return null;
  }
}

/**
 * Calculate distance from shop to a customer address
 * @param customerAddress Customer address object
 * @returns Distance result or null if geocoding fails
 */
export async function calculateAddressDistance(customerAddress: {
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
}): Promise<DistanceResult | null> {
  try {
    console.log(
      "Starting distance calculation for customer address:",
      customerAddress
    );

    // Construct full address string
    const fullAddress = `${customerAddress.full_address}, ${customerAddress.city}, ${customerAddress.state} ${customerAddress.zip_code}`;
    console.log("Constructed full address:", fullAddress);

    // First, try to geocode the full address
    let coordinates = await geocodeAddress(fullAddress);

    // If full address geocoding fails, try just the city
    if (!coordinates) {
      console.log(
        "Full address geocoding failed, trying city-only geocoding..."
      );
      const cityAddress = `${customerAddress.city}, ${customerAddress.state}, India`;
      coordinates = await geocodeAddress(cityAddress);

      if (coordinates) {
        console.log(
          "City geocoding successful, using city coordinates for rough estimate"
        );
      }
    }

    // If all geocoding services fail, try hardcoded city coordinates
    if (!coordinates) {
      console.log(
        "All geocoding services failed, trying hardcoded city coordinates..."
      );
      coordinates = getCityCoordinates(customerAddress.city);

      if (coordinates) {
        console.log(
          "Using hardcoded city coordinates for:",
          customerAddress.city
        );
      }
    }

    if (!coordinates) {
      console.error("Failed to get coordinates for address:", fullAddress);
      return null;
    }

    console.log("Successfully obtained coordinates:", coordinates);

    // Calculate distance from shop
    const result = calculateDistanceFromShop(coordinates);
    console.log("Distance calculation result:", result);

    return result;
  } catch (error) {
    console.error("Error calculating address distance:", error);
    return null;
  }
}

/**
 * Check environment variables for distance calculation
 */
export function checkEnvironmentVariables() {
  const env = {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      ? "Set"
      : "Not set",
    shopLatitude: process.env.SHOP_LATITUDE || "Using default",
    shopLongitude: process.env.SHOP_LONGITUDE || "Using default",
    shopName: process.env.SHOP_NAME || "Using default",
    shopAddress: process.env.SHOP_ADDRESS || "Using default",
  };

  console.log("Environment variables check:", env);
  return env;
}

/**
 * Hardcoded coordinates for common Indian cities as fallback
 */
const CITY_COORDINATES: Record<string, Coordinates> = {
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.7041, longitude: 77.1025 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  kanpur: { latitude: 26.4499, longitude: 80.3319 },
  nagpur: { latitude: 21.1458, longitude: 79.0882 },
  indore: { latitude: 22.7196, longitude: 75.8577 },
  thane: { latitude: 19.2183, longitude: 72.9781 },
  bhopal: { latitude: 23.2599, longitude: 77.4126 },
  visakhapatnam: { latitude: 17.6868, longitude: 83.2185 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  vadodara: { latitude: 22.3072, longitude: 73.1812 },
  ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  ludhiana: { latitude: 30.901, longitude: 75.8573 },
  agra: { latitude: 27.1767, longitude: 78.0081 },
  nashik: { latitude: 19.9975, longitude: 73.7898 },
  faridabad: { latitude: 28.4089, longitude: 77.3178 },
  meerut: { latitude: 28.9845, longitude: 77.7064 },
  rajkot: { latitude: 22.3039, longitude: 70.8022 },
  kalyan: { latitude: 19.2433, longitude: 73.1355 },
  vasai: { latitude: 19.4259, longitude: 72.8225 },
  srinagar: { latitude: 34.0837, longitude: 74.7973 },
  aurangabad: { latitude: 19.8762, longitude: 75.3433 },
  dhanbad: { latitude: 23.7957, longitude: 86.4304 },
  amritsar: { latitude: 31.634, longitude: 74.8723 },
  allahabad: { latitude: 25.4358, longitude: 81.8463 },
  ranchi: { latitude: 23.3441, longitude: 85.3096 },
  howrah: { latitude: 22.5958, longitude: 88.2636 },
  cochin: { latitude: 9.9312, longitude: 76.2673 },
  raipur: { latitude: 21.2514, longitude: 81.6296 },
  jabalpur: { latitude: 23.1815, longitude: 79.9864 },
  gwalior: { latitude: 26.2183, longitude: 78.1828 },
  vijayawada: { latitude: 16.5062, longitude: 80.648 },
  jodhpur: { latitude: 26.2389, longitude: 73.0243 },
  madurai: { latitude: 9.9252, longitude: 78.1198 },
  salem: { latitude: 11.6643, longitude: 78.146 },
  tiruchirappalli: { latitude: 10.7905, longitude: 78.7047 },
  bhubaneswar: { latitude: 20.2961, longitude: 85.8245 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
};

/**
 * Get coordinates for a city from hardcoded data
 */
function getCityCoordinates(cityName: string): Coordinates | null {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalizedCity] || null;
}
