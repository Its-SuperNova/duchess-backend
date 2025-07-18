"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";
import { useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import OrderSuccessNotification from "@/components/order-success-notification";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");
  const { clearCart } = useCart() || { clearCart: () => {} };
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

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

      // Pull additional data from localStorage
      const customizationData = localStorage.getItem("customizationOptions");
      const deliveryData = localStorage.getItem("deliveryDetails");
      const addressData = localStorage.getItem("selectedAddress");
      const distanceData = localStorage.getItem("distanceCalculation");

      // Parse additional data
      const customizationOptions = customizationData
        ? JSON.parse(customizationData)
        : {};
      const deliveryDetails = deliveryData ? JSON.parse(deliveryData) : {};
      const selectedAddress = addressData ? JSON.parse(addressData) : {};
      const distanceCalculation = distanceData ? JSON.parse(distanceData) : {};

      // Calculate taxes (CGST 9% + SGST 9% = 18% total)
      const subtotal = checkoutCtx.subtotal || 0;
      const discount = checkoutCtx.discount || 0;
      const taxableAmount = subtotal - discount;
      const cgstAmount = taxableAmount * 0.09;
      const sgstAmount = taxableAmount * 0.09;

      // Prepare comprehensive order data
      const comprehensiveOrderData = {
        subtotalAmount: checkoutCtx.subtotal,
        discountAmount: checkoutCtx.discount,
        deliveryFee: checkoutCtx.deliveryFee,
        totalAmount: amount,
        note: checkoutCtx.note,
        addressText: checkoutCtx.addressText,
        couponCode: checkoutCtx.couponCode,
        contactInfo: checkoutCtx.contactInfo,
        // Enhanced customization options
        customizationOptions: {
          addTextOnCake: customizationOptions.addTextOnCake || false,
          addCandles: customizationOptions.addCandles || false,
          addKnife: customizationOptions.addKnife || false,
          addMessageCard: customizationOptions.addMessageCard || false,
          cakeText: customizationOptions.cakeText || "",
          messageCardText: customizationOptions.messageCardText || "",
        },
        // Delivery timing and scheduling
        deliveryTiming: deliveryDetails.deliveryOption || "same-day",
        scheduledDelivery: deliveryDetails.scheduledDate
          ? {
              date: deliveryDetails.scheduledDate,
              timeSlot: deliveryDetails.timeSlot || "morning",
            }
          : null,
        estimatedDeliveryTime: deliveryDetails.estimatedTime || null,
        isSameDayDelivery: deliveryDetails.deliveryOption === "same-day",
        // Distance and location data
        distance: distanceCalculation.distance || null,
        duration: distanceCalculation.duration || null,
        deliveryZone: distanceCalculation.zone || null,
        coordinates: selectedAddress.coordinates || null,
        // Enhanced delivery address
        deliveryAddress: {
          address: checkoutCtx.addressText || selectedAddress.full_address,
          type: selectedAddress.type || "home",
          contact: checkoutCtx.contactInfo
            ? {
                name: checkoutCtx.contactInfo.name,
                phone: checkoutCtx.contactInfo.phone,
                alternatePhone: checkoutCtx.contactInfo.alternatePhone || null,
              }
            : null,
          coordinates: selectedAddress.coordinates || null,
          distance: distanceCalculation.distance || null,
          duration: distanceCalculation.duration || null,
          delivery_zone: distanceCalculation.zone || null,
          city: selectedAddress.city || null,
          state: selectedAddress.state || null,
          pincode: selectedAddress.zip_code || null,
        },
        // Tax information
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        // Payment and order details
        paymentMethod: "online",
        specialInstructions: checkoutCtx.note || "",
        restaurantNotes: checkoutCtx.restaurantNotes || "",
      };

      console.log(
        "Sending comprehensive order creation request:",
        comprehensiveOrderData
      );

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comprehensiveOrderData),
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

      const { orderId, orderNumber } = await response.json();
      console.log("Order created successfully:", orderId);

      // Store order details for notification
      setOrderDetails({
        orderId,
        orderNumber: orderNumber || `ORD-${Date.now()}`,
      });

      // Show success notification
      setShowSuccessNotification(true);

      // Clear all local storage data
      localStorage.removeItem("checkoutContext");
      localStorage.removeItem("customizationOptions");
      localStorage.removeItem("deliveryDetails");
      localStorage.removeItem("selectedAddress");
      localStorage.removeItem("distanceCalculation");

      // Clear cart
      clearCart();

      // Navigate to confirmation after a delay (let user see the notification)
      setTimeout(() => {
        router.replace("/checkout/confirmation?orderId=" + orderId);
      }, 3000); // 3 seconds delay
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

      {/* Order Success Notification */}
      {orderDetails && (
        <OrderSuccessNotification
          orderId={orderDetails.orderId}
          orderNumber={orderDetails.orderNumber}
          isVisible={showSuccessNotification}
          onClose={() => {
            setShowSuccessNotification(false);
            // Navigate immediately when user closes notification
            router.replace(
              "/checkout/confirmation?orderId=" + orderDetails.orderId
            );
          }}
          autoHideDuration={0} // Don't auto-hide, let user manually close or wait for timeout
        />
      )}
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
