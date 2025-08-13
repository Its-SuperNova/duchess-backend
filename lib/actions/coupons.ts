"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { Coupon } from "@/lib/supabase";

export async function getCoupons() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      throw new Error("Failed to fetch coupons");
    }

    return coupons;
  } catch (error) {
    console.error("Error in getCoupons:", error);
    throw error;
  }
}

export async function createCoupon(couponData: {
  code: string;
  type: "flat" | "percentage";
  value: number;
  minOrderAmount: number;
  maxDiscountCap?: number;
  usageLimit?: number;
  usagePerUser: number;
  validFrom: string;
  validUntil: string;
  applicableCategories?: string[];
  isActive: boolean;
}) {
  try {
    // Check if coupon code already exists
    const { data: existingCoupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", couponData.code.toUpperCase() as any)
      .single();

    if (existingCoupon) {
      throw new Error("Coupon code already exists");
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: couponData.code.toUpperCase(),
        type: couponData.type,
        value: couponData.value,
        min_order_amount: couponData.minOrderAmount,
        max_discount_cap: couponData.maxDiscountCap || null,
        usage_limit: couponData.usageLimit || null,
        usage_per_user: couponData.usagePerUser,
        valid_from: couponData.validFrom,
        valid_until: couponData.validUntil,
        applicable_categories: couponData.applicableCategories || null,
        is_active: couponData.isActive,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating coupon:", error);
      throw new Error("Failed to create coupon");
    }

    return coupon;
  } catch (error) {
    console.error("Error in createCoupon:", error);
    throw error;
  }
}

export async function updateCoupon(
  id: string,
  couponData: {
    code: string;
    type: "flat" | "percentage";
    value: number;
    minOrderAmount: number;
    maxDiscountCap?: number;
    usageLimit?: number;
    usagePerUser: number;
    validFrom: string;
    validUntil: string;
    applicableCategories?: string[];
    isActive: boolean;
  }
) {
  try {
    // Check if coupon code already exists (excluding current coupon)
    const { data: existingCoupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", couponData.code.toUpperCase() as any)
      .neq("id", id as any)
      .single();

    if (existingCoupon) {
      throw new Error("Coupon code already exists");
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .update({
        code: couponData.code.toUpperCase(),
        type: couponData.type,
        value: couponData.value,
        min_order_amount: couponData.minOrderAmount,
        max_discount_cap: couponData.maxDiscountCap || null,
        usage_limit: couponData.usageLimit || null,
        usage_per_user: couponData.usagePerUser,
        valid_from: couponData.validFrom,
        valid_until: couponData.validUntil,
        applicable_categories: couponData.applicableCategories || null,
        is_active: couponData.isActive,
      } as any)
      .eq("id", id as any)
      .select()
      .single();

    if (error) {
      console.error("Error updating coupon:", error);
      throw new Error("Failed to update coupon");
    }

    return coupon;
  } catch (error) {
    console.error("Error in updateCoupon:", error);
    throw error;
  }
}

export async function deleteCoupon(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id as any);

    if (error) {
      console.error("Error deleting coupon:", error);
      throw new Error("Failed to delete coupon");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteCoupon:", error);
    throw error;
  }
}

export async function getCouponById(id: string) {
  try {
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("id", id as any)
      .single();

    if (error) {
      console.error("Error fetching coupon:", error);
      throw new Error("Coupon not found");
    }

    return coupon;
  } catch (error) {
    console.error("Error in getCouponById:", error);
    throw error;
  }
}
