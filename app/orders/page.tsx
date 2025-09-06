"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Check,
  X,
  ShoppingBag,
  ChefHat,
} from "lucide-react";

// Skeleton Components
const OrderCardSkeleton = () => (
  <div className="rounded-[16px] lg:rounded-[22px] p-3 lg:p-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex w-full min-w-0">
        {/* Skeleton Image */}
        <div className="relative h-[72px] w-[72px] lg:h-[88px] lg:w-[88px] rounded-[16px] lg:rounded-[20px] overflow-hidden mr-3 lg:mr-3 shrink-0 bg-gray-200 dark:bg-gray-600"></div>

        {/* Skeleton Content */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          {/* Top row skeleton */}
          <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
            <div className="flex-1 w-full min-w-0">
              {/* Product name skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
              {/* Status tag skeleton */}
              <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-20 mb-2"></div>
            </div>
            {/* Days ago skeleton */}
            <div className="text-right shrink-0 self-start">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>

          {/* Bottom row skeleton */}
          <div className="flex items-center justify-between w-full mt-2 lg:mt-0">
            {/* Price skeleton */}
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            {/* Button skeleton */}
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-full w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TabsSkeleton = () => (
  <div className="bg-[#EDECF6] dark:bg-gray-700 p-1 rounded-xl flex gap-1">
    <div className="px-4 py-2 text-base font-medium text-center rounded-lg bg-gray-200 dark:bg-gray-600 w-20 h-10"></div>
    <div className="px-4 py-2 text-base font-medium text-center rounded-lg bg-gray-200 dark:bg-gray-600 w-24 h-10"></div>
  </div>
);

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount?: number;
  discount_amount?: number;
  delivery_charge?: number;
  cgst?: number;
  sgst?: number;
  is_coupon?: boolean;
  estimated_time_delivery?: string;
  distance?: number;
  duration?: number;
  delivery_zone?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  delivery_address?: any;
  addresses?: {
    id: string;
    address_name: string;
    full_address: string;
    city: string;
  };
  coupons?: {
    id: string;
    code: string;
    value: number;
  };
  // Legacy fields
  note?: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  category: string;
  quantity: number;
  price: number;
  variant?: string;
}

function OrdersPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // Handle URL parameter for tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "completed") {
      setActiveTab("completed");
    } else {
      setActiveTab("active");
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/orders/recent?email=${encodeURIComponent(
          session?.user?.email || ""
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders:", response.status);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  const getStatusMessage = (status: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Reset time to start of day for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const diffTime = today.getTime() - orderDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getOrderTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleTrackOrder = (orderId: string) => {
    router.push(`/orders/track/${orderId}`);
  };

  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status.toLowerCase())
  );

  const completedOrders = orders.filter((order) =>
    ["delivered", "cancelled"].includes(order.status.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FB] dark:bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          {/* Skeleton Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full mr-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            </div>
            <TabsSkeleton />
          </div>

          {/* Skeleton Order Cards */}
          <div className="px-4 pt-4">
            <div className="space-y-3 lg:space-y-4">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#F5F6FB] dark:bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm">
            <button
              onClick={() => router.back()}
              className="mr-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold dark:text-white">My Orders</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">
              Please login to view your orders
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] dark:bg-gray-900">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className=" dark:bg-gray-800 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm mr-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Orders
              </h1>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <div className="bg-[#EDECF6] p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "active"
                      ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                      : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "completed"
                      ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                      : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 mb-5">
          <div className="flex justify-center p-2">
            <div className="bg-white p-2 rounded-full flex gap-1 w-full max-w-[300px] shadow-lg">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-full transition-all ${
                  activeTab === "active"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-full transition-all ${
                  activeTab === "completed"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Order Lists */}
        <div className="px-4 pt-4 md:pb-4">
          {activeTab === "active" && (
            <div className="space-y-3 lg:space-y-4">
              {loading ? (
                <div className="min-h-screen bg-[#F5F6FB] dark:bg-gray-900">
                  <div className="max-w-[1200px] mx-auto">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full mr-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                      <TabsSkeleton />
                    </div>

                    <div className="px-4 pt-4">
                      <div className="space-y-3 lg:space-y-4">
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active</p>
                  <p className="text-sm">Your active will appear here</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-[16px] lg:rounded-[22px] p-3 lg:p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex w-full min-w-0">
                        {/* Order Product Image */}
                        <div className="relative h-[72px] w-[72px] lg:h-[88px] lg:w-[88px] rounded-[16px] lg:rounded-[20px] overflow-hidden mr-3 lg:mr-3 shrink-0 bg-gray-100 dark:bg-gray-700">
                          {order.order_items && order.order_items.length > 0 ? (
                            <>
                              <Image
                                src={
                                  order.order_items[0].product_image ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  order.order_items[0].product_name || "Product"
                                }
                                fill
                                className="object-cover"
                              />
                              {/* Status indicator overlay */}
                              <div className="absolute top-1 right-1 bg-white/90 dark:bg-gray-800/90 rounded-full p-1">
                                {getStatusIcon(order.status)}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                            {/* Product names and status tag */}
                            <div className="flex-1 w-full min-w-0">
                              {/* Product names as main title */}
                              {order.order_items &&
                                order.order_items.length > 0 && (
                                  <h3 className="block truncate text-[14px] lg:text-[15px] leading-tight font-medium text-black dark:text-gray-200 max-w-full">
                                    {order.order_items.length === 1
                                      ? order.order_items[0].product_name
                                      : `${
                                          order.order_items[0].product_name
                                        } +${
                                          order.order_items.length - 1
                                        } more`}
                                  </h3>
                                )}
                              {/* Preparing tag */}
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  <ChefHat className="h-3 w-3" />
                                  Preparing
                                </span>
                              </div>
                            </div>

                            {/* Days ago/today */}
                            <div className="text-right shrink-0 self-start">
                              <p className="text-[11px] lg:text-[12px] text-blue-600 dark:text-blue-400 font-medium">
                                {getDaysAgo(order.created_at)}
                              </p>
                              <p className="text-[10px] lg:text-[11px] text-gray-500 dark:text-gray-400">
                                {getOrderTime(order.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between w-full mt-2 lg:mt-0">
                            {/* Price */}
                            <div className="text-left">
                              <p className="text-[13px] lg:text-[14px] font-semibold text-black dark:text-gray-100">
                                ₹{order.total_amount?.toFixed(2) || "0.00"}
                              </p>
                            </div>

                            {/* Track Order button */}
                            <button
                              className="bg-primary text-white px-4 py-1 rounded-full text-[12px] hover:bg-primary/90 transition-colors "
                              onClick={() => handleTrackOrder(order.id)}
                            >
                              Track
                            </button>
                          </div>

                          {/* Note if exists */}
                          {order.note && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-[12px] lg:text-[13px] text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Note:</span>{" "}
                              {order.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-3 lg:space-y-4">
              {loading ? (
                <div className="space-y-3 lg:space-y-4">
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </div>
              ) : completedOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed</p>
                  <p className="text-sm">Your completed will appear here</p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-[16px] lg:rounded-[22px] p-3 lg:p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex w-full min-w-0">
                        {/* Order Product Image */}
                        <div className="relative h-[72px] w-[72px] lg:h-[88px] lg:w-[88px] rounded-[16px] lg:rounded-[20px] overflow-hidden mr-3 lg:mr-3 shrink-0 bg-gray-100 dark:bg-gray-700">
                          {order.order_items && order.order_items.length > 0 ? (
                            <>
                              <Image
                                src={
                                  order.order_items[0].product_image ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  order.order_items[0].product_name || "Product"
                                }
                                fill
                                className="object-cover"
                              />
                              {/* Status indicator overlay */}
                              <div className="absolute top-1 right-1 bg-white/90 dark:bg-gray-800/90 rounded-full p-1">
                                {getStatusIcon(order.status)}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                            {/* Product names and status tag */}
                            <div className="flex-1 w-full min-w-0">
                              {/* Product names as main title */}
                              {order.order_items &&
                                order.order_items.length > 0 && (
                                  <h3 className="block truncate text-[14px] lg:text-[15px] leading-tight font-medium text-black dark:text-gray-200 max-w-full">
                                    {order.order_items.length === 1
                                      ? order.order_items[0].product_name
                                      : `${
                                          order.order_items[0].product_name
                                        } +${
                                          order.order_items.length - 1
                                        } more`}
                                  </h3>
                                )}
                              {/* Status tag based on order status */}
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status.toLowerCase() === "delivered"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : order.status.toLowerCase() ===
                                        "cancelled"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                                >
                                  {order.status === "delivered"
                                    ? "Delivered"
                                    : order.status === "cancelled"
                                    ? "Cancelled"
                                    : order.status}
                                </span>
                              </div>
                            </div>

                            {/* Days ago/today */}
                            <div className="text-right shrink-0 self-start">
                              <p className="text-[11px] lg:text-[12px] text-blue-600 dark:text-blue-400 font-medium">
                                {getDaysAgo(order.created_at)}
                              </p>
                              <p className="text-[10px] lg:text-[11px] text-gray-500 dark:text-gray-400">
                                {getOrderTime(order.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between w-full mt-2 lg:mt-0">
                            {/* Price */}
                            <div className="text-left">
                              <p className="text-[13px] lg:text-[14px] font-semibold text-black dark:text-gray-100">
                                ₹{order.total_amount?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          </div>

                          {/* Note if exists */}
                          {order.note && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-[12px] lg:text-[13px] text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Note:</span>{" "}
                              {order.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
