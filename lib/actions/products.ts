"use server";

import { supabaseAdmin, withRetry } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getProductPrice } from "@/lib/utils";

// Get all products with category information
export async function getProducts() {
  try {
    return await withRetry(async () => {
      const { data: products, error } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            description
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return products;
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get a single product by ID
export async function getProductById(id: string) {
  try {
    return await withRetry(async () => {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            description
          )
        `
        )
        .eq("id", id as any)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return product;
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    throw new Error("Failed to fetch product");
  }
}

// Create a new product
export async function createProduct(productData: any) {
  try {
    return await withRetry(async () => {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/products");
      return product;
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw new Error("Failed to create product");
  }
}

// Update a product
export async function updateProduct(id: string, productData: any) {
  try {
    // Removed debug logging for production security

    // Validate required fields
    if (!id) {
      throw new Error("Product ID is required");
    }

    if (!productData.name || typeof productData.name !== "string") {
      throw new Error("Product name is required and must be a string");
    }

    if (!productData.category_id) {
      throw new Error("Category ID is required");
    }

    // Validate numeric fields
    const numericFields = [
      "offer_percentage",
      "calories",
      "net_weight",
      "sodium",
    ];
    for (const field of numericFields) {
      if (productData[field] !== null && productData[field] !== undefined) {
        if (
          !Number.isInteger(productData[field]) &&
          !isNaN(productData[field])
        ) {
          productData[field] = parseInt(productData[field]);
        }
        if (isNaN(productData[field])) {
          throw new Error(`Invalid ${field}: must be a number`);
        }
      }
    }

    // Validate decimal fields
    const decimalFields = [
      "offer_up_to_price",
      "protein",
      "fats",
      "carbs",
      "sugars",
      "fiber",
    ];
    for (const field of decimalFields) {
      if (productData[field] !== null && productData[field] !== undefined) {
        if (isNaN(productData[field])) {
          throw new Error(`Invalid ${field}: must be a number`);
        }
      }
    }

    // Validate JSONB fields
    const jsonFields = [
      "additional_images",
      "weight_options",
      "piece_options",
      "highlights",
      "ingredients",
    ];
    for (const field of jsonFields) {
      if (
        productData[field] !== undefined &&
        !Array.isArray(productData[field])
      ) {
        console.error(`Invalid ${field}:`, productData[field]);
        throw new Error(`Invalid ${field}: must be an array`);
      }
    }

    return await withRetry(async () => {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .update(productData as any)
        .eq("id", id as any)
        .select()
        .single();

      if (error) {
        console.error("Supabase Error Details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Product updated successfully:", (product as any)?.id);
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/edit/${id}`);
      return product;
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update product");
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    return await withRetry(async () => {
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id as any);

      if (error) {
        console.error("Error deleting product:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/products");
      return { success: true };
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw new Error("Failed to delete product");
  }
}

// Toggle product visibility
export async function toggleProductVisibility(id: string, isActive: boolean) {
  try {
    return await withRetry(async () => {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .update({ is_active: isActive } as any)
        .eq("id", id as any)
        .select()
        .single();

      if (error) {
        console.error("Error toggling product visibility:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/products");
      return product;
    });
  } catch (error) {
    console.error("Error in toggleProductVisibility:", error);
    throw new Error("Failed to toggle product visibility");
  }
}

// Get products by category - OPTIMIZED for ProductCard display
export async function getProductsByCategory(categoryId: string) {
  try {
    return await withRetry(async () => {
      const { data: products, error } = await supabaseAdmin
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
        .eq("category_id", categoryId as any)
        .eq("is_active", true as any)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products by category:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return products;
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw new Error("Failed to fetch products by category");
  }
}

// Search products - OPTIMIZED for ProductCard display
export async function searchProducts(query: string) {
  try {
    return await withRetry(async () => {
      const { data: products, error } = await supabaseAdmin
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
        .or(
          `name.ilike.%${query}%,short_description.ilike.%${query}%,long_description.ilike.%${query}%`
        )
        .eq("is_active", true as any)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching products:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return products;
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    throw new Error("Failed to search products");
  }
}

// Get active products with pagination for homepage and listing pages
export async function getActiveProducts({
  limit = 24,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  try {
    return await withRetry(
      async () => {
        const { data: products, error } = await supabaseAdmin
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
          .order("created_at", { ascending: false })
          .range(
            Math.max(0, offset),
            Math.max(0, offset + Math.max(1, Math.min(50, limit)) - 1)
          );

        if (error) {
          console.error("Error fetching active products:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        return products || [];
      },
      2,
      5000 // Increased timeout to 5 seconds
    );
  } catch (error) {
    console.error("Error in getActiveProducts:", error);
    // For homepage, we want to be more lenient and return empty array instead of throwing
    console.warn(
      "Returning empty products array due to database connection issues"
    );
    return [];
  }
}

// Get total count of active products
export async function getActiveProductsCount() {
  try {
    return await withRetry(async () => {
      const { count, error } = await supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching active products count:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return count || 0;
    });
  } catch (error) {
    console.error("Error in getActiveProductsCount:", error);
    return 0;
  }
}

// Get specific featured products for homepage (exact 12 products) - OPTIMIZED
export async function getHomepageProducts({
  limit = 12,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  try {
    return await withRetry(
      async () => {
        const { data: products, error } = await supabaseAdmin
          .from("products")
          .select(
            `
            id,
            name,
            banner_image,
            is_veg,
            weight_options,
            piece_options,
            categories (
              name
            )
          `
          )
          .eq("is_active", true)
          .eq("show_on_home", true) // Use the new boolean column
          .order("created_at", { ascending: false })
          .limit(12); // Ensure we only get 12 products

        if (error) {
          console.error("Error fetching homepage products:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log("Products with show_on_home=true:", products?.length || 0);
        console.log("Product names found:", products?.map((p) => p.name) || []);

        return products || [];
      },
      2,
      5000 // Increased timeout to 5 seconds
    );
  } catch (error) {
    console.error("Error in getHomepageProducts:", error);
    console.warn(
      "Returning empty products array due to database connection issues"
    );
    return [];
  }
}

// Get products by category slug (for category pages)
export async function getProductsByCategorySlug(categorySlug: string) {
  try {
    return await withRetry(async () => {
      // Convert slug back to readable format and handle URL encoding
      let searchTerm = categorySlug.replace(/-/g, " ");

      // Handle URL-encoded characters
      try {
        searchTerm = decodeURIComponent(searchTerm);
      } catch (e) {
        console.log("Failed to decode URL, using original:", searchTerm);
      }

      console.log("=== CATEGORY SEARCH DEBUG ===");
      console.log("Original slug:", categorySlug);
      console.log("Search term after processing:", searchTerm);

      // First, find the category by name (exact match or contains)
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from("categories")
        .select("id, name")
        .eq("is_active", true);

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return [];
      }

      console.log("Available categories:", categories);

      // Find the matching category - simple approach
      const matchingCategory = categories?.find((cat: any) => {
        const categoryName = cat.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        console.log(`\n--- Checking Category: "${cat.name}" ---`);
        console.log(`Category (lowercase): "${categoryName}"`);
        console.log(`Search term (lowercase): "${searchLower}"`);

        // Try exact match first
        if (categoryName === searchLower) {
          console.log("✓ Exact match found!");
          return true;
        }

        // Handle the case where slug has "and" but category has "&"
        // Convert both to use "and" for comparison
        const normalizedSearch = searchLower.replace(/&/g, "and");
        const normalizedCategory = categoryName.replace(/&/g, "and");

        console.log(`Normalized search: "${normalizedSearch}"`);
        console.log(`Normalized category: "${normalizedCategory}"`);

        // Try normalized exact match
        if (normalizedSearch === normalizedCategory) {
          console.log("✓ Normalized exact match found!");
          return true;
        }

        // Try contains match
        if (
          categoryName.includes(searchLower) ||
          searchLower.includes(categoryName)
        ) {
          console.log("✓ Contains match found!");
          return true;
        }

        console.log("✗ No match found for this category");
        return false;
      });

      if (!matchingCategory) {
        console.log("\n❌ NO MATCHING CATEGORY FOUND");
        console.log("Search term was:", searchTerm);
        console.log(
          "Available categories:",
          categories?.map((c) => c.name)
        );
        return [];
      }

      console.log("\n✅ MATCHING CATEGORY FOUND:", matchingCategory);

      // Get products for this category using the category_id
      // Only fetch fields needed for ProductCard display and price calculation
      const { data: products, error: productsError } = await supabaseAdmin
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
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw new Error(`Database error: ${productsError.message}`);
      }

      // Calculate price for each product and return optimized data
      const productsWithPrice =
        products?.map((product) => {
          const { price } = getProductPrice(product);
          return {
            id: product.id,
            name: product.name,
            is_veg: product.is_veg,
            banner_image: product.banner_image,
            categories: product.categories,
            price: price,
          };
        }) || [];

      console.log("Products found:", products?.length || 0);
      console.log("=== END CATEGORY SEARCH DEBUG ===\n");
      return productsWithPrice;
    });
  } catch (error) {
    console.error("Error in getProductsByCategorySlug:", error);
    return [];
  }
}

// Get paginated products by category slug (optimized for infinite scroll)
export async function getPaginatedProductsByCategorySlug(
  categorySlug: string,
  limit: number = 4,
  offset: number = 0
) {
  try {
    return await withRetry(async () => {
      // Convert slug back to readable format and handle URL encoding
      let searchTerm = categorySlug.replace(/-/g, " ");

      // Handle URL-encoded characters
      try {
        searchTerm = decodeURIComponent(searchTerm);
      } catch (e) {
        console.log("Failed to decode URL, using original:", searchTerm);
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
      if (categorySlugMap[categorySlug]) {
        searchTerm = categorySlugMap[categorySlug];
      }

      // First, find the category by name (exact match or contains)
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from("categories")
        .select("id, name")
        .eq("is_active", true);

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return { products: [], totalCount: 0, hasMore: false };
      }

      // Find the matching category with improved logic
      const matchingCategory = categories?.find((cat: any) => {
        const categoryName = cat.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // 1. Try exact match first (highest priority)
        if (categoryName === searchLower) {
          return true;
        }

        // 2. Handle the case where slug has "and" but category has "&"
        const normalizedSearch = searchLower.replace(/&/g, "and");
        const normalizedCategory = categoryName.replace(/&/g, "and");

        // Try normalized exact match
        if (normalizedSearch === normalizedCategory) {
          return true;
        }

        // 3. Try word-by-word matching for multi-word categories
        const searchWords = searchLower
          .split(/\s+/)
          .filter((word: string) => word.length > 0);
        const categoryWords = categoryName
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
        if (
          categoryName.includes(searchLower) &&
          categoryName.length - searchLower.length <= 3
        ) {
          return true;
        }

        return false;
      });

      if (!matchingCategory) {
        console.log(
          `No category found for slug: "${categorySlug}" (searchTerm: "${searchTerm}")`
        );
        console.log(
          "Available categories:",
          categories?.map((c) => c.name)
        );
        return { products: [], totalCount: 0, hasMore: false };
      }

      console.log(
        `Category matched: "${matchingCategory.name}" (ID: ${matchingCategory.id}) for slug: "${categorySlug}"`
      );

      // Get total count for pagination
      const { count: totalCount } = await supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", matchingCategory.id)
        .eq("is_active", true);

      // Get paginated products for this category
      const { data: products, error: productsError } = await supabaseAdmin
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
        throw new Error(`Database error: ${productsError.message}`);
      }

      // Calculate price for each product and return optimized data
      const productsWithPrice =
        products?.map((product) => {
          const { price } = getProductPrice(product);
          return {
            id: product.id,
            name: product.name,
            is_veg: product.is_veg,
            banner_image: product.banner_image,
            categories: product.categories,
            price: price,
          };
        }) || [];

      const hasMore =
        (products?.length || 0) === limit && offset + limit < (totalCount || 0);

      return {
        products: productsWithPrice,
        totalCount: totalCount || 0,
        hasMore,
        category: {
          id: matchingCategory.id,
          name: matchingCategory.name,
        },
      };
    });
  } catch (error) {
    console.error("Error in getPaginatedProductsByCategorySlug:", error);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

// Test function to verify database connectivity
export async function testDatabaseConnection() {
  try {
    console.log("=== TESTING DATABASE CONNECTION ===");

    // Test 1: Fetch categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from("categories")
      .select("id, name, is_active")
      .limit(5);

    if (catError) {
      console.error("❌ Categories query failed:", catError);
      return false;
    }

    console.log(
      "✅ Categories query successful:",
      categories?.length || 0,
      "categories found"
    );

    // Test 2: Fetch products
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id, name, category_id, is_active")
      .limit(5);

    if (prodError) {
      console.error("❌ Products query failed:", prodError);
      return false;
    }

    console.log(
      "✅ Products query successful:",
      products?.length || 0,
      "products found"
    );

    // Test 3: Fetch products with categories
    const { data: productsWithCat, error: joinError } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        category_id,
        categories (
          id,
          name
        )
      `
      )
      .limit(3);

    if (joinError) {
      console.error("❌ Products with categories query failed:", joinError);
      return false;
    }

    console.log(
      "✅ Products with categories query successful:",
      productsWithCat?.length || 0,
      "products found"
    );
    console.log("Sample product with category:", productsWithCat?.[0]);

    console.log("=== DATABASE CONNECTION TEST COMPLETE ===\n");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}
