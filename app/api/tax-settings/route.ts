import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET - Fetch current tax settings
export async function GET() {
  try {
    console.log("Fetching tax settings...");
    const { data, error } = await supabaseAdmin
      .from("tax_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Successfully fetched tax settings:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Update tax settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received tax settings data:", body);

    const { cgst_rate, sgst_rate } = body;

    // Validate required fields
    if (cgst_rate === undefined || sgst_rate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: cgst_rate and sgst_rate" },
        { status: 400 }
      );
    }

    // Validate tax rates are numbers and within reasonable range
    if (
      typeof cgst_rate !== "number" ||
      typeof sgst_rate !== "number" ||
      cgst_rate < 0 ||
      cgst_rate > 100 ||
      sgst_rate < 0 ||
      sgst_rate > 100
    ) {
      return NextResponse.json(
        { error: "Tax rates must be numbers between 0 and 100" },
        { status: 400 }
      );
    }

    console.log("Attempting to update tax settings...");

    // Check if tax settings exist
    const { data: existingSettings } = await supabaseAdmin
      .from("tax_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    let data, error;

    if (existingSettings) {
      // Update existing tax settings
      const result = await supabaseAdmin
        .from("tax_settings")
        .update({
          cgst_rate: cgst_rate,
          sgst_rate: sgst_rate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new tax settings if none exist
      const result = await supabaseAdmin
        .from("tax_settings")
        .insert([
          {
            cgst_rate: cgst_rate,
            sgst_rate: sgst_rate,
            is_active: true,
          },
        ])
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Successfully updated tax settings:", data);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
