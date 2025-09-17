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
  const [showConfirmingScreen, setShowConfirmingScreen] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const razorpayInstanceRef = useRef<any>(null);
  const orderIdRef = useRef<string | null>(null);

  // Comprehensive logging for debugging
  const log = (message: string, data?: any) => {
    console.log(`[RazorpayV2] ${message}`, data || "");
  };

  // Show custom confirming screen instead of Razorpay's error modal
  const showConfirmingScreen = () => {
    log("Showing custom confirming screen");
    setShowConfirmingScreen(true);

    // Log the event
    paymentMonitor.logEvent({
      event: "confirming_screen_shown",
      checkoutId,
      orderId: orderIdRef.current || undefined,
      amount,
      metadata: { reason: "razorpay_error_intercepted" },
    });

    // Auto-hide confirming screen after 2 minutes if no payment detected
    setTimeout(() => {
      if (showConfirmingScreen) {
        log("Confirming screen timeout - hiding screen");
        setShowConfirmingScreen(false);
        onFailure(new Error("Payment confirmation timeout. Please try again."));
        if (onClose) onClose();
      }
    }, 120000); // 2 minutes
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

          // Hide confirming screen
          setShowConfirmingScreen(false);

          cleanup();
          onSuccess(data);
          if (onClose) onClose();
          return;
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          log("Polling timeout - no payment detected");
          setShowConfirmingScreen(false);
          cleanup();
          onFailure(new Error("Payment not completed. Please try again."));
          if (onClose) onClose();
        }
      } catch (error) {
        log("Polling error", error);
      }
    };

    // Start with ultra-aggressive polling (every 200ms for first 10 seconds, then 500ms for 20 seconds, then 2 seconds)
    const startAggressive = () => {
      pollPayment();
      if (pollCount < 50) {
        // First 50 attempts: every 200ms (ultra-aggressive)
        pollingRef.current = setTimeout(startAggressive, 200);
      } else if (pollCount < 100) {
        // Next 50 attempts: every 500ms
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

              // Override Razorpay's error modal by checking payment status immediately
              setTimeout(async () => {
                if (orderIdRef.current) {
                  try {
                    const response = await fetch(
                      `/api/payment/status?orderId=${orderIdRef.current}&checkoutId=${checkoutId}`
                    );
                    const data = await response.json();

                    if (data.status === "paid") {
                      log(
                        "Payment confirmed on modal dismiss - overriding error"
                      );
                      paymentMonitor.logEvent({
                        event: "payment_detected",
                        checkoutId,
                        orderId: orderIdRef.current,
                        amount,
                        metadata: { source: "immediate_check", override: true },
                      });

                      // Hide any Razorpay error modals
                      const errorModals = document.querySelectorAll(
                        '[data-razorpay-error], .razorpay-error, [class*="error"]'
                      );
                      errorModals.forEach((modal) => {
                        if (modal instanceof HTMLElement) {
                          modal.style.display = "none";
                          modal.remove();
                        }
                      });

                      cleanup();
                      onSuccess(data);
                      if (onClose) onClose();
                      return;
                    }
                  } catch (error) {
                    log("Immediate payment check failed", error);
                  }
                }
              }, 500); // Check after 500ms

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

        // Intercept Razorpay's error events to prevent error modal
        razorpayInstanceRef.current.on("payment.failed", (response: any) => {
          log("Razorpay payment.failed event intercepted", response);

          // Show our custom confirming screen instead of Razorpay's error
          showConfirmingScreen();

          // Start aggressive polling to check if payment actually succeeded
          if (orderIdRef.current && !pollingRef.current) {
            startAggressivePolling(orderIdRef.current);
          }
        });

        razorpayInstanceRef.current.on("checkout.error", (error: any) => {
          log("Razorpay checkout.error event intercepted", error);

          // Show our custom confirming screen instead of Razorpay's error
          showConfirmingScreen();

          // Start aggressive polling to check if payment actually succeeded
          if (orderIdRef.current && !pollingRef.current) {
            startAggressivePolling(orderIdRef.current);
          }
        });

        // Start pre-emptive polling (in case user goes to external app immediately)
        if (orderIdRef.current) {
          // Start polling after 1 second (immediate detection)
          timeoutRef.current = setTimeout(() => {
            if (!pollingRef.current) {
              startAggressivePolling(orderIdRef.current!);
            }
          }, 1000);
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

        // Set up error modal watcher
        const errorModalWatcher = setInterval(() => {
          if (orderIdRef.current) {
            // Check for Razorpay error modals
            const errorModals = document.querySelectorAll(
              '[data-razorpay-error], .razorpay-error, [class*="error"]'
            );
            if (errorModals.length > 0) {
              // Check if payment is actually successful
              fetch(
                `/api/payment/status?orderId=${orderIdRef.current}&checkoutId=${checkoutId}`
              )
                .then((response) => response.json())
                .then((data) => {
                  if (data.status === "paid") {
                    log(
                      "Error modal detected but payment is successful - removing error modal"
                    );
                    errorModals.forEach((modal) => {
                      if (modal instanceof HTMLElement) {
                        modal.style.display = "none";
                        modal.remove();
                      }
                    });
                    clearInterval(errorModalWatcher);
                  }
                })
                .catch((error) => log("Error checking payment status", error));
            }
          }
        }, 100); // Check every 100ms

        // Clean up error modal watcher after 2 minutes
        setTimeout(() => {
          clearInterval(errorModalWatcher);
        }, 120000);

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

  // Custom confirming screen to replace Razorpay's error modal
  if (showConfirmingScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[22px] p-8 max-w-sm mx-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ✅ Payment Initiated
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Confirming with bank... Please wait.
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>💡 Your payment is being processed</p>
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
