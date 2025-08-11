import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      id,
      name,
      price,
      image,
      quantity,
      category,
      variant,
      addTextOnCake,
      addCandles,
      addKnife,
      addMessageCard,
      cakeText,
      giftCardText,
      orderType,
      uniqueId, // Use this to ensure each add action creates a new entry
    } = body;

    if (!id || !name || !price || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Always add as new item - each add to cart action creates a new entry
    // Generate a unique identifier for this specific cart item
    const itemUniqueId = uniqueId || `${Date.now()}-${Math.random()}`;

    const insertData = {
      cart_id: cart.id,
      product_id: id.toString(),
      quantity,
      variant: variant || "Regular",
      price,
      product_name: name,
      product_image: image || "/placeholder.svg",
      category: category || "Product",
      add_text_on_cake: addTextOnCake || false,
      add_candles: addCandles || false,
      add_knife: addKnife || false,
      add_message_card: addMessageCard || false,
      cake_text: cakeText || null,
      gift_card_text: giftCardText || null,
      order_type: orderType || "weight",
      unique_item_id: itemUniqueId, // Store the unique identifier
    };

    console.log("Adding new item to cart:", insertData);

    const { data: newItem, error: insertError } = await supabase
      .from("cart_items")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to add item to cart", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "New item added to cart",
      item: newItem,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
