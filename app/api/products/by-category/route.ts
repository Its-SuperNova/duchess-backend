import { NextRequest, NextResponse } from "next/server";
import { getProductsByCategory } from "@/lib/actions/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const products = await getProductsByCategory(categoryId);

    return NextResponse.json(
      {
        products,
        success: true,
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
    console.error("Error fetching products by category:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products by category",
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

