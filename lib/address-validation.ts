// Enhanced address validation using Google Maps API

import { calculateDistanceAndTime } from "./distance";

export interface ValidationResult {
  isValid: boolean;
  isCoimbatoreArea: boolean;
  area?: string;
  city?: string;
  state?: string;
  error?: string;
}

export interface PincodeAutofillResult {
  isValid: boolean;
  area?: string;
  city: string;
  state: string;
  error?: string;
}

// Enhanced pincode validation using Google Maps Geocoding API via server route
async function validatePincodeWithGoogleMaps(pincode: string): Promise<{
  isValid: boolean;
  city?: string;
  state?: string;
  area?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/validate-pincode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pincode }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Pincode validation API error:", error);
    return {
      isValid: false,
      error: "Failed to validate pincode. Please try again.",
    };
  }
}

// Validate address and calculate distance using Google Maps
export async function validateAddressForCoimbatoreDelivery(address: {
  zip_code: string;
  city?: string;
  state?: string;
}): Promise<ValidationResult> {
  try {
    const pincode = address.zip_code.replace(/\s+/g, "").trim();

    // Basic pincode validation
    if (!/^\d{6}$/.test(pincode)) {
      return {
        isValid: false,
        isCoimbatoreArea: false,
        error: "Please enter a valid 6-digit pincode.",
      };
    }

    // Enhanced pincode validation using Google Maps
    const pincodeValidation = await validatePincodeWithGoogleMaps(pincode);

    if (!pincodeValidation.isValid) {
      return {
        isValid: false,
        isCoimbatoreArea: false,
        error: pincodeValidation.error || "Invalid pincode",
      };
    }

    // Check if it's in Coimbatore area
    if (!pincodeValidation.isCoimbatoreArea) {
      return {
        isValid: false,
        isCoimbatoreArea: false,
        city: pincodeValidation.city,
        state: pincodeValidation.state,
        error:
          pincodeValidation.error ||
          "This pincode is not in Coimbatore area. We only deliver within Coimbatore.",
      };
    }

    // Return the enhanced validation result
    return {
      isValid: true,
      isCoimbatoreArea: true,
      area: pincodeValidation.area,
      city: pincodeValidation.city,
      state: pincodeValidation.state,
    };
  } catch (error) {
    console.error("Address validation error:", error);
    return {
      isValid: false,
      isCoimbatoreArea: false,
      error: "Failed to validate address. Please try again.",
    };
  }
}

// Enhanced autofill address from pincode using Google Maps
export async function autofillAddressFromPincode(
  pincode: string
): Promise<PincodeAutofillResult> {
  try {
    const cleanPincode = pincode.replace(/\s+/g, "").trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        isValid: false,
        city: "",
        state: "",
        error: "Please enter a valid 6-digit pincode.",
      };
    }

    // Enhanced pincode validation using Google Maps
    const pincodeValidation = await validatePincodeWithGoogleMaps(cleanPincode);

    if (!pincodeValidation.isValid) {
      return {
        isValid: false,
        city: "",
        state: "",
        error: pincodeValidation.error || "Invalid pincode",
      };
    }

    // Always return area information for valid pincodes (regardless of Coimbatore area)
    return {
      isValid: true,
      area: pincodeValidation.area || "",
      city: pincodeValidation.city || "",
      state: pincodeValidation.state || "",
    };
  } catch (error) {
    console.error("Pincode autofill error:", error);
    return {
      isValid: false,
      city: "",
      state: "",
      error: "Failed to validate pincode. Please try again.",
    };
  }
}
