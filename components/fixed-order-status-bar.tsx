"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (session?.user) {
      fetchRecentOrder();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchRecentOrder = async () => {
    try {
      const response = await fetch("/api/orders/recent");
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirmed":
      case "preparing":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "out_for_delivery":
        return <Truck className="h-4 w-4 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
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
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
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

  const getSimpleStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Order is being processed";
      case "processing":
        return "Order is being processed";
      case "confirmed":
        return "Order is confirmed";
      case "preparing":
        return "Order is preparing";
      case "out_for_delivery":
        return "Order is on the way";
      case "delivered":
        return "Order is delivered";
      case "cancelled":
        return "Order is cancelled";
      default:
        return "Order status unknown";
    }
  };

  const handleViewOrder = () => {
    router.push("/profile/orders");
  };

  // Don't show if loading, no user, or no recent order
  if (loading || !session?.user || !recentOrder) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 bg-white border border-gray-200 shadow-lg rounded-2xl transform -translate-x-1/2 max-w-[400px] w-full">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Order Status */}
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon(recentOrder.status)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getSimpleStatusMessage(recentOrder.status)}
              </p>
            </div>
          </div>

          {/* Right side - View Button */}
          <Button
            onClick={handleViewOrder}
            className="bg-[#7A0000] hover:bg-[#5A0000] text-white px-6 py-2 rounded-full text-sm font-medium min-w-[80px]"
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
