import { Redis } from "ioredis";
import { getRedisConfig, isRedisConfigured } from "./redis-config";

interface OTPData {
  otp: string;
  expiresAt: number;
}

// Redis-based OTP storage for persistence across API calls
let redis: Redis | null = null;

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    console.warn("Redis not configured, falling back to in-memory storage");
    return null;
  }

  if (!redis) {
    try {
      const config = getRedisConfig();
      redis = new Redis(config);
      console.log("Redis client initialized for OTP storage");
    } catch (error) {
      console.error("Failed to initialize Redis client:", error);
      return null;
    }
  }

  return redis;
}

// Fallback in-memory store for when Redis is not available
let inMemoryStore: { [email: string]: OTPData } = {};

export async function getOTPStore() {
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const keys = await redisClient.keys("otp:*");
      const store: { [email: string]: OTPData } = {};

      for (const key of keys) {
        const email = key.replace("otp:", "");
        const data = await redisClient.get(key);
        if (data) {
          store[email] = JSON.parse(data);
        }
      }

      return store;
    } catch (error) {
      console.error("Error reading OTP store from Redis:", error);
      return inMemoryStore;
    }
  }

  return inMemoryStore;
}

export async function setOTP(email: string, otp: string, expiresAt: number) {
  const redisClient = getRedisClient();
  const otpData = { otp, expiresAt };

  if (redisClient) {
    try {
      // Calculate TTL in seconds (expiresAt is timestamp, we need seconds from now)
      const ttlSeconds = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000)
      );

      await redisClient.setex(
        `otp:${email}`,
        ttlSeconds,
        JSON.stringify(otpData)
      );
      console.log("💾 OTP stored in Redis:", {
        email,
        otp,
        expiresAt,
        ttlSeconds,
      });
    } catch (error) {
      console.error("Error storing OTP in Redis:", error);
      // Fallback to in-memory storage
      inMemoryStore[email] = otpData;
      console.log("💾 OTP stored in memory (fallback):", {
        email,
        otp,
        expiresAt,
      });
    }
  } else {
    // Use in-memory storage as fallback
    inMemoryStore[email] = otpData;
    console.log("💾 OTP stored in memory:", { email, otp, expiresAt });
  }
}

export async function getOTP(email: string) {
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      const data = await redisClient.get(`otp:${email}`);
      if (data) {
        const otpData = JSON.parse(data);
        console.log("🔍 OTP retrieved from Redis:", { email, data: otpData });
        return otpData;
      }
      console.log("🔍 OTP not found in Redis:", email);
      return null;
    } catch (error) {
      console.error("Error retrieving OTP from Redis:", error);
      // Fallback to in-memory storage
      const data = inMemoryStore[email];
      console.log("🔍 OTP retrieved from memory (fallback):", { email, data });
      return data || null;
    }
  }

  // Use in-memory storage as fallback
  const data = inMemoryStore[email];
  console.log("🔍 OTP retrieved from memory:", { email, data });
  return data || null;
}

export async function deleteOTP(email: string) {
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      await redisClient.del(`otp:${email}`);
      console.log("🗑️ OTP deleted from Redis:", email);
    } catch (error) {
      console.error("Error deleting OTP from Redis:", error);
      // Fallback to in-memory storage
      delete inMemoryStore[email];
      console.log("🗑️ OTP deleted from memory (fallback):", email);
    }
  } else {
    // Use in-memory storage as fallback
    delete inMemoryStore[email];
    console.log("🗑️ OTP deleted from memory:", email);
  }
}

export async function clearExpiredOTPs() {
  const now = Date.now();
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      const keys = await redisClient.keys("otp:*");
      let hasExpired = false;

      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) {
          const otpData = JSON.parse(data);
          if (now > otpData.expiresAt) {
            await redisClient.del(key);
            hasExpired = true;
          }
        }
      }

      if (hasExpired) {
        console.log("🧹 Expired OTPs cleared from Redis");
      }
    } catch (error) {
      console.error("Error clearing expired OTPs from Redis:", error);
      // Fallback to in-memory cleanup
      let hasExpired = false;
      for (const email in inMemoryStore) {
        if (now > inMemoryStore[email].expiresAt) {
          delete inMemoryStore[email];
          hasExpired = true;
        }
      }
      if (hasExpired) {
        console.log("🧹 Expired OTPs cleared from memory (fallback)");
      }
    }
  } else {
    // Use in-memory storage cleanup
    let hasExpired = false;
    for (const email in inMemoryStore) {
      if (now > inMemoryStore[email].expiresAt) {
        delete inMemoryStore[email];
        hasExpired = true;
      }
    }
    if (hasExpired) {
      console.log("🧹 Expired OTPs cleared from memory");
    }
  }
}
