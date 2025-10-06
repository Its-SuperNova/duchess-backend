"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RazorpayButtonProps {
  amount: number;
  currency?: string;
  checkoutId?: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: (paymentData: any) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
  onModalOpening?: () => void;
  onPaymentVerifying?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function RazorpayButton({
  amount,
  currency = "INR",
  checkoutId,
  userDetails,
  onSuccess,
  onFailure,
  onClose,
  onModalOpening,
  onPaymentVerifying,
  disabled = false,
  className = "",
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "idle" | "opening" | "verifying"
  >("idle");
  const { toast } = useToast();

  // Fix z-index for Razorpay modal after it opens
  useEffect(() => {
    const fixRazorpayZIndex = () => {
      const razorpayElements = document.querySelectorAll(
        "[data-razorpay-checkout], .razorpay-checkout-frame, .razorpay-checkout-overlay"
      );
      razorpayElements.forEach((element: any) => {
        element.style.zIndex = "9999";
        if (element.querySelector && element.querySelector("iframe")) {
          element.querySelector("iframe").style.zIndex = "9999";
        }
      });
    };

    // Run the fix periodically while modal might be open
    const interval = setInterval(fixRazorpayZIndex, 100);

    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setLoadingState("opening");
    onModalOpening?.();

    try {
      // Step 1: Create Razorpay order
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          checkoutId,
        }),
      });

      const data = await res.json();

      if (!data.orderId) {
        throw new Error(data.error || "Order creation failed");
      }

      // Step 2: Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // convert to paise
        currency: currency,
        name: "Duchess Pastries",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment on backend
            setLoadingState("verifying");
            onPaymentVerifying?.();

            const verifyRes = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                checkoutId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Debug: Log delivery fee data before redirect
              console.log("🔍 Delivery Fee Debug - Payment Success:", {
                orderId: verifyData.orderId,
                deliveryFeeData: verifyData.deliveryFeeData,
                message: "Delivery fee successfully stored in database",
              });

              toast({
                title: "Payment Successful!",
                description:
                  "Your payment has been verified and order is confirmed.",
                variant: "default",
              });

              // Call success callback with order data
              if (onSuccess) {
                onSuccess({
                  orderId: verifyData.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  deliveryFeeData: verifyData.deliveryFeeData,
                });
              }
            } else {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description:
                "Payment was successful but verification failed. Please contact support.",
              variant: "destructive",
            });

            if (onFailure) {
              onFailure(error);
            }
          }
        },
        prefill: {
          name: userDetails?.name || "Customer",
          email: userDetails?.email || "customer@example.com",
          contact: userDetails?.phone || "9876543210",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal dismissed");
            setLoadingState("idle");
            if (onClose) {
              onClose();
            }
          },
          escape: true,
          backdropclose: false,
        },
      };

      // Load Razorpay script if not already loaded
      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          try {
            const rzp = new (window as any).Razorpay(options);
            rzp.open();

            // Ensure modal is clickable after opening
            setTimeout(() => {
              const razorpayElements = document.querySelectorAll(
                "[data-razorpay-checkout], .razorpay-checkout-frame, .razorpay-checkout-overlay"
              );
              razorpayElements.forEach((element: any) => {
                element.style.zIndex = "9999";
                element.style.pointerEvents = "auto";
                if (element.querySelector && element.querySelector("iframe")) {
                  element.querySelector("iframe").style.zIndex = "9999";
                  element.querySelector("iframe").style.pointerEvents = "auto";
                }
              });
            }, 100);
          } catch (error) {
            console.error("Error opening Razorpay modal:", error);
            throw error;
          }
        };

        script.onerror = () => {
          throw new Error("Failed to load Razorpay script");
        };
      } else {
        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();

          // Ensure modal is clickable after opening
          setTimeout(() => {
            const razorpayElements = document.querySelectorAll(
              "[data-razorpay-checkout], .razorpay-checkout-frame, .razorpay-checkout-overlay"
            );
            razorpayElements.forEach((element: any) => {
              element.style.zIndex = "9999";
              element.style.pointerEvents = "auto";
              if (element.querySelector && element.querySelector("iframe")) {
                element.querySelector("iframe").style.zIndex = "9999";
                element.querySelector("iframe").style.pointerEvents = "auto";
              }
            });
          }, 100);
        } catch (error) {
          console.error("Error opening Razorpay modal:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Payment could not be initiated",
        variant: "destructive",
      });

      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
      setLoadingState("idle");
    }
  };

  const getButtonText = () => {
    if (loadingState === "opening") return "Opening Payment Gateway...";
    if (loadingState === "verifying") return "Verifying Payment...";
    if (loading) return "Processing...";
    return `Pay ₹${amount.toFixed(2)}`;
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {getButtonText()}
    </Button>
  );
}
