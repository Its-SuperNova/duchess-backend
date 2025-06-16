import { Skeleton } from "@/components/ui/skeleton"
import { BsArrowLeft } from "react-icons/bs"

export default function Loading() {
  return (
    <div className="bg-[#f5f5f5] flex flex-col items-center">
      <div className="max-w-[1300px] flex flex-col min-h-screen mb-20 mx-4">
        {/* Main content: two columns on desktop, one column on mobile */}
        <div className="flex flex-col md:flex-row md:gap-8 md:p-8 flex-1">
          {/* Left column */}
          <div className="md:w-2/3 flex flex-col gap-6">
            {/* Hero Image Section */}
            <div className="relative mt-4 rounded-2xl overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-[350px] lg:h-[450px] w-full rounded-2xl overflow-hidden">
                <Skeleton className="h-full w-full rounded-2xl" />

                {/* Nav buttons */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                  <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                    <BsArrowLeft className="text-gray-800" size={20} />
                  </button>

                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                </div>

                {/* Skeleton thumbnails */}
                <div className="absolute bottom-3 left-0 right-0 px-3">
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <Skeleton
                        key={index}
                        className="w-16 h-16 rounded-xl flex-shrink-0 border-2 border-transparent"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Section - Enhanced */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
              {/* Category and Rating */}
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>

              {/* Product Name and Veg Indicator */}
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="w-6 h-6 rounded-sm" />
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-1.5 mt-2 mb-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Description */}
              <div className="mb-7 mt-4">
                <Skeleton className="font-semibold text-lg h-6 w-32 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-5 w-24 mt-3" />
              </div>

              {/* Product Highlights */}
              <div className="mb-6">
                <Skeleton className="font-semibold text-lg h-6 w-28 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <Skeleton key={index} className="h-8 w-24 rounded-full px-4 py-1.5" />
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Skeleton className="font-semibold text-lg h-6 w-32 mb-3" />
                <div className="flex flex-wrap gap-3 items-center">
                  {[1, 2, 3, 4].map((_, index) => (
                    <Skeleton key={index} className="h-10 w-24 rounded-full px-3 py-2" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column (Weight, Price, Add to Cart) - only on md and up */}
          <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4">
            {/* Card 1: Order Type, Select Weight/Quantity, Price, Add to Cart */}
            <div className="w-full bg-white rounded-3xl p-7 flex flex-col gap-5 h-fit shadow-sm">
              {/* Price display */}
              <div className="flex items-baseline gap-3 md:flex hidden">
                <Skeleton className="h-8 w-24 md:block hidden" />
                <Skeleton className="h-6 w-20 md:block hidden" />
              </div>

              {/* Stock Status in Card */}
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 w-full"></div>

              {/* Order Type */}
              <div>
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                </div>
              </div>

              {/* Weight Selection */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <Skeleton key={index} className="h-12 rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>

              {/* Add to Cart button (hide on mobile) */}
              <Skeleton className="h-12 w-full rounded-xl hidden md:flex" />
            </div>

            {/* Card 2: Nutrition Info */}
            <div className="p-6 bg-white rounded-2xl shadow-sm hidden md:block">
              <Skeleton className="h-6 w-48 mb-4" />
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cake Delivery Card Skeleton */}
        <div className="mx-4 md:mx-8 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Price and Add to Cart - Sticky at bottom for mobile */}
        <div className="fixed bottom-20 left-0 right-0 bg-white p-4 border-t border-gray-200 flex items-center justify-between z-40 md:hidden">
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
          <Skeleton className="rounded-full px-6 py-3 h-12 w-36" />
        </div>

        {/* Add padding at the bottom for mobile sticky button */}
        <div className="h-24 md:h-0"></div>
      </div>
    </div>
  )
}
