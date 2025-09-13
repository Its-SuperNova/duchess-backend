import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check Cloudinary environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const config = {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
      cloudNameValue: cloudName
        ? cloudName.substring(0, 10) + "..."
        : "Not set",
    };

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Cloudinary environment variables",
          config,
          required: [
            "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
          ],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cloudinary configuration is valid",
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check Cloudinary configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
