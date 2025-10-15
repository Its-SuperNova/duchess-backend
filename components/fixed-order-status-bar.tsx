"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-6 h-6 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
    </div>
  ),
});

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export default function FixedOrderStatusBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [preparingAnimation, setPreparingAnimation] = useState(null);
  const [deliveryAnimation, setDeliveryAnimation] = useState(null);

  // Load Lottie animations data dynamically to reduce bundle size
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        // Load preparing animation
        const preparingResponse = await fetch("/Lottie/preparing.json");
        const preparingData = await preparingResponse.json();
        setPreparingAnimation(preparingData);

        // Load delivery animation
        const deliveryResponse = await fetch("/Lottie/Delivery.json");
        const deliveryData = await deliveryResponse.json();
        setDeliveryAnimation(deliveryData);
      } catch (error) {
        console.error("Failed to load animations:", error);
      }
    };

    loadAnimations();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchRecentOrder();
    } else {
      setLoading(false);
    }
  }, [session?.user?.email]);

  const fetchRecentOrder = async () => {
    try {
      const response = await fetch(
        `/api/orders/recent?email=${session?.user?.email}`
      );
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        // Get the most recent order that's not delivered or cancelled
        const activeOrder = orders.find(
          (order: Order) =>
            !["delivered", "cancelled"].includes(order.status.toLowerCase())
        );
        setRecentOrder(activeOrder || null);
      }
    } catch (error) {
      console.error("Error fetching recent order:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, paymentStatus?: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirmed":
      case "preparing":
        // Show preparing animation for confirmed/preparing status or if payment is successful
        const isPaymentSuccessful =
          paymentStatus?.toLowerCase() === "successful" ||
          paymentStatus?.toLowerCase() === "paid" ||
          paymentStatus?.toLowerCase() === "captured";

        if (
          preparingAnimation &&
          (status.toLowerCase() === "preparing" ||
            status.toLowerCase() === "confirmed" ||
            isPaymentSuccessful)
        ) {
          return (
            <div className="w-6 h-6 mt-[-50px] ml-[-10px]">
              <Lottie
                animationData={preparingAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "80px", height: "80px" }}
              />
            </div>
          );
        }
        return <Package className="h-4 w-4 text-blue-600" />;
      case "out_for_delivery":
        // Show delivery animation for out for delivery status
        if (deliveryAnimation) {
          return (
            <div className="w-6 h-6 mt-[-35px] ml-[-10px]">
              <Lottie
                animationData={deliveryAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "60px", height: "60px" }}
              />
            </div>
          );
        }
        return <Truck className="h-4 w-4 text-purple-600" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "processing":
      case "confirmed":
        return "text-blue-600";
      case "preparing":
        return "text-orange-600";
      case "out_for_delivery":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getSimpleStatusMessage = (status: string, paymentStatus?: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Order is being processed";
      case "processing":
        return "Order is being processed";
      case "confirmed":
        const isPaymentSuccessful =
          paymentStatus?.toLowerCase() === "successful" ||
          paymentStatus?.toLowerCase() === "paid" ||
          paymentStatus?.toLowerCase() === "captured";
        return "Order is preparing";
      case "preparing":
        return "Order is preparing";
      case "out_for_delivery":
        return "Order is on the way";
      default:
        return "Order status unknown";
    }
  };

  const handleViewOrder = () => {
    if (recentOrder?.id) {
      router.push(`/orders/track/${recentOrder.id}`);
    }
  };

  // Don't show if loading, no user, or no recent order
  if (loading || !session?.user?.email || !recentOrder) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-[450px]"
      onClick={handleViewOrder}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Order Status */}
          <div className="flex items-center gap-[50px] flex-1">
            {getStatusIcon(recentOrder.status, recentOrder.payment_status)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getSimpleStatusMessage(
                  recentOrder.status,
                  recentOrder.payment_status
                )}
              </p>
            </div>
          </div>

          {/* Right side - View Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewOrder();
            }}
            className="bg-[#7A0000] hover:bg-[#5A0000] text-white px-6 py-2 rounded-full text-sm font-medium min-w-[80px]"
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
