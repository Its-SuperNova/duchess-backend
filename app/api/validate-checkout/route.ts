import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Server-Side Checkout Validation API
 * Validates all checkout data and recalculates financial values on the server
 * to prevent client-side manipulation and ensure data integrity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkoutId,
      items,
      addressId,
      addressText,
      distance,
      couponCode,
      customizationOptions,
      contactInfo,
    } = body;

    // ============================================================================
    // VALIDATION 1: Required Fields
    // ============================================================================
    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (!addressText || !addressId) {
      return NextResponse.json(
        { error: "Delivery address is required" },
        { status: 400 }
      );
    }

    if (!contactInfo?.name || !contactInfo?.phone) {
      return NextResponse.json(
        { error: "Contact information is required" },
        { status: 400 }
      );
    }

    // ============================================================================
    // CALCULATION 1: Verify Product Prices from Database
    // ============================================================================
    const productIds = items.map((item: any) => item.product_id || item.id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, category")
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Error fetching products for validation:", productsError);
      return NextResponse.json(
        { error: "Failed to validate product prices" },
        { status: 500 }
      );
    }

    // Create a map for quick price lookup
    const productPriceMap = new Map(
      products.map((p) => [p.id, { price: p.price, name: p.name }])
    );

    // Validate and calculate subtotal from database prices
    let validatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.product_id || item.id;
      const dbProduct = productPriceMap.get(productId);

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product not found: ${productId}` },
          { status: 400 }
        );
      }

      // Use database price, not client-provided price
      const validatedPrice = dbProduct.price;
      const quantity = item.quantity || 1;
      const itemTotal = validatedPrice * quantity;

      validatedSubtotal += itemTotal;
      validatedItems.push({
        product_id: productId,
        product_name: dbProduct.name,
        unit_price: validatedPrice,
        quantity: quantity,
        total_price: itemTotal,
      });
    }

    console.log("✅ Server-side subtotal validation:", {
      clientSubtotal: items.reduce(
        (sum: number, item: any) =>
          sum + (item.unit_price || item.price) * item.quantity,
        0
      ),
      validatedSubtotal,
      difference:
        validatedSubtotal -
        items.reduce(
          (sum: number, item: any) =>
            sum + (item.unit_price || item.price) * item.quantity,
          0
        ),
    });

    // ============================================================================
    // CALCULATION 2: Validate Coupon and Calculate Discount
    // ============================================================================
    let validatedDiscount = 0;
    let couponDetails = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .single();

      if (coupon && !couponError) {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = new Date(coupon.valid_until);

        // Validate coupon conditions
        if (
          now >= validFrom &&
          now <= validUntil &&
          validatedSubtotal >= coupon.min_order_amount
        ) {
          // Calculate discount based on coupon type
          if (coupon.type === "percentage") {
            const percentageDiscount = (validatedSubtotal * coupon.value) / 100;
            validatedDiscount = Math.min(
              percentageDiscount,
              coupon.max_discount_cap || Infinity
            );
          } else if (coupon.type === "flat") {
            validatedDiscount = coupon.value;
          }

          couponDetails = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount: validatedDiscount,
          };

          console.log("✅ Server-side coupon validation:", couponDetails);
        } else {
          console.warn("⚠️ Coupon validation failed:", {
            code: couponCode,
            isActive: coupon.is_active,
            validFrom,
            validUntil,
            now,
            minOrderAmount: coupon.min_order_amount,
            currentSubtotal: validatedSubtotal,
          });
        }
      }
    }

    // ============================================================================
    // CALCULATION 3: Fetch Tax Settings and Calculate Taxes
    // ============================================================================
    const { data: taxSettings, error: taxError } = await supabase
      .from("tax_settings")
      .select("cgst_rate, sgst_rate")
      .single();

    let validatedCgstAmount = 0;
    let validatedSgstAmount = 0;

    if (taxSettings && !taxError) {
      const taxableAmount = validatedSubtotal - validatedDiscount;
      validatedCgstAmount = taxSettings.cgst_rate
        ? (taxableAmount * taxSettings.cgst_rate) / 100
        : 0;
      validatedSgstAmount = taxSettings.sgst_rate
        ? (taxableAmount * taxSettings.sgst_rate) / 100
        : 0;

      console.log("✅ Server-side tax calculation:", {
        taxableAmount,
        cgstRate: taxSettings.cgst_rate,
        sgstRate: taxSettings.sgst_rate,
        cgstAmount: validatedCgstAmount,
        sgstAmount: validatedSgstAmount,
      });
    } else {
      console.warn("⚠️ No tax settings found, using 0%");
    }

    // ============================================================================
    // CALCULATION 4: Calculate Delivery Fee with Free Delivery Check
    // ============================================================================
    let validatedDeliveryFee = 0;
    let freeDeliveryQualified = false;

    if (distance) {
      // First, check if order qualifies for free delivery based on order value
      const { data: orderValueCharge, error: orderValueError } = await supabase
        .from("delivery_charges")
        .select("*")
        .eq("type", "order_value")
        .eq("is_active", true)
        .single();

      if (
        orderValueCharge &&
        !orderValueError &&
        orderValueCharge.delivery_type === "free"
      ) {
        const orderValueThreshold = orderValueCharge.order_value_threshold;

        if (validatedSubtotal >= orderValueThreshold) {
          validatedDeliveryFee = 0;
          freeDeliveryQualified = true;

          console.log("✅ Order qualifies for free delivery:", {
            subtotal: validatedSubtotal,
            threshold: orderValueThreshold,
            deliveryFee: validatedDeliveryFee,
            freeDeliveryQualified,
          });
        }
      }

      // If not qualified for free delivery, calculate based on distance
      if (!freeDeliveryQualified) {
        // Fetch distance-based delivery charges
        const { data: distanceCharges, error: deliveryError } = await supabase
          .from("delivery_charges")
          .select("*")
          .eq("type", "distance")
          .eq("is_active", true)
          .order("start_km", { ascending: true });

        if (distanceCharges && !deliveryError) {
          // Find appropriate delivery charge based on distance
          const applicableCharge = distanceCharges.find(
            (charge) => distance >= charge.start_km && distance <= charge.end_km
          );

          if (applicableCharge) {
            validatedDeliveryFee = applicableCharge.price;
          } else {
            // Use the closest range if no exact match
            const sortedCharges = distanceCharges.sort(
              (a, b) => a.start_km - b.start_km
            );

            if (distance < sortedCharges[0].start_km) {
              validatedDeliveryFee = sortedCharges[0].price;
            } else if (
              distance > sortedCharges[sortedCharges.length - 1].end_km
            ) {
              validatedDeliveryFee =
                sortedCharges[sortedCharges.length - 1].price;
            } else {
              validatedDeliveryFee = 80; // Fallback
            }
          }

          console.log("✅ Server-side delivery fee calculation:", {
            distance,
            deliveryFee: validatedDeliveryFee,
            applicableCharge,
            freeDeliveryQualified,
          });
        } else {
          console.error("❌ Failed to fetch delivery charges:", deliveryError);
          return NextResponse.json(
            { error: "Failed to calculate delivery fee" },
            { status: 500 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { error: "Distance is required for delivery calculation" },
        { status: 400 }
      );
    }

    // ============================================================================
    // CALCULATION 5: Calculate Final Total
    // ============================================================================
    const validatedTotal =
      validatedSubtotal -
      validatedDiscount +
      validatedCgstAmount +
      validatedSgstAmount +
      validatedDeliveryFee;

    // ============================================================================
    // VALIDATION 2: Cross-check with Client Values (if provided)
    // ============================================================================
    const clientTotal = body.clientTotal;
    if (clientTotal) {
      const difference = Math.abs(validatedTotal - clientTotal);

      // Allow 1 rupee difference due to rounding
      if (difference > 1) {
        console.error("❌ Total mismatch detected:", {
          clientTotal,
          validatedTotal,
          difference,
        });

        return NextResponse.json(
          {
            error: "Price mismatch detected. Please refresh and try again.",
            details: {
              clientTotal,
              validatedTotal,
              difference,
            },
          },
          { status: 400 }
        );
      }
    }

    // ============================================================================
    // RESPONSE: Return Validated Data
    // ============================================================================
    const validatedData = {
      success: true,
      validated: {
        items: validatedItems,
        subtotal: validatedSubtotal,
        discount: validatedDiscount,
        cgstAmount: validatedCgstAmount,
        sgstAmount: validatedSgstAmount,
        deliveryFee: validatedDeliveryFee,
        freeDeliveryQualified: freeDeliveryQualified,
        total: validatedTotal,
        coupon: couponDetails,
        taxSettings: {
          cgst_rate: taxSettings?.cgst_rate || 0,
          sgst_rate: taxSettings?.sgst_rate || 0,
        },
      },
      metadata: {
        validatedAt: new Date().toISOString(),
        checkoutId,
        itemCount: validatedItems.length,
      },
    };

    console.log("✅ Server-side validation complete:", validatedData);

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("❌ Server-side validation error:", error);
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
