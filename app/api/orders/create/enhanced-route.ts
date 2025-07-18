import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// This is the enhanced version to use AFTER running the database migration
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
      subtotalAmount,
      discountAmount,
      deliveryFee,
      totalAmount,
      note,
      addressText,
      couponCode,
      contactInfo,
      // Enhanced fields for comprehensive order data
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
    } = body || {};

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

    // Normalize inputs
    const sanitizedCouponCode =
      couponCode ?? null ? String(couponCode).trim() : null;

    // Calculate taxes if not provided
    const calculatedCgst =
      cgstAmount ?? (subtotalAmount - discountAmount) * 0.09;
    const calculatedSgst =
      sgstAmount ?? (subtotalAmount - discountAmount) * 0.09;

    // Enhanced order data structure (AFTER migration)
    const enhancedOrderData = {
      user_id: user.id,
      subtotal_amount: subtotalAmount ?? 0,
      discount_amount: discountAmount ?? 0,
      delivery_fee: deliveryFee ?? 0,
      total_amount: totalAmount ?? 0,
      // Tax information
      cgst_amount: calculatedCgst,
      sgst_amount: calculatedSgst,
      // Enhanced delivery information
      address_text: addressText || null,
      delivery_address: deliveryAddress || {
        address: addressText || "Default address",
        type: "home",
        contact: contactInfo
          ? {
              name: contactInfo.name,
              phone: contactInfo.phone,
              alternatePhone: contactInfo.alternatePhone || null,
            }
          : null,
        coordinates: coordinates || null,
        distance: distance || null,
        duration: duration || null,
        delivery_zone: deliveryZone || null,
      },
      // Delivery timing
      delivery_timing: deliveryTiming || "same-day",
      scheduled_delivery: scheduledDelivery || null,
      estimated_delivery_time: estimatedDeliveryTime || null,
      is_same_day_delivery: isSameDayDelivery ?? true,
      // Distance and location data
      distance: distance || null,
      duration: duration || null,
      delivery_zone: deliveryZone || null,
      coordinates: coordinates
        ? `(${coordinates.lat},${coordinates.lng})`
        : null,
      // Customization and special instructions
      note: note || null,
      restaurant_notes: restaurantNotes || null,
      special_instructions: specialInstructions || null,
      // Payment and order details
      payment_method: paymentMethod || "online",
      coupon_code: sanitizedCouponCode,
      // Generate a simple order number
      order_number: `ORD-${Date.now()}`,
      // Status fields (will use database defaults)
      // status: "processing",
      // payment_status: "pending",
    };

    console.log("Enhanced order data to insert:", enhancedOrderData);

    // Insert enhanced order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(enhancedOrderData)
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

    console.log("Attempting to insert order items with customization...");

    // Enhanced order items with customization options
    const enhancedOrderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant,
      // Enhanced customization fields
      add_text_on_cake: item.add_text_on_cake || false,
      add_candles: item.add_candles || false,
      add_knife: item.add_knife || false,
      add_message_card: item.add_message_card || false,
      cake_text: item.cake_text || null,
      gift_card_text: item.gift_card_text || null,
      // Order type and category
      order_type: item.order_type || "weight",
      category: item.category || null,
      // Customization options from checkout
      customization_options: customizationOptions || {},
    }));

    console.log("Enhanced order items payload:", enhancedOrderItemsPayload);
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(enhancedOrderItemsPayload);

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

    return NextResponse.json({
      success: true,
      orderId: order.id,
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
