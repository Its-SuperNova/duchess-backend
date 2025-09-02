"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutRazorpayProps {
  amount: number;
  currency?: string;
  notes?: Record<string, any>;
  orderData?: any; // Complete order data from checkout
  onSuccess?: (payload: any) => void;
  onFailure?: (err: any) => void;
  onClose?: () => void;
  className?: string;
  disabled?: boolean;
  autoTrigger?: boolean;
  onReadyToOpen?: () => void; // New prop for parent to signal readiness
}

declare global {
  interface Window {
    Razorpay: any;
    __razorpayScriptLoaded?: boolean;
  }
}

// Global script loading state
let scriptLoadingPromise: Promise<boolean> | null = null;

// Preload Razorpay script immediately when module loads
function preloadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (window.__razorpayScriptLoaded) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Razorpay SDK preloaded successfully");
      window.__razorpayScriptLoaded = true;
      resolve(true);
    };

    script.onerror = (error) => {
      console.error("Failed to preload Razorpay SDK:", error);
      scriptLoadingPromise = null;
      resolve(false);
    };

    // Set a shorter timeout for preloading
    const timeout = setTimeout(() => {
      console.error("Razorpay SDK preload timeout");
      scriptLoadingPromise = null;
      resolve(false);
    }, 5000); // 5 second timeout for preloading

    script.onload = () => {
      clearTimeout(timeout);
      console.log("Razorpay SDK preloaded successfully");
      window.__razorpayScriptLoaded = true;
      resolve(true);
    };

    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error("Failed to preload Razorpay SDK:", error);
      scriptLoadingPromise = null;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

// Start preloading immediately
if (typeof window !== "undefined") {
  preloadRazorpayScript();
}

export default function CheckoutRazorpay({
  amount,
  currency = "INR",
  notes,
  orderData,
  onSuccess,
  onFailure,
  onClose,
  className = "",
  disabled = false,
  autoTrigger = false,
  onReadyToOpen,
}: CheckoutRazorpayProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const hasTriggered = useRef(false);
  const orderCreationPromise = useRef<Promise<any> | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if script is already loaded on mount
  useEffect(() => {
    if (window.Razorpay || window.__razorpayScriptLoaded) {
      setScriptLoaded(true);
    }
  }, []);

  // Preload script when component mounts
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await preloadRazorpayScript();
      setScriptLoaded(loaded);
    };
    loadScript();
  }, []);

  // Pre-create order when component mounts (for autoTrigger)
  useEffect(() => {
    if (autoTrigger && !hasTriggered.current && scriptLoaded && orderData) {
      // Pre-create order in background
      orderCreationPromise.current = createOrderInBackground();
    }
  }, [autoTrigger, scriptLoaded, orderData]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Create order in background without blocking UI
  const createOrderInBackground = async () => {
    try {
      console.log("Pre-creating order in background...");

      const createOrderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency,
          notes: notes,
          ...orderData,
        }),
      });

      const createOrderData = await createOrderResponse.json();

      if (!createOrderResponse.ok) {
        throw new Error(createOrderData?.error || "Failed to create order");
      }

      console.log("Order pre-created successfully:", createOrderData);
      return createOrderData;
    } catch (error) {
      console.error("Background order creation failed:", error);
      return null;
    }
  };

  // Poll payment status for mobile UPI flows
  const pollPaymentStatus = async (orderId: string, rzpInstance: any) => {
    console.log("Starting payment status polling for order:", orderId);

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 20; // Poll for 20 seconds (20 * 1 second intervals)

    const poll = async () => {
      attempts++;
      console.log(`Payment status poll attempt ${attempts}/${maxAttempts}`);

      try {
        const response = await fetch("/api/razorpay/check-payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_order_id: orderId }),
        });

        const data = await response.json();
        console.log("Payment status response:", data);

        if (data.status === "success") {
          console.log("Payment completed successfully via polling!");
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;

          // Close Razorpay modal
          rzpInstance.close();

          // Trigger success flow
          const successData = {
            localOrderId: data.orderId,
            orderId: data.orderId,
            success: true,
            message: "Payment completed successfully",
          };

          onSuccess?.(successData);
          return;
        } else if (data.status === "failed") {
          console.log("Payment failed via polling");
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;

          rzpInstance.close();
          onFailure?.({ error: "Payment failed" });
          return;
        }

        // If max attempts reached, stop polling
        if (attempts >= maxAttempts) {
          console.log("Max polling attempts reached, stopping");
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;

          // Don't close modal, let user handle it
          console.log(
            "Payment status unclear after polling, user should check manually"
          );
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
        attempts++;
      }
    };

    // Start polling every second
    pollingIntervalRef.current = setInterval(poll, 1000);

    // Initial poll
    poll();
  };

  const handlePayment = useCallback(async () => {
    console.log("handlePayment called with:", {
      disabled,
      loading,
      hasTriggered: hasTriggered.current,
      amount,
      orderData: !!orderData,
      scriptLoaded,
    });

    if (disabled || loading) {
      console.log("handlePayment early return due to:", { disabled, loading });
      return;
    }

    // Set hasTriggered to true to prevent multiple calls
    hasTriggered.current = true;
    setLoading(true);

    try {
      // Wait for script to load (should be fast if preloaded)
      if (!scriptLoaded) {
        console.log("Waiting for Razorpay script to load...");
        const loaded = await preloadRazorpayScript();
        setScriptLoaded(loaded);

        if (!loaded) {
          throw new Error("Failed to load Razorpay SDK");
        }
      }

      // Check environment variables
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Razorpay configuration is missing");
      }

      // Use pre-created order or create new one
      let createOrderData;
      if (orderCreationPromise.current) {
        console.log("Using pre-created order...");
        createOrderData = await orderCreationPromise.current;
        orderCreationPromise.current = null;
      } else {
        console.log("Creating order on demand...");
        const createOrderResponse = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            currency,
            notes: notes,
            ...orderData,
          }),
        });

        createOrderData = await createOrderResponse.json();

        if (!createOrderResponse.ok) {
          throw new Error(createOrderData?.error || "Failed to create order");
        }
      }

      if (!createOrderData?.order) {
        throw new Error("Invalid order response from server");
      }

      const { order, key } = createOrderData;

      if (!key) {
        throw new Error("Razorpay key not provided by server");
      }

      console.log("Order ready, opening Razorpay checkout...");

      // Notify parent component that we're ready to open the gateway
      // This will close the payment dialog and show the Razorpay gateway
      if (onReadyToOpen) {
        console.log("Notifying parent component to close payment dialog...");
        onReadyToOpen();
      }

      // Configure Razorpay checkout options with mobile UPI optimization
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "Duchess Pastry",
        description: "Delicious pastries and cakes",
        image: "/duchess-logo.png",
        order_id: order.id,

        // Mobile UPI optimization
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        // Prevent reload after external app navigation
        retry: {
          enabled: false,
        },

        // Handle external app navigation gracefully
        remember_customer: false,

        // Mobile-specific settings to prevent reload issues
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            toast.info("Payment cancelled");
            onClose?.();
            onFailure?.({ error: "Payment cancelled by user" });
          },
          escape: false, // Prevent accidental dismissal
          handleback: false, // Prevent back button from closing modal
        },

        // Disable auto-focus to prevent mobile keyboard issues
        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        // Mobile UPI specific settings
        notes: {
          ...order.notes,
          mobile_flow: "true",
          prevent_reload: "true",
        },

        handler: async function (response: RazorpayResponse) {
          try {
            console.log("=== RAZORPAY SUCCESS CALLBACK STARTED ===");
            console.log("Payment successful, verifying...", response);
            console.log("Response structure:", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Verify payment on server
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log("Verification response:", verifyData);

            if (verifyResponse.ok && verifyData.success) {
              toast.success(
                "Payment successful! Your order has been confirmed."
              );
              const successData = {
                localOrderId: verifyData.localOrderId,
                orderId: verifyData.localOrderId,
                success: verifyData.success,
                message: verifyData.message,
              };
              console.log("=== CALLING ONSUCCESS CALLBACK ===");
              console.log(
                "Success data being passed to onSuccess:",
                successData
              );
              console.log("onSuccess function exists:", !!onSuccess);
              console.log("onSuccess function type:", typeof onSuccess);

              // Call onSuccess callback
              if (onSuccess) {
                console.log("Calling onSuccess callback...");
                try {
                  onSuccess(successData);
                  console.log("onSuccess callback executed successfully");
                } catch (callbackError) {
                  console.error("Error in onSuccess callback:", callbackError);
                }
              } else {
                console.warn("onSuccess callback is not provided");
              }
            } else {
              console.error("Payment verification failed:", verifyData);
              toast.error(
                "Payment verification failed. Please contact support."
              );
              onFailure?.(verifyData);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
            onFailure?.(error);
          }
        },
      };

      // Initialize and open Razorpay checkout
      const rzp = new window.Razorpay(options);

      // Enhanced event handling for mobile UPI flows
      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed:", resp);
        toast.error(`Payment failed: ${resp.error.description}`);
        onClose?.();
        onFailure?.(resp);
      });

      // Handle external app navigation (UPI apps)
      rzp.on("payment.razorpay_wallet_selected", function (resp: any) {
        console.log("External UPI app selected:", resp);
        // Don't close the modal, let user complete payment in external app
      });

      // Handle when user returns from external app
      rzp.on("payment.razorpay_wallet_dismissed", function (resp: any) {
        console.log("User returned from external UPI app:", resp);

        // Start polling to check if payment was completed
        console.log("Starting payment status polling for mobile UPI flow...");
        pollPaymentStatus(order.id, rzp);
      });

      // Handle modal close events
      rzp.on("modal.close", function () {
        console.log("Razorpay modal closed");
        // Check if this was due to successful payment
        // If not, treat as cancellation
        onClose?.();
      });

      // Open checkout immediately
      console.log("Opening Razorpay checkout...");
      rzp.open();
      console.log("Razorpay checkout opened");
    } catch (error: any) {
      console.error("Checkout error:", error);

      let errorMessage = "Checkout failed. Please try again.";

      if (error.message.includes("Failed to load Razorpay SDK")) {
        errorMessage =
          "Unable to load payment system. Please check your internet connection and try again.";
      } else if (error.message.includes("configuration is missing")) {
        errorMessage =
          "Payment system is not properly configured. Please contact support.";
      } else if (error.message.includes("Failed to create order")) {
        errorMessage =
          "Unable to create order. Please try again or contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      onClose?.();
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    currency,
    notes,
    orderData,
    onSuccess,
    onFailure,
    onClose,
    disabled,
    loading,
    scriptLoaded,
    onReadyToOpen,
  ]);

  // Auto-trigger payment when component mounts (for checkout flow)
  React.useEffect(() => {
    console.log("CheckoutRazorpay useEffect triggered:", {
      autoTrigger,
      disabled,
      loading,
      hasTriggered: hasTriggered.current,
      scriptLoaded,
    });

    if (
      autoTrigger &&
      !disabled &&
      !loading &&
      !hasTriggered.current &&
      scriptLoaded
    ) {
      console.log("Auto-triggering payment...");
      handlePayment();
    }

    // Reset trigger flag when autoTrigger changes
    return () => {
      if (!autoTrigger) {
        hasTriggered.current = false;
      }
    };
  }, [autoTrigger, disabled, loading, handlePayment, scriptLoaded]);

  // If autoTrigger is true, don't render the button (payment will be triggered automatically)
  if (autoTrigger) {
    return null;
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`w-full ${className}`}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay ₹{amount.toFixed(2)} via Razorpay
        </>
      )}
    </Button>
  );
}
