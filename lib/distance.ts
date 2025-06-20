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
 * Calculate road distance between two coordinates using OSRM API
 * @param lat1 Starting latitude
 * @param lon1 Starting longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 * @returns Road distance in kilometers
 * @throws Error if no route found or API fails
 */
export async function getRoadDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    // Validate input coordinates
    if (!isValidLatitude(lat1) || !isValidLatitude(lat2)) {
      throw new Error("Invalid latitude values. Must be between -90 and 90.");
    }

    if (!isValidLongitude(lon1) || !isValidLongitude(lon2)) {
      throw new Error(
        "Invalid longitude values. Must be between -180 and 180."
      );
    }

    // Construct OSRM API URL
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

    console.log("Requesting road distance from OSRM API:", url);

    // Fetch route data from OSRM
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OSRM API request failed with status: ${response.status} ${response.statusText}`
      );
    }

    const data: OSRMResponse = await response.json();

    // Check if route was found
    if (data.code !== "Ok") {
      throw new Error(`OSRM API error: ${data.code}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between the specified coordinates");
    }

    // Extract distance from the first route
    const distanceInMeters = data.routes[0].distance;

    if (distanceInMeters === undefined || distanceInMeters < 0) {
      throw new Error("Invalid distance returned from OSRM API");
    }

    // Convert meters to kilometers
    const distanceInKm = distanceInMeters / 1000;

    console.log(
      `OSRM road distance: ${distanceInKm.toFixed(2)}km (${distanceInMeters}m)`
    );

    return distanceInKm;
  } catch (error) {
    console.error("Error calculating road distance:", error);

    // Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(`Failed to calculate road distance: ${error.message}`);
    } else {
      throw new Error("Failed to calculate road distance: Unknown error");
    }
  }
}

/**
 * Calculate road distance and duration between two coordinates using OSRM API
 * @param lat1 Starting latitude
 * @param lon1 Starting longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 * @returns Object containing distance in km and duration in minutes
 * @throws Error if no route found or API fails
 */
export async function getRoadDistanceAndDuration(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<{ distance: number; duration: number }> {
  try {
    // Validate input coordinates
    if (!isValidLatitude(lat1) || !isValidLatitude(lat2)) {
      throw new Error("Invalid latitude values. Must be between -90 and 90.");
    }

    if (!isValidLongitude(lon1) || !isValidLongitude(lon2)) {
      throw new Error(
        "Invalid longitude values. Must be between -180 and 180."
      );
    }

    // Construct OSRM API URL
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

    console.log("Requesting road distance and duration from OSRM API:", url);

    // Fetch route data from OSRM
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OSRM API request failed with status: ${response.status} ${response.statusText}`
      );
    }

    const data: OSRMResponse = await response.json();

    // Check if route was found
    if (data.code !== "Ok") {
      throw new Error(`OSRM API error: ${data.code}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between the specified coordinates");
    }

    // Extract distance and duration from the first route
    const distanceInMeters = data.routes[0].distance;
    const durationInSeconds = data.routes[0].duration;

    if (distanceInMeters === undefined || distanceInMeters < 0) {
      throw new Error("Invalid distance returned from OSRM API");
    }

    if (durationInSeconds === undefined || durationInSeconds < 0) {
      throw new Error("Invalid duration returned from OSRM API");
    }

    // Convert to appropriate units
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
    console.error("Error calculating road distance and duration:", error);

    // Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(
        `Failed to calculate road distance and duration: ${error.message}`
      );
    } else {
      throw new Error(
        "Failed to calculate road distance and duration: Unknown error"
      );
    }
  }
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
 * Test function to verify OSRM API integration
 * @param lat1 Starting latitude
 * @param lon1 Starting longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 */
export async function testOSRMDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<void> {
  try {
    console.log("=== OSRM Distance Test ===");
    console.log("From:", lat1, lon1);
    console.log("To:", lat2, lon2);

    const result = await getRoadDistanceAndDuration(lat1, lon1, lat2, lon2);

    console.log("Distance:", result.distance.toFixed(2), "km");
    console.log("Duration:", result.duration, "minutes");
    console.log("=== Test Complete ===");
  } catch (error) {
    console.error("OSRM Test failed:", error);
  }
}
