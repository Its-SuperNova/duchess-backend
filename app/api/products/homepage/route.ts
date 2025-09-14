import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cache the homepage products for 1 hour (3600 seconds)
export const revalidate = 3600;

// This route is static and doesn't accept dynamic parameters to avoid build-time errors
// It always returns the 12 featured products for the homepage
export async function GET() {
  try {
    // First, get all active homepage sections ordered by display_order
    const { data: sections, error: sectionsError } = await supabase
      .from("product_sections")
      .select("id, display_order, max_products")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (sectionsError) {
      console.error("Error fetching homepage sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      console.log("No active homepage sections found");
      return NextResponse.json({
        success: true,
        products: [],
      });
    }

    // Get products from all sections, ordered by section display_order and product display_order
    const { data: sectionProducts, error: productsError } = await supabase
      .from("section_products")
      .select(
        `
        display_order,
        products!inner (
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
        )
      `
      )
      .in(
        "section_id",
        sections.map((s) => s.id)
      )
      .eq("products.is_active", true)
      .order("display_order", { ascending: true })
      .limit(12); // Fixed limit for homepage

    if (productsError) {
      console.error("Error fetching homepage section products:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Extract products and flatten the array
    const products = sectionProducts?.map((sp) => sp.products).flat() || [];

    console.log("API: Homepage products from sections:", products?.length || 0);
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
