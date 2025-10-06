import { supabaseAdmin } from "@/lib/supabase/admin";

interface DeliveryCharge {
  id: number;
  type: "order_value" | "distance";
  order_value_threshold?: number;
  delivery_type?: "free" | "fixed";
  fixed_price?: number;
  start_km?: number;
  end_km?: number;
  price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CacheEntry {
  data: DeliveryCharge[];
  timestamp: number;
}

class DeliveryChargesCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY = "delivery_charges";

  /**
   * Get delivery charges from cache or database
   */
  async getDeliveryCharges(): Promise<DeliveryCharge[]> {
    const cached = this.cache.get(this.CACHE_KEY);

    // Return cached data if it's still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log("📦 Using cached delivery charges");
      return cached.data;
    }

    console.log("🔄 Fetching fresh delivery charges from database");

    try {
      const { data, error } = await supabaseAdmin
        .from("delivery_charges")
        .select("*")
        .eq("is_active", true)
        .order("type", { ascending: true })
        .order("start_km", { ascending: true });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Update cache
      this.cache.set(this.CACHE_KEY, {
        data: data || [],
        timestamp: Date.now(),
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching delivery charges:", error);
      // Return cached data if available, even if expired
      if (cached) {
        console.log("⚠️ Using expired cache due to database error");
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get distance-based delivery charges only
   */
  async getDistanceBasedCharges(): Promise<DeliveryCharge[]> {
    const allCharges = await this.getDeliveryCharges();
    return allCharges.filter((charge) => charge.type === "distance");
  }

  /**
   * Get order value based delivery charge
   */
  async getOrderValueCharge(): Promise<DeliveryCharge | null> {
    const allCharges = await this.getDeliveryCharges();
    return allCharges.find((charge) => charge.type === "order_value") || null;
  }

  /**
   * Calculate delivery charge for a given distance
   */
  async calculateDeliveryCharge(distanceInKm: number): Promise<number> {
    const distanceCharges = await this.getDistanceBasedCharges();

    if (distanceCharges.length === 0) {
      console.log("⚠️ No distance-based charges found, using fallback");
      return 80; // Fallback price
    }

    // Find the matching range
    const matchingCharge = distanceCharges.find(
      (charge) =>
        distanceInKm >= charge.start_km! && distanceInKm <= charge.end_km!
    );

    if (matchingCharge) {
      console.log(
        `✅ Found matching charge: ${matchingCharge.start_km}-${matchingCharge.end_km}km = ₹${matchingCharge.price}`
      );
      return matchingCharge.price!;
    }

    // If no exact match, find the closest range
    const sortedCharges = distanceCharges.sort(
      (a, b) => a.start_km! - b.start_km!
    );

    // If distance is less than the minimum range, use the first range
    if (distanceInKm < sortedCharges[0].start_km!) {
      console.log(
        `📏 Distance ${distanceInKm}km is below minimum range, using first range`
      );
      return sortedCharges[0].price!;
    }

    // If distance is greater than the maximum range, use the last range
    if (distanceInKm > sortedCharges[sortedCharges.length - 1].end_km!) {
      console.log(
        `📏 Distance ${distanceInKm}km is above maximum range, using last range`
      );
      return sortedCharges[sortedCharges.length - 1].price!;
    }

    console.log("❌ No matching charge found, using fallback");
    return 80; // Fallback price
  }

  /**
   * Check if order qualifies for free delivery
   */
  async checkFreeDelivery(
    orderValue: number
  ): Promise<{ isFree: boolean; fixedPrice?: number }> {
    const orderValueCharge = await this.getOrderValueCharge();

    if (!orderValueCharge) {
      return { isFree: false };
    }

    if (orderValue >= orderValueCharge.order_value_threshold!) {
      if (orderValueCharge.delivery_type === "free") {
        return { isFree: true };
      } else if (orderValueCharge.delivery_type === "fixed") {
        return { isFree: false, fixedPrice: orderValueCharge.fixed_price };
      }
    }

    return { isFree: false };
  }

  /**
   * Clear cache (useful when delivery charges are updated)
   */
  clearCache(): void {
    this.cache.clear();
    console.log("🗑️ Delivery charges cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[]; isExpired: boolean } {
    const cached = this.cache.get(this.CACHE_KEY);
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      isExpired: cached
        ? Date.now() - cached.timestamp >= this.CACHE_TTL
        : true,
    };
  }
}

// Export singleton instance
export const deliveryChargesCache = new DeliveryChargesCache();

// Export types
export type { DeliveryCharge };
