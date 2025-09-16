"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface RazorpayCheckoutProps {
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  amount,
  currency = "INR",
  checkoutId,
  userDetails,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayCheckoutProps) {
  const { toast } = useToast();

  useEffect(() => {
    let isInitialized = false;

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initializePayment = async () => {
      if (isInitialized) return;
      isInitialized = true;

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay script");
        }

        // Create Razorpay order
        const orderResponse = await fetch("/api/payment/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            checkoutId,
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();

          // If payment is already in progress, reset it and try again
          if (
            orderResponse.status === 409 &&
            errorData.error === "Payment already in progress"
          ) {
            console.log("Payment already in progress, resetting...");

            // Reset payment status
            const resetResponse = await fetch("/api/payment/reset", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ checkoutId }),
            });

            if (resetResponse.ok) {
              // Try creating order again
              const retryOrderResponse = await fetch("/api/payment/order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: Math.round(amount * 100),
                  currency,
                  checkoutId,
                }),
              });

              if (retryOrderResponse.ok) {
                const retryOrderData = await retryOrderResponse.json();
                // Continue with the retry order data
                const orderData = retryOrderData;

                // Configure Razorpay options with retry data
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
                      // Verify payment
                      const verifyResponse = await fetch(
                        "/api/payment/verify",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            checkoutId,
                          }),
                        }
                      );

                      const verifyData = await verifyResponse.json();

                      if (verifyData.success) {
                        onSuccess({
                          orderId: verifyData.orderId,
                          paymentId: verifyData.paymentId,
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                        });
                      } else {
                        onFailure(
                          new Error(
                            verifyData.error || "Payment verification failed"
                          )
                        );
                      }
                    } catch (error) {
                      console.error("Payment verification error:", error);
                      onFailure(error);
                    }
                  },
                  modal: {
                    ondismiss: function () {
                      if (onClose) {
                        onClose();
                      }
                    },
                  },
                };

                // Open Razorpay checkout
                const razorpay = new window.Razorpay(options);
                razorpay.open();
                return; // Exit early since we handled the retry
              }
            }
          }

          throw new Error(errorData.error || "Failed to create payment order");
        }

        const orderData = await orderResponse.json();

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
              console.log("Razorpay response received:", response);

              // Verify payment
              const verifyResponse = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  checkoutId,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                onSuccess({
                  orderId: verifyData.orderId,
                  paymentId: verifyData.paymentId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                });
              } else {
                onFailure(
                  new Error(verifyData.error || "Payment verification failed")
                );
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              onFailure(error);
            }
          },
          modal: {
            ondismiss: function () {
              if (onClose) {
                onClose();
              }
            },
          },
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        onFailure(error);
      }
    };

    // Initialize payment when component mounts
    initializePayment();

    // Cleanup function
    return () => {
      isInitialized = false;
    };
  }, [
    amount,
    currency,
    checkoutId,
    userDetails,
    onSuccess,
    onFailure,
    onClose,
  ]);

  return null; // This component doesn't render anything
}
