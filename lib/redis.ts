import Redis from "ioredis";
import { getRedisConfig, validateRedisEnvironment } from "./redis-config";

// Create Redis client instance
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    // Validate Redis environment
    const validation = validateRedisEnvironment();
    if (!validation.isValid) {
      console.warn("Redis configuration issues:", validation.errors);
    }

    const redisConfig = getRedisConfig();
    // Fix for Windows Redis connection issues
    redisClient = new Redis({
      ...redisConfig,
      enableOfflineQueue: true,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

    // Add error handling
    redisClient.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
    });

    redisClient.on("ready", () => {
      console.log("Redis ready to accept commands");
    });

    redisClient.on("close", () => {
      console.log("Redis connection closed");
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis reconnecting...");
    });
  }

  return redisClient;
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
}

// Redis key utilities
export class RedisKeys {
  static CHECKOUT_SESSION = (checkoutId: string) =>
    `checkout:session:${checkoutId}`;
  static CHECKOUT_EXPIRY = (checkoutId: string) =>
    `checkout:expiry:${checkoutId}`;
  static CHECKOUT_INDEX = "checkout:index";
  static CHECKOUT_STATS = "checkout:stats";
  static DELIVERY_CACHE = (distance: number, orderValue: number) =>
    `delivery:cache:${distance}:${orderValue}`;
  static COUPON_CACHE = (couponCode: string) => `coupon:cache:${couponCode}`;
  static USER_SESSIONS = (userId: string) => `user:sessions:${userId}`;
}

// Redis utility functions
export class RedisUtils {
  static async setWithExpiry(
    key: string,
    value: any,
    ttlSeconds: number
  ): Promise<void> {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  }

  static async getAndParse<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  static async deleteKey(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  static async getTTL(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.ttl(key);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  static async extendTTL(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error(`Error extending TTL for key ${key}:`, error);
      return false;
    }
  }

  static async getKeys(pattern: string): Promise<string[]> {
    try {
      const client = getRedisClient();
      return await client.keys(pattern);
    } catch (error) {
      console.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  static async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const client = getRedisClient();
      const values = await client.mget(...keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error("Error getting multiple keys:", error);
      return keys.map(() => null);
    }
  }

  static async setMultiple(
    keyValuePairs: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    try {
      const client = getRedisClient();
      const pipeline = client.pipeline();

      for (const { key, value, ttl } of keyValuePairs) {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value));
        } else {
          pipeline.set(key, JSON.stringify(value));
        }
      }

      await pipeline.exec();
    } catch (error) {
      console.error("Error setting multiple keys:", error);
    }
  }
}

export default getRedisClient;
