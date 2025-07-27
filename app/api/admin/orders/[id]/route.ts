import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order with user information and order items
    const { data: order, error: orderError } = await supabase
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
          id,
          product_id,
          product_name,
          product_image,
          product_description,
          category,
          quantity,
          unit_price,
          total_price,
          variant,
          customization_options,
          cake_text,
          cake_flavor,
          cake_size,
          cake_weight,
          item_has_knife,
          item_has_candle,
          item_has_message_card,
          item_message_card_text,
          item_status,
          preparation_notes
        ),
        addresses!orders_delivery_address_id_fkey (
          id,
          address_name,
          full_address,
          city,
          state,
          zip_code,
          alternate_phone,
          additional_details,
          distance,
          duration
        ),
        coupons!orders_coupon_id_fkey (
          id,
          code,
          type,
          value,
          min_order_amount,
          max_discount_cap
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order items with enhanced data
    const products =
      order.order_items?.map((item: any) => ({
        id: item.id,
        name: item.product_name || "Unknown Product",
        description: item.product_description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        price: item.unit_price, // for backward compatibility
        image: item.product_image,
        variant: item.variant,
        category: item.category,
        customization_options: item.customization_options,
        cake_text: item.cake_text,
        cake_flavor: item.cake_flavor,
        cake_size: item.cake_size,
        cake_weight: item.cake_weight,
        item_has_knife: item.item_has_knife,
        item_has_candle: item.item_has_candle,
        item_has_message_card: item.item_has_message_card,
        item_message_card_text: item.item_message_card_text,
        item_status: item.item_status,
        preparation_notes: item.preparation_notes,
      })) || [];

    // Extract contact information from delivery_address (legacy) or addresses table
    const deliveryAddress = order.delivery_address || {};
    const contactInfo = deliveryAddress.contact || {};
    const addressData = order.addresses;

    console.log("Raw order data:", {
      delivery_address: order.delivery_address,
      addresses: order.addresses,
      contactInfo: contactInfo,
      userInfo: order.users,
      coupon: order.coupons,
    });

    // Format order for admin display with enhanced fields
    const formattedOrder = {
      id: order.id,
      order_number: order.order_number,
      customer: {
        name: order.users?.name || order.contact_name || "Unknown Customer",
        email: order.users?.email || "No email",
        phone: order.contact_number || addressData?.alternate_phone || null,
        alternatePhone: order.contact_alternate_number || null,
        avatar: `/api/avatar?name=${encodeURIComponent(
          order.users?.name || order.contact_name || "Unknown"
        )}`,
      },
      products: products,
      amount: `₹${order.total_amount?.toFixed(2) || "0.00"}`,
      paymentStatus: order.payment_status || "pending",
      orderStatus: order.status || "pending",
      date: formatRelativeDate(order.created_at),
      fullDate: formatFullDate(order.created_at),

      // Enhanced financial information
      item_total: order.item_total,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      delivery_charge: order.delivery_charge,
      cgst: order.cgst,
      sgst: order.sgst,
      subtotal_amount: order.item_total, // for backward compatibility
      delivery_fee: order.delivery_charge, // for backward compatibility

      // Enhanced delivery and contact information
      delivery_address: addressData
        ? {
            id: addressData.id,
            name: addressData.address_name,
            full_address: addressData.full_address,
            city: addressData.city,
            state: addressData.state,
            zip_code: addressData.zip_code,
            alternate_phone: addressData.alternate_phone,
            additional_details: addressData.additional_details,
          }
        : null,
      delivery_address_text: order.delivery_address_text,
      contact_name: order.contact_name,
      contact_number: order.contact_number,
      contact_alternate_number: order.contact_alternate_number,

      // Special requests and customizations
      notes: order.notes,
      is_knife: order.is_knife,
      is_candle: order.is_candle,
      is_text_on_card: order.is_text_on_card,
      text_on_card: order.text_on_card,

      // Delivery timing and logistics
      delivery_timing: order.delivery_timing,
      delivery_date: order.delivery_date,
      delivery_time_slot: order.delivery_time_slot,
      estimated_time_delivery: order.estimated_time_delivery,
      distance: addressData?.distance || null, // From address relationship
      duration: addressData?.duration || null, // From address relationship
      delivery_zone: order.delivery_zone,
      delivery_partner_id: order.delivery_partner_id,

      // Payment information
      payment_method: order.payment_method,
      payment_transaction_id: order.payment_transaction_id,

      // Coupon information
      coupon: order.coupons
        ? {
            id: order.coupons.id,
            code: order.coupons.code,
            type: order.coupons.type,
            value: order.coupons.value,
            min_order_amount: order.coupons.min_order_amount,
            max_discount_cap: order.coupons.max_discount_cap,
          }
        : null,
      is_coupon: order.is_coupon,
      coupon_code: order.coupon_code,

      // Order tracking timestamps
      preparation_time: order.preparation_time,
      cooking_started_at: order.cooking_started_at,
      ready_at: order.ready_at,
      picked_up_at: order.picked_up_at,
      delivered_at: order.delivered_at,

      // Customer feedback
      customer_rating: order.customer_rating,
      customer_feedback: order.customer_feedback,

      // Legacy fields for backward compatibility
      address_text: order.delivery_address_text,
      note: order.notes,
      created_at: order.created_at,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Error in admin order detail API:", error);
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
