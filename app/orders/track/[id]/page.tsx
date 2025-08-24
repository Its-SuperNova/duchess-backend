"use client";

import type React from "react";
import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, RefreshCw } from "lucide-react";
import {
  UploadMinimalistic,
  Card,
  ChefHatHeart,
  Scooter,
  HomeSmile,
} from "@solar-icons/react";
import Link from "next/link";
import Lottie from "lottie-react";
import paymentPendingAnimation from "../../../../public/Lottie/payment-pending.json";
import paymentDoneAnimation from "../../../../public/Lottie/Payment-Done.json";
import preparingAnimation from "../../../../public/Lottie/preparing.json";
import outForDeliveryAnimation from "../../../../public/Lottie/out-for-delivery.json";
import confirmAnimation from "../../../../public/Lottie/check.json";
import Image from "next/image";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  delivery_person_name?: string;
  delivery_person_contact?: string;
  estimated_time_delivery?: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_image?: string;
  }>;
}

function TrackOrderPageContent() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Function to determine current step based on order status
  const getCurrentStep = (order: Order): number => {
    const { status, payment_status } = order;

    // If payment is pending, show step 0
    if (payment_status === "pending") {
      return 0;
    }

    // If payment is successful, determine step based on order status
    switch (status) {
      case "pending":
      case "confirmed":
        return 1; // Payment successful, order confirmed
      case "preparing":
        return 2; // Preparing order
      case "ready":
      case "out_for_delivery":
        return 3; // Out for delivery
      case "delivered":
        return 4; // Delivered
      case "cancelled":
        return 0; // Cancelled orders go back to payment pending
      default:
        return 1; // Default to payment successful
    }
  };

  // Function to get status text based on current step
  const getStatusText = (step: number) => {
    switch (step) {
      case 0:
        return "Payment Pending";
      case 1:
        return "Payment Successful";
      case 2:
        return "Preparing Order";
      case 3:
        return "Out for Delivery";
      case 4:
        return "Delivered";
      default:
        return "Payment Pending";
    }
  };

  // Function to get status description based on current step
  const getStatusDescription = (step: number, order: Order | null) => {
    switch (step) {
      case 0:
        return "Complete payment to proceed";
      case 1:
        return "Payment completed successfully";
      case 2:
        if (order?.estimated_time_delivery) {
          // Calculate time difference between current time and estimated delivery time
          // Parse the ISO string manually to avoid timezone conversion
          const match = order.estimated_time_delivery.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
          );
          let estimatedTime: Date;

          if (match) {
            const [, year, month, day, hour, minute, second] = match;
            estimatedTime = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
          } else {
            // Fallback to original method
            estimatedTime = new Date(order.estimated_time_delivery);
          }

          // Calculate time difference directly
          const timeDiffMs = estimatedTime.getTime() - currentTime.getTime();
          const timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));

          if (timeDiffMinutes > 0) {
            if (timeDiffMinutes < 60) {
              return `Arriving in ${timeDiffMinutes} minutes`;
            } else {
              const hours = Math.floor(timeDiffMinutes / 60);
              const minutes = timeDiffMinutes % 60;
              if (minutes === 0) {
                return `Arriving in ${hours} hour${hours > 1 ? "s" : ""}`;
              } else {
                return `Arriving in ${hours} hour${
                  hours > 1 ? "s" : ""
                } ${minutes} minute${minutes > 1 ? "s" : ""}`;
              }
            }
          } else if (timeDiffMinutes === 0) {
            return "Arriving now";
          } else {
            return "Your order is being prepared";
          }
        }
        return "Your order is being prepared";
      case 3:
        return "Your order is on the way";
      case 4:
        return "Your order has been delivered";
      default:
        return "Complete payment to proceed";
    }
  };

  // Function to get animation data based on current step
  const getAnimationData = (step: number) => {
    switch (step) {
      case 0:
        return paymentPendingAnimation;
      case 1:
        return paymentDoneAnimation;
      case 2:
        return preparingAnimation;
      case 3:
        return outForDeliveryAnimation;
      case 4:
        return confirmAnimation;
      default:
        return paymentPendingAnimation;
    }
  };

  // Function to get header background color based on current step
  const getHeaderBgColor = (step: number) => {
    if (step === 0) return "bg-blue-500";
    return "bg-green-500";
  };

  // Function to get button background color based on current step
  const getButtonBgColor = (step: number) => {
    if (step === 0) return "bg-blue-500 text-white hover:bg-blue-600";
    return "bg-green-500 text-white hover:bg-green-600";
  };

  // Function to get progress bar color based on current step
  const getProgressBarColor = (step: number) => {
    if (step === 0) return "bg-gray-300";
    return "bg-green-500";
  };

  // Function to get progress width based on current step
  const getProgressWidth = (step: number) => {
    switch (step) {
      case 0:
        return "0%";
      case 1:
        return "25%";
      case 2:
        return "60%";
      case 3:
        return "80%";
      case 4:
        return "100%";
      default:
        return "0%";
    }
  };

  // Function to format time in 12-hour format
  const formatTime12Hour = (dateString: string) => {
    // Parse the ISO string manually to avoid timezone conversion
    const match = dateString.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    // Fallback to original method
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to fetch order data
  const fetchOrder = async (isRefresh = false) => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    }

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
      setRefreshing(false);
    }
  };

  // Fetch order data on mount
  useEffect(() => {
    fetchOrder();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => fetchOrder(), 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [orderId]);

  // Update current time every minute for arrival time calculation
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Unable to load order details"}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep(order);
  const headerBgColor = getHeaderBgColor(currentStep);
  const buttonBgColor = getButtonBgColor(currentStep);
  const progressBarColor = getProgressBarColor(currentStep);
  const progressWidth = getProgressWidth(currentStep);

  return (
    <div className="flex-1 h-screen md:flex md:items-center md:justify-center w-full">
      <div
        className="md:h-[600px] min-h-screen md:min-h-0 w-full max-w-[800px] mx-auto md:rounded-[32px] overflow-hidden md:shadow-2xl md:pb-[32px]"
        style={{ backgroundColor: "#f5f6fa" }}
      >
        {/* Header Section */}
        <div
          className={`text-white p-4 md:pt-[20px] pt-6 ${headerBgColor} md:relative fixed top-0 left-0 right-0 z-50`}
        >
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/orders"
              className={`flex items-center rounded-full p-2 ${
                currentStep === 0 ? "bg-blue-200" : "bg-green-200"
              }`}
            >
              <ChevronLeft
                className={`h-5 w-5 ${
                  currentStep === 0 ? "text-blue-700" : "text-green-700"
                }`}
              />
            </Link>
            <h2 className="text-[18px] mb-2 font-medium text-white">
              {getStatusText(currentStep)}
            </h2>
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className={`flex items-center justify-center rounded-full h-9 w-9 ${
                currentStep === 0 ? "bg-blue-200" : "bg-green-200"
              } transition-colors hover:opacity-80 disabled:opacity-50`}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  currentStep === 0 ? "text-blue-700" : "text-green-700"
                } ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white/30 text-white px-6 py-2 rounded-full text-sm font-medium">
                {getStatusDescription(currentStep, order)}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="md:overflow-y-auto md:scrollbar-hide md:h-[calc(500px-120px)] pt-[140px] md:pt-0 pb-[100px]">
          {/* Animation and Progress Container */}
          <div className="flex flex-col md:flex-row gap-4 mx-4 mt-4">
            {/* Animation Section */}
            <div className="relative h-[200px] md:h-[300px] md:flex-1 bg-white rounded-[18px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`mx-auto mb-4 ${
                      currentStep === 4 ? "w-32 h-32" : "w-64 h-64"
                    }`}
                  >
                    <Lottie
                      animationData={getAnimationData(currentStep)}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="bg-white rounded-[18px] p-6 md:flex-1">
              {/* Status and Contact */}
              <div className="mb-8">
                <h2 className="text-[20px] font-semibold text-gray-900 mb-1">
                  {getStatusText(currentStep)}
                </h2>
                <p className="text-gray-600 mb-4 text-[14px]">
                  <span
                    className={`text-[14px] font-medium ${
                      currentStep === 0 ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    {currentStep === 0 ? "Awaiting payment" : "In progress"}
                  </span>
                  <span className="mx-1">•</span>
                  {getStatusDescription(currentStep, order)}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-500 ${progressBarColor}`}
                    style={{ width: progressWidth }}
                  />
                </div>

                {/* Steps */}
                <div className="flex justify-between relative">
                  {/* Step 1 - Order Confirmed */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        currentStep >= 1
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Card className="w-6 h-6" weight="Broken" />
                    </div>
                  </div>

                  {/* Step 2 - Preparing */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        currentStep >= 2
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <ChefHatHeart className="w-6 h-6" weight="Broken" />
                    </div>
                  </div>

                  {/* Step 3 - Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        currentStep >= 3
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Scooter className="w-6 h-6" weight="Broken" />
                    </div>
                  </div>

                  {/* Step 4 - Delivered */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        currentStep >= 4
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <HomeSmile className="w-6 h-6" weight="Broken" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="w-full px-5 mt-4">
            <div className="rounded-[18px] bg-white p-4">
              <h3 className="font-semibold text-gray-800 text-[16px] mb-3">
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Number</p>
                  <p className="font-medium text-gray-900">
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">
                    ₹{order.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <p
                    className={`font-medium ${
                      order.payment_status === "paid"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Person Assignment */}
          <div className="w-full px-5 mt-4">
            <div className="rounded-[18px] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/profile/profile-man.png"
                      alt="delivery person"
                      width={30}
                      height={30}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-[16px]">
                      {order.delivery_person_name || "Assigning delivery soon"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {order.delivery_person_contact || "Coming up soon"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Products */}
          <div className="w-full px-5 mt-4">
            <div className="rounded-[18px] bg-white p-4">
              <h3 className="font-semibold text-gray-800 text-[16px] mb-3">
                Order Items
              </h3>
              {order.items && order.items.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between h-[60px]"
                    >
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={60}
                            height={60}
                            className="object-cover rounded-[12px]"
                            style={{ width: "50px", height: "50px" }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{item.unit_price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-4xl mb-2">📦</div>
                  <p className="text-gray-500">Loading order items...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Contact Button */}
        <div className="hidden md:block w-full px-5 mt-4">
          <a
            href="tel:+919876543210"
            className={`w-full py-3 px-6 rounded-full font-medium text-center flex items-center justify-center gap-2 transition-colors ${buttonBgColor}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Contact Duchess Pastry
          </a>
        </div>

        {/* Fixed Mobile Contact Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white z-20">
          <a
            href="tel:+919876543210"
            className={`w-full py-3 px-6 rounded-full font-medium text-center flex items-center justify-center gap-2 transition-colors ${buttonBgColor}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Contact Duchess Pastry
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
