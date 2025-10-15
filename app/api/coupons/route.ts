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

    // Prepare coupon data with new structure
    const couponData = {
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,

      // Conditional fields based on toggle states
      min_order_amount: body.minOrderAmount || 0,
      max_discount_cap: body.maxDiscountCap || null,
      usage_limit: body.usageLimit || null,

      // Toggle states
      enable_min_order_amount: body.enableMinOrderAmount || false,
      enable_max_discount_cap: body.enableMaxDiscountCap || false,
      enable_usage_limit: body.enableUsageLimit || false,

      // Validity period
      valid_from: body.validFrom,
      valid_until: body.validUntil,

      // Product/Category restrictions
      applicable_categories:
        body.applicableCategories?.length > 0
          ? body.applicableCategories
          : null,
      applicable_products:
        body.applicableProducts?.length > 0
          ? body.applicableProducts.map((id) => parseInt(id))
          : null,
      apply_to_specific: body.applyToSpecific || false,
      restriction_type: body.restrictionType || null,

      // Default values
      usage_per_user: 1, // Keep default for backward compatibility
      is_active: true,
    };

    console.log("Creating coupon with data:", couponData);

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .insert(couponData as any)
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
