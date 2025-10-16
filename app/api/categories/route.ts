import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/actions/categories";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();

    return NextResponse.json(
      {
        categories,
        success: true,
      },
      {
        status: 200,
        headers: {
          // Shorter cache with revalidation for category order changes
          // Cache for 1 minute, revalidate for 5 minutes
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          // Allow CORS for better caching across origins
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        success: false,
      },
      {
        status: 500,
        headers: {
          // Don't cache error responses
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
