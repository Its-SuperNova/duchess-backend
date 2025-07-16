import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, variant, orderType } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
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

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cartError) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (quantity === 0) {
      // Remove item from cart
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id)
        .eq("product_id", productId.toString())
        .eq("variant", variant || "Regular")
        .eq("order_type", orderType || "weight");

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to remove item" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Item removed from cart" });
    } else {
      // Update item quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("cart_id", cart.id)
        .eq("product_id", productId.toString())
        .eq("variant", variant || "Regular")
        .eq("order_type", orderType || "weight")
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update item quantity" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Item quantity updated",
        item: updatedItem,
      });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
