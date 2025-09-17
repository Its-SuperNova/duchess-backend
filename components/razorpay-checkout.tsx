"use client";

import { useEffect, useState } from "react";
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
  onOpen?: () => void;
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
  onOpen,
}: RazorpayCheckoutProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Payment polling function to check payment status
  const startPaymentPolling = (orderId: string) => {
    console.log("Starting payment polling for order:", orderId);

    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/payment/status?orderId=${orderId}&checkoutId=${checkoutId}`
        );
        const data = await response.json();

        if (response.ok && data.status === "paid") {
          console.log("Payment detected via polling:", data);
          // Clear polling interval
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          // Call success handler
          onSuccess(data);
          // Call onClose to close the modal
          if (onClose) {
            onClose();
          }
        }
      } catch (error) {
        console.error("Payment polling error:", error);
      }
    };

    // Start polling every 3 seconds
    const interval = setInterval(pollPaymentStatus, 3000);
    setPollingInterval(interval);

    // Stop polling after 2 minutes and show failure if no payment detected
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
        console.log("Payment polling timeout - no payment detected");
        // Call failure handler if no payment was detected
        onFailure(new Error("Payment not completed. Please try again."));
        if (onClose) {
          onClose();
        }
      }
    }, 120000); // 2 minutes
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    if (isInitialized) return;

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
      setIsInitialized(true);

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay script");
        }

        // Get checkout session to check for pre-created Razorpay order
        const checkoutResponse = await fetch(`/api/checkout/${checkoutId}`);
        if (!checkoutResponse.ok) {
          throw new Error("Failed to get checkout session");
        }

        const checkoutResponseData = await checkoutResponse.json();
        const checkoutSession = checkoutResponseData.checkout;
        let orderData;

        if (checkoutSession.razorpayOrderId) {
          // Use pre-created Razorpay order for instant modal
          console.log(
            "Using pre-created Razorpay order:",
            checkoutSession.razorpayOrderId
          );
          orderData = {
            id: checkoutSession.razorpayOrderId,
            amount: Math.round(amount * 100),
            currency,
            receipt: `rcpt_${checkoutId.substring(0, 8)}_precreated`,
            status: "created",
          };
        } else {
          // Fallback: Create Razorpay order on demand (old behavior)
          console.log("No pre-created order found, creating on demand");
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
                  orderData = retryOrderData;
                } else {
                  throw new Error("Failed to create payment order after retry");
                }
              } else {
                throw new Error("Failed to reset payment status");
              }
            } else {
              throw new Error(
                errorData.error || "Failed to create payment order"
              );
            }
          } else {
            orderData = await orderResponse.json();
          }
        }

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

              // Stop polling since we have direct payment confirmation
              if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
              }

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
              console.log(
                "Razorpay modal dismissed - user returned from external app"
              );

              // Start payment polling to check if payment was completed
              if (orderData && orderData.id) {
                startPaymentPolling(orderData.id);
              }

              // Don't call onClose immediately - wait for polling result
              // onClose will be called by polling success/failure
            },
          },
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();

        // Call onOpen callback to update parent component status
        if (onOpen) {
          onOpen();
        }
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        onFailure(error);
      }
    };

    // Initialize payment when component mounts
    initializePayment();

    // Cleanup function
    return () => {
      setIsInitialized(false);
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
