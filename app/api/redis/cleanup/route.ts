import { NextRequest, NextResponse } from "next/server";
import { CheckoutStore } from "@/lib/checkout-store";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "cleanup_expired":
        const cleanedCount = await CheckoutStore.cleanupExpiredSessions();
        return NextResponse.json({
          success: true,
          action: "cleanup_expired",
          cleanedCount,
          message: `Cleaned up ${cleanedCount} expired sessions`,
        });

      case "get_stats":
        const stats = await CheckoutStore.getStats();
        const sessionCount = await CheckoutStore.getSessionCount();
        return NextResponse.json({
          success: true,
          action: "get_stats",
          stats,
          sessionCount,
        });

      case "get_all_sessions":
        const sessions = await CheckoutStore.getAllSessions();
        return NextResponse.json({
          success: true,
          action: "get_all_sessions",
          sessions,
          count: sessions.length,
        });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: cleanup_expired, get_stats, get_all_sessions",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Redis cleanup action failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



