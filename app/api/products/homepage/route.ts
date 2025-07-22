import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cache the homepage products for 1 hour (3600 seconds)
export const revalidate = 3600;

// This route is static and doesn't accept dynamic parameters to avoid build-time errors
// It always returns the 12 featured products for the homepage
export async function GET() {
  try {
    // Fetch only essential product data for homepage display
    // Optimized to only include fields needed for ProductCard and basic info
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        banner_image,
        is_veg,
        has_offer,
        offer_percentage,
        weight_options,
        piece_options,
        selling_type,
        categories (
          name
        )
      `
      )
      .eq("is_active", true)
      .eq("show_on_home", true) // Use the new boolean column
      .order("created_at", { ascending: false })
      .limit(12); // Fixed limit for homepage

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
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    response.headers.set("CDN-Cache-Control", "public, max-age=3600");
    response.headers.set("Vercel-CDN-Cache-Control", "public, max-age=3600");

    return response;
  } catch (error) {
    console.error("Error in homepage products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
