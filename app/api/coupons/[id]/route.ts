import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("id", id as any)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq("code", body.code as any)
      .neq("id", id as any)
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
      .update(couponData as any)
      .eq("id", id as any)
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow specific fields for partial updates (start with is_active toggle)
    const updates: Record<string, unknown> = {};

    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    } else if (typeof body.isActive === "boolean") {
      updates.is_active = body.isActive;
    }

    // If no valid fields provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .update(updates as any)
      .eq("id", id as any)
      .select()
      .single();

    if (error) {
      console.error("Error partially updating coupon:", error);
      return NextResponse.json(
        { error: "Failed to update coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error in coupon PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id as any);

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
