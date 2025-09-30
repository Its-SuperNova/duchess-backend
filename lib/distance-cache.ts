// Distance calculation cache to reduce Google Maps API calls
// This significantly reduces costs by avoiding repeated API requests

interface CacheEntry {
  distance: number;
  duration: number;
  timestamp: number;
  accuracy: string;
}

interface DistanceCache {
  [key: string]: CacheEntry;
}

class DistanceCacheManager {
  private cache: DistanceCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached entries

  // Generate cache key from coordinates
  private generateCacheKey(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): string {
    // Round coordinates to 4 decimal places (~11 meters precision) for better cache hits
    const roundCoord = (coord: number) => Math.round(coord * 10000) / 10000;

    return `${roundCoord(origin.lat)},${roundCoord(origin.lng)}-${roundCoord(
      destination.lat
    )},${roundCoord(destination.lng)}`;
  }

  // Generate cache key from address strings
  private generateAddressCacheKey(origin: string, destination: string): string {
    return `${origin}|${destination}`;
  }

  // Check if cache entry is valid (not expired)
  private isValidEntry(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  // Clean expired entries
  private cleanExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      if (now - this.cache[key].timestamp >= this.CACHE_DURATION) {
        delete this.cache[key];
      }
    });
  }

  // Remove oldest entries if cache is full
  private evictOldestEntries(): void {
    if (Object.keys(this.cache).length >= this.MAX_CACHE_SIZE) {
      const entries = Object.entries(this.cache);
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 20% of entries
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.2);
      for (let i = 0; i < toRemove; i++) {
        delete this.cache[entries[i][0]];
      }
    }
  }

  // Get cached distance result
  getCachedDistance(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string
  ): { distance: number; duration: number; accuracy: string } | null {
    this.cleanExpiredEntries();

    let cacheKey: string;

    if (typeof origin === "string" && typeof destination === "string") {
      cacheKey = this.generateAddressCacheKey(origin, destination);
    } else if (typeof origin === "object" && typeof destination === "object") {
      cacheKey = this.generateCacheKey(origin, destination);
    } else {
      return null;
    }

    const entry = this.cache[cacheKey];

    if (entry && this.isValidEntry(entry)) {
      console.log("🎯 Cache hit for distance calculation:", cacheKey);
      return {
        distance: entry.distance,
        duration: entry.duration,
        accuracy: entry.accuracy,
      };
    }

    console.log("❌ Cache miss for distance calculation:", cacheKey);
    return null;
  }

  // Store distance result in cache
  setCachedDistance(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    distance: number,
    duration: number,
    accuracy: string = "approximate"
  ): void {
    this.evictOldestEntries();

    let cacheKey: string;

    if (typeof origin === "string" && typeof destination === "string") {
      cacheKey = this.generateAddressCacheKey(origin, destination);
    } else if (typeof origin === "object" && typeof destination === "object") {
      cacheKey = this.generateCacheKey(origin, destination);
    } else {
      return;
    }

    this.cache[cacheKey] = {
      distance,
      duration,
      timestamp: Date.now(),
      accuracy,
    };

    console.log("💾 Cached distance calculation:", cacheKey, {
      distance,
      duration,
      accuracy,
    });
  }

  // Get cache statistics
  getCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    cacheHitRate?: number;
  } {
    this.cleanExpiredEntries();

    const totalEntries = Object.keys(this.cache).length;
    const validEntries = Object.values(this.cache).filter((entry) =>
      this.isValidEntry(entry)
    ).length;
    const expiredEntries = totalEntries - validEntries;

    return {
      totalEntries,
      validEntries,
      expiredEntries,
    };
  }

  // Clear all cache
  clearCache(): void {
    this.cache = {};
    console.log("🗑️ Distance cache cleared");
  }

  // Clear expired entries only
  clearExpiredCache(): void {
    const beforeCount = Object.keys(this.cache).length;
    this.cleanExpiredEntries();
    const afterCount = Object.keys(this.cache).length;
    console.log(`🧹 Cleared ${beforeCount - afterCount} expired cache entries`);
  }
}

// Export singleton instance
export const distanceCache = new DistanceCacheManager();

// Export types for use in other files
export type { CacheEntry, DistanceCache };

