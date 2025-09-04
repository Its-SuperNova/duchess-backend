import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all orders for this user
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          *,
          order_items (
            id,
            product_name,
            product_image,
            category,
            quantity,
            unit_price,
            total_price,
            variant
          ),
          addresses (
            id,
            address_name,
            full_address,
            city
          ),
          coupons (
            id,
            code,
            value
          )
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error("Error fetching orders:", orderError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: orders || [],
      count: orders?.length || 0,
    });
  } catch (error) {
    console.error("Error in orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
