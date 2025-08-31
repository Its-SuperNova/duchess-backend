"use client";

import React, { useState, useCallback, useRef } from "react";
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
}

declare global {
  interface Window {
    Razorpay: any;
  }
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
}: CheckoutRazorpayProps) {
  const [loading, setLoading] = useState(false);
  const hasTriggered = useRef(false);

  // Load Razorpay script dynamically
  async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        console.log("Razorpay SDK loaded successfully");
        resolve(true);
      };

      script.onerror = (error) => {
        console.error("Failed to load Razorpay SDK:", error);
        resolve(false);
      };

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error("Razorpay SDK load timeout");
        resolve(false);
      }, 10000); // 10 second timeout

      script.onload = () => {
        clearTimeout(timeout);
        console.log("Razorpay SDK loaded successfully");
        resolve(true);
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error("Failed to load Razorpay SDK:", error);
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  const handlePayment = useCallback(async () => {
    console.log("handlePayment called with:", {
      disabled,
      loading,
      hasTriggered: hasTriggered.current,
      amount,
      orderData: !!orderData,
    });

    if (disabled || loading) {
      console.log("handlePayment early return due to:", {
        disabled,
        loading,
      });
      return;
    }

    // Set hasTriggered to true to prevent multiple calls
    hasTriggered.current = true;
    setLoading(true);

    try {
      // Load Razorpay script
      console.log("Loading Razorpay SDK...");
      const scriptLoaded = await loadRazorpayScript();
      console.log("Razorpay script loaded:", scriptLoaded);
      console.log("window.Razorpay available:", !!window.Razorpay);

      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay SDK. Please check your internet connection and try again."
        );
      }

      // Check if environment variables are configured
      console.log("Checking environment variables...");
      console.log(
        "NEXT_PUBLIC_RAZORPAY_KEY_ID:",
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      );

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error(
          "Razorpay configuration is missing. Please check your environment variables."
        );
      }

      // Create order on server
      console.log("Creating order on server...");
      console.log("Order data being sent:", {
        amountInRupees: amount,
        currency,
        notes: notes,
        orderData: orderData,
      });

      const createOrderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInRupees: amount,
          currency,
          notes: notes,
          ...orderData, // Include all order data
        }),
      });

      const createOrderData = await createOrderResponse.json();
      console.log("Order creation response:", createOrderData);
      console.log("Order creation status:", createOrderResponse.status);

      if (!createOrderResponse.ok) {
        console.error("Create order failed:", createOrderData);
        throw new Error(createOrderData?.error || "Failed to create order");
      }

      if (!createOrderData?.order) {
        console.error("Invalid order response:", createOrderData);
        throw new Error("Invalid order response from server");
      }

      const { order, localOrderId, key } = createOrderData;

      // Verify we have the required data
      if (!key) {
        throw new Error("Razorpay key not provided by server");
      }

      console.log("Order created successfully:", {
        orderId: order.id,
        localOrderId,
      });

      // Configure Razorpay checkout options
      const options = {
        key: key, // NEXT_PUBLIC_RAZORPAY_KEY_ID
        amount: order.amount,
        currency: order.currency,
        name: "Duchess Pastry",
        description: "Delicious pastries and cakes",
        image: "/duchess-logo.png", // Your logo
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          try {
            console.log("Payment successful, verifying...", response);

            // Verify payment on server
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                localOrderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              toast.success(
                "Payment successful! Your order has been confirmed."
              );
              // Pass the localOrderId along with the verification data
              const successData = {
                ...verifyData,
                localOrderId: localOrderId,
              };
              console.log("Calling onSuccess with data:", successData);
              onSuccess?.(successData);
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
        prefill: {
          // You can prefill customer details if available
          name: "",
          email: "",
          contact: "",
        },
        notes: order.notes || {},
        theme: {
          color: "#F37254", // Razorpay brand color
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            toast.info("Payment cancelled");
            onClose?.();
            onFailure?.({ error: "Payment cancelled by user" });
          },
        },
      };

      console.log("Initializing Razorpay checkout...");
      console.log("Razorpay options:", options);

      // Initialize and open Razorpay checkout
      const rzp = new window.Razorpay(options);
      console.log("Razorpay instance created:", !!rzp);

      // Handle payment failure
      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed:", resp);
        toast.error(`Payment failed: ${resp.error.description}`);
        onClose?.();
        onFailure?.(resp);
      });

      // Open checkout
      console.log("Opening Razorpay checkout...");
      rzp.open();
      console.log("Razorpay checkout opened");
    } catch (error: any) {
      console.error("Checkout error:", error);

      // Provide more specific error messages
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
  ]);

  // Auto-trigger payment when component mounts (for checkout flow)
  React.useEffect(() => {
    console.log("CheckoutRazorpay useEffect triggered:", {
      autoTrigger,
      disabled,
      loading,
      hasTriggered: hasTriggered.current,
    });

    if (autoTrigger && !disabled && !loading && !hasTriggered.current) {
      console.log("Auto-triggering payment...");
      handlePayment();
    }

    // Reset trigger flag when autoTrigger changes
    return () => {
      if (!autoTrigger) {
        hasTriggered.current = false;
      }
    };
  }, [autoTrigger, disabled, loading, handlePayment]);

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
