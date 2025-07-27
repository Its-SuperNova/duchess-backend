"use client";

import type React from "react";
import { Suspense } from "react";
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
import paymentPendingAnimation from "../../../public/Lottie/payment-pending.json";
import preparingAnimation from "../../../public/Lottie/preparing.json";
import outForDeliveryAnimation from "../../../public/Lottie/out-for-delivery.json";
import confirmAnimation from "../../../public/Lottie/check.json";
import Image from "next/image";
import { useState } from "react";

function TrackOrderPageContent() {
  const [currentStep, setCurrentStep] = useState(1); // 1 = payment pending, 2 = preparing, etc.
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f6fa" }}>
      {/* Header Section */}
      <div
        className={`text-white p-4 ${
          currentStep === 1 ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/orders"
            className={`flex items-center rounded-full p-2 ${
              currentStep === 1 ? "bg-blue-200" : "bg-green-200"
            }`}
          >
            <ChevronLeft
              className={`h-5 w-5 ${
                currentStep === 1 ? "text-blue-700" : "text-green-700"
              }`}
            />
          </Link>
          <h2 className={`text-[18px] mb-2 font-medium text-white`}>
            {currentStep === 4
              ? "Delivered"
              : currentStep === 3
              ? "Out for Delivery"
              : currentStep === 2
              ? "Preparing Order"
              : "Payment Pending"}
          </h2>
          <div
            className={`flex items-center justify-center rounded-full h-9 w-9 ${
              currentStep === 1 ? "bg-blue-200" : "bg-green-200"
            }`}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                currentStep === 1 ? "text-blue-700" : "text-green-700"
              }`}
            />
          </div>
        </div>

        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-white/30 text-white px-6 py-2 rounded-full text-sm font-medium">
              {currentStep === 4
                ? "Your order has been delivered"
                : currentStep === 3
                ? "Your order is on the way"
                : currentStep === 2
                ? "Your order is being prepared"
                : "Complete payment to proceed"}
            </div>
          </div>
        </div>
      </div>

      {/* animation Section */}
      <div className="relative h-[200px] bg-white rounded-[18px] mx-4 mt-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className={`mx-auto mb-4 ${
                currentStep === 4 ? "w-32 h-32" : "w-64 h-64"
              }`}
            >
              <Lottie
                animationData={
                  currentStep === 4
                    ? confirmAnimation
                    : currentStep === 3
                    ? outForDeliveryAnimation
                    : currentStep === 2
                    ? preparingAnimation
                    : paymentPendingAnimation
                }
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white mx-4 mt-4 rounded-[18px] p-6">
        {/* Status and Contact */}
        <div className="mb-8">
          <h2 className="text-[20px] font-semibold text-gray-900 mb-1">
            {currentStep === 4
              ? "Order Delivered"
              : currentStep === 3
              ? "Out for Delivery"
              : currentStep === 2
              ? "Order in Progress"
              : "Payment Pending"}
          </h2>
          <p className="text-gray-600 mb-4 text-[14px]">
            <span
              className={`text-[14px] font-medium ${
                currentStep === 1 ? "text-blue-600" : "text-green-600"
              }`}
            >
              {currentStep === 4
                ? "Completed"
                : currentStep === 3
                ? "On the way"
                : currentStep === 2
                ? "Being prepared"
                : "Awaiting payment"}
            </span>
            <span className="mx-1">•</span>
            {currentStep === 4
              ? "Thank you for your order!"
              : currentStep === 3
              ? "Your order is being delivered to you"
              : currentStep === 2
              ? "Your delicious order is being made"
              : "Complete payment to proceed with your order"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div
              className={`h-full transition-all duration-500 ${
                currentStep === 1 ? "bg-blue-500" : "bg-green-500"
              }`}
              style={{
                width:
                  currentStep >= 4
                    ? "100%"
                    : currentStep >= 3
                    ? "80%"
                    : currentStep >= 2
                    ? "60%"
                    : "25%",
              }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between relative">
            {/* Step 1 - Order Confirmed */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 shadow-lg ${
                  currentStep === 1 ? "bg-blue-500" : "bg-green-500"
                } text-white`}
              >
                <Card className="w-6 h-6" weight="Broken" />
              </div>
            </div>

            {/* Step 2 - Preparing */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(currentStep === 2 ? 1 : 2)}
                className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                  currentStep >= 2
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <ChefHatHeart className="w-6 h-6" weight="Broken" />
              </button>
            </div>

            {/* Step 3 - Out for Delivery */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(currentStep === 3 ? 2 : 3)}
                className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                  currentStep >= 3
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Scooter className="w-6 h-6" weight="Broken" />
              </button>
            </div>

            {/* Step 4 - Delivered */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(currentStep === 4 ? 3 : 4)}
                className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                  currentStep >= 4
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <HomeSmile className="w-6 h-6" weight="Broken" />
              </button>
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
                  Assigning delivery soon
                </h4>
                <p className="text-sm text-gray-500">Coming up soon</p>
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

      {/* Fixed Contact Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white z-20">
        <a
          href="tel:+919876543210"
          className={`w-full py-3 px-6 rounded-full font-medium text-center flex items-center justify-center gap-2 transition-colors ${
            currentStep === 1
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
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
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
