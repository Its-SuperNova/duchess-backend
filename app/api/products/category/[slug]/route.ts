import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (page < 0 || limit <= 0 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination params" },
        { status: 400 }
      );
    }

    const offset = page * limit;

    let searchTerm = slug.replace(/-/g, " ");
    try {
      searchTerm = decodeURIComponent(searchTerm);
    } catch {
      // ignore decode errors
    }

    // 1. Get categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true);

    if (catError) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    const category = categories?.find((c: any) => {
      const cName = c.name.toLowerCase();
      const sName = searchTerm.toLowerCase();

      const normC = cName.replace(/&/g, "and");
      const normS = sName.replace(/&/g, "and");

      return (
        cName === sName ||
        normC === normS ||
        cName.includes(sName) ||
        sName.includes(cName)
      );
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 2. Fetch products with offset pagination
    const { data: products, error: prodError } = await supabase
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
        categories(name)
      `
      )
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (prodError) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // 3. Get total count
    const { count: totalCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("is_active", true);

    return NextResponse.json(
      {
        success: true,
        products: products ?? [],
        pagination: {
          page,
          limit,
          total: totalCount ?? 0,
          hasMore: (products?.length || 0) === limit,
          totalPages: totalCount ? Math.ceil(totalCount / limit) : 0,
          nextPage: (products?.length || 0) === limit ? page + 1 : null,
        },
        category: {
          id: category.id,
          name: category.name,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error in category products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
