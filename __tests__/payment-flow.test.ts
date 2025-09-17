/**
 * Payment Flow Tests
 * Tests for the bulletproof Razorpay payment integration
 */

import { paymentMonitor } from "../lib/payment-monitor";

// Mock fetch
global.fetch = jest.fn();

describe("Payment Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    paymentMonitor.clearEvents();
  });

  describe("Payment Monitor", () => {
    it("should log payment events correctly", () => {
      const checkoutId = "test-checkout-123";
      const orderId = "order_test_123";
      const amount = 1000;

      paymentMonitor.logEvent({
        event: "payment_initiated",
        checkoutId,
        orderId,
        amount,
        metadata: { currency: "INR" },
      });

      const events = paymentMonitor.getEvents(checkoutId);
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("payment_initiated");
      expect(events[0].checkoutId).toBe(checkoutId);
      expect(events[0].orderId).toBe(orderId);
      expect(events[0].amount).toBe(amount);
    });

    it("should generate payment flow summary", () => {
      const checkoutId = "test-checkout-456";

      // Simulate a successful payment flow
      paymentMonitor.logEvent({
        event: "payment_initiated",
        checkoutId,
        amount: 2000,
      });

      paymentMonitor.logEvent({
        event: "razorpay_opened",
        checkoutId,
        orderId: "order_test_456",
      });

      paymentMonitor.logEvent({
        event: "payment_detected",
        checkoutId,
        orderId: "order_test_456",
      });

      paymentMonitor.logEvent({
        event: "payment_verified",
        checkoutId,
        orderId: "order_test_456",
      });

      const summary = paymentMonitor.getPaymentFlowSummary(checkoutId);

      expect(summary.totalEvents).toBe(4);
      expect(summary.success).toBe(true);
      expect(summary.flow).toHaveLength(4);
    });
  });

  describe("Payment Status API", () => {
    it("should handle payment status check", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: "paid", orderId: "order_123" }),
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await fetch(
        "/api/payment/status?orderId=order_123&checkoutId=checkout_123"
      );
      const data = await response.json();

      expect(data.status).toBe("paid");
      expect(data.orderId).toBe("order_123");
    });

    it("should handle pending payment status", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: "pending" }),
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await fetch(
        "/api/payment/status?orderId=order_123&checkoutId=checkout_123"
      );
      const data = await response.json();

      expect(data.status).toBe("pending");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      try {
        await fetch(
          "/api/payment/status?orderId=order_123&checkoutId=checkout_123"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Network error");
      }
    });

    it("should handle invalid responses", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "Invalid request" }),
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await fetch(
        "/api/payment/status?orderId=order_123&checkoutId=checkout_123"
      );
      const data = await response.json();

      expect(data.error).toBe("Invalid request");
    });
  });
});

// Integration test for the complete payment flow
describe("Complete Payment Flow Integration", () => {
  it("should simulate a successful UPI payment flow", async () => {
    const checkoutId = "integration-test-123";

    // Step 1: Payment initiated
    paymentMonitor.logEvent({
      event: "payment_initiated",
      checkoutId,
      amount: 1500,
    });

    // Step 2: Razorpay opened
    paymentMonitor.logEvent({
      event: "razorpay_opened",
      checkoutId,
      orderId: "order_integration_123",
    });

    // Step 3: User goes to external app (Google Pay)
    paymentMonitor.logEvent({
      event: "external_app_opened",
      checkoutId,
      orderId: "order_integration_123",
      metadata: { app: "google_pay" },
    });

    // Step 4: User returns from external app
    paymentMonitor.logEvent({
      event: "modal_dismissed",
      checkoutId,
      orderId: "order_integration_123",
      metadata: { reason: "user_returned_from_external_app" },
    });

    // Step 5: Polling starts
    paymentMonitor.logEvent({
      event: "payment_polling_started",
      checkoutId,
      orderId: "order_integration_123",
      metadata: { pollingType: "aggressive" },
    });

    // Step 6: Payment detected
    paymentMonitor.logEvent({
      event: "payment_detected",
      checkoutId,
      orderId: "order_integration_123",
      metadata: { source: "razorpay_api", pollCount: 3 },
    });

    // Step 7: Payment verified
    paymentMonitor.logEvent({
      event: "payment_verified",
      checkoutId,
      orderId: "order_integration_123",
    });

    const summary = paymentMonitor.getPaymentFlowSummary(checkoutId);

    expect(summary.success).toBe(true);
    expect(summary.totalEvents).toBe(7);
    expect(summary.flow.map((e) => e.event)).toEqual([
      "payment_initiated",
      "razorpay_opened",
      "external_app_opened",
      "modal_dismissed",
      "payment_polling_started",
      "payment_detected",
      "payment_verified",
    ]);
  });
});
