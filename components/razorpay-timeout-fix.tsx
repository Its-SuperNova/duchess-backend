"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentMonitor } from "@/lib/payment-monitor";

interface RazorpayTimeoutFixProps {
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

export default function RazorpayTimeoutFix({
  amount,
  currency = "INR",
  checkoutId,
  userDetails,
  onSuccess,
  onFailure,
  onClose,
  onOpen,
}: RazorpayTimeoutFixProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPendingScreen, setShowPendingScreen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const razorpayInstanceRef = useRef<any>(null);
  const modalReloadPrevented = useRef(false);

  const log = (message: string, data?: any) => {
    console.log(`[RazorpayTimeoutFix] ${message}`, data || "");
  };

  // Show custom pending screen instead of Razorpay's error modal
  const showCustomPendingScreen = (orderId: string) => {
    log("Showing custom pending screen - intercepting Razorpay error");
    setShowPendingScreen(true);

    paymentMonitor.logEvent({
      event: "pending_screen_shown",
      checkoutId,
      orderId,
      amount,
      metadata: { reason: "razorpay_timeout_intercepted" },
    });

    // Start aggressive polling
    startPaymentPolling(orderId);
  };

  // Aggressive payment polling
  const startPaymentPolling = (orderId: string) => {
    log("Starting aggressive payment polling", { orderId });

    paymentMonitor.logEvent({
      event: "payment_polling_started",
      checkoutId,
      orderId,
      amount,
      metadata: { pollingType: "aggressive", reason: "timeout_fix" },
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
          log("Payment confirmed via polling", data);

          paymentMonitor.logEvent({
            event: "payment_detected",
            checkoutId,
            orderId,
            amount,
            metadata: { source: data.source, pollCount, method: "timeout_fix" },
          });

          setShowPendingScreen(false);
          cleanup();
          onSuccess(data);
          if (onClose) onClose();
          return;
        }

        if (pollCount >= maxPolls) {
          log("Polling timeout - showing fallback message");
          setShowPendingScreen(false);
          cleanup();

          // Show fallback message instead of error
          toast({
            title: "Payment Processing",
            description:
              "Your payment is being processed. We'll update you via SMS/Email shortly.",
            duration: 10000,
          });

          if (onClose) onClose();
        }
      } catch (error) {
        log("Polling error", error);
      }
    };

    // Ultra-aggressive polling: 500ms for first 60 attempts (30 seconds), then 1 second
    const startPolling = () => {
      pollPayment();
      if (pollCount < 60) {
        setTimeout(startPolling, 500); // 500ms for first 30 seconds
      } else {
        const interval = setInterval(pollPayment, 1000); // 1 second after that
        pollingRef.current = interval;
      }
    };

    startPolling();
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
  };

  // Initialize Razorpay with event interception
  useEffect(() => {
    if (isInitialized || modalReloadPrevented.current) return;

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
        log("Initializing Razorpay with timeout fix", {
          amount,
          currency,
          checkoutId,
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

        setOrderId(orderData.id);

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
              cleanup();

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
                setShowPendingScreen(false);
                onSuccess({
                  orderId: verifyData.orderId,
                  paymentId: verifyData.paymentId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                });
              } else {
                log("Payment verification failed", verifyData);
                setShowPendingScreen(false);
                onFailure(
                  new Error(verifyData.error || "Payment verification failed")
                );
              }
            } catch (error) {
              log("Payment verification error", error);
              setShowPendingScreen(false);
              onFailure(error);
            }
          },
          modal: {
            ondismiss: function () {
              log("Razorpay modal dismissed - user returned from external app");

              // Prevent modal from reloading by not calling onClose immediately
              // Instead, show our custom pending screen and start polling
              if (orderData.id && !pollingRef.current) {
                showCustomPendingScreen(orderData.id);
              }
            },
          },
        };

        // Create Razorpay instance
        razorpayInstanceRef.current = new window.Razorpay(options);

        // 🔥 THE KEY FIX: Intercept Razorpay's error events
        razorpayInstanceRef.current.on("payment.failed", (response: any) => {
          log("🔥 INTERCEPTED: Razorpay payment.failed event", response);

          // Show our custom pending screen instead of Razorpay's error modal
          showCustomPendingScreen(orderData.id);
        });

        razorpayInstanceRef.current.on("checkout.error", (error: any) => {
          log("🔥 INTERCEPTED: Razorpay checkout.error event", error);

          // Show our custom pending screen instead of Razorpay's error modal
          showCustomPendingScreen(orderData.id);
        });

        // Open Razorpay
        razorpayInstanceRef.current.open();
        setModalOpened(true);
        modalReloadPrevented.current = true; // Prevent modal reload
        log("Razorpay modal opened with timeout fix");

        // Log Razorpay opened
        paymentMonitor.logEvent({
          event: "razorpay_opened",
          checkoutId,
          orderId: orderData.id,
          amount,
          metadata: { method: "timeout_fix" },
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

  // Listen for page visibility changes (when user returns from external app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        modalOpened &&
        orderId &&
        !pollingRef.current
      ) {
        log("User returned to browser - starting payment polling");
        showCustomPendingScreen(orderId);
      }
    };

    const handleWindowFocus = () => {
      if (modalOpened && orderId && !pollingRef.current) {
        log("Window focused - starting payment polling");
        showCustomPendingScreen(orderId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [modalOpened, orderId]);

  // Custom pending screen to replace Razorpay's error modal
  if (showPendingScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[22px] p-8 max-w-sm mx-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ✅ Payment Initiated
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Confirming with your bank... Please wait 30-60 seconds
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>💡 Your UPI payment is being processed</p>
                <p>• This may take up to 2 minutes</p>
                <p>• Please don't close this window</p>
                <p>• We'll redirect you automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This component doesn't render anything - it's just for payment logic
  return null;
}
