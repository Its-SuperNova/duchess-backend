import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

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
    } = body || {};

    console.log("Extracted order data:", {
      subtotalAmount,
      discountAmount,
      deliveryFee,
      totalAmount,
      note,
      addressText,
      couponCode,
      contactInfo,
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
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      console.log("Cart creation result:", { newCart, createError });
      if (createError) {
        return NextResponse.json(
          { error: "Failed to create cart" },
          { status: 500 }
        );
      }
      cart = newCart;
    } else if (cartError) {
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 }
      );
    }

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not available" },
        { status: 500 }
      );
    }

    // Fetch cart items
    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", (cart as any)?.id)
      .order("created_at", { ascending: false });

    console.log("Cart items lookup result:", {
      cartItemsCount: cartItems?.length,
      itemsError,
    });
    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to fetch cart items" },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    console.log("Attempting to insert order...");
    // Normalize inputs
    const sanitizedCouponCode =
      couponCode ?? null ? String(couponCode).trim() : null;

    // Insert order - using the correct column names from the actual table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal_amount: subtotalAmount ?? 0,
        discount_amount: discountAmount ?? 0,
        delivery_fee: deliveryFee ?? 0,
        total_amount: totalAmount ?? 0,
        // status omitted to use DB default and avoid check constraint
        // payment_status omitted to use DB default
        address_text: addressText || null,
        note: note || null,
        coupon_code: sanitizedCouponCode,
        // Generate a simple order number
        order_number: `ORD-${Date.now()}`,
        // Set delivery address as JSON (required field)
        delivery_address: {
          address: addressText || "Default address",
          type: "home",
          contact: contactInfo
            ? {
                name: contactInfo.name,
                phone: contactInfo.phone,
              }
            : null,
        },
      })
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
    // Insert order items - using only basic columns that should exist
    const orderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant,
      // Removed potentially missing columns: category, order_type, customization fields
    }));

    console.log("Order items payload:", orderItemsPayload);
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    console.log("Order items insertion result:", { orderItemsError });
    if (orderItemsError) {
      console.error("Order items insertion failed:", orderItemsError);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    console.log("Attempting to clear cart...");
    // Clear cart
    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", (cart as any)?.id);

    if (clearError) {
      // Non-fatal: order created but cart not cleared
      console.warn("Order created but failed to clear cart", clearError);
    }

    console.log("Order creation successful, returning orderId:", order.id);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
