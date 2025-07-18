"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShoppingBag, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export default function OrderStatusIndicator() {
  const { data: session } = useSession();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchRecentOrders();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch("/api/orders/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="h-3 w-3" />;
      case "confirmed":
      case "preparing":
        return <Package className="h-3 w-3" />;
      case "out_for_delivery":
        return <Truck className="h-3 w-3" />;
      case "delivered":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <ShoppingBag className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading || !session?.user || recentOrders.length === 0) {
    return null;
  }

  // Show the most recent active order (not delivered or cancelled)
  const activeOrder = recentOrders.find(
    (order) => !["delivered", "cancelled"].includes(order.status.toLowerCase())
  );

  if (!activeOrder) {
    return null;
  }

  return (
    <Link
      href="/profile/orders"
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-black hover:bg-gray-50 transition-colors"
      aria-label="Recent Orders"
    >
      <ShoppingBag className="h-5 w-5" />

      {/* Status Badge - Small dot indicator */}
      <span
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          activeOrder.status.toLowerCase() === "delivered"
            ? "bg-green-500"
            : activeOrder.status.toLowerCase() === "out_for_delivery"
            ? "bg-purple-500"
            : activeOrder.status.toLowerCase() === "preparing"
            ? "bg-orange-500"
            : "bg-blue-500"
        }`}
      />
    </Link>
  );
}

// Detailed Order Status Card for dropdown or hover
export function OrderStatusCard() {
  const { data: session } = useSession();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchRecentOrders();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch("/api/orders/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading || !session?.user) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
        Loading orders...
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No recent orders</p>
        <Link
          href="/categories"
          className="text-primary hover:underline text-xs mt-1 inline-block"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <div className="p-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Recent Orders</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {recentOrders.slice(0, 3).map((order) => (
          <Link
            key={order.id}
            href={`/profile/orders`}
            className="block p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-gray-900">
                #{order.order_number}
              </span>
              <Badge
                variant="outline"
                className={`text-xs ${getStatusColor(
                  order.status
                )} flex items-center gap-1`}
              >
                {getStatusIcon(order.status)}
                {formatStatus(order.status)}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>₹{order.total_amount.toFixed(2)}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <Link
          href="/profile/orders"
          className="text-primary hover:underline text-sm font-medium"
        >
          View all orders →
        </Link>
      </div>
    </div>
  );
}
