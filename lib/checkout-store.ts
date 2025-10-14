import { v4 as uuidv4 } from "uuid";
import { CheckoutStoreDB } from "./checkout-store-db";
import { CheckoutStoreRedis } from "./checkout-store-redis";
import { checkRedisHealth } from "./redis";

export interface CheckoutItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_description?: string;
  category?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant?: string;
  customization_options?: Record<string, any>;
  cake_text?: string;
  cake_flavor?: string;
  cake_size?: string;
  cake_weight?: string;
  item_has_knife?: boolean;
  item_has_candle?: boolean;
  item_has_message_card?: boolean;
  item_message_card_text?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  alternatePhone?: string;
}

export interface CheckoutSession {
  checkoutId: string;
  userId?: string;
  userEmail?: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  freeDeliveryQualified?: boolean;
  totalAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  addressText?: string;
  selectedAddressId?: string;
  couponCode?: string;
  customizationOptions?: Record<string, any>;
  cakeText?: string;
  messageCardText?: string;
  contactInfo?: ContactInfo;
  notes?: string;
  deliveryTiming?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  estimatedDeliveryTime?: string;
  distance?: number;
  duration?: number;
  deliveryZone?: string;
  // Payment related fields
  paymentStatus?: "pending" | "processing" | "paid" | "failed" | "cancelled";
  paymentAttempts?: number;
  // Database order ID
  databaseOrderId?: string;
  createdAt: string;
  expiresAt: string;
}

// In-memory store for checkout sessions
// Using a global variable to persist across hot reloads in development
declare global {
  var __checkoutSessions: Map<string, CheckoutSession> | undefined;
}

const checkoutSessions =
  globalThis.__checkoutSessions || new Map<string, CheckoutSession>();
if (!globalThis.__checkoutSessions) {
  globalThis.__checkoutSessions = checkoutSessions;
}

// Session expiry time (30 minutes)
const SESSION_EXPIRY_MINUTES = 30;

export class CheckoutStore {
  static async createSession(
    data: Omit<
      CheckoutSession,
      | "checkoutId"
      | "createdAt"
      | "expiresAt"
      | "paymentStatus"
      | "paymentAttempts"
    >
  ): Promise<CheckoutSession> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        console.log("🚀 Using Redis for checkout session storage");
        return await CheckoutStoreRedis.createSession(data);
      }
    } catch (error) {
      console.error("Redis storage failed, trying database:", error);
    }

    try {
      // Try database storage as fallback
      console.log("📊 Using database for checkout session storage");
      return await CheckoutStoreDB.createSession(data);
    } catch (error) {
      console.error(
        "Database storage failed, falling back to in-memory:",
        error
      );

      // Fallback to in-memory storage
      const checkoutId = uuidv4();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + SESSION_EXPIRY_MINUTES * 60 * 1000
      );

      const session: CheckoutSession = {
        ...data,
        checkoutId,
        paymentStatus: "pending",
        paymentAttempts: 0,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      checkoutSessions.set(checkoutId, session);

      // Clean up expired sessions
      await this.cleanupExpiredSessions();

      console.log("⚠️ Using in-memory storage (not persistent)");
      return session;
    }
  }

  static async getSession(checkoutId: string): Promise<CheckoutSession | null> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        const redisSession = await CheckoutStoreRedis.getSession(checkoutId);
        if (redisSession) {
          return redisSession;
        }
      }
    } catch (error) {
      console.error("Redis getSession failed, trying database:", error);
    }

    try {
      // Try database storage as fallback
      const dbSession = await CheckoutStoreDB.getSession(checkoutId);
      if (dbSession) {
        return dbSession;
      }
    } catch (error) {
      console.error("Database getSession failed, trying in-memory:", error);
    }

    // Fallback to in-memory storage
    const session = checkoutSessions.get(checkoutId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      checkoutSessions.delete(checkoutId);
      return null;
    }

    return session;
  }

  static async updateSession(
    checkoutId: string,
    updates: Partial<CheckoutSession>
  ): Promise<CheckoutSession | null> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        const redisResult = await CheckoutStoreRedis.updateSession(
          checkoutId,
          updates
        );
        if (redisResult) {
          return redisResult;
        }
      }
    } catch (error) {
      console.error("Redis updateSession failed, trying database:", error);
    }

    try {
      // Try database storage as fallback
      const dbResult = await CheckoutStoreDB.updateSession(checkoutId, updates);
      if (dbResult) {
        return dbResult;
      }
    } catch (error) {
      console.error("Database updateSession failed, trying in-memory:", error);
    }

    // Fallback to in-memory storage
    const session = await this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updatedSession = { ...session, ...updates };
    checkoutSessions.set(checkoutId, updatedSession);

    return updatedSession;
  }

  static async deleteSession(checkoutId: string): Promise<boolean> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        const redisResult = await CheckoutStoreRedis.deleteSession(checkoutId);
        if (redisResult) {
          return true;
        }
      }
    } catch (error) {
      console.error("Redis deleteSession failed, trying database:", error);
    }

    try {
      // Try database storage as fallback
      const dbResult = await CheckoutStoreDB.deleteSession(checkoutId);
      if (dbResult) {
        return true;
      }
    } catch (error) {
      console.error("Database deleteSession failed, trying in-memory:", error);
    }

    // Fallback to in-memory storage
    return checkoutSessions.delete(checkoutId);
  }

  // Payment specific methods
  static async updatePaymentStatus(
    checkoutId: string,
    status: CheckoutSession["paymentStatus"]
  ): Promise<CheckoutSession | null> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        const redisResult = await CheckoutStoreRedis.updatePaymentStatus(
          checkoutId,
          status
        );
        if (redisResult) {
          return redisResult;
        }
      }
    } catch (error) {
      console.error(
        "Redis updatePaymentStatus failed, trying database:",
        error
      );
    }

    try {
      // Try database storage as fallback
      const dbResult = await CheckoutStoreDB.updatePaymentStatus(
        checkoutId,
        status
      );
      if (dbResult) {
        return dbResult;
      }
    } catch (error) {
      console.error(
        "Database updatePaymentStatus failed, trying in-memory:",
        error
      );
    }

    // Fallback to in-memory storage
    const session = await this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updates: Partial<CheckoutSession> = {
      paymentStatus: status,
      paymentAttempts: (session.paymentAttempts || 0) + 1,
    };

    return this.updateSession(checkoutId, updates);
  }

  static async updateDatabaseOrderId(
    checkoutId: string,
    databaseOrderId: string
  ): Promise<CheckoutSession | null> {
    try {
      // Try Redis storage first (best performance)
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        const redisResult = await CheckoutStoreRedis.updateDatabaseOrderId(
          checkoutId,
          databaseOrderId
        );
        if (redisResult) {
          return redisResult;
        }
      }
    } catch (error) {
      console.error(
        "Redis updateDatabaseOrderId failed, trying database:",
        error
      );
    }

    try {
      // Try database storage as fallback
      const dbResult = await CheckoutStoreDB.updateDatabaseOrderId(
        checkoutId,
        databaseOrderId
      );
      if (dbResult) {
        return dbResult;
      }
    } catch (error) {
      console.error(
        "Database updateDatabaseOrderId failed, trying in-memory:",
        error
      );
    }

    // Fallback to in-memory storage
    const session = await this.getSession(checkoutId);
    if (!session) {
      return null;
    }

    const updatedSession = { ...session, databaseOrderId };
    checkoutSessions.set(checkoutId, updatedSession);
    return updatedSession;
  }

  // Redis-specific utility methods
  static async getSessionCount(): Promise<number> {
    try {
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        return await CheckoutStoreRedis.getSessionCount();
      }
    } catch (error) {
      console.error("Redis getSessionCount failed, using in-memory:", error);
    }
    return checkoutSessions.size;
  }

  static async getAllSessions(): Promise<CheckoutSession[]> {
    try {
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        return await CheckoutStoreRedis.getAllSessions();
      }
    } catch (error) {
      console.error("Redis getAllSessions failed, using in-memory:", error);
    }
    return Array.from(checkoutSessions.values());
  }

  static async getSessionsByUser(userId: string): Promise<CheckoutSession[]> {
    try {
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        return await CheckoutStoreRedis.getSessionsByUser(userId);
      }
    } catch (error) {
      console.error("Redis getSessionsByUser failed, using in-memory:", error);
    }
    return Array.from(checkoutSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        return await CheckoutStoreRedis.cleanupExpiredSessions();
      }
    } catch (error) {
      console.error(
        "Redis cleanupExpiredSessions failed, using in-memory:",
        error
      );
    }

    // Fallback to in-memory cleanup
    const now = new Date();
    let cleanedCount = 0;

    for (const [checkoutId, session] of checkoutSessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        checkoutSessions.delete(checkoutId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  static async getStats(): Promise<any> {
    try {
      const isRedisHealthy = await checkRedisHealth();
      if (isRedisHealthy) {
        return await CheckoutStoreRedis.getStats();
      }
    } catch (error) {
      console.error("Redis getStats failed:", error);
    }
    return null;
  }

  static async healthCheck(): Promise<{
    redis: boolean;
    database: boolean;
    inMemory: boolean;
    sessionCount: number;
  }> {
    const health = {
      redis: false,
      database: false,
      inMemory: true,
      sessionCount: checkoutSessions.size,
    };

    try {
      const isRedisHealthy = await checkRedisHealth();
      health.redis = isRedisHealthy;
    } catch (error) {
      console.error("Redis health check failed:", error);
    }

    try {
      // Test database connection
      await CheckoutStoreDB.getSessionCount();
      health.database = true;
    } catch (error) {
      console.error("Database health check failed:", error);
    }

    return health;
  }
}
