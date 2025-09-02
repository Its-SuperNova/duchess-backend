"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutButtonProps {
  amountInRupees: number;
  orderData: any; // The complete order data to be saved
  onSuccess?: (paymentData: any) => void;
  onFailure?: (error: any) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckoutButton({
  amountInRupees,
  orderData,
  onSuccess,
  onFailure,
  className = "",
  disabled = false,
  children,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load Razorpay script dynamically
  async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Poll payment status for mobile UPI flows
  const pollPaymentStatus = async (orderId: string, rzpInstance: any) => {
    console.log("Starting payment status polling for order:", orderId);

    let attempts = 0;
    const maxAttempts = 20; // Poll for 20 seconds

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

          rzpInstance.close();
          onFailure?.({ error: "Payment failed" });
          return;
        }

        // If max attempts reached, stop polling
        if (attempts >= maxAttempts) {
          console.log("Max polling attempts reached, stopping");
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
    const interval = setInterval(poll, 1000);

    // Initial poll
    poll();

    // Cleanup interval after max attempts
    setTimeout(() => {
      clearInterval(interval);
    }, maxAttempts * 1000);
  };

  async function handlePayment() {
    if (disabled || loading) return;

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create Razorpay order
      const createOrderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInRupees,
          currency: "INR",
          notes: {
            order_type: "checkout",
            ...orderData,
          },
          orderMetadata: orderData,
        }),
      });

      const createOrderData = await createOrderResponse.json();

      if (!createOrderResponse.ok || !createOrderData?.order) {
        throw new Error(createOrderData?.error || "Failed to create order");
      }

      const { order, razorpayOrderId } = createOrderData;

      // Configure Razorpay checkout options with mobile UPI optimization
      const options = {
        key: createOrderData.key,
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
        handler: async function (response: any) {
          try {
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

            if (verifyResponse.ok && verifyData.success) {
              toast.success(
                "Payment successful! Your order has been confirmed."
              );

              // Call success callback with the payment data in expected format
              onSuccess?.({
                localOrderId: verifyData.localOrderId,
                orderId: verifyData.localOrderId,
                success: true,
                message: "Payment verified successfully",
              });

              // Navigate to order confirmation
              router.push(
                `/checkout/order-confirmation-animation?orderId=${verifyData.localOrderId}`
              );
            } else {
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
          name: orderData.contactName || "",
          email: orderData.email || "",
          contact: orderData.contactNumber || "",
        },
        notes: {
          ...order.notes,
          mobile_flow: "true",
          prevent_reload: "true",
        },

        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            onFailure?.({ error: "Payment cancelled by user" });
          },
          escape: false, // Prevent accidental dismissal
          handleback: false, // Prevent back button from closing modal
        },
      };

      // Initialize and open Razorpay checkout
      const rzp = new window.Razorpay(options);

      // Enhanced event handling for mobile UPI flows
      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed:", resp);
        toast.error(`Payment failed: ${resp.error.description}`);
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
        onFailure?.({ error: "Payment modal closed" });
      });

      // Open checkout
      rzp.open();
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error?.message || "Checkout failed. Please try again.");
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || `Pay ₹${amountInRupees.toFixed(2)}`}
        </>
      )}
    </Button>
  );
}
