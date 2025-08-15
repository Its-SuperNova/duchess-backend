import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch recent orders (last 30 days, limit 5) with order items
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        discount_amount,
        delivery_charge,
        cgst,
        sgst,
        is_coupon,
        estimated_time_delivery,
        delivery_zone,
        payment_method,
        notes,
        created_at,
        order_items (
          id,
          product_name,
          product_image,
          category,
          quantity,
          unit_price
        ),
        addresses!orders_delivery_address_id_fkey (
          id,
          address_name,
          full_address,
          city
        ),
        coupons!orders_coupon_id_fkey (
          id,
          code,
          value
        )
      `
      )
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error("Error fetching recent orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("Error in recent orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
