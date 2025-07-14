// This file contains all the comprehensive database type fixes
// Import this into files that need database type safety

import {
  isValidDatabaseResult,
  isValidUser,
  isValidProduct,
  isValidCategory,
  isValidCoupon,
  isValidFavorite,
} from "./type-guards";

// Universal database query wrapper with type safety
export async function safeDbQuery<T>(
  queryPromise: Promise<any>,
  validator: (item: any) => item is T
): Promise<T | null> {
  try {
    const result = await queryPromise;

    if (result?.data && validator(result.data)) {
      return result.data;
    }

    if (result?.error) {
      console.error("Database query error:", result.error);
      return null;
    }

    return null;
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

// Universal database array query wrapper
export async function safeDbArrayQuery<T>(
  queryPromise: Promise<any>,
  validator: (item: any) => item is T
): Promise<T[]> {
  try {
    const result = await queryPromise;

    if (result?.data && Array.isArray(result.data)) {
      return result.data.filter(validator);
    }

    if (result?.error) {
      console.error("Database array query error:", result.error);
      return [];
    }

    return [];
  } catch (error) {
    console.error("Database array query failed:", error);
    return [];
  }
}

// Type-safe wrappers for common operations
export const DatabaseHelpers = {
  // User operations
  async getUserByEmail(supabase: any, email: string) {
    return safeDbQuery(
      supabase.from("users").select("*").eq("email", email).single(),
      isValidUser
    );
  },

  // Product operations
  async getProductById(supabase: any, id: string) {
    return safeDbQuery(
      supabase.from("products").select("*").eq("id", id).single(),
      isValidProduct
    );
  },

  // Category operations
  async getCategories(supabase: any) {
    return safeDbArrayQuery(
      supabase.from("categories").select("*").order("name"),
      isValidCategory
    );
  },

  // Coupon operations
  async getCoupons(supabase: any) {
    return safeDbArrayQuery(
      supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false }),
      isValidCoupon
    );
  },

  // Favorites operations
  async getFavoritesByUserId(supabase: any, userId: string) {
    return safeDbArrayQuery(
      supabase.from("favorites").select("*").eq("user_id", userId),
      isValidFavorite
    );
  },
};

// Type assertion helpers for existing code
export function assertUser(
  user: any
): asserts user is ReturnType<typeof isValidUser> extends true
  ? Parameters<typeof isValidUser>[0]
  : never {
  if (!isValidUser(user)) {
    throw new Error("Invalid user object");
  }
}

export function assertProduct(
  product: any
): asserts product is ReturnType<typeof isValidProduct> extends true
  ? Parameters<typeof isValidProduct>[0]
  : never {
  if (!isValidProduct(product)) {
    throw new Error("Invalid product object");
  }
}

export function assertCategory(
  category: any
): asserts category is ReturnType<typeof isValidCategory> extends true
  ? Parameters<typeof isValidCategory>[0]
  : never {
  if (!isValidCategory(category)) {
    throw new Error("Invalid category object");
  }
}

// Safe property extractors with TypeScript compatibility
export const SafeExtractors = {
  userId: (user: any): string => (isValidUser(user) ? user.id : ""),
  userEmail: (user: any): string => (isValidUser(user) ? user.email : ""),
  userName: (user: any): string => (isValidUser(user) ? user.name : ""),
  userRole: (user: any): string => (isValidUser(user) ? user.role : "user"),

  productId: (product: any): string =>
    isValidProduct(product) ? product.id : "",
  productName: (product: any): string =>
    isValidProduct(product) ? product.name : "",
  productCategoryId: (product: any): string =>
    isValidProduct(product) ? product.category_id : "",

  categoryId: (category: any): string =>
    isValidCategory(category) ? category.id : "",
  categoryName: (category: any): string =>
    isValidCategory(category) ? category.name : "",
  categoryIsActive: (category: any): boolean =>
    isValidCategory(category) ? category.is_active : false,

  favoriteProductId: (favorite: any): string =>
    isValidFavorite(favorite) ? favorite.product_id : "",
  favoriteProductName: (favorite: any): string =>
    isValidFavorite(favorite) ? favorite.product_name : "",
  favoriteProductPrice: (favorite: any): number =>
    isValidFavorite(favorite) ? favorite.product_price : 0,
};
