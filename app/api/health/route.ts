import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const healthCheck = await checkDatabaseHealth();

    return NextResponse.json(
      {
        status: healthCheck.isHealthy ? "healthy" : "unhealthy",
        database: healthCheck,
        timestamp: new Date().toISOString(),
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? "configured"
            : "missing",
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
            ? "configured"
            : "missing",
        },
      },
      {
        status: healthCheck.isHealthy ? 200 : 503,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}
