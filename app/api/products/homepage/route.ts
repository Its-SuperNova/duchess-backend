import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch complete product data for homepage
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        banner_image,
        additional_images,
        short_description,
        is_veg,
        has_offer,
        offer_percentage,
        weight_options,
        piece_options,
        selling_type,
        created_at,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching homepage products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error("Error in homepage products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
