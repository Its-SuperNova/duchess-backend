"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  product_image: string | null;
  variant: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
  address_text: string | null;
  note: string | null;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function ConfirmationClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Unable to load order details"}
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F6FB]">
      {/* Simple Header */}
      <div className="bg-[#F5F6FB] p-4 flex items-center">
        <Link href="/checkout" className="mr-4">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Order Confirmation</h1>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
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

        {/* Order Status Tracker Section */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="text-center mb-4">
            <div className="text-lg font-bold text-black mb-1">
              10:20 - 10:30 PM
            </div>
            <div className="text-sm text-black">
              On time •{" "}
              <span className="text-gray-500">We've got your order!</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {/* Step 1: Confirmed */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xs text-gray-600">Confirmed</span>
            </div>

            {/* Line 1 */}
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>

            {/* Step 2: Preparation */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Preparing</span>
            </div>

            {/* Line 2 */}
            <div className="flex-1 h-1 bg-green-200 mx-2"></div>

            {/* Step 3: Delivery */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">On Way</span>
            </div>

            {/* Line 3 */}
            <div className="flex-1 h-1 bg-green-200 mx-2"></div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Delivered</span>
            </div>
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
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
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
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} x {item.quantity}
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
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(order.subtotal_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatCurrency(order.delivery_fee)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Notes Section */}
        {(order.address_text || order.note || order.coupon_code) && (
          <div className="bg-white rounded-[20px] p-6 shadow-sm space-y-4">
            {order.address_text && (
              <div>
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p className="text-gray-600">{order.address_text}</p>
              </div>
            )}

            {order.note && (
              <div>
                <h3 className="font-medium mb-2">Order Note</h3>
                <p className="text-gray-600">{order.note}</p>
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

        {/* Action Buttons Section */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild className="bg-[#523435] hover:bg-[#4a2a2a] flex-1">
              <Link href="/profile/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
