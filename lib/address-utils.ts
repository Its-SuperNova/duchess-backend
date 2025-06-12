import { supabase } from "./supabase";
import type { Address } from "./supabase";

export interface CreateAddressData {
  address_name: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_default?: boolean;
}

export interface UpdateAddressData {
  address_name?: string;
  full_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_default?: boolean;
}

// Get all addresses for a user
export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    return [];
  }
}

// Create a new address
export async function createAddress(
  userId: string,
  addressData: CreateAddressData
): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        ...addressData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating address:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createAddress:", error);
    return null;
  }
}

// Update an existing address
export async function updateAddress(
  addressId: string,
  addressData: UpdateAddressData
): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", addressId)
      .select()
      .single();

    if (error) {
      console.error("Error updating address:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateAddress:", error);
    return null;
  }
}

// Delete an address
export async function deleteAddress(addressId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      console.error("Error deleting address:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return false;
  }
}

// Set an address as default
export async function setDefaultAddress(
  userId: string,
  addressId: string
): Promise<boolean> {
  try {
    // First, unset all other addresses as default
    const { error: unsetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    if (unsetError) {
      console.error("Error unsetting default addresses:", unsetError);
      return false;
    }

    // Then set the specified address as default
    const { error: setError } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", userId);

    if (setError) {
      console.error("Error setting default address:", setError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in setDefaultAddress:", error);
    return false;
  }
}

// Get the default address for a user
export async function getDefaultAddress(
  userId: string
): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No default address found
        return null;
      }
      console.error("Error fetching default address:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getDefaultAddress:", error);
    return null;
  }
}
