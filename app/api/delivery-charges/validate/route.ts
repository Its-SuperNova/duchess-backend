import { NextRequest, NextResponse } from "next/server";
import {
  validateDeliveryRanges,
  getDeliveryChargeSummary,
} from "@/lib/optimized-delivery-calculation";

// GET - Validate delivery charge ranges
export async function GET() {
  try {
    console.log("Validating delivery charge ranges...");

    const validation = await validateDeliveryRanges();
    const summary = await getDeliveryChargeSummary();

    return NextResponse.json({
      validation,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error validating delivery ranges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Calculate delivery charge for specific distance and order value
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distance, orderValue = 0 } = body;

    if (distance === undefined || distance === null) {
      return NextResponse.json(
        { error: "Distance is required" },
        { status: 400 }
      );
    }

    const { calculateOptimizedDeliveryCharge } = await import(
      "@/lib/optimized-delivery-calculation"
    );
    const result = await calculateOptimizedDeliveryCharge(distance, orderValue);

    return NextResponse.json({
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculating delivery charge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
