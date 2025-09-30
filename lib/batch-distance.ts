// Batch distance calculation system to reduce API calls
// Instead of making multiple individual API calls, batch them together

import { SHOP_LOCATION } from "@/lib/shop-config";
import { distanceCache } from "./distance-cache";

interface BatchDistanceRequest {
  id: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  pincode?: string;
  area?: string;
}

interface BatchDistanceResult {
  id: string;
  distance: number;
  duration: number;
  success: boolean;
  error?: string;
  accuracy: string;
  locationType: string;
}

interface BatchDistanceResponse {
  results: BatchDistanceResult[];
  totalRequests: number;
  cachedRequests: number;
  apiRequests: number;
  costSavings: number; // Estimated cost savings in USD
}

class BatchDistanceCalculator {
  private readonly BATCH_SIZE = 25; // Google Maps allows up to 25 destinations per request
  private readonly API_COST_PER_1000 = 5.0; // $5 per 1000 requests

  // Process batch distance calculations
  async calculateBatchDistances(
    requests: BatchDistanceRequest[]
  ): Promise<BatchDistanceResponse> {
    console.log(
      `🔄 Processing batch distance calculation for ${requests.length} requests`
    );

    const results: BatchDistanceResult[] = [];
    let cachedRequests = 0;
    let apiRequests = 0;

    // Check cache first for each request
    for (const request of requests) {
      const cachedResult = this.getCachedResult(request);

      if (cachedResult) {
        results.push({
          id: request.id,
          ...cachedResult,
          success: true,
          locationType: request.coordinates ? "GPS Coordinates" : "Address",
        });
        cachedRequests++;
      }
    }

    // Process non-cached requests in batches
    const uncachedRequests = requests.filter(
      (req) => !results.find((result) => result.id === req.id)
    );

    if (uncachedRequests.length > 0) {
      const batchResults = await this.processBatchRequests(uncachedRequests);
      results.push(...batchResults);
      apiRequests = Math.ceil(uncachedRequests.length / this.BATCH_SIZE);
    }

    const costSavings = this.calculateCostSavings(cachedRequests, apiRequests);

    console.log(
      `✅ Batch processing complete: ${cachedRequests} cached, ${apiRequests} API calls, $${costSavings.toFixed(
        2
      )} saved`
    );

    return {
      results,
      totalRequests: requests.length,
      cachedRequests,
      apiRequests,
      costSavings,
    };
  }

  // Get cached result for a request
  private getCachedResult(
    request: BatchDistanceRequest
  ): { distance: number; duration: number; accuracy: string } | null {
    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;

    if (request.coordinates) {
      return distanceCache.getCachedDistance(
        { lat: SHOP_LOCATION.latitude, lng: SHOP_LOCATION.longitude },
        request.coordinates
      );
    } else if (request.address) {
      return distanceCache.getCachedDistance(origin, request.address);
    } else if (request.area && request.pincode) {
      const destination = `${request.area}, ${request.pincode}, Coimbatore, Tamil Nadu, India`;
      return distanceCache.getCachedDistance(origin, destination);
    }

    return null;
  }

  // Process batch requests through Google Maps API
  private async processBatchRequests(
    requests: BatchDistanceRequest[]
  ): Promise<BatchDistanceResult[]> {
    const results: BatchDistanceResult[] = [];
    const batches = this.createBatches(requests, this.BATCH_SIZE);

    for (const batch of batches) {
      try {
        const batchResult = await this.processSingleBatch(batch);
        results.push(...batchResult);
      } catch (error) {
        console.error("❌ Batch processing error:", error);

        // Fallback to individual requests
        for (const request of batch) {
          results.push({
            id: request.id,
            distance: 15, // Default fallback
            duration: 30,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Batch processing failed",
            accuracy: "approximate",
            locationType: "Fallback",
          });
        }
      }
    }

    return results;
  }

  // Create batches of requests
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  // Process a single batch through Google Maps API
  private async processSingleBatch(
    requests: BatchDistanceRequest[]
  ): Promise<BatchDistanceResult[]> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }

    const origin = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
    const destinations = requests
      .map((req) => {
        if (req.coordinates) {
          return `${req.coordinates.lat},${req.coordinates.lng}`;
        } else if (req.address) {
          return req.address;
        } else if (req.area && req.pincode) {
          return `${req.area}, ${req.pincode}, Coimbatore, Tamil Nadu, India`;
        }
        return "";
      })
      .filter((dest) => dest);

    if (destinations.length === 0) {
      return requests.map((req) => ({
        id: req.id,
        distance: 15,
        duration: 30,
        success: false,
        error: "No valid destination",
        accuracy: "approximate",
        locationType: "Invalid",
      }));
    }

    // Google Maps Distance Matrix API call
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(
      destinations.join("|")
    )}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&key=${apiKey}`;

    console.log(
      `🌐 Making batch API call for ${destinations.length} destinations`
    );

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Maps API status: ${data.status}`);
    }

    // Process results
    const results: BatchDistanceResult[] = [];
    const elements = data.rows[0].elements;

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const element = elements[i];

      if (element.status === "OK") {
        const distance = Math.round((element.distance.value / 1000) * 10) / 10;
        const duration = Math.round(element.duration.value / 60);

        // Cache the result
        this.cacheResult(request, distance, duration);

        results.push({
          id: request.id,
          distance,
          duration,
          success: true,
          accuracy: "precise",
          locationType: request.coordinates ? "GPS Coordinates" : "Address",
        });
      } else {
        results.push({
          id: request.id,
          distance: 15,
          duration: 30,
          success: false,
          error: `Route status: ${element.status}`,
          accuracy: "approximate",
          locationType: "Error",
        });
      }
    }

    return results;
  }

  // Cache the result for future use
  private cacheResult(
    request: BatchDistanceRequest,
    distance: number,
    duration: number
  ): void {
    const origin = {
      lat: SHOP_LOCATION.latitude,
      lng: SHOP_LOCATION.longitude,
    };

    if (request.coordinates) {
      distanceCache.setCachedDistance(
        origin,
        request.coordinates,
        distance,
        duration,
        "precise"
      );
    } else if (request.address) {
      const originStr = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
      distanceCache.setCachedDistance(
        originStr,
        request.address,
        distance,
        duration,
        "precise"
      );
    } else if (request.area && request.pincode) {
      const originStr = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
      const destination = `${request.area}, ${request.pincode}, Coimbatore, Tamil Nadu, India`;
      distanceCache.setCachedDistance(
        originStr,
        destination,
        distance,
        duration,
        "approximate"
      );
    }
  }

  // Calculate cost savings
  private calculateCostSavings(
    cachedRequests: number,
    apiRequests: number
  ): number {
    const totalRequests = cachedRequests + apiRequests;
    const costWithoutCache = (totalRequests / 1000) * this.API_COST_PER_1000;
    const costWithCache = (apiRequests / 1000) * this.API_COST_PER_1000;

    return costWithoutCache - costWithCache;
  }

  // Get usage statistics
  getUsageStats(): {
    cacheStats: ReturnType<typeof distanceCache.getCacheStats>;
    estimatedMonthlyCost: number;
    estimatedSavings: number;
  } {
    const cacheStats = distanceCache.getCacheStats();
    const estimatedMonthlyCost =
      (cacheStats.validEntries / 1000) * this.API_COST_PER_1000;
    const estimatedSavings =
      (cacheStats.totalEntries / 1000) * this.API_COST_PER_1000;

    return {
      cacheStats,
      estimatedMonthlyCost,
      estimatedSavings,
    };
  }
}

// Export singleton instance
export const batchDistanceCalculator = new BatchDistanceCalculator();

// Export types
export type {
  BatchDistanceRequest,
  BatchDistanceResult,
  BatchDistanceResponse,
};
