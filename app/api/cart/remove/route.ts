import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { uniqueItemId } = body;

    if (!uniqueItemId) {
      return NextResponse.json(
        { error: "uniqueItemId is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email as any)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", (user as any)?.id)
      .single();

    if (cartError) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Remove specific item from cart using unique_item_id
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("unique_item_id", uniqueItemId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to remove item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
