"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentMonitor } from "@/lib/payment-monitor";

interface CustomPaymentFlowProps {
  amount: number;
  currency?: string;
  checkoutId: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  onClose?: () => void;
}

export default function CustomPaymentFlow({
  amount,
  currency = "INR",
  checkoutId,
  userDetails,
  onSuccess,
  onFailure,
  onClose,
}: CustomPaymentFlowProps) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<
    | "idle"
    | "creating_order"
    | "redirecting"
    | "confirming"
    | "success"
    | "failed"
  >("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const log = (message: string, data?: any) => {
    console.log(`[CustomPayment] ${message}`, data || "");
  };

  // Create Razorpay order directly via API
  const createPaymentOrder = async () => {
    try {
      setPaymentStatus("creating_order");
      log("Creating payment order", { amount, checkoutId });

      const response = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          checkoutId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await response.json();
      setOrderId(orderData.id);
      log("Payment order created", orderData);

      // Log payment initiation
      paymentMonitor.logEvent({
        event: "payment_initiated",
        checkoutId,
        orderId: orderData.id,
        amount,
        metadata: { currency, method: "custom_flow" },
      });

      return orderData;
    } catch (error) {
      log("Failed to create payment order", error);
      setPaymentStatus("failed");
      onFailure(error);
      return null;
    }
  };

  // Open Razorpay in new window (bypasses SDK issues)
  const openRazorpayWindow = (orderData: any) => {
    try {
      setPaymentStatus("redirecting");
      log("Opening Razorpay window", orderData);

      // Create Razorpay checkout URL
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?key=${
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      }&amount=${orderData.amount}&currency=${
        orderData.currency
      }&name=Duchess Pastries&description=Order Payment&order_id=${
        orderData.id
      }&prefill[name]=${encodeURIComponent(
        userDetails.name
      )}&prefill[email]=${encodeURIComponent(
        userDetails.email
      )}&prefill[contact]=${encodeURIComponent(
        userDetails.phone
      )}&theme[color]=%232664eb`;

      // Open in new window
      const razorpayWindow = window.open(
        checkoutUrl,
        "razorpay_checkout",
        "width=400,height=600,scrollbars=yes,resizable=yes"
      );

      if (!razorpayWindow) {
        throw new Error("Failed to open payment window");
      }

      // Start polling immediately
      startPaymentPolling(orderData.id);

      // Monitor window close
      const checkClosed = setInterval(() => {
        if (razorpayWindow.closed) {
          clearInterval(checkClosed);
          log("Razorpay window closed");

          // Check payment status when window closes
          setTimeout(() => {
            checkPaymentStatus(orderData.id);
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      log("Failed to open Razorpay window", error);
      setPaymentStatus("failed");
      onFailure(error);
    }
  };

  // Start aggressive payment polling
  const startPaymentPolling = (orderId: string) => {
    log("Starting payment polling", { orderId });
    setPaymentStatus("confirming");

    paymentMonitor.logEvent({
      event: "payment_polling_started",
      checkoutId,
      orderId,
      amount,
      metadata: { pollingType: "aggressive", method: "custom_flow" },
    });

    let pollCount = 0;
    const maxPolls = 120; // 2 minutes

    const pollPayment = async () => {
      try {
        pollCount++;
        log(`Polling attempt ${pollCount}/${maxPolls}`, { orderId });

        const response = await fetch(
          `/api/payment/status?orderId=${orderId}&checkoutId=${checkoutId}`
        );
        const data = await response.json();

        if (response.ok && data.status === "paid") {
          log("Payment detected", data);

          paymentMonitor.logEvent({
            event: "payment_detected",
            checkoutId,
            orderId,
            amount,
            metadata: { source: data.source, pollCount, method: "custom_flow" },
          });

          setPaymentStatus("success");
          setPollingInterval(null);
          onSuccess(data);
          if (onClose) onClose();
          return;
        }

        if (pollCount >= maxPolls) {
          log("Polling timeout");
          setPaymentStatus("failed");
          setPollingInterval(null);
          onFailure(new Error("Payment not completed. Please try again."));
          if (onClose) onClose();
        }
      } catch (error) {
        log("Polling error", error);
      }
    };

    // Ultra-aggressive polling: 200ms for first 50 attempts, then 500ms
    const startPolling = () => {
      pollPayment();
      if (pollCount < 50) {
        setTimeout(startPolling, 200);
      } else if (pollCount < 100) {
        setTimeout(startPolling, 500);
      } else {
        const interval = setInterval(pollPayment, 2000);
        setPollingInterval(interval);
      }
    };

    startPolling();
  };

  // Check payment status (fallback)
  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/payment/status?orderId=${orderId}&checkoutId=${checkoutId}`
      );
      const data = await response.json();

      if (data.status === "paid") {
        log("Payment confirmed on window close", data);
        setPaymentStatus("success");
        onSuccess(data);
        if (onClose) onClose();
      } else {
        log("Payment not confirmed on window close");
        setPaymentStatus("confirming");
      }
    } catch (error) {
      log("Failed to check payment status", error);
    }
  };

  // Initialize payment flow
  useEffect(() => {
    const initPayment = async () => {
      const orderData = await createPaymentOrder();
      if (orderData) {
        openRazorpayWindow(orderData);
      }
    };

    initPayment();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Render payment status UI
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[22px] p-8 max-w-sm mx-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          {paymentStatus === "creating_order" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <h3 className="text-xl font-semibold text-gray-900">
                Creating Payment Order
              </h3>
              <p className="text-sm text-gray-600">Please wait...</p>
            </>
          )}

          {paymentStatus === "redirecting" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
              <h3 className="text-xl font-semibold text-gray-900">
                Opening Payment Window
              </h3>
              <p className="text-sm text-gray-600">
                Redirecting to Razorpay...
              </p>
            </>
          )}

          {paymentStatus === "confirming" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
              <h3 className="text-xl font-semibold text-gray-900">
                Confirming Payment
              </h3>
              <p className="text-sm text-gray-600">
                Please complete payment in the new window
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>💡 Complete payment in the Razorpay window</p>
                <p>• We'll detect it automatically</p>
                <p>• This may take up to 2 minutes</p>
              </div>
            </>
          )}

          {paymentStatus === "success" && (
            <>
              <div className="rounded-full h-16 w-16 bg-green-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Payment Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Redirecting to confirmation page...
              </p>
            </>
          )}

          {paymentStatus === "failed" && (
            <>
              <div className="rounded-full h-16 w-16 bg-red-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Payment Failed
              </h3>
              <p className="text-sm text-gray-600">Please try again</p>
              <button
                onClick={() => {
                  setPaymentStatus("idle");
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
