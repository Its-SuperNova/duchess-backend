import { createClient } from "@supabase/supabase-js";

// Debug: Log environment variables to help troubleshoot
console.log("Environment variables check:");
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set"
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add validation to provide better error messages
if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please check your .env.local file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider: string;
  provider_id: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  role: "user" | "admin" | "delivery_agent" | "shop_worker";
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  address_name: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  distance: number | null;
  duration: number | null;
  alternate_phone: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  category_id: string;
  is_veg: boolean;
  has_offer: boolean;
  offer_percentage: number | null;
  offer_up_to_price: number;

  // Images
  banner_image: string | null;
  additional_images: string[];

  // Selling options
  selling_type: "weight" | "piece" | "both";
  weight_options: Array<{
    weight: string;
    price: string;
    stock: string;
    isActive: boolean;
  }>;
  piece_options: Array<{
    quantity: string;
    price: string;
    stock: string;
    isActive: boolean;
  }>;

  // Nutrition information
  calories: number | null;
  net_weight: number | null; // in grams
  protein: number | null; // in grams
  fats: number | null; // in grams
  carbs: number | null; // in grams
  sugars: number | null; // in grams
  fiber: number | null; // in grams
  sodium: number | null; // in mg

  // Customization options
  add_text_on_cake: boolean;
  add_candles: boolean;
  add_knife: boolean;
  add_message_card: boolean;

  // Delivery options
  delivery_option: "same-day" | "both";

  // Tags and features
  highlights: string[];
  ingredients: string[];

  // Status and timestamps
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at" | "updated_at">;
        Update: Partial<Address>;
      };
      categories: {
        Row: Category;
        Insert: Omit<
          Category,
          "id" | "created_at" | "updated_at" | "products_count"
        >;
        Update: Partial<
          Omit<Category, "id" | "created_at" | "updated_at" | "products_count">
        >;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
