import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return NextResponse.json(
        { error: "Failed to fetch coupons" },
        { status: 500 }
      );
    }

         // Add debug info
     const debugInfo = {
       totalCoupons: coupons?.length || 0,
       activeCoupons: coupons?.filter((c) => c.is_active).length || 0,
       coupons: coupons?.map((c) => ({
         id: c.id,
         code: c.code,
         is_active: c.is_active,
         valid_from: c.valid_from,
         valid_until: c.valid_until,
         type: c.type,
         value: c.value,
         min_order_amount: c.min_order_amount,
         max_discount_cap: c.max_discount_cap,
       })),
     };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Error in test coupons GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
