import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Track coupon usage when an order is successfully completed
 * This function should be called AFTER order creation and payment confirmation
 *
 * @param couponCode - The coupon code that was used
 * @param orderId - The order ID where the coupon was applied
 * @param userId - The user ID who used the coupon
 * @param discountAmount - The discount amount applied
 */
export async function trackCouponUsage(
  couponCode: string,
  orderId: string,
  userId: string,
  discountAmount: number
) {
  try {
    console.log("🎫 Tracking coupon usage:", {
      couponCode,
      orderId,
      userId,
      discountAmount,
    });

    // Find the coupon by code
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select(
        "id, code, times_used, usage_limit, enable_usage_limit, total_revenue"
      )
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      console.error("❌ Coupon not found:", couponError);
      return {
        success: false,
        error: "Coupon not found or inactive",
      };
    }

    // Check if coupon has reached its usage limit
    if (coupon.enable_usage_limit && coupon.usage_limit) {
      if (coupon.times_used >= coupon.usage_limit) {
        console.warn("⚠️ Coupon usage limit reached:", {
          couponCode,
          timesUsed: coupon.times_used,
          usageLimit: coupon.usage_limit,
        });
        return {
          success: false,
          error: "Coupon usage limit reached",
        };
      }
    }

    // Update coupon usage statistics
    const { error: updateError } = await supabaseAdmin
      .from("coupons")
      .update({
        times_used: coupon.times_used + 1,
        last_used_at: new Date().toISOString(),
        total_revenue: (coupon.total_revenue || 0) + discountAmount,
      })
      .eq("id", coupon.id);

    if (updateError) {
      console.error("❌ Failed to update coupon usage:", updateError);
      return {
        success: false,
        error: "Failed to update coupon usage",
      };
    }

    console.log("✅ Coupon usage tracked successfully:", {
      couponCode,
      newTimesUsed: coupon.times_used + 1,
      discountAmount,
    });

    return {
      success: true,
      data: {
        couponId: coupon.id,
        timesUsed: coupon.times_used + 1,
        usageLimit: coupon.usage_limit,
        isLimitReached:
          coupon.enable_usage_limit &&
          coupon.times_used + 1 >= coupon.usage_limit,
      },
    };
  } catch (error) {
    console.error("❌ Error tracking coupon usage:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

/**
 * Check if a coupon can still be used (not expired, not at limit)
 * This function should be called BEFORE applying coupon during checkout
 *
 * @param couponCode - The coupon code to check
 */
export async function validateCouponUsage(couponCode: string) {
  try {
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select(
        "id, code, times_used, usage_limit, enable_usage_limit, valid_until, is_active"
      )
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return {
        valid: false,
        error: "Coupon not found or inactive",
      };
    }

    // Check if coupon is expired
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    if (now > validUntil) {
      return {
        valid: false,
        error: "Coupon has expired",
      };
    }

    // Check if coupon has reached its usage limit
    if (coupon.enable_usage_limit && coupon.usage_limit) {
      if (coupon.times_used >= coupon.usage_limit) {
        return {
          valid: false,
          error: "Coupon usage limit reached",
        };
      }
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        timesUsed: coupon.times_used,
        usageLimit: coupon.usage_limit,
        remainingUses:
          coupon.enable_usage_limit && coupon.usage_limit
            ? coupon.usage_limit - coupon.times_used
            : null,
      },
    };
  } catch (error) {
    console.error("❌ Error validating coupon usage:", error);
    return {
      valid: false,
      error: "Internal server error",
    };
  }
}

/**
 * Get coupon usage statistics for admin dashboard
 *
 * @param couponId - Optional coupon ID to get stats for specific coupon
 */
export async function getCouponUsageStats(couponId?: string) {
  try {
    let query = supabaseAdmin
      .from("coupons")
      .select(
        "id, code, times_used, usage_limit, enable_usage_limit, total_revenue, last_used_at, created_at"
      );

    if (couponId) {
      query = query.eq("id", couponId);
    }

    const { data: coupons, error } = await query;

    if (error) {
      console.error("❌ Error fetching coupon stats:", error);
      return {
        success: false,
        error: "Failed to fetch coupon statistics",
      };
    }

    const stats = coupons?.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      timesUsed: coupon.times_used,
      usageLimit: coupon.usage_limit,
      hasUsageLimit: coupon.enable_usage_limit,
      remainingUses:
        coupon.enable_usage_limit && coupon.usage_limit
          ? Math.max(0, coupon.usage_limit - coupon.times_used)
          : null,
      totalRevenue: coupon.total_revenue || 0,
      lastUsedAt: coupon.last_used_at,
      createdAt: coupon.created_at,
      usagePercentage:
        coupon.enable_usage_limit && coupon.usage_limit
          ? Math.round((coupon.times_used / coupon.usage_limit) * 100)
          : null,
    }));

    return {
      success: true,
      data: couponId ? stats?.[0] : stats,
    };
  } catch (error) {
    console.error("❌ Error getting coupon usage stats:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
