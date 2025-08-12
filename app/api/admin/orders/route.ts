import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // For now, we'll skip authentication check since this is admin panel
    // In production, you should implement proper admin role verification

    // Fetch orders with user information and order items count
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        *,
        users!orders_user_id_fkey (
          id,
          email,
          name
        ),
        order_items!order_items_order_id_fkey (
          id
        )
      `
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Format orders for admin display
    const formattedOrders = orders.map((order) => {
      const user = order.users;
      const itemsCount = order.order_items?.length || 0;

      return {
        id: order.id,
        order_number: order.order_number,
        customer: {
          name: user?.name || "Unknown Customer",
          email: user?.email || "No email",
          avatar: `/api/avatar?name=${encodeURIComponent(
            user?.name || "Unknown"
          )}`,
        },
        products: itemsCount,
        amount: `₹${order.total_amount?.toFixed(2) || "0.00"}`,
        paymentStatus: order.payment_status || "pending",
        orderStatus: order.status || "processing",
        date: formatRelativeDate(order.created_at),
        fullDate: formatFullDate(order.created_at),
        total_amount: order.total_amount,
        subtotal_amount: order.subtotal_amount,
        discount_amount: order.discount_amount,
        delivery_fee: order.delivery_fee,
        address_text: order.address_text,
        note: order.note,
        coupon_code: order.coupon_code,
        created_at: order.created_at,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error in admin orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to format relative date
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Helper function to format full date
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
