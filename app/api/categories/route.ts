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
          // Cache for 10 minutes, allow stale content for 2 hours while revalidating
          // Categories change less frequently than products
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=7200",
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
