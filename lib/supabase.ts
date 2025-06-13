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
    };
  };
}
