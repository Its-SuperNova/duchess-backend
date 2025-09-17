// Payment monitoring and analytics
export interface PaymentEvent {
  event: string;
  checkoutId: string;
  orderId?: string;
  amount?: number;
  timestamp: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class PaymentMonitor {
  private static instance: PaymentMonitor;
  private events: PaymentEvent[] = [];

  static getInstance(): PaymentMonitor {
    if (!PaymentMonitor.instance) {
      PaymentMonitor.instance = new PaymentMonitor();
    }
    return PaymentMonitor.instance;
  }

  logEvent(event: Omit<PaymentEvent, "timestamp">) {
    const fullEvent: PaymentEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };

    this.events.push(fullEvent);

    // Log to console with emoji for easy identification
    const emoji = this.getEventEmoji(event.event);
    console.log(`${emoji} [Payment Monitor] ${event.event}`, {
      checkoutId: event.checkoutId,
      orderId: event.orderId,
      amount: event.amount,
      metadata: event.metadata,
    });

    // Send to analytics service (if configured)
    this.sendToAnalytics(fullEvent);
  }

  private getEventEmoji(event: string): string {
    const emojiMap: Record<string, string> = {
      payment_initiated: "🚀",
      razorpay_opened: "💳",
      payment_polling_started: "🔍",
      payment_detected: "✅",
      payment_verified: "🎉",
      payment_failed: "❌",
      modal_dismissed: "🔄",
      external_app_opened: "📱",
      user_returned: "↩️",
      polling_timeout: "⏰",
      webhook_received: "🔔",
      confirming_screen_shown: "⏳",
      pending_screen_shown: "🔄",
    };
    return emojiMap[event] || "📊";
  }

  private async sendToAnalytics(event: PaymentEvent) {
    try {
      // Send to your analytics service
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "production"
      ) {
        // Example: Send to your analytics endpoint
        // await fetch('/api/analytics/payment-events', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event)
        // });
      }
    } catch (error) {
      console.error("Failed to send payment event to analytics:", error);
    }
  }

  getEvents(checkoutId?: string): PaymentEvent[] {
    if (checkoutId) {
      return this.events.filter((event) => event.checkoutId === checkoutId);
    }
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  // Get payment flow summary for debugging
  getPaymentFlowSummary(checkoutId: string): {
    totalEvents: number;
    flow: PaymentEvent[];
    duration?: number;
    success: boolean;
  } {
    const flow = this.getEvents(checkoutId);
    const startEvent = flow.find((e) => e.event === "payment_initiated");
    const endEvent = flow.find(
      (e) => e.event === "payment_verified" || e.event === "payment_failed"
    );

    let duration: number | undefined;
    if (startEvent && endEvent) {
      duration =
        new Date(endEvent.timestamp).getTime() -
        new Date(startEvent.timestamp).getTime();
    }

    return {
      totalEvents: flow.length,
      flow,
      duration,
      success: flow.some((e) => e.event === "payment_verified"),
    };
  }
}

// Export singleton instance
export const paymentMonitor = PaymentMonitor.getInstance();
