// Simple address validation using Google Maps

import { calculateDistanceAndTime } from "./distance";

export interface ValidationResult {
  isValid: boolean;
  isCoimbatoreArea: boolean; // For backward compatibility
  distance?: number;
  duration?: number;
  area?: string;
  error?: string;
}

export interface PincodeAutofillResult {
  isValid: boolean;
  area?: string;
  city: string;
  state: string;
  distance?: number;
  duration?: number;
  error?: string;
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

    // Use Google Maps to calculate distance (it will handle if the address is valid)
    const result = await calculateDistanceAndTime("", pincode);

    if (result.success) {
      return {
        isValid: true,
        isCoimbatoreArea: true,
        distance: result.distance,
        duration: result.duration,
        area: "", // Google Maps handles this
      };
    } else {
      return {
        isValid: false,
        isCoimbatoreArea: false,
        error: "Unable to calculate delivery distance for this pincode.",
      };
    }
  } catch (error) {
    return {
      isValid: false,
      isCoimbatoreArea: false,
      error: "Failed to validate address. Please try again.",
    };
  }
}

// Autofill address from pincode using Google Maps
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

    // Use Google Maps to validate and get distance
    const result = await calculateDistanceAndTime("", cleanPincode);

    if (result.success) {
      return {
        isValid: true,
        area: "", // Google Maps will handle area detection
        city: "Coimbatore",
        state: "Tamil Nadu",
        distance: result.distance,
        duration: result.duration,
      };
    } else {
      return {
        isValid: false,
        city: "",
        state: "",
        error:
          "This pincode may not be serviceable or is outside our delivery area.",
      };
    }
  } catch (error) {
    return {
      isValid: false,
      city: "",
      state: "",
      error: "Failed to validate pincode. Please try again.",
    };
  }
}
