import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IoIosArrowBack } from "react-icons/io";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#F5F6FB] pb-28">
      {/* Header */}
      <div className="bg-[#F5F6FB]">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <div className="bg-white p-3 md:p-2 rounded-full shadow-sm">
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </div>
            <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              Checkout
            </h1>
            <div className="w-9 md:hidden"></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 order-1">
            {/* Product Item Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex w-full min-w-0">
                  {/* Product image */}
                  <Skeleton className="h-[88px] w-[88px] rounded-[20px] mr-3 shrink-0" />

                  {/* Product details */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1 w-full min-w-0">
                        <Skeleton className="h-4 w-32 mb-1 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between w-full">
                      <Skeleton className="h-4 w-16 rounded" />
                      <div className="flex items-center gap-2 bg-[#F5F4F7] rounded-full p-1">
                        <Skeleton className="h-[26px] w-[26px] rounded-full" />
                        <Skeleton className="h-4 w-6 rounded" />
                        <Skeleton className="h-[26px] w-[26px] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              </div>
            </div>

            {/* Customization Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-3 rounded" />
                <Skeleton className="h-5 w-32 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-3 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
              <div className="space-y-4">
                {/* Delivery Time */}
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 mr-3 rounded flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 mr-3 rounded flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2 rounded" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48 rounded" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 mr-3 rounded flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-20 mb-2 rounded" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40 rounded" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bill Details & Payment */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            {/* Bill Details - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white mx-4 p-4 rounded-[22px] border border-gray-200">
                <div className="flex items-center mb-3 gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <div className="pt-2 mt-2">
                    <div className="w-full h-[1.5px] bg-gray-200 rounded-full"></div>
                    <div className="flex justify-between mt-2">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section - Desktop */}
            <div className="hidden lg:block mx-4 mt-4">
              <div className="bg-white p-4 rounded-[22px] border border-gray-200">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <Skeleton className="w-full h-[200px] rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-5 w-20 mb-3 rounded" />
                    <Skeleton className="h-4 w-full mb-2 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bill Details and Payment Sections */}
        <div className="lg:hidden space-y-4 mt-6">
          {/* Product Item - Mobile */}
          <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex w-full min-w-0">
                {/* Product image */}
                <Skeleton className="h-[88px] w-[88px] rounded-[20px] mr-3 shrink-0" />

                {/* Product details */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1 w-full min-w-0">
                      <Skeleton className="h-4 w-32 mb-1 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between w-full">
                    <Skeleton className="h-4 w-16 rounded" />
                    <div className="flex items-center gap-2 bg-[#F5F4F7] rounded-full p-1">
                      <Skeleton className="h-[26px] w-[26px] rounded-full" />
                      <Skeleton className="h-4 w-6 rounded" />
                      <Skeleton className="h-[26px] w-[26px] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Details - Mobile */}
          <div className="bg-white mx-4 p-4 rounded-[22px] border border-gray-200">
            <div className="flex items-center mb-3 gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="pt-2 mt-2">
                <div className="w-full h-[1.5px] bg-gray-200 rounded-full"></div>
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section - Mobile */}
          <div className="bg-white mx-4 p-4 pb-6 rounded-[22px] border border-gray-200">
            <div>
              <Skeleton className="h-5 w-20 mb-3 rounded" />
              <Skeleton className="w-full h-[250px] rounded-lg mb-4" />
              <Skeleton className="h-4 w-full mb-2 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>

          {/* Cancellation Policy - Mobile */}
          <div className="mx-4 px-4">
            <Skeleton className="h-4 w-32 mb-2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        </div>

        {/* Fixed bottom Place Order bar skeleton (mobile only) */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 lg:hidden">
          <div className="mx-auto px-4 py-3 w-full max-w-[1200px]">
            <Skeleton className="w-full h-12 rounded-[18px] mb-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
