import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deliveryChargesCache } from "@/lib/delivery-charges-cache";

// GET - Fetch all delivery charges
export async function GET() {
  try {
    console.log("Fetching delivery charges...");
    const data = await deliveryChargesCache.getDeliveryCharges();
    console.log("Successfully fetched delivery charges:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new delivery charge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received data:", body);

    // Validate required fields based on type
    if (body.type === "order_value") {
      if (
        body.order_value_threshold === undefined ||
        body.order_value_threshold === null ||
        !body.delivery_type
      ) {
        return NextResponse.json(
          { error: "Missing required fields for order value" },
          { status: 400 }
        );
      }
    } else if (body.type === "distance") {
      if (
        body.start_km === undefined ||
        body.start_km === null ||
        body.end_km === undefined ||
        body.end_km === null ||
        body.price === undefined ||
        body.price === null
      ) {
        return NextResponse.json(
          { error: "Missing required fields for distance" },
          { status: 400 }
        );
      }

      // Validate distance range
      if (body.start_km >= body.end_km) {
        return NextResponse.json(
          { error: "Start KM must be less than End KM" },
          { status: 400 }
        );
      }

      // Validate price is positive
      if (body.price < 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }

      // Check for range overlaps
      const { data: existingRanges, error: fetchError } = await supabaseAdmin
        .from("delivery_charges")
        .select("start_km, end_km, id")
        .eq("type", "distance")
        .eq("is_active", true);

      if (fetchError) {
        console.error("Error fetching existing ranges:", fetchError);
        return NextResponse.json(
          { error: "Failed to validate range" },
          { status: 500 }
        );
      }

      // Check for overlaps
      const hasOverlap = existingRanges.some((range) => {
        const startOverlap =
          body.start_km >= range.start_km && body.start_km < range.end_km;
        const endOverlap =
          body.end_km > range.start_km && body.end_km <= range.end_km;
        const containsRange =
          body.start_km <= range.start_km && body.end_km >= range.end_km;
        const isContained =
          body.start_km >= range.start_km && body.end_km <= range.end_km;

        return startOverlap || endOverlap || containsRange || isContained;
      });

      if (hasOverlap) {
        return NextResponse.json(
          {
            error:
              "This distance range overlaps with an existing delivery charge range",
          },
          { status: 400 }
        );
      }
    }

    console.log("Attempting to insert into delivery_charges table...");
    const { data, error } = await supabaseAdmin
      .from("delivery_charges")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Successfully created delivery charge:", data);

    // Clear cache to ensure fresh data on next request
    deliveryChargesCache.clearCache();

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
