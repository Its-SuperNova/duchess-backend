"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";
import { useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");
  const { clearCart } = useCart() || { clearCart: () => {} };
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => {
    const parsed = parseFloat(amountParam || "0");
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100) / 100;
  }, [amountParam]);

  async function handlePayNow() {
    try {
      setIsProcessing(true);
      setError(null);

      // Pull stored checkout context from localStorage
      const checkoutCtxRaw =
        typeof window !== "undefined"
          ? localStorage.getItem("checkoutContext")
          : null;
      const checkoutCtx = checkoutCtxRaw ? JSON.parse(checkoutCtxRaw) : {};

      console.log("Sending order creation request with data:", {
        subtotalAmount: checkoutCtx.subtotal,
        discountAmount: checkoutCtx.discount,
        deliveryFee: checkoutCtx.deliveryFee,
        totalAmount: amount,
        note: checkoutCtx.note,
        addressText: checkoutCtx.addressText,
        couponCode: checkoutCtx.couponCode,
        contactInfo: checkoutCtx.contactInfo,
      });

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotalAmount: checkoutCtx.subtotal,
          discountAmount: checkoutCtx.discount,
          deliveryFee: checkoutCtx.deliveryFee,
          totalAmount: amount,
          note: checkoutCtx.note,
          addressText: checkoutCtx.addressText,
          couponCode: checkoutCtx.couponCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to create order:", response.status, errorData);
        setError(
          `Failed to create order: ${
            errorData.error || `HTTP ${response.status}`
          }`
        );
        return;
      }

      const { orderId } = await response.json();
      console.log("Order created successfully:", orderId);

      // Optionally clear local checkout context
      localStorage.removeItem("checkoutContext");

      // Clear cart
      clearCart();

      // Navigate to confirmation
      router.replace("/checkout/confirmation?orderId=" + orderId);
    } catch (err) {
      console.error("Error on Pay Now:", err);
      setError(
        `Payment failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB]">
      <div className="bg-[#F5F6FB]">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <button
              onClick={() => router.back()}
              className="bg-white p-3 md:p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              Payment
            </h1>
            <div className="w-9 md:hidden" />
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-gray-700 mb-6">Dummy payment gateway</p>
          <p className="text-lg font-semibold mb-8">
            Amount: ₹{amount.toFixed(2)}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] text-[16px] font-medium h-auto disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 rounded-[18px] text-[16px] font-medium h-auto"
              onClick={() => router.back()}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DummyPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
