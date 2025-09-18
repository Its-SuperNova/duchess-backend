import { supabase } from "@/lib/supabase";
import { getAreaFromPincode } from "@/lib/pincode-areas";
import { CheckoutStore } from "@/lib/checkout-store";

export interface CreateOrderData {
  checkoutId: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  orderStatus?: string;
  status?: string;
  userEmail?: string;
}

export async function createOrderFromCheckout(data: CreateOrderData) {
  const {
    checkoutId,
    userEmail,
    paymentMethod = "online",
    paymentStatus = "paid",
    paymentTransactionId,
    orderStatus = "confirmed",
    status = "confirmed",
  } = data;

  // Get checkout session
  const checkoutSession = await CheckoutStore.getSession(checkoutId);
  if (!checkoutSession) {
    throw new Error("Checkout session not found or expired");
  }

  // Verify payment status
  if (checkoutSession.paymentStatus !== "paid") {
    throw new Error("Payment not completed");
  }

  // Check if order already exists
  if (checkoutSession.databaseOrderId) {
    return {
      orderId: checkoutSession.databaseOrderId,
      message: "Order already exists",
    };
  }

  // Get user by email (from checkout session or provided)
  const email = userEmail || checkoutSession.userEmail;
  if (!email) {
    throw new Error("User email not found");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  // Get or create cart
  let { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (cartError && cartError.code === "PGRST116") {
    // Cart doesn't exist, create one
    const { data: newCart, error: createCartError } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (createCartError || !newCart) {
      throw new Error("Failed to create cart");
    }
    cart = newCart;
  }

  if (!cart) {
    throw new Error("Failed to get or create cart");
  }

  // Get delivery address
  let deliveryAddress = null;
  if (checkoutSession.selectedAddressId) {
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", checkoutSession.selectedAddressId)
      .single();

    if (!addressError && address) {
      deliveryAddress = address;
    }
  }

  // Create order - using exact same structure as working orders/create endpoint
  const orderData = {
    // User and order identification
    user_id: user.id,
    order_number: `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`,

    // Order status
    status: orderStatus || "confirmed",
    payment_status: paymentStatus,

    // Financial information
    item_total: checkoutSession.subtotal,
    delivery_charge: checkoutSession.deliveryFee || 0,
    discount_amount: checkoutSession.discount || 0,
    cgst: checkoutSession.cgstAmount || 0,
    sgst: checkoutSession.sgstAmount || 0,
    total_amount: checkoutSession.totalAmount,

    // Address and delivery
    delivery_address_id: deliveryAddress?.id || null,

    // Contact information
    contact_name: checkoutSession.contactInfo?.name || "",
    contact_number: checkoutSession.contactInfo?.phone || "",
    contact_alternate_number:
      checkoutSession.contactInfo?.alternatePhone || null,

    // Customer notes and special requests
    notes: checkoutSession.notes || null,
    is_knife: checkoutSession.customizationOptions?.addKnife ?? false,
    is_candle: checkoutSession.customizationOptions?.addCandles ?? false,
    is_text_on_card:
      checkoutSession.customizationOptions?.addMessageCard ?? false,
    text_on_card: checkoutSession.messageCardText || null,

    // Delivery timing and scheduling
    delivery_timing: checkoutSession.deliveryTiming || "same_day",
    delivery_date: checkoutSession.deliveryDate || null,
    delivery_time_slot: checkoutSession.deliveryTimeSlot || null,

    // Coupon information
    is_coupon: !!checkoutSession.couponCode,
    coupon_id: null,
    coupon_code: checkoutSession.couponCode || null,

    // Delivery logistics
    estimated_time_delivery: null, // Set to null to avoid timestamp format errors
    delivery_zone: checkoutSession.deliveryZone || null,

    // Payment information
    payment_method: paymentMethod || "online",
    payment_transaction_id: paymentTransactionId || null,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderData)
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    throw new Error("Failed to create order");
  }

  // Create order items - mapping to correct database column names
  const orderItems = checkoutSession.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id, // Keep as string as per schema
    product_name: item.product_name,
    product_image: item.product_image || null,
    product_description: item.product_description || null,
    category: item.category || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    variant: item.variant || null,
    customization_options: item.customization_options || {},
    cake_text: item.cake_text || null,
    cake_flavor: item.cake_flavor || null,
    cake_size: item.cake_size || null,
    cake_weight: item.cake_weight || null,
    item_has_knife: item.item_has_knife || false,
    item_has_candle: item.item_has_candle || false,
    item_has_message_card: item.item_has_message_card || false,
    item_message_card_text: item.item_message_card_text || null,
    item_status: "pending",
    preparation_notes: null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items creation error:", itemsError);
    // Try to clean up the order if items creation failed
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("Failed to create order items");
  }

  // Update checkout session with database order ID
  await CheckoutStore.updateDatabaseOrderId(checkoutId, order.id);

  // Mark checkout session as completed
  await CheckoutStore.updateSession(checkoutId, {
    paymentStatus: "paid",
    databaseOrderId: order.id,
  });

  return {
    orderId: order.id,
    message: "Order created successfully",
  };
}
