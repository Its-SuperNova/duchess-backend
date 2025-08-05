import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error in coupons GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.code ||
      !body.type ||
      !body.value ||
      !body.validFrom ||
      !body.validUntil
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const { data: existingCoupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", body.code)
      .single();

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    // Prepare coupon data
    const couponData = {
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      min_order_amount: body.minOrderAmount || 0,
      max_discount_cap: body.maxDiscountCap || null,
      usage_limit: body.usageLimit || null,
      usage_per_user: body.usagePerUser || 1,
      valid_from: body.validFrom,
      valid_until: body.validUntil,
      applicable_categories: body.applicableCategories || null,
      is_active: body.isActive !== undefined ? body.isActive : true,
    };

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .insert(couponData)
      .select()
      .single();

    if (error) {
      console.error("Error creating coupon:", error);
      return NextResponse.json(
        { error: "Failed to create coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error in coupons POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
