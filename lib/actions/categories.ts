"use server";

import { supabaseAdmin, withRetry } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get all categories - OPTIMIZED for hero section
export async function getCategories() {
  try {
    return await withRetry(
      async () => {
        const { data: categories, error } = await supabaseAdmin
          .from("categories")
          .select("id, name, image") // Only fetch essential columns
          .eq("is_active", true) // Filter active categories on server side
          .limit(50); // Limit to prevent large queries

        if (error) {
          console.error("Error fetching categories:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        // Custom ordering for categories
        const categoryOrder = [
          "Cakes",
          "Chocolates",
          "Cookies",
          "Cheese Cakes",
          "Muffins & Cupcakes",
          "Brownies & Brookies",
        ];

        // Sort categories according to the custom order
        const sortedCategories = (categories || []).sort((a, b) => {
          const aIndex = categoryOrder.indexOf(a.name);
          const bIndex = categoryOrder.indexOf(b.name);

          // If both categories are in the order list, sort by their position
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }

          // If only one is in the order list, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          // If neither is in the order list, sort alphabetically
          return a.name.localeCompare(b.name);
        });

        return sortedCategories;
      },
      2,
      5000
    ); // Increased timeout to 5 seconds
  } catch (error) {
    console.error("Error in getCategories:", error);
    // Return empty array for graceful fallback
    console.warn(
      "Returning empty categories array due to database connection issues"
    );
    return [];
  }
}

// Get a single category by ID
export async function getCategoryById(id: string) {
  try {
    return await withRetry(async () => {
      const { data: category, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("id", id as any)
        .single();

      if (error) {
        console.error("Error fetching category:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return category;
    });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    throw new Error("Failed to fetch category");
  }
}

// Create a new category
export async function createCategory(categoryData: any) {
  try {
    return await withRetry(async () => {
      const { data: category, error } = await supabaseAdmin
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error("Error creating category:", error);
        if (error.code === "23505") {
          // Unique constraint violation
          throw new Error("A category with this name already exists.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/categories");
      return category;
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create category");
  }
}

// Update a category
export async function updateCategory(id: string, categoryData: any) {
  try {
    return await withRetry(async () => {
      const { data: category, error } = await supabaseAdmin
        .from("categories")
        .update(categoryData as any)
        .eq("id", id as any)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        if (error.code === "23505") {
          // Unique constraint violation
          throw new Error("A category with this name already exists.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/categories");
      return category;
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update category");
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    return await withRetry(async () => {
      // First check if there are any products in this category
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("category_id", id as any)
        .limit(1);

      if (productsError) {
        console.error("Error checking products in category:", productsError);
        throw new Error("Failed to check category dependencies");
      }

      if (products && products.length > 0) {
        throw new Error(
          "Cannot delete category: It contains products. Please move or delete all products first."
        );
      }

      const { error } = await supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id as any);

      if (error) {
        console.error("Error deleting category:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/categories");
      return { success: true };
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
}

// Toggle category visibility
export async function toggleCategoryVisibility(id: string, isActive: boolean) {
  try {
    return await withRetry(async () => {
      const { data: category, error } = await supabaseAdmin
        .from("categories")
        .update({ is_active: isActive } as any)
        .eq("id", id as any)
        .select()
        .single();

      if (error) {
        console.error("Error toggling category visibility:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/categories");
      return category;
    });
  } catch (error) {
    console.error("Error in toggleCategoryVisibility:", error);
    throw new Error("Failed to toggle category visibility");
  }
}

// Get categories with product counts
export async function getCategoriesWithProductCounts() {
  try {
    return await withRetry(async () => {
      const { data: categories, error } = await supabaseAdmin
        .from("categories")
        .select(
          `
          *,
          products (
            id
          )
        `
        )
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories with product counts:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Transform the data to include product count
      const categoriesWithCounts =
        categories?.map((category) => ({
          ...(category as any),
          products_count: (category as any).products?.length || 0,
        })) || [];

      return categoriesWithCounts;
    });
  } catch (error) {
    console.error("Error in getCategoriesWithProductCounts:", error);
    throw new Error("Failed to fetch categories");
  }
}
