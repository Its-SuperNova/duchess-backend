import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create cart for user
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cartError && cartError.code === "PGRST116") {
      // Cart doesn't exist, create one
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();

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

    // Get cart items
    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: false });

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to fetch cart items" },
        { status: 500 }
      );
    }

    // Transform cart items to match frontend format
    const transformedItems = cartItems.map((item) => ({
      id: parseInt(item.product_id) || 0,
      name: item.product_name,
      price: item.price,
      image: item.product_image || "/placeholder.svg",
      quantity: item.quantity,
      category: item.category || "Product",
      variant: item.variant,
      addTextOnCake: item.add_text_on_cake,
      addCandles: item.add_candles,
      addKnife: item.add_knife,
      addMessageCard: item.add_message_card,
      cakeText: item.cake_text,
      giftCardText: item.gift_card_text,
      orderType: item.order_type,
    }));

    return NextResponse.json({
      cart: transformedItems,
      cartId: cart.id,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
