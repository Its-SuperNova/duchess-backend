import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET - Fetch all delivery charges
export async function GET() {
  try {
    console.log("Fetching delivery charges...");
    const { data, error } = await supabaseAdmin
      .from("delivery_charges")
      .select("*")
      .eq("is_active", true)
      .order("type", { ascending: true })
      .order("start_km", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
