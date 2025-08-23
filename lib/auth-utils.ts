"use server";
// import { supabase } from "./supabase";
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
        } as any,
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

    return data as any;
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
      .eq("email", email as any)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data as any;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
}

export async function updateUserProfile(
  email: string,
  profileData: {
    name?: string;
    phone_number?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    image?: string | null;
  }
): Promise<User | null> {
  try {
    console.log("updateUserProfile called with:", { email, profileData });

    // Filter out undefined values to avoid database errors
    const cleanProfileData = Object.fromEntries(
      Object.entries(profileData).filter(([_, value]) => value !== undefined)
    );

    console.log("Clean profile data:", cleanProfileData);

    // Use admin client to bypass RLS for user profile updates
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...cleanProfileData,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("email", email as any)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating user profile:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.error("No user found with email:", email);
      throw new Error("User not found");
    }

    console.log("Profile updated successfully:", data);
    return data as any;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user profile");
  }
}

// Role-based access control utilities
export async function getUserRole(
  email: string
): Promise<"user" | "admin" | "shop_worker" | null> {
  try {
    // Use admin client to bypass RLS for user role queries
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", email as any)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return (data as any).role;
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
  return role === "shop_worker" || role === "admin";
}

export async function updateUserRole(
  email: string,
  role: "user" | "admin" | "shop_worker"
): Promise<User | null> {
  try {
    console.log("updateUserRole called with:", { email, role });

    // Use admin client to bypass RLS for user role updates
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("email", email as any)
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
    return data as any;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return null;
  }
}
