"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentMonitor } from "@/lib/payment-monitor";

interface RazorpayCheckoutV2Props {
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
  onOpen?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckoutV2({
  amount,
  currency = "INR",
  checkoutId,
  userDetails,
  onSuccess,
  onFailure,
  onClose,
  onOpen,
}: RazorpayCheckoutV2Props) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const razorpayInstanceRef = useRef<any>(null);
  const orderIdRef = useRef<string | null>(null);

  // Comprehensive logging for debugging
  const log = (message: string, data?: any) => {
    console.log(`[RazorpayV2] ${message}`, data || "");
  };

  // Cleanup function
  const cleanup = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (razorpayInstanceRef.current) {
      razorpayInstanceRef.current = null;
    }
  };

  // Aggressive payment polling
  const startAggressivePolling = (orderId: string) => {
    log("Starting aggressive payment polling", { orderId });

    // Log polling start
    paymentMonitor.logEvent({
      event: "payment_polling_started",
      checkoutId,
      orderId,
      amount,
      metadata: { pollingType: "aggressive" },
    });

    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    let pollCount = 0;
    const maxPolls = 60; // 2 minutes of polling

    const pollPayment = async () => {
      try {
        pollCount++;
        log(`Polling attempt ${pollCount}/${maxPolls}`, { orderId });

        const response = await fetch(
          `/api/payment/status?orderId=${orderId}&checkoutId=${checkoutId}`
        );
        const data = await response.json();

        if (response.ok && data.status === "paid") {
          log("Payment detected via polling", data);

          // Log payment detection
          paymentMonitor.logEvent({
            event: "payment_detected",
            checkoutId,
            orderId,
            amount,
            metadata: { source: data.source, pollCount },
          });

          cleanup();
          onSuccess(data);
          if (onClose) onClose();
          return;
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          log("Polling timeout - no payment detected");
          cleanup();
          onFailure(new Error("Payment not completed. Please try again."));
          if (onClose) onClose();
        }
      } catch (error) {
        log("Polling error", error);
      }
    };

    // Start with aggressive polling (every 500ms for first 30 seconds, then every 2 seconds)
    const startAggressive = () => {
      pollPayment();
      if (pollCount < 30) {
        // First 30 attempts: every 500ms
        pollingRef.current = setTimeout(startAggressive, 500);
      } else {
        // Remaining attempts: every 2 seconds
        pollingRef.current = setTimeout(startAggressive, 2000);
      }
    };

    startAggressive();
  };

  // Initialize Razorpay
  useEffect(() => {
    if (isInitialized) return;

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initializePayment = async () => {
      try {
        setIsInitialized(true);
        log("Initializing payment", { amount, currency, checkoutId });

        // Log payment initiation
        paymentMonitor.logEvent({
          event: "payment_initiated",
          checkoutId,
          amount,
          metadata: { currency, userAgent: navigator.userAgent },
        });

        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay script");
        }

        // Get or create Razorpay order
        let orderData;
        const checkoutResponse = await fetch(`/api/checkout/${checkoutId}`);

        if (checkoutResponse.ok) {
          const checkoutData = await checkoutResponse.json();
          const session = checkoutData.checkout;

          if (session.razorpayOrderId) {
            log("Using pre-created Razorpay order", session.razorpayOrderId);
            orderData = {
              id: session.razorpayOrderId,
              amount: Math.round(amount * 100),
              currency,
              receipt: `rcpt_${checkoutId.substring(0, 8)}_precreated`,
              status: "created",
            };
          } else {
            // Create new order
            const orderResponse = await fetch("/api/payment/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency,
                checkoutId,
              }),
            });

            if (!orderResponse.ok) {
              throw new Error("Failed to create payment order");
            }

            orderData = await orderResponse.json();
            log("Created new Razorpay order", orderData);
          }
        } else {
          throw new Error("Failed to get checkout session");
        }

        orderIdRef.current = orderData.id;

        // Configure Razorpay options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Duchess Pastries",
          description: "Order Payment",
          order_id: orderData.id,
          prefill: {
            name: userDetails.name,
            email: userDetails.email,
            contact: userDetails.phone,
          },
          theme: {
            color: "#2664eb",
          },
          handler: async function (response: any) {
            try {
              log("Razorpay handler called", response);
              setIsPaymentInProgress(true);
              cleanup(); // Stop polling since we have direct confirmation

              // Verify payment
              const verifyResponse = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  checkoutId,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                log("Payment verified successfully", verifyData);
                onSuccess({
                  orderId: verifyData.orderId,
                  paymentId: verifyData.paymentId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                });
              } else {
                log("Payment verification failed", verifyData);
                onFailure(
                  new Error(verifyData.error || "Payment verification failed")
                );
              }
            } catch (error) {
              log("Payment verification error", error);
              onFailure(error);
            }
          },
          modal: {
            ondismiss: function () {
              log("Razorpay modal dismissed - user returned from external app");

              // Log modal dismissal
              paymentMonitor.logEvent({
                event: "modal_dismissed",
                checkoutId,
                orderId: orderIdRef.current || undefined,
                amount,
                metadata: { reason: "user_returned_from_external_app" },
              });

              // Start aggressive polling immediately
              if (orderIdRef.current && !pollingRef.current) {
                startAggressivePolling(orderIdRef.current);
              }

              // Don't call onClose immediately - let polling handle it
            },
          },
          retry: {
            enabled: true,
            max_count: 3,
          },
        };

        // Create and open Razorpay instance
        razorpayInstanceRef.current = new window.Razorpay(options);

        // Start pre-emptive polling (in case user goes to external app immediately)
        if (orderIdRef.current) {
          // Start polling after 3 seconds (give Razorpay time to initialize)
          timeoutRef.current = setTimeout(() => {
            if (!pollingRef.current) {
              startAggressivePolling(orderIdRef.current!);
            }
          }, 3000);
        }

        razorpayInstanceRef.current.open();
        log("Razorpay modal opened");

        // Log Razorpay modal opened
        paymentMonitor.logEvent({
          event: "razorpay_opened",
          checkoutId,
          orderId: orderIdRef.current || undefined,
          amount,
          metadata: { orderData },
        });

        // Call onOpen callback
        if (onOpen) {
          onOpen();
        }
      } catch (error) {
        log("Razorpay initialization error", error);
        onFailure(error);
      }
    };

    initializePayment();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [
    isInitialized,
    amount,
    currency,
    checkoutId,
    userDetails,
    onSuccess,
    onFailure,
    onOpen,
    onClose,
  ]);

  // This component doesn't render anything - it's just for payment logic
  return null;
}
