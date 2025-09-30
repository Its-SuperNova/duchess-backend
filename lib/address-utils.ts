import { supabase } from "./supabase";
import type { Address } from "./supabase";
import { validateAddressForCoimbatoreDelivery } from "./address-validation";
import { calculateDistanceForAddress } from "./distance";

// Utility function to convert stored distance (integer * 10) back to display format
export function getDisplayDistance(
  storedDistance: number | null
): number | null {
  if (storedDistance === null) return null;
  return storedDistance / 10; // Convert back from integer storage format
}

// Utility function to convert display distance to storage format
export function getStorageDistance(displayDistance: number): number {
  return Math.round(displayDistance * 10); // Convert to integer storage format
}

export interface CreateAddressData {
  address_name: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_default?: boolean;
  distance?: number;
  duration?: number;
  additional_details?: string;
}

export interface UpdateAddressData {
  address_name?: string;
  full_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
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
          "Address is outside our Coimbatore delivery area. We currently deliver within 50km of Coimbatore city.",
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

    // Calculate distance and duration using the server-side API
    const deliveryResult = await calculateDistanceForAddress(
      addressData.full_address,
      addressData.city,
      addressData.state,
      addressData.zip_code
    );

    if (!deliveryResult.success) {
      return {
        address: null,
        error: deliveryResult.error || "Failed to calculate distance and time",
      };
    }

    // Add distance and duration to address data (area is not stored in database)
    // Ensure distance and duration are integers for database compatibility
    const addressDataWithDistance = {
      ...addressData,
      distance: Math.round(deliveryResult.distance * 10), // Convert to integer (multiply by 10 to preserve 1 decimal place)
      duration: Math.round(deliveryResult.duration), // Convert to integer
      is_default: shouldBeDefault,
    };

    console.log("Address data with distance:", {
      distance: deliveryResult.distance,
      duration: deliveryResult.duration,
      distanceInt: Math.round(deliveryResult.distance * 10),
      durationInt: Math.round(deliveryResult.duration),
    });

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
        .select("full_address, city, state, zip_code")
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
              "Updated address is outside our Coimbatore delivery area. We currently deliver within 50km of Coimbatore city.",
          };
        }

        // Calculate distance and duration using the server-side API
        const deliveryResult = await calculateDistanceForAddress(
          addressData.full_address || currentAddress.full_address,
          addressData.city || currentAddress.city,
          addressData.state || currentAddress.state,
          addressData.zip_code || currentAddress.zip_code
        );

        if (!deliveryResult.success) {
          return {
            address: null,
            error:
              deliveryResult.error || "Failed to calculate distance and time",
          };
        }

        // Add distance and duration to address data (area is not stored in database)
        // Ensure distance and duration are integers for database compatibility
        addressData.distance = Math.round(deliveryResult.distance * 10); // Convert to integer (multiply by 10 to preserve 1 decimal place)
        addressData.duration = Math.round(deliveryResult.duration); // Convert to integer
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

// Recalculate distance and time for an address
export async function recalculateAddressDistance(
  addressId: string
): Promise<{ address: Address | null; error?: string }> {
  try {
    console.log("Recalculating distance for address ID:", addressId);

    // Get the address data
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .single();

    if (fetchError) {
      console.error("Error fetching address:", fetchError);
      return { address: null, error: "Failed to fetch address" };
    }

    if (!address) {
      console.error("Address not found for ID:", addressId);
      return { address: null, error: "Address not found" };
    }

    console.log("Found address:", address);

    // First validate that the address is in Coimbatore area
    const validationResult = await validateAddressForCoimbatoreDelivery({
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    });

    if (!validationResult.isCoimbatoreArea) {
      return {
        address: null,
        error: validationResult.error || "Address is outside delivery area",
      };
    }

    // Calculate distance and duration using the server-side API
    const deliveryResult = await calculateDistanceForAddress(
      address.full_address,
      address.city,
      address.state,
      address.zip_code
    );

    if (!deliveryResult.success) {
      return {
        address: null,
        error: deliveryResult.error || "Failed to calculate distance and time",
      };
    }

    console.log(
      "Updating address with distance:",
      deliveryResult.distance,
      "duration:",
      deliveryResult.duration
    );

    // First check if the address still exists
    const { data: checkAddress, error: checkError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", addressId)
      .single();

    if (checkError || !checkAddress) {
      console.error("Address no longer exists or check failed:", checkError);
      return { address: null, error: "Address no longer exists" };
    }

    // Update the address with new distance and duration
    // Ensure distance and duration are integers for database compatibility
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update({
        distance: Math.round(deliveryResult.distance * 10), // Convert to integer (multiply by 10 to preserve 1 decimal place)
        duration: Math.round(deliveryResult.duration), // Convert to integer
      })
      .eq("id", addressId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating address distance:", updateError);
      console.error("Update error details:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      });
      return { address: null, error: "Failed to update address distance" };
    }

    if (!updatedAddress) {
      console.error("No address returned after update");
      return {
        address: null,
        error: "Failed to update address - no data returned",
      };
    }

    return { address: updatedAddress };
  } catch (error) {
    console.error("Error in recalculateAddressDistance:", error);
    return { address: null, error: "Failed to recalculate distance" };
  }
}
