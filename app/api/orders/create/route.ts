import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { getAreaFromPincode } from "@/lib/pincode-areas";
import { CheckoutStore } from "@/lib/checkout-store";

export async function GET() {
  return NextResponse.json(
    { error: "GET method not supported. Use POST to create orders." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("Session:", session?.user?.email);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    const {
      // Checkout session
      checkoutId,

      // Financial information
      itemTotal,
      subtotalAmount, // fallback
      discountAmount,
      deliveryFee,
      deliveryCharge, // alias
      totalAmount,
      cgstAmount,
      sgstAmount,

      // Contact and delivery
      contactName,
      contactNumber,
      contactAlternateNumber,
      deliveryAddressId,
      addressText, // fallback

      // Special requests
      notes,
      note, // fallback
      isKnife,
      isCandle,
      isTextOnCard,
      textOnCard,

      // Delivery timing
      deliveryTiming,
      deliveryDate,
      deliveryTimeSlot,
      estimatedTimeDelivery,
      estimatedDeliveryTime, // fallback
      distance,
      duration,
      deliveryZone,

      // Coupon information
      isCoupon,
      couponId,
      couponCode,

      // Payment
      paymentMethod,
      paymentTransactionId,
      paymentStatus,

      // Order status
      orderStatus,
      status,

      // Legacy fields for backward compatibility
      contactInfo,
      customizationOptions,
      deliveryAddress,
      scheduledDelivery,
      specialInstructions,
      restaurantNotes,
      isSameDayDelivery,
      coordinates,
    } = body || {};

    // Check payment status if checkoutId is provided
    if (checkoutId) {
      const checkoutSession = await CheckoutStore.getSession(checkoutId);
      if (!checkoutSession) {
        return NextResponse.json(
          { error: "Checkout session not found or expired" },
          { status: 404 }
        );
      }

      if (checkoutSession.paymentStatus === "paid") {
        return NextResponse.json(
          { error: "Order already created for this payment" },
          { status: 409 }
        );
      }

      if (checkoutSession.paymentStatus !== "processing") {
        return NextResponse.json(
          { error: "Payment not in processing state" },
          { status: 400 }
        );
      }
    }

    console.log("Extracted enhanced order data:", {
      subtotalAmount,
      discountAmount,
      deliveryFee,
      totalAmount,
      note,
      addressText,
      couponCode,
      contactInfo,
      customizationOptions,
      deliveryTiming,
      distance,
      duration,
      cgstAmount,
      sgstAmount,
      deliveryAddress,
      scheduledDelivery,
      paymentMethod,
      specialInstructions,
      restaurantNotes,
      estimatedDeliveryTime,
      isSameDayDelivery,
      deliveryZone,
      coordinates,
    });

    // Get user id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email as any)
      .single();

    console.log("User lookup result:", { user, userError });
    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", (user as any)?.id)
      .single();

    console.log("Cart lookup result:", { cart, cartError });
    if (cartError && (cartError as any).code === "PGRST116") {
      // Cart doesn't exist, create one
      const { data: newCart, error: createCartError } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();

      if (createCartError || !newCart) {
        console.error("Failed to create cart:", createCartError);
        return NextResponse.json(
          { error: "Failed to create cart" },
          { status: 500 }
        );
      }
      cart = newCart;
    } else if (cartError || !cart) {
      console.error("Cart lookup failed:", cartError);
      return NextResponse.json(
        { error: "Failed to get cart" },
        { status: 500 }
      );
    }

    // Get cart items
    const { data: cartItems, error: cartItemsError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id);

    if (cartItemsError) {
      console.error("Failed to get cart items:", cartItemsError);
      return NextResponse.json(
        { error: "Failed to get cart items" },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Normalize and calculate values
    const finalItemTotal = itemTotal ?? subtotalAmount ?? 0;
    const finalDeliveryCharge = deliveryCharge ?? deliveryFee ?? 0;
    const finalDiscountAmount = discountAmount ?? 0;

    // Calculate taxes if not provided
    const calculatedCgst =
      cgstAmount ?? (finalItemTotal - finalDiscountAmount) * 0.09;
    const calculatedSgst =
      sgstAmount ?? (finalItemTotal - finalDiscountAmount) * 0.09;

    // Extract contact info from legacy or new format
    const finalContactName = contactName || contactInfo?.name || "";
    const finalContactNumber = contactNumber || contactInfo?.phone || "";
    const finalContactAlternateNumber =
      contactAlternateNumber || contactInfo?.alternatePhone || null;

    // Fetch address data if deliveryAddressId is provided
    let addressData = null;
    let finalDeliveryZone = deliveryZone;

    if (deliveryAddressId) {
      try {
        const { data: address, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", deliveryAddressId)
          .eq("user_id", user.id)
          .single();

        if (!addressError && address) {
          console.log("Found address data:", {
            id: address.id,
            name: address.address_name,
            distance: address.distance,
            duration: address.duration,
            zip_code: address.zip_code,
          });

          addressData = address;

          // Calculate delivery zone based on distance and pincode area from address
          if (address.distance) {
            const areaName = getAreaFromPincode(address.zip_code);

            // Enhanced zone calculation
            if (address.distance <= 3) {
              finalDeliveryZone = "Zone A - Express";
            } else if (address.distance <= 7) {
              finalDeliveryZone = "Zone B - Standard";
            } else if (address.distance <= 12) {
              finalDeliveryZone = "Zone C - Extended";
            } else if (address.distance <= 20) {
              finalDeliveryZone = "Zone D - Outskirts";
            } else {
              finalDeliveryZone = "Zone E - Remote";
            }

            // Add area info if available
            if (areaName) {
              finalDeliveryZone += ` (${areaName})`;
            }
          } else if (address.zip_code) {
            // Fallback zone calculation based on pincode only
            const areaName = getAreaFromPincode(address.zip_code);
            if (areaName) {
              finalDeliveryZone = `Standard Zone (${areaName})`;
            }
          }
        } else {
          console.warn("Address not found or access denied:", addressError);
          // If address not found, we should still allow the order but log the issue
          console.warn(
            "Proceeding with order creation without address validation"
          );
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    }

    // Validate that we have a delivery address ID
    if (!deliveryAddressId) {
      console.error("No delivery address ID provided");
      return NextResponse.json(
        { error: "Delivery address is required" },
        { status: 400 }
      );
    }

    // Normalize coupon info
    const sanitizedCouponCode = couponCode ? String(couponCode).trim() : null;
    const finalIsCoupon = isCoupon ?? (!!sanitizedCouponCode || !!couponId);

    // Enhanced order data structure
    const orderData = {
      // User and order identification
      user_id: user.id,
      order_number: `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`,

      // Order status
      status: status || orderStatus || "pending",
      payment_status: paymentStatus || "pending",

      // Financial information
      item_total: finalItemTotal,
      delivery_charge: finalDeliveryCharge,
      discount_amount: finalDiscountAmount,
      cgst: calculatedCgst,
      sgst: calculatedSgst,
      total_amount:
        totalAmount ??
        finalItemTotal +
          finalDeliveryCharge -
          finalDiscountAmount +
          calculatedCgst +
          calculatedSgst,

      // Address and delivery
      delivery_address_id: deliveryAddressId || null,

      // Contact information (prioritize provided contact info over address data)
      contact_name: finalContactName || addressData?.address_name,
      contact_number: finalContactNumber,
      contact_alternate_number:
        finalContactAlternateNumber || addressData?.alternate_phone,

      // Customer notes and special requests
      notes: notes || note || null,
      is_knife: isKnife ?? false,
      is_candle: isCandle ?? false,
      is_text_on_card: isTextOnCard ?? false,
      text_on_card: textOnCard || null,

      // Delivery timing and scheduling
      delivery_timing: deliveryTiming || "same_day",
      delivery_date: deliveryDate || null,
      delivery_time_slot: deliveryTimeSlot || null,

      // Coupon information
      is_coupon: finalIsCoupon,
      coupon_id: couponId || null,
      coupon_code: sanitizedCouponCode,

      // Delivery logistics (distance and duration will come from address relationship)
      estimated_time_delivery: null, // Set to null to avoid timestamp format errors
      delivery_zone: finalDeliveryZone || null,

      // Payment information
      payment_method: paymentMethod || "online",
      payment_transaction_id: paymentTransactionId || null,
    };

    console.log("Order data to insert:", orderData);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    console.log("Order insertion result:", { order, orderError });
    if (orderError || !order) {
      console.error("Order insertion failed:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    console.log("Attempting to insert order items...");

    // Enhanced order items with new schema
    const orderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,

      // Product information (snapshot at time of order)
      product_name: item.product_name,
      product_image: item.product_image || null,
      product_description: item.product_description || null,
      category: item.category || null,

      // Quantity and pricing
      quantity: item.quantity,
      unit_price: item.price || item.unit_price || 0,
      total_price: (item.price || item.unit_price || 0) * item.quantity,

      // Product variant/customization
      variant: item.variant || null,
      customization_options:
        customizationOptions || item.customization_options || {},

      // Cake-specific customizations
      cake_text: item.cake_text || null,
      cake_flavor: item.cake_flavor || null,
      cake_size: item.cake_size || null,
      cake_weight: item.cake_weight || null,

      // Additional services for this item
      item_has_knife: item.add_knife || item.item_has_knife || false,
      item_has_candle: item.add_candles || item.item_has_candle || false,
      item_has_message_card:
        item.add_message_card || item.item_has_message_card || false,
      item_message_card_text:
        item.gift_card_text || item.item_message_card_text || null,

      // Item status tracking
      item_status: "pending",
      preparation_notes: null,
    }));

    console.log("Order items payload:", orderItemsPayload);
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (orderItemsError) {
      console.error("Failed to insert order items:", orderItemsError);
      // Try to rollback order creation
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    console.log("Order and items created successfully");

    // Clear cart after successful order creation
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (clearCartError) {
      console.warn("Failed to clear cart:", clearCartError);
      // Don't fail the order creation if cart clearing fails
    }

    // Invalidate checkout session after successful order creation
    if (checkoutId) {
      const checkoutSession = await CheckoutStore.getSession(checkoutId);
      if (checkoutSession) {
        // Update session to mark as completed and set database order ID
        await CheckoutStore.updateSession(checkoutId, {
          paymentStatus: "paid",
          databaseOrderId: order.id,
        });

        // Delete the session to prevent reuse
        await CheckoutStore.deleteSession(checkoutId);
        console.log(
          `Checkout session ${checkoutId} invalidated after order creation`
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create redirect URL for confirmation page
    const redirectUrl = `/confirmation?orderId=${order.id}`;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      redirectUrl,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
