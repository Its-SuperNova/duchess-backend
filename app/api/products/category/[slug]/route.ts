import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "4");
    const categorySlug = params.slug;

    // Validate parameters
    if (page < 0 || limit <= 0 || limit > 20) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Calculate offset
    const offset = page * limit;

    // Convert slug back to readable format and handle URL encoding
    let searchTerm = categorySlug.replace(/-/g, " ");

    // Handle URL-encoded characters
    try {
      searchTerm = decodeURIComponent(searchTerm);
    } catch (e) {
      console.log("Failed to decode URL, using original:", searchTerm);
    }

    // First, find the category by name
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    // Find the matching category
    const matchingCategory = categories?.find((cat: any) => {
      const categoryName = cat.name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      // Try exact match first
      if (categoryName === searchLower) {
        return true;
      }

      // Handle the case where slug has "and" but category has "&"
      const normalizedSearch = searchLower.replace(/&/g, "and");
      const normalizedCategory = categoryName.replace(/&/g, "and");

      // Try normalized exact match
      if (normalizedSearch === normalizedCategory) {
        return true;
      }

      // Try contains match
      if (
        categoryName.includes(searchLower) ||
        searchLower.includes(categoryName)
      ) {
        return true;
      }

      return false;
    });

    if (!matchingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get products for this category with pagination
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        is_veg,
        has_offer,
        offer_percentage,
        weight_options,
        piece_options,
        selling_type,
        banner_image,
        categories (
          name
        )
      `
      )
      .eq("category_id", matchingCategory.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Get total count for this category
    const { count: totalCount, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", matchingCategory.id)
      .eq("is_active", true);

    if (countError) {
      console.error("Error fetching product count:", countError);
      // Continue without count, not critical for functionality
    }

    const response = NextResponse.json({
      success: true,
      products: products || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: (products?.length || 0) === limit,
        totalPages: totalCount ? Math.ceil(totalCount / limit) : 0,
      },
      category: {
        id: matchingCategory.id,
        name: matchingCategory.name,
      },
    });

    // Set cache headers for better performance
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error in category products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
