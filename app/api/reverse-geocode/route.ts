import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    console.log("🔄 Server-side reverse geocoding for:", lat, lng);

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Reverse geocode to get address details
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    console.log("📍 Geocoding response status:", geocodeResponse.status);

    if (!geocodeResponse.ok) {
      return NextResponse.json(
        { error: `Geocoding request failed: ${geocodeResponse.status}` },
        { status: geocodeResponse.status }
      );
    }

    const geocodeData = await geocodeResponse.json();
    console.log("📍 Reverse geocoding result:", geocodeData);

    if (geocodeData.results && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      const addressComponents = result.address_components;

      console.log("🏠 Address components:", addressComponents);

      // Extract address components
      let streetNumber = "";
      let route = "";
      let area = "";
      let city = "";
      let state = "";
      let pincode = "";

      addressComponents.forEach((component: any) => {
        const types = component.types;
        console.log("🔍 Component:", component.long_name, "Types:", types);

        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        } else if (types.includes("route")) {
          route = component.long_name;
        } else if (
          types.includes("sublocality") ||
          types.includes("sublocality_level_1") ||
          types.includes("neighborhood")
        ) {
          area = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("postal_code")) {
          pincode = component.long_name;
        }
      });

      console.log("📝 Extracted data:", {
        streetNumber,
        route,
        area,
        city,
        state,
        pincode,
      });

      // Return the extracted data
      const addressData = {
        fullAddress: `${streetNumber} ${route}`.trim(),
        area: area || city || "Area",
        zipCode: pincode || "",
        streetNumber,
        route,
        city,
        state,
        pincode,
        formattedAddress: result.formatted_address,
      };

      console.log("✅ Returning address data:", addressData);

      return NextResponse.json({
        success: true,
        data: addressData,
      });
    } else {
      console.log("❌ No geocoding results found");
      return NextResponse.json(
        { error: "No address found for the given coordinates" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
      { status: 500 }
    );
  }
}
