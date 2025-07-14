import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("is_active", true as any)
      .lte("valid_from", now)
      .gte("valid_until", now)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active coupons:", error);
      return NextResponse.json(
        { error: "Failed to fetch active coupons" },
        { status: 500 }
      );
    }

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error in active coupons GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
