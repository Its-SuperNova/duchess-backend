"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export default function RecentOrderCard() {
  const { data: session } = useSession();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
        const activeOrder =
          orders.find(
            (order: Order) =>
              !["delivered", "cancelled"].includes(order.status.toLowerCase())
          ) || orders[0]; // Fallback to most recent order
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
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "confirmed":
      case "preparing":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "out_for_delivery":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-gray-600" />;
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

  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Your order is being processed";
      case "processing":
        return "We're preparing your order";
      case "confirmed":
        return "Your order has been confirmed";
      case "preparing":
        return "Your delicious treats are being prepared";
      case "out_for_delivery":
        return "Your order is on its way!";
      case "delivered":
        return "Order delivered successfully";
      case "cancelled":
        return "Order was cancelled";
      default:
        return "Order status unknown";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user || !recentOrder) {
    return null;
  }

  return (
    <Card className="w-full border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(recentOrder.status)}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Order #{recentOrder.order_number}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {getStatusMessage(recentOrder.status)}
              </p>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(recentOrder.status)}`}
                >
                  {formatStatus(recentOrder.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  ₹{recentOrder.total_amount.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(recentOrder.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/profile/orders">
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress indicator for active orders */}
        {!["delivered", "cancelled"].includes(
          recentOrder.status.toLowerCase()
        ) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Order Progress</span>
              <Link
                href={`/orders/track/${recentOrder.id}`}
                className="text-primary hover:underline"
              >
                Track Order
              </Link>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  recentOrder.status.toLowerCase() === "delivered"
                    ? "bg-green-500 w-full"
                    : recentOrder.status.toLowerCase() === "out_for_delivery"
                    ? "bg-purple-500 w-4/5"
                    : recentOrder.status.toLowerCase() === "preparing"
                    ? "bg-orange-500 w-3/5"
                    : recentOrder.status.toLowerCase() === "confirmed"
                    ? "bg-blue-500 w-2/5"
                    : "bg-yellow-500 w-1/5"
                }`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
