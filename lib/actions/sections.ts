"use server";

import { supabaseAdmin, withRetry } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface ProductSection {
  id: string;
  name: string;
  title: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  max_products: number;
  current_products_count: number;
  created_at: string;
  updated_at: string;
  products?: Array<{
    id: string;
    name: string;
    banner_image: string | null;
    is_veg: boolean;
    weight_options: any;
    piece_options: any;
    selling_type: string;
    display_order: number;
    categories: { name: string } | null;
  }>;
}

// Get all product sections with their products
export async function getProductSections(): Promise<ProductSection[]> {
  try {
    return await withRetry(async () => {
      // First check if the table exists
      const { data: sections, error } = await supabaseAdmin
        .from("product_sections")
        .select("*")
        .limit(1);

      if (error && error.code === "PGRST116") {
        console.log(
          "Product sections table does not exist yet. Please run the setup script."
        );
        return [];
      }

      if (error) {
        console.error("Error checking product sections table:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // If table exists, fetch sections with products
      const { data: sectionsWithProducts, error: fetchError } =
        await supabaseAdmin
          .from("product_sections")
          .select(
            `
          *,
          section_products (
            display_order,
            products (
              id,
              name,
              banner_image,
              is_veg,
              weight_options,
              piece_options,
              selling_type,
              categories (
                name
              )
            )
          )
        `
          )
          .eq("is_active", true)
          .order("display_order", { ascending: true });

      if (fetchError) {
        console.error("Error fetching product sections:", fetchError);
        // If there's a relationship error, try fetching sections without products
        const { data: sectionsOnly, error: sectionsOnlyError } =
          await supabaseAdmin
            .from("product_sections")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (sectionsOnlyError) {
          throw new Error(`Database error: ${sectionsOnlyError.message}`);
        }

        return (
          sectionsOnly?.map((section) => ({
            ...section,
            products: [],
          })) || []
        );
      }

      // Transform the data to match our interface
      return (
        sectionsWithProducts?.map((section) => ({
          ...section,
          products:
            section.section_products
              ?.sort((a: any, b: any) => a.display_order - b.display_order)
              .map((sp: any) => ({
                ...sp.products,
                display_order: sp.display_order,
              })) || [],
        })) || []
      );
    });
  } catch (error) {
    console.error("Error in getProductSections:", error);
    // Return empty array instead of throwing error to prevent app crashes
    return [];
  }
}

// Create a new product section
export async function createProductSection(data: {
  name: string;
  title: string;
  description?: string;
  max_products?: number;
}): Promise<ProductSection> {
  try {
    return await withRetry(async () => {
      // Check if table exists first
      const { error: tableCheckError } = await supabaseAdmin
        .from("product_sections")
        .select("*")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "PGRST116") {
        throw new Error(
          "Product sections table does not exist. Please run the setup script first."
        );
      }

      // Get the next display order
      const { data: lastSection } = await supabaseAdmin
        .from("product_sections")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (lastSection?.display_order || 0) + 1;

      const { data: section, error } = await supabaseAdmin
        .from("product_sections")
        .insert({
          name: data.name,
          title: data.title,
          description: data.description,
          max_products: data.max_products || 12,
          current_products_count: 0,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product section:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");

      return { ...section, products: [] };
    });
  } catch (error) {
    console.error("Error in createProductSection:", error);
    throw new Error("Failed to create product section");
  }
}

// Update a product section
export async function updateProductSection(
  id: string,
  data: {
    name?: string;
    title?: string;
    description?: string;
    max_products?: number;
    is_active?: boolean;
  }
): Promise<ProductSection> {
  try {
    return await withRetry(async () => {
      const { data: section, error } = await supabaseAdmin
        .from("product_sections")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product section:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");

      return { ...section, products: [] };
    });
  } catch (error) {
    console.error("Error in updateProductSection:", error);
    throw new Error("Failed to update product section");
  }
}

// Delete a product section
export async function deleteProductSection(id: string): Promise<void> {
  try {
    await withRetry(async () => {
      const { error } = await supabaseAdmin
        .from("product_sections")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting product section:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in deleteProductSection:", error);
    throw new Error("Failed to delete product section");
  }
}

// Add product to section
export async function addProductToSection(
  sectionId: string,
  productId: string
): Promise<void> {
  try {
    await withRetry(async () => {
      // Get the next display order for this section
      const { data: lastProduct } = await supabaseAdmin
        .from("section_products")
        .select("display_order")
        .eq("section_id", sectionId)
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (lastProduct?.display_order || 0) + 1;

      const { error } = await supabaseAdmin.from("section_products").insert({
        section_id: sectionId,
        product_id: productId,
        display_order: nextOrder,
      });

      if (error) {
        console.error("Error adding product to section:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in addProductToSection:", error);
    throw new Error("Failed to add product to section");
  }
}

// Remove product from section
export async function removeProductFromSection(
  sectionId: string,
  productId: string
): Promise<void> {
  try {
    await withRetry(async () => {
      const { error } = await supabaseAdmin
        .from("section_products")
        .delete()
        .eq("section_id", sectionId)
        .eq("product_id", productId);

      if (error) {
        console.error("Error removing product from section:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in removeProductFromSection:", error);
    throw new Error("Failed to remove product from section");
  }
}

// Update section order
export async function updateSectionOrder(sectionIds: string[]): Promise<void> {
  try {
    await withRetry(async () => {
      const updates = sectionIds.map((sectionId, index) => ({
        id: sectionId,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabaseAdmin
          .from("product_sections")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) {
          console.error("Error updating section order:", error);
          throw new Error(`Database error: ${error.message}`);
        }
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in updateSectionOrder:", error);
    throw new Error("Failed to update section order");
  }
}

// Update product order within section
export async function updateProductOrderInSection(
  sectionId: string,
  productIds: string[]
): Promise<void> {
  try {
    await withRetry(async () => {
      const updates = productIds.map((productId, index) => ({
        section_id: sectionId,
        product_id: productId,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabaseAdmin
          .from("section_products")
          .update({ display_order: update.display_order })
          .eq("section_id", update.section_id)
          .eq("product_id", update.product_id);

        if (error) {
          console.error("Error updating product order in section:", error);
          throw new Error(`Database error: ${error.message}`);
        }
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in updateProductOrderInSection:", error);
    throw new Error("Failed to update product order in section");
  }
}

// Manually update the current_products_count for a specific section
export async function updateSectionProductsCount(
  sectionId: string
): Promise<void> {
  try {
    await withRetry(async () => {
      // Count current products in the section
      const { count, error: countError } = await supabaseAdmin
        .from("section_products")
        .select("*", { count: "exact", head: true })
        .eq("section_id", sectionId);

      if (countError) {
        console.error("Error counting products in section:", countError);
        throw new Error(`Database error: ${countError.message}`);
      }

      // Update the section with the new count
      const { error: updateError } = await supabaseAdmin
        .from("product_sections")
        .update({ current_products_count: count || 0 })
        .eq("id", sectionId);

      if (updateError) {
        console.error("Error updating section products count:", updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in updateSectionProductsCount:", error);
    throw new Error("Failed to update section products count");
  }
}

// Update current_products_count for all sections
export async function updateAllSectionsProductsCount(): Promise<void> {
  try {
    await withRetry(async () => {
      // Get all sections
      const { data: sections, error: sectionsError } = await supabaseAdmin
        .from("product_sections")
        .select("id");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        throw new Error(`Database error: ${sectionsError.message}`);
      }

      // Update count for each section
      for (const section of sections || []) {
        await updateSectionProductsCount(section.id);
      }

      revalidatePath("/admin/home-customization/product-management");
      revalidatePath("/");
    });
  } catch (error) {
    console.error("Error in updateAllSectionsProductsCount:", error);
    throw new Error("Failed to update all sections products count");
  }
}

// Debug function to check homepage sections and their products
export async function getHomepageSectionsDebug(): Promise<{
  sections: any[];
  totalProducts: number;
}> {
  try {
    return await withRetry(async () => {
      // Get all active sections with their products
      const { data: sections, error } = await supabaseAdmin
        .from("product_sections")
        .select(
          `
          id,
          name,
          title,
          display_order,
          is_active,
          max_products,
          current_products_count,
          section_products (
            display_order,
            products (
              id,
              name,
              is_active
            )
          )
        `
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching homepage sections debug:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      const totalProducts =
        sections?.reduce((total, section) => {
          return total + (section.section_products?.length || 0);
        }, 0) || 0;

      return {
        sections: sections || [],
        totalProducts,
      };
    });
  } catch (error) {
    console.error("Error in getHomepageSectionsDebug:", error);
    throw new Error("Failed to get homepage sections debug info");
  }
}
