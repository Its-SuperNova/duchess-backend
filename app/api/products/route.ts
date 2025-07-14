import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/actions/products";

export async function GET(request: NextRequest) {
  try {
    const products = await getActiveProducts();

    return NextResponse.json(
      {
        products,
        success: true,
      },
      {
        status: 200,
        headers: {
          // Cache for 5 minutes, allow stale content for 1 hour while revalidating
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          // Add ETag for conditional requests
          ETag: `"products-${Date.now()}"`,
          // Allow CORS for better caching across origins
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
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
