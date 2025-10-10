import { deliveryChargesCache } from "@/lib/delivery-charges-cache";

interface DeliveryCalculationResult {
  deliveryCharge: number;
  isFreeDelivery: boolean;
  calculationMethod: "distance" | "order_value" | "fallback";
  details: {
    distance?: number;
    orderValue?: number;
    matchingRange?: {
      start_km: number;
      end_km: number;
      price: number;
    };
    orderValueThreshold?: number;
  };
}

/**
 * Optimized delivery charge calculation
 * This function handles both distance-based and order-value-based delivery charges
 * with intelligent fallbacks and caching
 */
export async function calculateOptimizedDeliveryCharge(
  distanceInKm: number,
  orderValue: number = 0
): Promise<DeliveryCalculationResult> {
  try {
    console.log(
      `🚚 Calculating delivery charge for distance: ${distanceInKm}km, order value: ₹${orderValue}`
    );

    // First, check if order qualifies for free delivery based on order value
    if (orderValue > 0) {
      const orderValueCheck = await deliveryChargesCache.checkFreeDelivery(
        orderValue
      );

      if (orderValueCheck.isFree) {
        console.log(
          `✅ Order qualifies for free delivery (order value: ₹${orderValue})`
        );
        return {
          deliveryCharge: 0,
          isFreeDelivery: true,
          calculationMethod: "order_value",
          details: {
            orderValue,
            orderValueThreshold: orderValue,
          },
        };
      }

      if (orderValueCheck.fixedPrice !== undefined) {
        console.log(
          `💰 Using fixed delivery price: ₹${orderValueCheck.fixedPrice}`
        );
        return {
          deliveryCharge: orderValueCheck.fixedPrice,
          isFreeDelivery: false,
          calculationMethod: "order_value",
          details: {
            orderValue,
            orderValueThreshold: orderValue,
          },
        };
      }
    }

    // Get all distance-based charges for logging
    const distanceCharges =
      await deliveryChargesCache.getDistanceBasedCharges();

    console.log("🔍 Available distance-based charges:");
    distanceCharges.forEach((charge, index) => {
      console.log(
        `  ${index + 1}. ${charge.start_km}km - ${charge.end_km}km = ₹${
          charge.price
        }`
      );
    });

    // Calculate distance-based delivery charge
    const distanceCharge = await deliveryChargesCache.calculateDeliveryCharge(
      distanceInKm
    );

    // Find the matching range for details
    const matchingRange = distanceCharges.find(
      (charge) =>
        distanceInKm >= charge.start_km! && distanceInKm <= charge.end_km!
    );

    console.log(`📏 Distance-based delivery charge: ₹${distanceCharge}`);
    if (matchingRange) {
      console.log(
        `✅ Matched range: ${matchingRange.start_km}km - ${matchingRange.end_km}km`
      );
    } else {
      console.log(`⚠️ No exact range match found for ${distanceInKm}km`);
    }

    return {
      deliveryCharge: distanceCharge,
      isFreeDelivery: false,
      calculationMethod: "distance",
      details: {
        distance: distanceInKm,
        matchingRange: matchingRange
          ? {
              start_km: matchingRange.start_km!,
              end_km: matchingRange.end_km!,
              price: matchingRange.price!,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("❌ Error calculating delivery charge:", error);

    // Fallback to default charge
    const fallbackCharge = 80;
    console.log(`⚠️ Using fallback delivery charge: ₹${fallbackCharge}`);

    return {
      deliveryCharge: fallbackCharge,
      isFreeDelivery: false,
      calculationMethod: "fallback",
      details: {
        distance: distanceInKm,
        orderValue,
      },
    };
  }
}

/**
 * Batch calculate delivery charges for multiple addresses
 * Useful for comparing delivery costs across different locations
 */
export async function batchCalculateDeliveryCharges(
  addresses: Array<{ distance: number; orderValue?: number }>
): Promise<Array<DeliveryCalculationResult & { addressIndex: number }>> {
  const results = await Promise.all(
    addresses.map(async (address, index) => {
      const result = await calculateOptimizedDeliveryCharge(
        address.distance,
        address.orderValue || 0
      );
      return {
        ...result,
        addressIndex: index,
      };
    })
  );

  return results;
}

/**
 * Get delivery charge summary for admin dashboard
 */
export async function getDeliveryChargeSummary(): Promise<{
  totalRanges: number;
  distanceRanges: Array<{ start: number; end: number; price: number }>;
  orderValueSettings: {
    threshold?: number;
    type?: string;
    fixedPrice?: number;
  } | null;
  cacheStats: {
    size: number;
    isExpired: boolean;
  };
}> {
  try {
    const distanceCharges =
      await deliveryChargesCache.getDistanceBasedCharges();
    const orderValueCharge = await deliveryChargesCache.getOrderValueCharge();
    const cacheStats = deliveryChargesCache.getCacheStats();

    return {
      totalRanges: distanceCharges.length,
      distanceRanges: distanceCharges.map((charge) => ({
        start: charge.start_km!,
        end: charge.end_km!,
        price: charge.price!,
      })),
      orderValueSettings: orderValueCharge
        ? {
            threshold: orderValueCharge.order_value_threshold,
            type: orderValueCharge.delivery_type,
            fixedPrice: orderValueCharge.fixed_price,
          }
        : null,
      cacheStats: {
        size: cacheStats.size,
        isExpired: cacheStats.isExpired,
      },
    };
  } catch (error) {
    console.error("Error getting delivery charge summary:", error);
    throw error;
  }
}

/**
 * Validate delivery charge ranges for gaps and overlaps
 */
export async function validateDeliveryRanges(): Promise<{
  isValid: boolean;
  issues: Array<{
    type: "gap" | "overlap" | "invalid_range";
    message: string;
    ranges: Array<{ start: number; end: number; id: number }>;
  }>;
}> {
  try {
    const distanceCharges =
      await deliveryChargesCache.getDistanceBasedCharges();
    const issues: Array<{
      type: "gap" | "overlap" | "invalid_range";
      message: string;
      ranges: Array<{ start: number; end: number; id: number }>;
    }> = [];

    // Sort ranges by start_km
    const sortedRanges = distanceCharges.sort(
      (a, b) => a.start_km! - b.start_km!
    );

    // Check for invalid ranges
    for (const range of sortedRanges) {
      if (range.start_km! >= range.end_km!) {
        issues.push({
          type: "invalid_range",
          message: `Invalid range: start (${range.start_km}) >= end (${range.end_km})`,
          ranges: [
            {
              start: range.start_km!,
              end: range.end_km!,
              id: range.id,
            },
          ],
        });
      }
    }

    // Check for overlaps and gaps
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i];
      const next = sortedRanges[i + 1];

      // Check for overlap
      if (current.end_km! > next.start_km!) {
        issues.push({
          type: "overlap",
          message: `Overlap between ranges: ${current.start_km}-${current.end_km} and ${next.start_km}-${next.end_km}`,
          ranges: [
            { start: current.start_km!, end: current.end_km!, id: current.id },
            { start: next.start_km!, end: next.end_km!, id: next.id },
          ],
        });
      }

      // Check for gap
      if (current.end_km! < next.start_km!) {
        issues.push({
          type: "gap",
          message: `Gap between ranges: ${current.end_km} to ${next.start_km}`,
          ranges: [
            { start: current.start_km!, end: current.end_km!, id: current.id },
            { start: next.start_km!, end: next.end_km!, id: next.id },
          ],
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    console.error("Error validating delivery ranges:", error);
    throw error;
  }
}
