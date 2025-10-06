import { NextRequest, NextResponse } from "next/server";
import { getRoadDistanceAndDuration } from "@/lib/distance";

export async function POST(request: NextRequest) {
  try {
    const { lat1, lon1, lat2, lon2 } = await request.json();

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 }
      );
    }

    console.log("🚀 Server-side distance calculation:", {
      from: { lat: lat1, lon: lon1 },
      to: { lat: lat2, lon: lon2 },
    });

    const result = await getRoadDistanceAndDuration(
      Number(lat1),
      Number(lon1),
      Number(lat2),
      Number(lon2)
    );

    console.log("✅ Distance calculation result:", result);

    return NextResponse.json({
      success: true,
      distance: result.distance,
      duration: result.duration,
    });
  } catch (error) {
    console.error("❌ Distance calculation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}












