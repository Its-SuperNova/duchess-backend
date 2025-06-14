"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Get all products with category information
export async function getProducts() {
  try {
    const { data: products, error } = await supabase
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
      throw new Error("Failed to fetch products");
    }

    return products;
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get a single product by ID
export async function getProductById(id: string) {
  try {
    const { data: product, error } = await supabase
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
      throw new Error("Failed to fetch product");
    }

    return product;
  } catch (error) {
    console.error("Error in getProductById:", error);
    throw new Error("Failed to fetch product");
  }
}

// Create a new product
export async function createProduct(productData: any) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }

    revalidatePath("/admin/products");
    return product;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw new Error("Failed to create product");
  }
}

// Update a product
export async function updateProduct(id: string, productData: any) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/edit/${id}`);
    return product;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw new Error("Failed to update product");
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw new Error("Failed to delete product");
  }
}

// Toggle product visibility
export async function toggleProductVisibility(id: string, isActive: boolean) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling product visibility:", error);
      throw new Error("Failed to toggle product visibility");
    }

    revalidatePath("/admin/products");
    return product;
  } catch (error) {
    console.error("Error in toggleProductVisibility:", error);
    throw new Error("Failed to toggle product visibility");
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string) {
  try {
    const { data: products, error } = await supabase
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
      throw new Error("Failed to fetch products by category");
    }

    return products;
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw new Error("Failed to fetch products by category");
  }
}

// Search products
export async function searchProducts(query: string) {
  try {
    const { data: products, error } = await supabase
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
      throw new Error("Failed to search products");
    }

    return products;
  } catch (error) {
    console.error("Error in searchProducts:", error);
    throw new Error("Failed to search products");
  }
}
