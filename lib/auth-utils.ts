import { supabase } from "./supabase";
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
