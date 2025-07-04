import { NextRequest, NextResponse } from "next/server";
import { getAreaFromPincode } from "@/lib/pincode-areas";

interface GoogleMapsGeocodingResponse {
  status: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { pincode } = await request.json();

    if (!pincode) {
      return NextResponse.json(
        { error: "Pincode is required" },
        { status: 400 }
      );
    }

    const cleanPincode = pincode.replace(/\s+/g, "").trim();
    console.log("Validating pincode:", cleanPincode);

    // Basic pincode validation
    if (!/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json(
        {
          isValid: false,
          error: "Please enter a valid 6-digit pincode.",
        },
        { status: 200 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Fallback to basic validation without Google Maps API
      return NextResponse.json(
        {
          isValid: true,
          isCoimbatoreArea: true,
          city: "Coimbatore",
          state: "Tamil Nadu",
          area: "",
        },
        { status: 200 }
      );
    }

    // Use Google Maps Geocoding API to get location details from pincode
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      `${cleanPincode}, India`
    )}&key=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DuchessPastries/1.0 (https://duchesspastries.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API request failed: ${response.status}`);
    }

    const data: GoogleMapsGeocodingResponse = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json(
        {
          isValid: false,
          error: "Invalid pincode or location not found",
        },
        { status: 200 }
      );
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract city, state, and area information
    let city = "";
    let state = "";
    let area = "";
    let district = "";

    console.log("Address components:", addressComponents);

    for (const component of addressComponents) {
      const types = component.types;
      console.log("Component:", component.long_name, "Types:", types);

      if (types.includes("locality") || types.includes("sublocality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("administrative_area_level_3")) {
        district = component.long_name;
      } else if (
        types.includes("sublocality_level_1") ||
        types.includes("neighborhood")
      ) {
        area = component.long_name;
      }
    }

    // First try to get area from our pincode mapping
    const mappedArea = getAreaFromPincode(cleanPincode);
    if (mappedArea) {
      area = mappedArea;
    } else {
      // Use locality as area if no specific area is found
      if (!area && city) {
        area = city;
      }
      // If still no area, use district name
      if (!area && district) {
        area = district;
      }
    }

    console.log("Extracted info:", { city, state, area, district });

    // Check if the location is in Coimbatore area (must be specifically in Coimbatore district)
    const isCoimbatoreArea =
      city.toLowerCase().includes("coimbatore") ||
      district.toLowerCase().includes("coimbatore") ||
      // Check if the pincode is in our Coimbatore mapping
      getAreaFromPincode(cleanPincode) !== null;
    console.log("Pincode validation result:", {
      pincode: cleanPincode,
      city,
      state,
      area,
      isCoimbatoreArea,
    });

    return NextResponse.json(
      {
        isValid: true,
        isCoimbatoreArea,
        city,
        state,
        area,
        error: isCoimbatoreArea
          ? undefined
          : "This pincode is not in Coimbatore area. We only deliver within Coimbatore.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pincode validation error:", error);
    return NextResponse.json(
      {
        isValid: false,
        error: "Failed to validate pincode. Please try again.",
      },
      { status: 500 }
    );
  }
}
