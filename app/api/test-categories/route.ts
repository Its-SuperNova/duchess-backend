import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/actions/categories";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing categories API endpoint...");
    const categories = await getCategories();

    console.log("Categories fetched:", categories);

    return NextResponse.json({
      success: true,
      categories: categories,
      count: categories?.length || 0,
    });
  } catch (error) {
    console.error("Error in categories test API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
