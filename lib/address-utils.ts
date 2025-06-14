import { supabase } from "./supabase";
import type { Address } from "./supabase";
import { validateAddressForCoimbatoreDelivery } from "./address-validation";

export interface CreateAddressData {
  address_name: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  area?: string;
  is_default?: boolean;
  distance?: number;
  duration?: number;
  alternate_phone: string;
  additional_details?: string;
}

export interface UpdateAddressData {
  address_name?: string;
  full_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  area?: string;
  is_default?: boolean;
  distance?: number;
  duration?: number;
  alternate_phone?: string;
  additional_details?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface AddressFromLocation {
  city: string;
  state: string;
  zipCode: string;
}

// Function to reverse geocode coordinates using Nominatim (free service)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<AddressFromLocation | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=14`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address data");
    }

    const data = await response.json();

    if (data && data.address) {
      const address = data.address;

      // Extract only city, state, and zipcode - street address should be entered manually
      // Try multiple fallbacks for city name
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.municipality ||
        address.district ||
        "";
      const state = address.state || "";
      const zipCode = address.postcode || "";

      return {
        city: city,
        state: state,
        zipCode: zipCode,
      };
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Function to get current location and reverse geocode it
export const getCurrentLocationAddress = async (): Promise<{
  location: LocationData | null;
  address: AddressFromLocation | null;
  error: string | null;
}> => {
  if (!navigator.geolocation) {
    return {
      location: null,
      address: null,
      error: "Geolocation is not supported by this browser.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          const address = await reverseGeocode(
            location.latitude,
            location.longitude
          );
          resolve({
            location,
            address,
            error: null,
          });
        } catch (error) {
          resolve({
            location,
            address: null,
            error: "Failed to get address from location.",
          });
        }
      },
      (error) => {
        let errorMessage =
          "An unknown error occurred while getting your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        resolve({
          location: null,
          address: null,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

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
): Promise<{ address: Address | null; error?: string }> {
  try {
    console.log("Creating address with data:", { userId, addressData });

    // Validate that we have a valid user ID
    if (!userId || typeof userId !== "string") {
      console.error("Invalid user ID provided:", userId);
      return { address: null, error: "Invalid user ID" };
    }

    // Validate address data
    if (
      !addressData.address_name ||
      !addressData.full_address ||
      !addressData.city ||
      !addressData.state ||
      !addressData.zip_code
    ) {
      console.error("Missing required address fields:", addressData);
      return { address: null, error: "Missing required address fields" };
    }

    // Validate Coimbatore area
    const validationResult = await validateAddressForCoimbatoreDelivery({
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zip_code,
    });

    if (!validationResult.isCoimbatoreArea) {
      console.error(
        "Address is outside Coimbatore delivery area:",
        validationResult
      );
      return {
        address: null,
        error:
          validationResult.error ||
          "Address is outside our Coimbatore delivery area. We currently deliver within 30km of Coimbatore city.",
      };
    }

    // Check if this is the user's first address
    const { data: existingAddresses, error: countError } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId);

    if (countError) {
      console.error("Error checking existing addresses:", countError);
      return { address: null, error: "Failed to check existing addresses" };
    }

    // If this is the first address, make it default
    const isFirstAddress = existingAddresses.length === 0;
    const shouldBeDefault = isFirstAddress || addressData.is_default;

    // Add distance, duration, and area to address data
    const addressDataWithDistance = {
      ...addressData,
      distance: validationResult.distance,
      duration: validationResult.duration,
      area: validationResult.area,
      is_default: shouldBeDefault,
    };

    // If this should be default, first unset any existing default addresses
    if (shouldBeDefault && !isFirstAddress) {
      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (unsetError) {
        console.error(
          "Error unsetting existing default addresses:",
          unsetError
        );
        return { address: null, error: "Failed to update default addresses" };
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        ...addressDataWithDistance,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating address:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return { address: null, error: "Failed to create address" };
    }

    console.log("Address created successfully:", data);
    return { address: data };
  } catch (error) {
    console.error("Error in createAddress:", error);
    return { address: null, error: "Failed to create address" };
  }
}

// Update an existing address
export async function updateAddress(
  addressId: string,
  addressData: UpdateAddressData
): Promise<{ address: Address | null; error?: string }> {
  try {
    // If address fields are being updated, validate Coimbatore area
    if (addressData.city || addressData.state || addressData.zip_code) {
      // Get current address data to fill in missing fields
      const { data: currentAddress } = await supabase
        .from("addresses")
        .select("city, state, zip_code")
        .eq("id", addressId)
        .single();

      if (currentAddress) {
        const validationData = {
          city: addressData.city || currentAddress.city,
          state: addressData.state || currentAddress.state,
          zip_code: addressData.zip_code || currentAddress.zip_code,
        };

        const validationResult = await validateAddressForCoimbatoreDelivery(
          validationData
        );

        if (!validationResult.isCoimbatoreArea) {
          console.error(
            "Updated address is outside Coimbatore delivery area:",
            validationResult
          );
          return {
            address: null,
            error:
              validationResult.error ||
              "Updated address is outside our Coimbatore delivery area. We currently deliver within 30km of Coimbatore city.",
          };
        }

        // Add distance, duration, and area to address data
        addressData.distance = validationResult.distance;
        addressData.duration = validationResult.duration;
        addressData.area = validationResult.area;
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", addressId)
      .select()
      .single();

    if (error) {
      console.error("Error updating address:", error);
      return { address: null, error: "Failed to update address" };
    }

    return { address: data };
  } catch (error) {
    console.error("Error in updateAddress:", error);
    return { address: null, error: "Failed to update address" };
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
