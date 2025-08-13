// Universal type guards for database operations
// This file provides type safety for all Supabase queries

export function isValidDatabaseResult<T>(result: any): result is T {
  return (
    result &&
    typeof result === "object" &&
    !("message" in result) &&
    !("error" in result) &&
    !("hint" in result)
  );
}

export function isValidUser(user: any): user is {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  provider?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
} {
  return (
    user &&
    typeof user === "object" &&
    "id" in user &&
    "email" in user &&
    "name" in user
  );
}

export function isValidProduct(product: any): product is {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  category_id: string;
  is_veg: boolean;
  has_offer: boolean;
  offer_percentage: number;
  offer_up_to_price: number;
  weight_options: any[];
  piece_options: any[];
  selling_type: string;
  calories: number;
  net_weight: number;
  protein: number;
  fats: number;
  carbs: number;
  sugars: number;
  fiber: number;
  sodium: number;
  banner_image: string;
  additional_images: string[];
  highlights: string[];
  ingredients: string[];
  delivery_option: string;
  add_text_on_cake: boolean;
  add_candles: boolean;
  add_knife: boolean;
  add_message_card: boolean;
  created_at: string;
  updated_at: string;
} {
  return (
    product &&
    typeof product === "object" &&
    "id" in product &&
    "name" in product &&
    "category_id" in product
  );
}

export function isValidCategory(category: any): category is {
  id: string;
  name: string;
  image: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} {
  return (
    category &&
    typeof category === "object" &&
    "id" in category &&
    "name" in category &&
    "is_active" in category
  );
}

export function isValidCoupon(coupon: any): coupon is {
  id: string;
  code: string;
  type: "flat" | "percentage";
  value: number;
  min_order_amount: number;
  max_discount_cap: number | null;
  usage_limit: number | null;
  usage_per_user: number;
  valid_from: string;
  valid_until: string;
  applicable_categories: string[] | null;
  is_active: boolean;
  total_redemptions: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
} {
  return (
    coupon &&
    typeof coupon === "object" &&
    "id" in coupon &&
    "code" in coupon &&
    "type" in coupon
  );
}

export function isValidFavorite(favorite: any): favorite is {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  product_description: string;
  product_rating: number;
  is_veg: boolean;
  created_at: string;
  updated_at: string;
} {
  return (
    favorite &&
    typeof favorite === "object" &&
    "product_id" in favorite &&
    "product_name" in favorite &&
    "product_price" in favorite
  );
}

// Type guard for arrays of database results
export function isValidDatabaseArray<T>(
  results: any,
  itemValidator: (item: any) => item is T
): results is T[] {
  return Array.isArray(results) && results.every(itemValidator);
}

// Safe property access with fallback
export function safePropertyAccess<T>(
  obj: any,
  property: string,
  fallback: T
): T {
  if (isValidDatabaseResult(obj) && property in (obj as any)) {
    return (obj as any)[property];
  }
  return fallback;
}

// Safe string property access
export function safeStringAccess(obj: any, property: string): string {
  return safePropertyAccess(obj, property, "");
}

// Safe number property access
export function safeNumberAccess(obj: any, property: string): number {
  return safePropertyAccess(obj, property, 0);
}

// Safe boolean property access
export function safeBooleanAccess(obj: any, property: string): boolean {
  return safePropertyAccess(obj, property, false);
}
