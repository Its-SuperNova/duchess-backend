"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface OrderItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  product_image: string | null;
  variant: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  item_total?: number;
  discount_amount?: number;
  delivery_charge?: number;
  cgst?: number;
  sgst?: number;
  status: string;
  payment_status: string;
  delivery_address_text: string | null;
  note: string | null;
  notes?: string | null;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

/**
 * Order Confirmation Client Component
 *
 * This component ALWAYS fetches order data from the database via the API,
 * never from in-memory session data. This ensures robustness even when
 * sessions expire or are cleared.
 */
export default function ConfirmationClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch order data from database - always from DB, never from session
  // This ensures robustness even when checkout sessions expire (30 minutes)
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Validate order ID format (should be a valid UUID or numeric ID)
    if (!/^[a-zA-Z0-9-_]+$/.test(orderId)) {
      setError("Invalid order ID format");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`);

      if (response.status === 401) {
        setError("Please log in to view your order details");
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        setError(
          "Order not found. This order may have expired or you may not have permission to view it."
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Retry logic for server errors (5xx)
        if (response.status >= 500 && retryCount < 2) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            fetchOrder();
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }

        throw new Error(errorData.error || "Failed to fetch order");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId, retryCount]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FB]">
        {/* Header Skeleton */}
        <div className="bg-[#F5F6FB] p-4">
          <div className="max-w-[1200px] mx-auto flex items-center">
            <div className="mr-4">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-4">
          {/* Order Confirmation Header Skeleton */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Contact Section Skeleton */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="text-center">
              <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="h-12 w-56 bg-gray-200 rounded-[12px] animate-pulse"></div>
                <div className="h-12 w-48 bg-gray-200 rounded-[12px] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Order Information Skeleton */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="h-6 w-36 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items Skeleton */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="h-6 w-28 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Skeleton */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="h-6 w-36 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-32 bg-gray-200 rounded-[12px] animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 rounded-[12px] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Unable to load order details"}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                setRetryCount(0);
                fetchOrder();
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
            <Link href="/orders">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "₹0.00";
    }
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F6FB]">
      {/* Simple Header */}
      <div className="bg-[#F5F6FB] p-4 ">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/checkout" className="mr-4">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <ArrowLeft className="h-5 w-5" />
              </div>
            </Link>
            <h1 className="text-xl font-semibold">Order Confirmation</h1>
          </div>
          <div className="hidden md:block">
            <Button
              asChild
              className="bg-[#523435] hover:bg-[#4a2a2a] rounded-[16px] px-6 py-2"
            >
              <Link href={`/orders/track/${order.id}`}>Track Order</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-4">
        {/* Order Confirmation Header Section */}
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. Your order has been received and is
              being prepared.
            </p>
          </div>
        </div>

        {/* Order Information Section */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Time</p>
              <p className="font-medium">{formatTime(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="font-medium capitalize">{order.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product_image || "/placeholder.svg"}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="font-medium">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.unit_price)} x {item.quantity}
                  </p>
                  {item.variant && (
                    <p className="text-sm text-gray-500">
                      Variant: {item.variant}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(order.item_total)}
              </span>
            </div>
            {order.discount_amount && order.discount_amount > 0 ? (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatCurrency(order.discount_amount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">
                {formatCurrency(order.delivery_charge)}
              </span>
            </div>
            {order.cgst && order.cgst > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CGST (9%)</span>
                <span className="font-medium">
                  {formatCurrency(order.cgst)}
                </span>
              </div>
            )}
            {order.sgst && order.sgst > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SGST (9%)</span>
                <span className="font-medium">
                  {formatCurrency(order.sgst)}
                </span>
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Coupon Section */}
        {(order.delivery_address_text || order.coupon_code) && (
          <div className="bg-white rounded-[20px] p-6 shadow-sm space-y-4">
            {order.delivery_address_text && (
              <div>
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p className="text-gray-600">{order.delivery_address_text}</p>
              </div>
            )}

            {order.coupon_code && (
              <div>
                <h3 className="font-medium mb-2 text-green-800">
                  Applied Coupon
                </h3>
                <p className="text-green-700 font-mono bg-green-50 px-3 py-2 rounded-lg inline-block">
                  {order.coupon_code}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mobile spacing for fixed button */}
        <div className="md:hidden h-20"></div>
      </div>

      {/* Fixed Mobile Track Order Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <Button
          asChild
          className="w-full bg-[#523435] hover:bg-[#4a2a2a] py-4 text-lg font-semibold rounded-full"
        >
          <Link href={`/orders/track/${order.id}`}>Track Order</Link>
        </Button>
      </div>
    </div>
  );
}
