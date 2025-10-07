/**
 * Redis Configuration
 *
 * This file contains Redis configuration settings and environment variable handling.
 * It provides a centralized way to manage Redis connection parameters.
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  connectTimeout: number;
  commandTimeout: number;
  retryDelayOnClusterDown: number;
  enableOfflineQueue: boolean;
  family: number;
}

/**
 * Get Redis configuration from environment variables
 */
export function getRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: false, // Changed to false for Windows compatibility
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: true, // Changed to true for Windows compatibility
    family: 4, // IPv4
  };
}

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(
    process.env.REDIS_HOST ||
    process.env.REDIS_PORT ||
    process.env.REDIS_PASSWORD
  );
}

/**
 * Get Redis connection string for logging (without password)
 */
export function getRedisConnectionString(): string {
  const config = getRedisConfig();
  const auth = config.password ? ":***@" : "";
  return `redis://${auth}${config.host}:${config.port}/${config.db}`;
}

/**
 * Redis environment validation
 */
export function validateRedisEnvironment(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if Redis is configured
  if (!isRedisConfigured()) {
    errors.push(
      "Redis is not configured. Set REDIS_HOST, REDIS_PORT, or REDIS_PASSWORD environment variables."
    );
  }

  // Validate port
  const port = parseInt(process.env.REDIS_PORT || "6379");
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push("REDIS_PORT must be a valid port number (1-65535)");
  }

  // Validate database number
  const db = parseInt(process.env.REDIS_DB || "0");
  if (isNaN(db) || db < 0 || db > 15) {
    errors.push("REDIS_DB must be a number between 0 and 15");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Redis feature flags
 */
export const RedisFeatures = {
  // Enable Redis for checkout sessions
  CHECKOUT_SESSIONS: process.env.REDIS_ENABLE_CHECKOUT_SESSIONS !== "false",

  // Enable Redis for delivery charge caching
  DELIVERY_CACHE: process.env.REDIS_ENABLE_DELIVERY_CACHE !== "false",

  // Enable Redis for coupon caching
  COUPON_CACHE: process.env.REDIS_ENABLE_COUPON_CACHE !== "false",

  // Enable Redis for user session tracking
  USER_SESSIONS: process.env.REDIS_ENABLE_USER_SESSIONS !== "false",

  // Enable Redis statistics
  STATISTICS: process.env.REDIS_ENABLE_STATISTICS !== "false",
} as const;

/**
 * Redis TTL (Time To Live) settings in seconds
 */
export const RedisTTL = {
  CHECKOUT_SESSION: 30 * 60, // 30 minutes
  DELIVERY_CACHE: 5 * 60, // 5 minutes
  COUPON_CACHE: 10 * 60, // 10 minutes
  USER_SESSION: 24 * 60 * 60, // 24 hours
  STATISTICS: 60 * 60, // 1 hour
} as const;

/**
 * Redis key patterns
 */
export const RedisKeyPatterns = {
  CHECKOUT_SESSION: "checkout:session:*",
  CHECKOUT_INDEX: "checkout:index",
  DELIVERY_CACHE: "delivery:cache:*",
  COUPON_CACHE: "coupon:cache:*",
  USER_SESSION: "user:session:*",
  STATISTICS: "stats:*",
} as const;
