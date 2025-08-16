import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/actions/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get("limit");
    const rawPage = searchParams.get("page");
    const rawOffset = searchParams.get("offset");

    // Support both page-based and offset-based pagination
    let limit = Math.max(1, Math.min(100, Number(rawLimit) || 24));
    let offset = 0;

    if (rawPage) {
      const page = Math.max(0, Number(rawPage) || 0);
      offset = page * limit;
    } else if (rawOffset) {
      offset = Math.max(0, Number(rawOffset) || 0);
    }

    const products = await getActiveProducts({ limit, offset });

    return NextResponse.json(
      {
        products,
        success: true,
        pagination: {
          page: Math.floor(offset / limit),
          limit,
          offset,
          hasMore: products.length === limit,
        },
      },
      {
        status: 200,
        headers: {
          // Cache at the edge for 5 minutes, permit serving stale up to 1 hour
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          // Allow CORS for read-only GET
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
