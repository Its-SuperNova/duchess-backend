import { NextRequest, NextResponse } from "next/server";
import {
  calculateDeliveryDistance,
  calculateDeliveryDistanceByPincode,
  testPincodeDeliveryCalculation,
} from "@/lib/distance";

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      message: "Distance calculation API is working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test environment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, pincode, district, state, address } = body;

    // Handle pincode-based calculation
    if (type === "pincode" && pincode) {
      console.log("Processing pincode-based distance calculation:", {
        pincode,
        district,
        state,
      });

      const result = await calculateDeliveryDistanceByPincode(
        pincode,
        district,
        state
      );

      return NextResponse.json({
        success: true,
        result,
        method: "pincode-based",
      });
    }

    // Handle address-based calculation (backward compatibility)
    if (address) {
      console.log("Processing address-based distance calculation:", address);

      const result = await calculateDeliveryDistance({
        street: address.full_address,
        district: address.city,
        pincode: address.zip_code,
        state: address.state,
        country: "India",
      });

      return NextResponse.json({
        success: true,
        result,
        method: "address-based",
      });
    }

    // If neither pincode nor address is provided
    return NextResponse.json(
      {
        error: "Invalid request",
        message:
          "Please provide either pincode (with type: 'pincode') or address object",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Distance calculation API error:", error);

    return NextResponse.json(
      {
        error: "Distance calculation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
