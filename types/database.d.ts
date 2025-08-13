// Database type declarations to resolve Supabase type issues

declare global {
  namespace Database {
    interface Tables {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          image?: string;
          provider?: string;
          provider_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["users"]["Insert"]>;
      };

      products: {
        Row: {
          id: string;
          name: string;
          short_description: string;
          long_description: string;
          category_id: string;
          is_veg: boolean;
          has_offer: boolean;
          offer?: string;
          offer_percentage: number;
          offer_up_to_price: number;
          weight_options: any[];
          piece_options: any[];
          selling_type: string;
          is_active: boolean;
          [key: string]: any;
        };
        Insert: Partial<Tables["products"]["Row"]>;
        Update: Partial<Tables["products"]["Row"]>;
      };

      categories: {
        Row: {
          id: string;
          name: string;
          image: string | null;
          description: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["categories"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["categories"]["Insert"]>;
      };

      coupons: {
        Row: {
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
        };
        Insert: Omit<
          Tables["coupons"]["Row"],
          | "id"
          | "created_at"
          | "updated_at"
          | "total_redemptions"
          | "total_revenue"
        >;
        Update: Partial<Tables["coupons"]["Insert"]>;
      };

      favorites: {
        Row: {
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
        };
        Insert: Omit<
          Tables["favorites"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["favorites"]["Insert"]>;
      };
    }
  }
}

// Extend Supabase types
declare module "@supabase/supabase-js" {
  interface Database {
    Tables: Database.Tables;
  }
}

export {};
