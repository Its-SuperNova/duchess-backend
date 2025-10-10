import { v4 as uuidv4 } from "uuid";
import { RedisKeys, RedisUtils, getRedisClient } from "./redis";
import type {
  CheckoutSession,
  CheckoutItem,
  ContactInfo,
} from "./checkout-store";

// Session expiry time (30 minutes)
const SESSION_EXPIRY_MINUTES = 30;
const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_MINUTES * 60;

export class CheckoutStoreRedis {
  /**
   * Create a new checkout session in Redis
   */
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

      // Log initial checkout session data being stored in Redis
      console.log("🔴 STORING INITIAL CHECKOUT SESSION IN REDIS:", {
        storageType: "Redis",
        tableName: "checkout_sessions (Redis)",
        checkoutId: checkoutId,
        storageAction: "CREATE",
        initialDataStored: {
          // Order Items (always present during creation)
          orderItems: data.items.map((item) => ({
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            variant: item.variant || "Standard",
            redisField: "items",
          })),

          // Financial Information (always present during creation)
          financialDetails: {
            subtotal: data.subtotal,
            discount: data.discount,
            deliveryFee: data.deliveryFee,
            cgstAmount: data.cgstAmount || 0,
            sgstAmount: data.sgstAmount || 0,
            totalAmount: data.totalAmount,
            couponCode: data.couponCode || "No coupon applied",
            redisFields: {
              subtotal: data.subtotal,
              discount: data.discount,
              deliveryFee: data.deliveryFee,
              cgstAmount: data.cgstAmount,
              sgstAmount: data.sgstAmount,
              totalAmount: data.totalAmount,
              couponCode: data.couponCode,
            },
          },

          // User Information (always present during creation)
          userInfo: {
            userId: data.userId || "Guest user",
            userEmail: data.userEmail || "No email provided",
            redisFields: {
              userId: data.userId,
              userEmail: data.userEmail,
            },
          },

          // Receiver Details (may be present during creation, will be updated later)
          receiverDetails: {
            contactInfo: data.contactInfo
              ? {
                  name: data.contactInfo.name,
                  phone: data.contactInfo.phone,
                  alternatePhone:
                    data.contactInfo.alternatePhone || "Not provided",
                  redisField: "contactInfo",
                  status: "Present during creation",
                }
              : {
                  status: "Will be added via PATCH request",
                  redisField: "contactInfo",
                },

            deliveryAddress: {
              addressText:
                data.addressText || "Will be added via PATCH request",
              selectedAddressId:
                data.selectedAddressId || "Will be added via PATCH request",
              distance: data.distance
                ? `${data.distance.toFixed(2)} km`
                : "Will be calculated via PATCH request",
              duration: data.duration
                ? `${Math.round(data.duration / 60)} minutes`
                : "Will be calculated via PATCH request",
              deliveryZone:
                data.deliveryZone || "Will be added via PATCH request",
              redisFields: {
                addressText: data.addressText,
                selectedAddressId: data.selectedAddressId,
                distance: data.distance,
                duration: data.duration,
                deliveryZone: data.deliveryZone,
              },
            },

            deliveryTiming: {
              timing: data.deliveryTiming || "Will be added via PATCH request",
              deliveryDate:
                data.deliveryDate || "Will be added via PATCH request",
              deliveryTimeSlot:
                data.deliveryTimeSlot || "Will be added via PATCH request",
              estimatedDeliveryTime:
                data.estimatedDeliveryTime || "Will be added via PATCH request",
              redisFields: {
                deliveryTiming: data.deliveryTiming,
                deliveryDate: data.deliveryDate,
                deliveryTimeSlot: data.deliveryTimeSlot,
                estimatedDeliveryTime: data.estimatedDeliveryTime,
              },
            },

            customization: {
              notes: data.notes || "Will be added via PATCH request",
              cakeText: data.cakeText || "Will be added via PATCH request",
              messageCardText:
                data.messageCardText || "Will be added via PATCH request",
              customizationOptions: data.customizationOptions || {},
              redisFields: {
                notes: data.notes,
                cakeText: data.cakeText,
                messageCardText: data.messageCardText,
                customizationOptions: data.customizationOptions,
              },
            },
          },

          // Session Management
          sessionInfo: {
            expiresAt: expiresAt.toISOString(),
            paymentStatus: "pending",
            paymentAttempts: 0,
            ttlSeconds: SESSION_EXPIRY_SECONDS,
            redisFields: {
              expiresAt: expiresAt.toISOString(),
              paymentStatus: "pending",
              paymentAttempts: 0,
            },
          },
        },

        // Redis storage details
        redisStorage: {
          key: RedisKeys.CHECKOUT_SESSION(checkoutId),
          ttlSeconds: SESSION_EXPIRY_SECONDS,
          expiresAt: expiresAt.toISOString(),
          completeSessionData: session,
        },

        // Note about receiver details
        note: "Receiver details (contact info, delivery address, timing, customization) will be updated via PATCH requests to /api/checkout/[checkoutId] during the checkout process",
      });

      // Store session in Redis with TTL
      await RedisUtils.setWithExpiry(
        RedisKeys.CHECKOUT_SESSION(checkoutId),
        session,
        SESSION_EXPIRY_SECONDS
      );

      // Add to checkout index for tracking
      await this.addToIndex(checkoutId);

      // Update statistics
      await this.updateStats("created");

      console.log(`✅ Checkout session created in Redis: ${checkoutId}`);
      return session;
    } catch (error) {
      console.error("Error creating checkout session in Redis:", error);
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Get a checkout session from Redis
   */
  static async getSession(checkoutId: string): Promise<CheckoutSession | null> {
    try {
      const session = await RedisUtils.getAndParse<CheckoutSession>(
        RedisKeys.CHECKOUT_SESSION(checkoutId)
      );

      if (!session) {
        return null;
      }

      // Check if session has expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.deleteSession(checkoutId);
        return null;
      }

      // Extend TTL on access (sliding expiry)
      await RedisUtils.extendTTL(
        RedisKeys.CHECKOUT_SESSION(checkoutId),
        SESSION_EXPIRY_SECONDS
      );

      return session;
    } catch (error) {
      console.error(`Error getting checkout session ${checkoutId}:`, error);
      return null;
    }
  }

  /**
   * Update a checkout session in Redis
   */
  static async updateSession(
    checkoutId: string,
    updates: Partial<CheckoutSession>
  ): Promise<CheckoutSession | null> {
    try {
      const session = await this.getSession(checkoutId);

      if (!session) {
        return null;
      }

      const updatedSession = { ...session, ...updates };

      // Update session in Redis
      await RedisUtils.setWithExpiry(
        RedisKeys.CHECKOUT_SESSION(checkoutId),
        updatedSession,
        SESSION_EXPIRY_SECONDS
      );

      console.log(`✅ Checkout session updated in Redis: ${checkoutId}`);
      return updatedSession;
    } catch (error) {
      console.error(`Error updating checkout session ${checkoutId}:`, error);
      return null;
    }
  }

  /**
   * Delete a checkout session from Redis
   */
  static async deleteSession(checkoutId: string): Promise<boolean> {
    try {
      const deleted = await RedisUtils.deleteKey(
        RedisKeys.CHECKOUT_SESSION(checkoutId)
      );

      // Remove from index
      await this.removeFromIndex(checkoutId);

      if (deleted) {
        console.log(`✅ Checkout session deleted from Redis: ${checkoutId}`);
      }

      return deleted;
    } catch (error) {
      console.error(`Error deleting checkout session ${checkoutId}:`, error);
      return false;
    }
  }

  /**
   * Update payment status for a checkout session
   */
  static async updatePaymentStatus(
    checkoutId: string,
    status: CheckoutSession["paymentStatus"]
  ): Promise<CheckoutSession | null> {
    try {
      const session = await this.getSession(checkoutId);

      if (!session) {
        return null;
      }

      const updates: Partial<CheckoutSession> = {
        paymentStatus: status,
        paymentAttempts: (session.paymentAttempts || 0) + 1,
      };

      const updatedSession = await this.updateSession(checkoutId, updates);

      if (updatedSession) {
        console.log(
          `✅ Payment status updated to ${status} for session: ${checkoutId}`
        );

        // Update statistics
        await this.updateStats("payment_status_updated", { status });
      }

      return updatedSession;
    } catch (error) {
      console.error(`Error updating payment status for ${checkoutId}:`, error);
      return null;
    }
  }

  /**
   * Update database order ID for a checkout session
   */
  static async updateDatabaseOrderId(
    checkoutId: string,
    databaseOrderId: string
  ): Promise<CheckoutSession | null> {
    try {
      const updatedSession = await this.updateSession(checkoutId, {
        databaseOrderId,
      });

      if (updatedSession) {
        console.log(`✅ Database order ID updated for session: ${checkoutId}`);

        // Update statistics
        await this.updateStats("order_created");
      }

      return updatedSession;
    } catch (error) {
      console.error(
        `Error updating database order ID for ${checkoutId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get all active checkout sessions
   */
  static async getAllSessions(): Promise<CheckoutSession[]> {
    try {
      const pattern = RedisKeys.CHECKOUT_SESSION("*");
      const keys = await RedisUtils.getKeys(pattern);

      if (keys.length === 0) {
        return [];
      }

      const sessions = await RedisUtils.getMultiple<CheckoutSession>(keys);
      return sessions.filter(
        (session) => session !== null
      ) as CheckoutSession[];
    } catch (error) {
      console.error("Error getting all checkout sessions:", error);
      return [];
    }
  }

  /**
   * Get sessions by user ID
   */
  static async getSessionsByUser(userId: string): Promise<CheckoutSession[]> {
    try {
      const allSessions = await this.getAllSessions();
      return allSessions.filter((session) => session.userId === userId);
    } catch (error) {
      console.error(`Error getting sessions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get session count
   */
  static async getSessionCount(): Promise<number> {
    try {
      const pattern = RedisKeys.CHECKOUT_SESSION("*");
      const keys = await RedisUtils.getKeys(pattern);
      return keys.length;
    } catch (error) {
      console.error("Error getting session count:", error);
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const allSessions = await this.getAllSessions();
      const now = new Date();
      let cleanedCount = 0;

      for (const session of allSessions) {
        if (now > new Date(session.expiresAt)) {
          await this.deleteSession(session.checkoutId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
        await this.updateStats("cleanup", { count: cleanedCount });
      }

      return cleanedCount;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  /**
   * Get checkout statistics
   */
  static async getStats(): Promise<any> {
    try {
      const stats = await RedisUtils.getAndParse(RedisKeys.CHECKOUT_STATS);
      return (
        stats || {
          totalCreated: 0,
          totalCompleted: 0,
          totalFailed: 0,
          activeSessions: 0,
          lastCleanup: null,
        }
      );
    } catch (error) {
      console.error("Error getting checkout stats:", error);
      return null;
    }
  }

  /**
   * Add session to index for tracking
   */
  private static async addToIndex(checkoutId: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.sadd(RedisKeys.CHECKOUT_INDEX, checkoutId);
    } catch (error) {
      console.error(`Error adding ${checkoutId} to index:`, error);
    }
  }

  /**
   * Remove session from index
   */
  private static async removeFromIndex(checkoutId: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.srem(RedisKeys.CHECKOUT_INDEX, checkoutId);
    } catch (error) {
      console.error(`Error removing ${checkoutId} from index:`, error);
    }
  }

  /**
   * Update checkout statistics
   */
  private static async updateStats(
    event: string,
    data: any = {}
  ): Promise<void> {
    try {
      const client = getRedisClient();
      const pipeline = client.pipeline();

      // Increment counters
      pipeline.hincrby(RedisKeys.CHECKOUT_STATS, "totalCreated", 1);

      if (event === "order_created") {
        pipeline.hincrby(RedisKeys.CHECKOUT_STATS, "totalCompleted", 1);
      }

      if (event === "payment_status_updated" && data.status === "failed") {
        pipeline.hincrby(RedisKeys.CHECKOUT_STATS, "totalFailed", 1);
      }

      if (event === "cleanup") {
        pipeline.hset(
          RedisKeys.CHECKOUT_STATS,
          "lastCleanup",
          new Date().toISOString()
        );
      }

      // Update active sessions count
      const sessionCount = await this.getSessionCount();
      pipeline.hset(RedisKeys.CHECKOUT_STATS, "activeSessions", sessionCount);

      await pipeline.exec();
    } catch (error) {
      console.error("Error updating checkout stats:", error);
    }
  }

  /**
   * Health check for Redis connection
   */
  static async healthCheck(): Promise<{
    connected: boolean;
    sessionCount: number;
    error?: string;
  }> {
    try {
      const client = getRedisClient();
      await client.ping();

      const sessionCount = await this.getSessionCount();

      return {
        connected: true,
        sessionCount,
      };
    } catch (error) {
      return {
        connected: false,
        sessionCount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
