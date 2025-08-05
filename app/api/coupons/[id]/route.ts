import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching coupon:", error);
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error in coupon GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if coupon code already exists (excluding current coupon)
    const { data: existingCoupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", body.code)
      .neq("id", params.id)
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
      .update(couponData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating coupon:", error);
      return NextResponse.json(
        { error: "Failed to update coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error in coupon PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting coupon:", error);
      return NextResponse.json(
        { error: "Failed to delete coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error in coupon DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
