import { NextRequest, NextResponse } from "next/server";
import { getOTPStore } from "@/lib/otp-store";

export async function GET(request: NextRequest) {
  try {
    const store = getOTPStore();
    const entries = Object.entries(store).map(([email, data]) => ({
      email,
      otp: data.otp,
      expiresAt: data.expiresAt,
      expiresIn: new Date(data.expiresAt).toISOString(),
      isExpired: Date.now() > data.expiresAt,
    }));

    return NextResponse.json({
      success: true,
      storeSize: Object.keys(store).length,
      entries,
    });
  } catch (error) {
    console.error("Error in debug-otp API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
