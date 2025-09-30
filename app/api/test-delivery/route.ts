import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    console.log("Testing delivery_charges table...");

    // Try to select from the table
    const { data, error } = await supabaseAdmin
      .from("delivery_charges")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Table test error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        message:
          "Table 'delivery_charges' does not exist or has permission issues",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Table 'delivery_charges' exists and is accessible",
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    });
  }
}
