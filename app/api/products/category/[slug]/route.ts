import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getProductPrice } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

    // Create a reverse mapping for common category slugs
    const categorySlugMap: { [key: string]: string } = {
      "muffins-cupcakes": "Muffins & Cupcakes",
      "muffins-and-cupcakes": "Muffins & Cupcakes",
      "chocolate-cakes": "Chocolate Cakes",
      "vanilla-cakes": "Vanilla Cakes",
      "birthday-cakes": "Birthday Cakes",
      "wedding-cakes": "Wedding Cakes",
      cheesecakes: "Cheesecakes",
      "chocolate-cookies": "Chocolate Cookies",
      "butter-cookies": "Butter Cookies",
      "oatmeal-cookies": "Oatmeal Cookies",
      "chocolate-brownies": "Chocolate Brownies",
      "vanilla-brownies": "Vanilla Brownies",
      "chocolate-donuts": "Chocolate Donuts",
      "glazed-donuts": "Glazed Donuts",
      "chocolate-macarons": "Chocolate Macarons",
      "vanilla-macarons": "Vanilla Macarons",
      "chocolate-tarts": "Chocolate Tarts",
      "fruit-tarts": "Fruit Tarts",
      "chocolate-pies": "Chocolate Pies",
      "apple-pies": "Apple Pies",
      "chocolate-muffins": "Chocolate Muffins",
      "blueberry-muffins": "Blueberry Muffins",
      "chocolate-croissants": "Chocolate Croissants",
      "plain-croissants": "Plain Croissants",
      "white-bread": "White Bread",
      "whole-wheat-bread": "Whole Wheat Bread",
      "chocolate-sweets": "Chocolate Sweets",
      "traditional-sweets": "Traditional Sweets",
    };

    // Check if we have a direct mapping first
    if (categorySlugMap[slug]) {
      searchTerm = categorySlugMap[slug];
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

      // 1. Try exact match first (highest priority)
      if (cName === sName) {
        return true;
      }

      // 2. Handle the case where slug has "and" but category has "&"
      const normC = cName.replace(/&/g, "and");
      const normS = sName.replace(/&/g, "and");

      if (normC === normS) {
        return true;
      }

      // 3. Try word-by-word matching for multi-word categories
      const searchWords = sName
        .split(/\s+/)
        .filter((word: string) => word.length > 0);
      const categoryWords = cName
        .split(/\s+/)
        .filter((word: string) => word.length > 0);

      // Check if all search words are present in category words
      if (searchWords.length > 1) {
        const allSearchWordsFound = searchWords.every((searchWord: string) =>
          categoryWords.some(
            (categoryWord: string) =>
              categoryWord === searchWord ||
              categoryWord.includes(searchWord) ||
              searchWord.includes(categoryWord)
          )
        );

        if (allSearchWordsFound) {
          return true;
        }
      }

      // 4. Fallback: try contains match but only if it's a close match
      // This prevents "cupcakes" from matching "cakes" incorrectly
      if (cName.includes(sName) && cName.length - sName.length <= 3) {
        return true;
      }

      return false;
    });

    if (!category) {
      console.log(
        `No category found for slug: "${slug}" (searchTerm: "${searchTerm}")`
      );
      console.log(
        "Available categories:",
        categories?.map((c) => c.name)
      );
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    console.log(
      `Category matched: "${category.name}" (ID: ${category.id}) for slug: "${slug}"`
    );

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

    // Calculate price for each product
    const productsWithPrice =
      products?.map((product) => {
        const { price, originalPrice } = getProductPrice(product);

        return {
          id: product.id,
          name: product.name,
          is_veg: product.is_veg,
          banner_image: product.banner_image,
          categories: product.categories,
          price: price,
          originalPrice: originalPrice,
        };
      }) || [];

    // 3. Get total count
    const { count: totalCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("is_active", true);

    return NextResponse.json(
      {
        success: true,
        products: productsWithPrice,
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
