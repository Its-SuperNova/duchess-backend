import { supabase } from "./supabase";

export interface PaymentData {
  id: string;
  order_id: string;
  external_order_id?: string;
  external_payment_id?: string;
  external_refund_id?: string;
  amount: number;
  currency: string;
  payment_status: "pending" | "captured" | "failed" | "refunded";
  payment_method: string;
  receipt?: string;
  signature_verified: boolean;
  webhook_received: boolean;
  notes?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Get payment by external order ID
 */
export async function getPaymentByExternalOrderId(
  externalOrderId: string
): Promise<PaymentData | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("external_order_id", externalOrderId)
    .single();

  if (error) {
    console.error("Error fetching payment:", error);
    return null;
  }

  return data;
}

/**
 * Get payment by order ID
 */
export async function getPaymentByOrderId(
  orderId: string
): Promise<PaymentData | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching payment:", error);
    return null;
  }

  return data;
}

/**
 * Get all payments for an order
 */
export async function getPaymentsByOrderId(
  orderId: string
): Promise<PaymentData[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new payment record
 */
export async function createPayment(
  paymentData: Omit<PaymentData, "id" | "created_at" | "updated_at">
): Promise<PaymentData | null> {
  const { data, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating payment:", error);
    return null;
  }

  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentData["payment_status"],
  additionalData?: Partial<PaymentData>
): Promise<boolean> {
  const updateData = {
    payment_status: status,
    updated_at: new Date().toISOString(),
    ...additionalData,
  };

  const { error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", paymentId);

  if (error) {
    console.error("Error updating payment status:", error);
    return false;
  }

  return true;
}

/**
 * Mark payment as signature verified
 */
export async function markPaymentSignatureVerified(
  paymentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("payments")
    .update({
      signature_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Error marking payment signature verified:", error);
    return false;
  }

  return true;
}

/**
 * Mark payment as webhook received
 */
export async function markPaymentWebhookReceived(
  paymentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("payments")
    .update({
      webhook_received: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Error marking payment webhook received:", error);
    return false;
  }

  return true;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats() {
  const { data, error } = await supabase
    .from("payments")
    .select("payment_status, amount");

  if (error) {
    console.error("Error fetching payment stats:", error);
    return null;
  }

  const stats = {
    total: data.length,
    totalAmount: data.reduce((sum, payment) => sum + payment.amount, 0),
    byStatus: {} as Record<string, { count: number; amount: number }>,
  };

  data.forEach((payment) => {
    if (!stats.byStatus[payment.payment_status]) {
      stats.byStatus[payment.payment_status] = { count: 0, amount: 0 };
    }
    stats.byStatus[payment.payment_status].count++;
    stats.byStatus[payment.payment_status].amount += payment.amount;
  });

  return stats;
}
