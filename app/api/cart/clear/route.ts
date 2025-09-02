import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user's cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // Cart doesn't exist, which means it's already empty
        return NextResponse.json({
          success: true,
          message: "Cart is already empty",
        });
      }
      console.error("Error fetching cart:", cartError);
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 }
      );
    }

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: "Cart is already empty",
      });
    }

    // Clear all cart items for the user's cart
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (deleteError) {
      console.error("Error clearing cart:", deleteError);
      return NextResponse.json(
        { error: "Failed to clear cart" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
