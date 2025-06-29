import { Skeleton } from "@/components/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="bg-[#f5f5f5] flex flex-col items-center pt-3">
      <div className="max-w-[1300px] flex flex-col min-h-screen mb-20 mx-4">
        {/* Back Button Skeleton */}
        <div className="mt-2 md:p-8 md:pb-0">
          <Skeleton className="w-10 h-10 rounded-[14px] bg-white border border-gray-200" />
        </div>

        {/* Main content: two columns on desktop, one column on mobile */}
        <div className="flex flex-col md:flex-row md:gap-8 md:px-8 md:pt-0 md:pb-8 flex-1">
          {/* Left column skeleton */}
          <div className="md:w-2/3 flex flex-col gap-6">
            {/* Hero Image Skeleton */}
            <div className="relative mt-4 rounded-2xl overflow-hidden">
              <Skeleton className="h-[350px] lg:h-[450px] w-full rounded-2xl bg-white border border-gray-200" />

              {/* Dots skeleton */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {[1, 2, 3, 4].map((index) => (
                  <Skeleton
                    key={index}
                    className="w-2 h-2 rounded-full bg-white/50"
                  />
                ))}
              </div>
            </div>

            {/* Product Info Section Skeleton */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
              {/* Category and Rating Row */}
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Product Name and Veg Indicator */}
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="w-6 h-6 rounded-sm" />
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-1.5 mt-2 mb-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Description Section */}
              <div className="mb-7 mt-4">
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-4 w-20 mt-3" />
              </div>

              {/* Highlights Section */}
              <div className="mb-6">
                <Skeleton className="h-6 w-20 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((index) => (
                    <Skeleton key={index} className="h-8 w-20 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Ingredients Section */}
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="flex flex-wrap gap-3 items-center">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <Skeleton key={index} className="h-10 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4">
            {/* Pricing and Order Card Skeleton */}
            <div className="w-full bg-white rounded-3xl p-7 flex flex-col gap-5 h-fit shadow-sm">
              {/* Price display */}
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Stock Status in Card */}
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>

              {/* Divider */}
              <Skeleton className="h-px w-full" />

              {/* Order Type Selection */}
              <div>
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                  <Skeleton className="flex-1 h-12 rounded-lg" />
                </div>
              </div>

              {/* Weight/Piece Selection */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((index) => (
                    <Skeleton key={index} className="h-12 rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              {/* Add to Cart button */}
              <Skeleton className="h-14 w-full rounded-xl hidden md:block" />
            </div>

            {/* Nutrition Info Skeleton */}
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <Skeleton className="h-6 w-40 mb-4" />

              {/* Calories and Net Weight */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>

              <Skeleton className="h-px w-full my-4" />

              {/* Nutrition List */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CakeDeliveryCard Skeleton */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
