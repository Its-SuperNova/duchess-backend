// Database type declarations to resolve Supabase type issues

declare global {
  namespace Database {
    // Email confirmation types
    interface EmailConfirmation {
      email: string;
      orderId: string;
      items: Array<{
        name: string;
        quantity: number;
      }>;
    }
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

      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_refund_id: string | null;
          amount: number;
          currency: string;
          payment_status: "pending" | "captured" | "failed" | "refunded";
          payment_method: string;
          receipt: string | null;
          signature_verified: boolean;
          webhook_received: boolean;
          notes: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["payments"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["payments"]["Insert"]>;
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

      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          payment_status:
            | "pending"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_paid";
          // Financial information
          item_total: number;
          delivery_charge: number;
          discount_amount: number;
          cgst: number;
          sgst: number;
          total_amount: number;
          // Address and delivery
          delivery_address_id: string | null;
          delivery_address_text: string | null;
          // Customer notes and special requests
          notes: string | null;
          is_knife: boolean;
          is_candle: boolean;
          is_text_on_card: boolean;
          text_on_card: string | null;
          // Delivery timing
          delivery_timing: string;
          delivery_date: string | null;
          delivery_time_slot: string | null;
          // Contact information
          contact_name: string;
          contact_number: string;
          contact_alternate_number: string | null;
          // Coupon information
          is_coupon: boolean;
          coupon_id: string | null;
          coupon_code: string | null;
          // Delivery logistics
          estimated_time_delivery: string | null;
          delivery_zone: string | null;
          // Delivery person information
          delivery_person_name: string | null;
          delivery_person_contact: string | null;
          // Payment information
          payment_method: "online" | "cod" | "card" | "upi" | "wallet";
          payment_transaction_id: string | null;
          // Payment reference
          latest_payment_id: string | null;
          // Additional tracking
          preparation_time: number | null;
          cooking_started_at: string | null;
          ready_at: string | null;
          picked_up_at: string | null;
          delivered_at: string | null;
          // Ratings and feedback
          customer_rating: number | null;
          customer_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["orders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["orders"]["Insert"]>;
      };

      // delivery_partners table removed

      addresses: {
        Row: {
          id: string;
          user_id: string;
          address_name: string;
          full_address: string;
          city: string;
          state: string;
          zip_code: string;
          is_default: boolean;
          distance: number | null;
          duration: number | null;
          alternate_phone: string;
          additional_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["addresses"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["addresses"]["Insert"]>;
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string; // This matches your string-based product IDs
          // Product information (snapshot at time of order)
          product_name: string;
          product_image: string | null;
          product_description: string | null;
          category: string | null;
          // Quantity and pricing
          quantity: number;
          unit_price: number;
          total_price: number;
          // Product variant/customization
          variant: string | null;
          customization_options: any;
          // Cake-specific customizations
          cake_text: string | null;
          cake_flavor: string | null;
          cake_size: string | null;
          cake_weight: number | null;
          // Additional services for this item
          item_has_knife: boolean;
          item_has_candle: boolean;
          item_has_message_card: boolean;
          item_message_card_text: string | null;
          // Item status tracking
          item_status: "pending" | "preparing" | "ready" | "delivered";
          preparation_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["order_items"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["order_items"]["Insert"]>;
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
