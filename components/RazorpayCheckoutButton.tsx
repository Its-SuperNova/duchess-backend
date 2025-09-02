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

      // Configure Razorpay checkout options
      const options = {
        key: createOrderData.key,
        amount: order.amount,
        currency: order.currency,
        name: "Duchess Pastry",
        description: "Delicious pastries and cakes",
        image: "/duchess-logo.png",
        order_id: order.id,
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
        notes: order.notes || {},

        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            onFailure?.({ error: "Payment cancelled by user" });
          },
        },
      };

      // Initialize and open Razorpay checkout
      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed:", resp);
        toast.error(`Payment failed: ${resp.error.description}`);
        onFailure?.(resp);
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
