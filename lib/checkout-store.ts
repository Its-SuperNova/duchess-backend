import { v4 as uuidv4 } from "uuid";

export interface CheckoutItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_description?: string;
  category?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant?: string;
  customization_options?: Record<string, any>;
  cake_text?: string;
  cake_flavor?: string;
  cake_size?: string;
  cake_weight?: string;
  item_has_knife?: boolean;
  item_has_candle?: boolean;
  item_has_message_card?: boolean;
  item_message_card_text?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  alternatePhone?: string;
}

export interface CheckoutSession {
  checkoutId: string;
  userId?: string;
  userEmail?: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  addressText?: string;
  selectedAddressId?: string;
  couponCode?: string;
  customizationOptions?: Record<string, any>;
  cakeText?: string;
  messageCardText?: string;
  contactInfo?: ContactInfo;
  notes?: string;
  deliveryTiming?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  estimatedDeliveryTime?: string;
  distance?: number;
  duration?: number;
  deliveryZone?: string;
  // Payment related fields
  paymentStatus?: "pending" | "processing" | "paid" | "failed" | "cancelled";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentAttempts?: number;
  // Database order ID
  databaseOrderId?: string;
  createdAt: string;
  expiresAt: string;
}

// In-memory store for checkout sessions
// Using a global variable to persist across hot reloads in development
declare global {
  var __checkoutSessions: Map<string, CheckoutSession> | undefined;
}

const checkoutSessions =
  globalThis.__checkoutSessions || new Map<string, CheckoutSession>();
if (!globalThis.__checkoutSessions) {
  globalThis.__checkoutSessions = checkoutSessions;
}

// Session expiry time (30 minutes)
const SESSION_EXPIRY_MINUTES = 30;

export class CheckoutStore {
  static createSession(
    data: Omit<
      CheckoutSession,
      | "checkoutId"
      | "createdAt"
      | "expiresAt"
      | "paymentStatus"
      | "paymentAttempts"
    >
  ): CheckoutSession {
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

    checkoutSessions.set(checkoutId, session);

    // Clean up expired sessions
    this.cleanupExpiredSessions();

    return session;
  }

  static getSession(checkoutId: string): CheckoutSession | null {
    const session = checkoutSessions.get(checkoutId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      checkoutSessions.delete(checkoutId);
      return null;
    }

    return session;
  }

  static updateSession(
    checkoutId: string,
    updates: Partial<CheckoutSession>
  ): CheckoutSession | null {
    const session = this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updatedSession = { ...session, ...updates };
    checkoutSessions.set(checkoutId, updatedSession);

    return updatedSession;
  }

  static deleteSession(checkoutId: string): boolean {
    return checkoutSessions.delete(checkoutId);
  }

  static cleanupExpiredSessions(): void {
    const now = new Date();

    for (const [checkoutId, session] of checkoutSessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        checkoutSessions.delete(checkoutId);
      }
    }
  }

  static getSessionCount(): number {
    return checkoutSessions.size;
  }

  static getAllSessions(): CheckoutSession[] {
    return Array.from(checkoutSessions.values());
  }

  // Payment specific methods
  static updatePaymentStatus(
    checkoutId: string,
    status: CheckoutSession["paymentStatus"],
    razorpayOrderId?: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string
  ): CheckoutSession | null {
    const session = this.getSession(checkoutId);

    if (!session) {
      return null;
    }

    const updates: Partial<CheckoutSession> = {
      paymentStatus: status,
      paymentAttempts: (session.paymentAttempts || 0) + 1,
    };

    if (razorpayOrderId) {
      updates.razorpayOrderId = razorpayOrderId;
    }

    if (razorpayPaymentId) {
      updates.razorpayPaymentId = razorpayPaymentId;
    }

    if (razorpaySignature) {
      updates.razorpaySignature = razorpaySignature;
    }

    return this.updateSession(checkoutId, updates);
  }

  static getSessionByRazorpayOrderId(
    razorpayOrderId: string
  ): CheckoutSession | null {
    for (const session of checkoutSessions.values()) {
      if (session.razorpayOrderId === razorpayOrderId) {
        return session;
      }
    }
    return null;
  }

  static updateDatabaseOrderId(
    checkoutId: string,
    databaseOrderId: string
  ): CheckoutSession | null {
    const session = this.getSession(checkoutId);
    if (!session) {
      return null;
    }

    const updatedSession = { ...session, databaseOrderId };
    checkoutSessions.set(checkoutId, updatedSession);
    return updatedSession;
  }
}
