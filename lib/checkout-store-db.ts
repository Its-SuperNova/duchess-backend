import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";
import type {
  CheckoutSession,
  CheckoutItem,
  ContactInfo,
} from "./checkout-store";

// Session expiry time (30 minutes)
const SESSION_EXPIRY_MINUTES = 30;

export class CheckoutStoreDB {
  static async createSession(
    data: Omit<
      CheckoutSession,
      | "checkoutId"
      | "createdAt"
      | "expiresAt"
      | "paymentStatus"
      | "paymentAttempts"
    >
  ): Promise<CheckoutSession> {
    const checkoutId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + SESSION_EXPIRY_MINUTES * 60 * 1000
    );

    const session: CheckoutSession = {
      ...data,
      checkoutId,
      paymentStatus: "pending",
      paymentAttempts: 0,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Store in database
    const { error } = await supabase.from("checkout_sessions").insert({
      checkout_id: checkoutId,
      user_id: data.userId,
      user_email: data.userEmail,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      delivery_fee: data.deliveryFee,
      total_amount: data.totalAmount,
      cgst_amount: data.cgstAmount,
      sgst_amount: data.sgstAmount,
      address_text: data.addressText,
      selected_address_id: data.selectedAddressId,
      coupon_code: data.couponCode,
      customization_options: data.customizationOptions,
      cake_text: data.cakeText,
      message_card_text: data.messageCardText,
      contact_info: data.contactInfo,
      notes: data.notes,
      delivery_timing: data.deliveryTiming,
      delivery_date: data.deliveryDate,
      delivery_time_slot: data.deliveryTimeSlot,
      estimated_delivery_time: data.estimatedDeliveryTime,
      distance: data.distance,
      duration: data.duration,
      delivery_zone: data.deliveryZone,
      payment_status: "pending",
      payment_attempts: 0,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }

    // Clean up expired sessions
    await this.cleanupExpiredSessions();

    return session;
  }

  static async getSession(checkoutId: string): Promise<CheckoutSession | null> {
    const { data, error } = await supabase
      .from("checkout_sessions")
      .select("*")
      .eq("checkout_id", checkoutId)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if session has expired
    if (new Date() > new Date(data.expires_at)) {
      await this.deleteSession(checkoutId);
      return null;
    }

    // Convert database row to CheckoutSession format
    return {
      checkoutId: data.checkout_id,
      userId: data.user_id,
      userEmail: data.user_email,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryFee: data.delivery_fee,
      totalAmount: data.total_amount,
      cgstAmount: data.cgst_amount,
      sgstAmount: data.sgst_amount,
      addressText: data.address_text,
      selectedAddressId: data.selected_address_id,
      couponCode: data.coupon_code,
      customizationOptions: data.customization_options,
      cakeText: data.cake_text,
      messageCardText: data.message_card_text,
      contactInfo: data.contact_info,
      notes: data.notes,
      deliveryTiming: data.delivery_timing,
      deliveryDate: data.delivery_date,
      deliveryTimeSlot: data.delivery_time_slot,
      estimatedDeliveryTime: data.estimated_delivery_time,
      distance: data.distance,
      duration: data.duration,
      deliveryZone: data.delivery_zone,
      paymentStatus: data.payment_status,
      paymentAttempts: data.payment_attempts,
      databaseOrderId: data.database_order_id,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    };
  }

  static async updateSession(
    checkoutId: string,
    updates: Partial<CheckoutSession>
  ): Promise<CheckoutSession | null> {
    const session = await this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updatedSession = { ...session, ...updates };

    // Update in database
    const updateData: any = {};

    // Financial fields
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.discount !== undefined) updateData.discount = updates.discount;
    if (updates.deliveryFee !== undefined)
      updateData.delivery_fee = updates.deliveryFee;
    if (updates.totalAmount !== undefined)
      updateData.total_amount = updates.totalAmount;
    if (updates.cgstAmount !== undefined)
      updateData.cgst_amount = updates.cgstAmount;
    if (updates.sgstAmount !== undefined)
      updateData.sgst_amount = updates.sgstAmount;

    // Other fields
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.addressText !== undefined)
      updateData.address_text = updates.addressText;
    if (updates.selectedAddressId !== undefined)
      updateData.selected_address_id = updates.selectedAddressId;
    if (updates.couponCode !== undefined)
      updateData.coupon_code = updates.couponCode;
    if (updates.customizationOptions !== undefined)
      updateData.customization_options = updates.customizationOptions;
    if (updates.cakeText !== undefined) updateData.cake_text = updates.cakeText;
    if (updates.messageCardText !== undefined)
      updateData.message_card_text = updates.messageCardText;
    if (updates.contactInfo !== undefined)
      updateData.contact_info = updates.contactInfo;
    if (updates.deliveryTiming !== undefined)
      updateData.delivery_timing = updates.deliveryTiming;
    if (updates.deliveryDate !== undefined)
      updateData.delivery_date = updates.deliveryDate;
    if (updates.deliveryTimeSlot !== undefined)
      updateData.delivery_time_slot = updates.deliveryTimeSlot;
    if (updates.estimatedDeliveryTime !== undefined)
      updateData.estimated_delivery_time = updates.estimatedDeliveryTime;
    if (updates.distance !== undefined) updateData.distance = updates.distance;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.deliveryZone !== undefined)
      updateData.delivery_zone = updates.deliveryZone;
    if (updates.paymentStatus !== undefined)
      updateData.payment_status = updates.paymentStatus;
    if (updates.paymentAttempts !== undefined)
      updateData.payment_attempts = updates.paymentAttempts;
    if (updates.databaseOrderId !== undefined)
      updateData.database_order_id = updates.databaseOrderId;

    // Debug: Log what's being updated in database
    console.log("🗄️ Updating checkout session in database:", {
      checkoutId,
      updateData,
    });

    const { error } = await supabase
      .from("checkout_sessions")
      .update(updateData)
      .eq("checkout_id", checkoutId);

    if (error) {
      console.error("Error updating checkout session:", error);
      return null;
    }

    return updatedSession;
  }

  static async deleteSession(checkoutId: string): Promise<boolean> {
    const { error } = await supabase
      .from("checkout_sessions")
      .delete()
      .eq("checkout_id", checkoutId);

    return !error;
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const { error } = await supabase.rpc("cleanup_expired_checkout_sessions");

    if (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  }

  static async getSessionCount(): Promise<number> {
    const { count, error } = await supabase
      .from("checkout_sessions")
      .select("*", { count: "exact", head: true });

    return error ? 0 : count || 0;
  }

  // Payment specific methods
  static async updatePaymentStatus(
    checkoutId: string,
    status: CheckoutSession["paymentStatus"]
  ): Promise<CheckoutSession | null> {
    const session = await this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updates: Partial<CheckoutSession> = {
      paymentStatus: status,
      paymentAttempts: (session.paymentAttempts || 0) + 1,
    };

    return this.updateSession(checkoutId, updates);
  }

  static async updateDatabaseOrderId(
    checkoutId: string,
    databaseOrderId: string
  ): Promise<CheckoutSession | null> {
    const session = await this.getSession(checkoutId);
    if (!session) {
      return null;
    }

    return this.updateSession(checkoutId, { databaseOrderId });
  }
}
