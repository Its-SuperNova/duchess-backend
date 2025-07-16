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
    const { localCartItems } = body;

    if (!Array.isArray(localCartItems)) {
      return NextResponse.json(
        { error: "Invalid cart items format" },
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

    // Get existing cart items
    const { data: existingItems, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id);

    if (existingError) {
      return NextResponse.json(
        { error: "Failed to fetch existing cart items" },
        { status: 500 }
      );
    }

    // Merge local cart items with database cart
    for (const localItem of localCartItems) {
      const existingItem = existingItems.find(
        (item) =>
          item.product_id === localItem.id.toString() &&
          item.variant === localItem.variant
      );

      if (existingItem) {
        // Update quantity (add local quantity to existing)
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + localItem.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (updateError) {
          console.error("Failed to update cart item:", updateError);
        }
      } else {
        // Add new item to database cart
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cart.id,
            product_id: localItem.id.toString(),
            quantity: localItem.quantity,
            variant: localItem.variant || "Regular",
            price: localItem.price,
            product_name: localItem.name,
            product_image: localItem.image || "/placeholder.svg",
            category: localItem.category || "Product",
            add_text_on_cake: localItem.addTextOnCake || false,
            add_candles: localItem.addCandles || false,
            add_knife: localItem.addKnife || false,
            add_message_card: localItem.addMessageCard || false,
            cake_text: localItem.cakeText || null,
            gift_card_text: localItem.giftCardText || null,
            order_type: localItem.orderType || "weight",
          });

        if (insertError) {
          console.error("Failed to insert cart item:", insertError);
        }
      }
    }

    // Get updated cart items to return
    const { data: updatedCartItems, error: updatedError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id);

    if (updatedError) {
      return NextResponse.json(
        { error: "Failed to fetch updated cart" },
        { status: 500 }
      );
    }

    // Transform cart items to match frontend format
    const transformedItems = updatedCartItems.map((item) => ({
      id: parseInt(item.product_id) || 0,
      name: item.product_name,
      price: item.price,
      image: item.product_image,
      quantity: item.quantity,
      category: item.category,
      variant: item.variant,
      addTextOnCake: item.add_text_on_cake || false,
      addCandles: item.add_candles || false,
      addKnife: item.add_knife || false,
      addMessageCard: item.add_message_card || false,
      cakeText: item.cake_text || undefined,
      giftCardText: item.gift_card_text || undefined,
      orderType: item.order_type || "weight",
    }));

    return NextResponse.json({
      message: "Cart synced successfully",
      cart: transformedItems,
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
