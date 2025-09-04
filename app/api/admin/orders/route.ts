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
        ),
        addresses!orders_delivery_address_id_fkey (
          id,
          address_name,
          full_address,
          city,
          state,
          zip_code
        ),
        coupons!orders_coupon_id_fkey (
          id,
          code,
          type,
          value
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
        orderStatus: order.status || "pending",
        date: formatRelativeDate(order.created_at),
        fullDate: formatFullDate(order.created_at),
        orderTime: formatOrderTime(order.created_at),
        total_amount: order.total_amount,
        paid_amount: order.paid_amount,
        discount_amount: order.discount_amount,
        delivery_charge: order.delivery_charge,
        cgst: order.cgst,
        sgst: order.sgst,
        delivery_address: order.addresses
          ? {
              id: order.addresses.id,
              name: order.addresses.address_name,
              full_address: order.addresses.full_address,
              city: order.addresses.city,
              state: order.addresses.state,
              zip_code: order.addresses.zip_code,
            }
          : null,
        coupon: order.coupons
          ? {
              id: order.coupons.id,
              code: order.coupons.code,
              type: order.coupons.type,
              value: order.coupons.value,
            }
          : null,
        is_coupon: order.is_coupon,
        estimated_time_delivery: order.estimated_time_delivery,
        distance: order.distance,
        duration: order.duration,
        delivery_zone: order.delivery_zone,
        payment_method: order.payment_method,
        // Legacy fields for backward compatibility
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

  // Reset time to start of day for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = today.getTime() - orderDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
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

// Helper function to format order time
function formatOrderTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
