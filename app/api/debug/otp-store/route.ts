import { NextRequest, NextResponse } from "next/server";
import { getOTPStore } from "@/lib/otp-store";

export async function GET(request: NextRequest) {
  try {
    const store = await getOTPStore();

    return NextResponse.json({
      success: true,
      store,
      count: Object.keys(store).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in debug OTP store API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
