"use server";

import { supabaseAdmin, withRetry } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
        .eq("id", id)
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
    console.log("=== UPDATE PRODUCT SERVER ACTION ===");
    console.log("Product ID:", id);
    console.log("Product Data Keys:", Object.keys(productData));
    console.log("Product Data:", JSON.stringify(productData, null, 2));

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
          console.error(`Invalid ${field}:`, productData[field]);
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
          console.error(`Invalid ${field}:`, productData[field]);
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
        .update(productData)
        .eq("id", id)
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

      console.log("Product updated successfully:", product?.id);
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
        .eq("id", id);

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
        .update({ is_active: isActive })
        .eq("id", id)
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

// Get products by category
export async function getProductsByCategory(categoryId: string) {
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
        .eq("category_id", categoryId)
        .eq("is_active", true)
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

// Search products
export async function searchProducts(query: string) {
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
        .or(
          `name.ilike.%${query}%,short_description.ilike.%${query}%,long_description.ilike.%${query}%`
        )
        .eq("is_active", true)
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

// Get active products for homepage display
export async function getActiveProducts() {
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
          short_description,
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
          .limit(24); // Increase to 24 for better grid layout

        if (error) {
          console.error("Error fetching active products:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        return products || [];
      },
      2,
      2000
    ); // More aggressive retry for homepage
  } catch (error) {
    console.error("Error in getActiveProducts:", error);
    // For homepage, we want to be more lenient and return empty array instead of throwing
    console.warn(
      "Returning empty products array due to database connection issues"
    );
    return [];
  }
}
