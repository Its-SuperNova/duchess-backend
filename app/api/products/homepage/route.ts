import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cache the homepage products for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch complete product data for homepage (only products with show_on_home=true)
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        banner_image,
        additional_images,
        short_description,
        long_description,
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
      .eq("show_on_home", true) // Use the new boolean column
      .order("created_at", { ascending: false })
      .limit(12); // Ensure we only get 12 products

    if (error) {
      console.error("Error fetching homepage products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    console.log("API: Products with show_on_home=true:", products?.length || 0);
    console.log(
      "API: Product names found:",
      products?.map((p) => p.name) || []
    );

    // Add cache headers for better performance
    const response = NextResponse.json({
      success: true,
      products: products || [],
    });

    // Set cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    response.headers.set('CDN-Cache-Control', 'public, max-age=3600');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=3600');

    return response;
  } catch (error) {
    console.error("Error in homepage products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
