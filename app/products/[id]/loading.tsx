import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
export default function ProductDetailLoading() {
  return (
    <div className="bg-[#f5f5f5] flex flex-col items-center pt-3">
      <div className="max-w-[1200px] flex flex-col min-h-screen mb-20 mx-4 md:mx-4 w-full px-[20px] md:px-0">
        {/* Main content: two columns on desktop, one column on mobile */}
        <div className="flex flex-col md:flex-row md:gap-8 md:px-8 md:pt-0 md:pb-8 flex-1 w-full">
          {/* Left column */}
          <div className="md:w-2/3 flex flex-col gap-6 w-full">
            {/* Top navigation and Hero Image */}
            <div className="relative mt-4 rounded-2xl overflow-hidden">
              {/* Hero Image Skeleton */}
              <div className="relative h-[350px] lg:h-[450px] w-full rounded-2xl overflow-hidden">
                <Skeleton className="w-full h-full rounded-2xl" />
              </div>
            </div>

            {/* Product Info Section */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50 w-full overflow-hidden">
              {/* Category and Rating */}
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>

              {/* Product Name and Veg Indicator */}
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-6 rounded-sm" />
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Description */}
              <div className="mb-7 mt-4">
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20 mt-3" />
              </div>

              {/* Product Highlights */}
              <div className="mb-6">
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4 md:mt-0">
            {/* Pricing and Order Card - Hidden on Mobile */}
            <div className="hidden md:flex w-full bg-white rounded-3xl p-7 flex-col gap-4 h-fit shadow-sm">
              <div className="flex flex-col">
                {/* Price display */}
                <div className="flex items-baseline gap-3 md:flex">
                  <Skeleton className="h-8 w-20" />
                </div>

                {/* Stock Status in Card */}
                <div className="hidden md:block mt-2">
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 w-full"></div>

              {/* Order Type Selection - Hidden on Mobile */}
              <div className="hidden md:block">
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                </div>
              </div>

              {/* Weight Selection - Hidden on Mobile */}
              <div className="hidden md:block">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              </div>

              {/* Add to Cart button */}
              <Skeleton className="h-14 rounded-xl" />
            </div>

            {/* Nutrition Info */}
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <Skeleton className="h-6 w-40 mb-4" />
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-18" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom padding */}
        <div className="h-24 md:h-0"></div>
      </div>
    </div>
  );
}
