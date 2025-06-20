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
  isDeliverable: boolean; // whether address is within delivery radius
  deliveryMessage?: string; // message for delivery status
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

// Delivery radius in kilometers
export const DELIVERY_RADIUS_KM = 30;

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

  // Check if within delivery radius (30km)
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

  return {
    distance,
    distanceMiles,
    duration,
    formattedDistance: formatDistance(distance),
    formattedDuration: formatDuration(duration),
    isDeliverable,
    deliveryMessage,
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
  gandhipuram: { latitude: 11.0174, longitude: 76.9661 },
  rs_puram: { latitude: 11.0066, longitude: 76.9502 },
  peelamedu: { latitude: 11.0354, longitude: 77.008 },
  saibaba_colony: { latitude: 11.0229, longitude: 76.9483 },
  race_course: { latitude: 11.0089, longitude: 76.9618 },
  singanallur: { latitude: 11.0084, longitude: 77.0266 },
  ukkadam: { latitude: 10.9923, longitude: 76.9544 },
  podanur: { latitude: 10.9742, longitude: 76.9635 },
  vadavalli: { latitude: 11.0251, longitude: 76.9011 },
  kuniamuthur: { latitude: 10.9763, longitude: 76.9401 },
  sundarapuram: { latitude: 10.9652, longitude: 76.9487 },
  kovilpalayam: { latitude: 11.1163, longitude: 77.0342 },
  sulur: { latitude: 11.0262, longitude: 77.1459 },
  perur: { latitude: 10.9989, longitude: 76.9113 },
  thudiyalur: { latitude: 11.0707, longitude: 76.9402 },
  eachanari: { latitude: 10.9505, longitude: 76.9773 },
  vellalore: { latitude: 10.9391, longitude: 76.9996 },
  karamadai: { latitude: 11.2432, longitude: 76.9606 },
  mettupalayam: { latitude: 11.2991, longitude: 76.9345 },
  saravanampatti: { latitude: 11.0804, longitude: 76.9994 },
  kalapatti: { latitude: 11.0664, longitude: 77.0386 },
  irugur: { latitude: 11.0024, longitude: 77.0596 },
  ganapathy: { latitude: 11.0413, longitude: 76.9723 },
  kurichi: { latitude: 10.9625, longitude: 76.9395 },
  malumichampatti: { latitude: 10.9191, longitude: 76.9914 },
  madukkarai: { latitude: 10.8869, longitude: 76.9637 },
  neelambur: { latitude: 11.0323, longitude: 77.0851 },
  chinniampalayam: { latitude: 11.0159, longitude: 77.0359 },
  gudalur: { latitude: 11.026, longitude: 76.7292 },
  kinathukadavu: { latitude: 10.7979, longitude: 77.0027 },
  karumathampatti: { latitude: 11.1027, longitude: 77.1166 },
  annur: { latitude: 11.2333, longitude: 77.1667 },
  somayampalayam: { latitude: 11.0252, longitude: 76.9153 },
  narasimhanaickenpalayam: { latitude: 11.0872, longitude: 76.9583 },
  vedapatti: { latitude: 10.9985, longitude: 76.8938 },
  vadapudhur: { latitude: 10.9605, longitude: 76.9684 },
  vellakinar: { latitude: 11.0701, longitude: 76.9611 },
  vellanaipatti: { latitude: 11.0993, longitude: 77.0132 },
  chinnavedampatti: { latitude: 11.0645, longitude: 76.9855 },
  kallapalayam: { latitude: 11.0792, longitude: 76.9713 },
  chettipalayam: { latitude: 10.9165, longitude: 77.0054 },
  sivanandha_colony: { latitude: 11.0258, longitude: 76.9596 },
  hopes: { latitude: 11.0333, longitude: 77.0125 },
  sitra: { latitude: 11.0374, longitude: 77.0495 },
  kalveerampalayam: { latitude: 11.0389, longitude: 76.891 },
  kurudampalayam: { latitude: 11.0788, longitude: 76.9489 },
  maniyakarampalayam: { latitude: 11.0487, longitude: 76.9795 },
  kavundampalayam: { latitude: 11.0422, longitude: 76.9308 },
  pappampatti: { latitude: 10.9781, longitude: 77.0503 },
  kannampalayam: { latitude: 11.0457, longitude: 77.0679 },
  vadamadurai: { latitude: 11.1861, longitude: 77.1478 },
  thondamuthur: { latitude: 11.0021, longitude: 76.8403 },
  arasampalayam: { latitude: 10.9973, longitude: 76.9354 },
  karumbukadai: { latitude: 10.9801, longitude: 76.9515 },
  pattaravakkam: { latitude: 11.0062, longitude: 77.0003 },
  nggo_colony: { latitude: 11.0799, longitude: 76.9433 },
  attukal: { latitude: 10.9227, longitude: 77.0136 },
  veerakeralam: { latitude: 10.9999, longitude: 76.887 },
  pattinam: { latitude: 10.9487, longitude: 77.016 },
  selvapuram: { latitude: 10.9978, longitude: 76.9321 },
  karanampettai: { latitude: 10.8911, longitude: 77.1466 },
  ondipudur: { latitude: 11.0046, longitude: 77.0408 },
  podanur_railway_colony: { latitude: 10.9691, longitude: 76.9649 },
  puliakulam: { latitude: 11.0054, longitude: 76.984 },
  texmo_colony: { latitude: 11.0246, longitude: 76.9752 },
  kurumbapalayam: { latitude: 11.0893, longitude: 77.0287 },
  kovaipudur: { latitude: 10.9786, longitude: 76.9003 },
  ramanathapuram: { latitude: 11.0081, longitude: 77.0064 },
  selvapuram_south: { latitude: 10.9942, longitude: 76.9265 },
  coimbatore_fort_area: { latitude: 11.0045, longitude: 76.954 },

  /**
   * POLLACHI_COORDINATES
   */
  pollachi_town: { latitude: 10.6584, longitude: 77.0085 },
  udumalpet_road: { latitude: 10.6685, longitude: 77.0415 },
  achipatti: { latitude: 10.6421, longitude: 77.0337 },
  anamalai: { latitude: 10.5715, longitude: 76.9345 },
  zaminuthukuli: { latitude: 10.6511, longitude: 77.0045 },
  meenakshipuram: { latitude: 10.6409, longitude: 77.0483 },
  vennandur: { latitude: 10.6807, longitude: 77.0263 },
  kottur: { latitude: 10.5871, longitude: 77.0323 },
  vadugapalayam: { latitude: 10.6493, longitude: 77.0722 },
  sultanpet: { latitude: 10.6964, longitude: 77.0376 },
  mahalingapuram: { latitude: 10.6357, longitude: 77.0182 },
  kaliyapuram: { latitude: 10.6625, longitude: 77.0632 },
  kollengode_border: { latitude: 10.6354, longitude: 76.7645 },
  pongalur: { latitude: 10.8294, longitude: 77.2529 },
  top_slip: { latitude: 10.4882, longitude: 76.9189 },
  parambikulam: { latitude: 10.4781, longitude: 76.8709 },
  sethumadai: { latitude: 10.5617, longitude: 76.9445 },
  udumalpet_border: { latitude: 10.5967, longitude: 77.2419 },
  kottamangalam: { latitude: 10.6764, longitude: 77.0009 },
  vadakkipalayam: { latitude: 10.6768, longitude: 76.9856 },
  vadakkipalayam_pudur: { latitude: 10.6822, longitude: 76.9784 },
  moolathurai: { latitude: 10.5483, longitude: 76.9267 },
  veerappampalayam: { latitude: 10.6353, longitude: 76.9962 },
  velanthavalam: { latitude: 10.7633, longitude: 76.9008 },
  samathur: { latitude: 10.6119, longitude: 76.9762 },
  vadakkanandal: { latitude: 10.6239, longitude: 76.9472 },
  kinathukadavu_pollachi_side: { latitude: 10.7353, longitude: 76.9987 },
  sulakkal: { latitude: 10.5934, longitude: 77.1015 },
  jallipatti: { latitude: 10.4982, longitude: 77.1637 },
  periya_negamam: { latitude: 10.7346, longitude: 76.9492 },
  malumichampatti_pollachi_road: { latitude: 10.9203, longitude: 77.0121 },
  valparai: { latitude: 10.3253, longitude: 76.9552 },
  attakatti: { latitude: 10.3484, longitude: 76.9565 },
  loams_view_point: { latitude: 10.355, longitude: 76.95 },
  aliyar_dam: { latitude: 10.4895, longitude: 76.9556 },
  monkey_falls: { latitude: 10.4953, longitude: 76.956 },
  elayamuthur: { latitude: 10.6072, longitude: 77.0464 },
  muthur: { latitude: 10.5783, longitude: 77.0172 },
  kollankinar: { latitude: 10.6641, longitude: 76.9544 },
  devarayapuram: { latitude: 10.6521, longitude: 76.9768 },
  vadavalli_pollachi: { latitude: 10.682, longitude: 77.0409 },
  vadakkanampalayam: { latitude: 10.6969, longitude: 77.0246 },
  thippampatti: { latitude: 10.7234, longitude: 76.9763 },
  myleripalayam: { latitude: 10.878, longitude: 77.0049 },
  kannivadi: { latitude: 10.6187, longitude: 77.1599 },
  devipatinam: { latitude: 10.6908, longitude: 77.0055 },
  anjur: { latitude: 10.6034, longitude: 77.0833 },
  vazhukkalpatti: { latitude: 10.7097, longitude: 77.0755 },
  thalakkarai: { latitude: 10.6394, longitude: 76.9583 },
  puravipalayam: { latitude: 10.7032, longitude: 76.9874 },
  karumathampatti_pollachi_side: { latitude: 10.9303, longitude: 77.0659 },
};

/**
 * Get coordinates for a city from hardcoded data
 */
function getCityCoordinates(cityName: string): Coordinates | null {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalizedCity] || null;
}
