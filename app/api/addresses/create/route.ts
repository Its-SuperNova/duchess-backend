import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      address_name,
      full_address,
      area,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      address_type,
      other_address_name,
      additional_details,
      is_default = false,
      distance: providedDistance,
      duration: providedDuration,
    } = body;

    // Validate required fields
    if (!address_name || !full_address || !city || !state || !zip_code) {
      return NextResponse.json(
        { error: "Missing required address fields" },
        { status: 400 }
      );
    }

    // Validate coordinates if provided
    if (latitude && (latitude < -90 || latitude > 90)) {
      return NextResponse.json(
        { error: "Invalid latitude value" },
        { status: 400 }
      );
    }

    if (longitude && (longitude < -180 || longitude > 180)) {
      return NextResponse.json(
        { error: "Invalid longitude value" },
        { status: 400 }
      );
    }

    // Validate address type
    if (address_type && !["Home", "Work", "Other"].includes(address_type)) {
      return NextResponse.json(
        { error: "Invalid address type" },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If this should be default, unset any existing default addresses
    if (is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    // Use provided distance/duration or calculate if not provided
    let distance = providedDistance;
    let duration = providedDuration;

    console.log("Distance/Duration handling:", {
      providedDistance,
      providedDuration,
      willCalculate: (!distance || !duration) && latitude && longitude,
    });

    // Only calculate if not provided and coordinates are available
    if ((!distance || !duration) && latitude && longitude) {
      try {
        console.log("Calculating distance with coordinates:", {
          latitude,
          longitude,
          full_address,
          area,
          city,
          state,
          zip_code,
        });

        // Import the distance calculation function directly
        const { getRoadDistanceAndDuration } = await import("@/lib/distance");
        const { SHOP_LOCATION } = await import("@/lib/shop-config");

        const result = await getRoadDistanceAndDuration(
          SHOP_LOCATION.latitude,
          SHOP_LOCATION.longitude,
          latitude,
          longitude
        );

        console.log("Distance calculation result:", result);

        if (result.distance && result.duration) {
          distance = distance || Math.round(result.distance * 100) / 100; // Round to 2 decimal places as float
          duration = duration || Math.round(result.duration); // Convert to integer
          console.log("Calculated distance and duration:", {
            distance,
            duration,
          });
        }
      } catch (error) {
        console.warn("Failed to calculate distance with coordinates:", error);

        // Fallback: Try using the enhanced distance API
        try {
          console.log("Trying fallback distance calculation...");
          const response = await fetch("/api/enhanced-distance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coordinates: { lat: latitude, lng: longitude },
              address: full_address,
              pincode: zip_code,
              area: area,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.distance && result.duration) {
              distance = distance || Math.round(result.distance * 100) / 100; // Round to 2 decimal places as float
              duration = duration || Math.round(result.duration);
              console.log("Fallback distance calculation successful:", {
                distance,
                duration,
              });
            }
          }
        } catch (fallbackError) {
          console.warn(
            "Fallback distance calculation also failed:",
            fallbackError
          );
        }
      }
    }

    // Log the data being inserted
    console.log("Inserting address with data:", {
      user_id: user.id,
      address_name,
      full_address,
      area,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      address_type: address_type || "Home",
      other_address_name,
      additional_details,
      is_default,
      distance,
      duration,
    });

    // Create the address
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        address_name,
        full_address,
        area,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        address_type: address_type || "Home",
        other_address_name,
        additional_details,
        is_default,
        distance,
        duration,
      })
      .select()
      .single();

    if (addressError) {
      console.error("Error creating address:", addressError);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
      message: "Address created successfully",
    });
  } catch (error) {
    console.error("Error in address creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
