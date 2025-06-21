import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase/admin";
import type { User } from "./supabase";

export interface AuthUserData {
  email: string;
  name: string;
  image?: string;
  provider: string;
  provider_id: string;
}

export async function upsertUser(userData: AuthUserData): Promise<User | null> {
  try {
    // Use admin client to bypass RLS for user creation
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          email: userData.email,
          name: userData.name,
          image: userData.image,
          provider: userData.provider,
          provider_id: userData.provider_id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in upsertUser:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Use admin client to bypass RLS for user queries
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
}

export async function updateUserProfile(
  email: string,
  profileData: {
    name?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
    image?: string;
  }
): Promise<User | null> {
  try {
    // Use admin client to bypass RLS for user profile updates
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return null;
  }
}

// Role-based access control utilities
export async function getUserRole(
  email: string
): Promise<"user" | "admin" | "delivery_agent" | "shop_worker" | null> {
  try {
    // Use admin client to bypass RLS for user role queries
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return data.role;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
}

export async function isUserAdmin(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return role === "admin";
}

export async function isUserModerator(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return (
    role === "delivery_agent" || role === "shop_worker" || role === "admin"
  );
}

export async function updateUserRole(
  email: string,
  role: "user" | "admin" | "delivery_agent" | "shop_worker"
): Promise<User | null> {
  try {
    console.log("updateUserRole called with:", { email, role });

    // Use admin client to bypass RLS for user role updates
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Error updating user role:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log("Role updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return null;
  }
}
