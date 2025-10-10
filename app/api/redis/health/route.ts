import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";
import { checkRedisHealth } from "@/lib/redis";
import { validateRedisEnvironment } from "@/lib/redis-config";

export async function GET(request: NextRequest) {
  try {
    // Validate Redis environment
    const envValidation = validateRedisEnvironment();

    // Check Redis connection health
    const redisHealthy = await checkRedisHealth();

    // Get checkout store health
    const checkoutHealth = await CheckoutStore.healthCheck();

    // Get session statistics
    const sessionCount = await CheckoutStore.getSessionCount();
    const stats = await CheckoutStore.getStats();

    const healthData = {
      timestamp: new Date().toISOString(),
      environment: {
        configured: envValidation.isValid,
        errors: envValidation.errors,
      },
      redis: {
        connected: redisHealthy,
        checkoutStore: checkoutHealth.redis,
      },
      database: {
        connected: checkoutHealth.database,
      },
      inMemory: {
        connected: checkoutHealth.inMemory,
      },
      sessions: {
        count: sessionCount,
        stats: stats,
      },
      status: redisHealthy ? "healthy" : "degraded",
    };

    return NextResponse.json(healthData, {
      status: redisHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error("Redis health check failed:", error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}





