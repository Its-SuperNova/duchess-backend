import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface CartSkeletonProps {
  itemCount?: number;
}

export default function CartSkeleton({ itemCount = 3 }: CartSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F7] dark:bg-[#202028]">
      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto py-6">
        {/* Cart Items */}
        <div className="p-4 lg:p-6 mb-6">
          <Skeleton className="h-6 w-24 mb-4" />

          {/* Cart Items Skeletons */}
          <div className="space-y-3 lg:space-y-4">
            {Array.from({ length: itemCount }, (_, index) => (
              <Card
                key={index}
                className="p-3 lg:p-4 rounded-[16px] lg:rounded-[22px] border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex w-full min-w-0">
                    {/* Product Image Skeleton */}
                    <div className="relative h-[72px] w-[72px] lg:h-[88px] lg:w-[88px] rounded-[16px] lg:rounded-[20px] overflow-hidden mr-3 lg:mr-3 shrink-0">
                      <Skeleton className="w-full h-full" />
                    </div>

                    {/* Product Details Skeleton */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      {/* Top row */}
                      <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                        {/* Name and category skeleton */}
                        <div className="flex-1 w-full min-w-0">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>

                        {/* Remove button skeleton */}
                        <Skeleton className="h-5 w-5 shrink-0 self-start" />
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between w-full mt-2 lg:mt-0">
                        {/* Price skeleton */}
                        <Skeleton className="h-5 w-16" />

                        {/* Quantity controls skeleton */}
                        <div className="flex items-center gap-1 lg:gap-2 bg-[#F5F4F7] rounded-full p-1 shrink-0">
                          <Skeleton className="w-[24px] h-[24px] lg:w-[26px] lg:h-[26px] rounded-full" />
                          <Skeleton className="w-6 h-4" />
                          <Skeleton className="w-[24px] h-[24px] lg:w-[26px] lg:h-[26px] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Desktop Checkout Section Skeleton - Hidden on mobile */}
        <div className="hidden lg:block p-4 lg:p-6">
          <div className="max-w-[360px] ml-auto flex flex-col gap-3 items-end">
            {/* Estimated Total Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Tax Info Skeleton */}
            <Skeleton className="h-3 w-[300px]" />

            {/* Checkout Button Skeleton */}
            <Skeleton className="w-full h-[48px] rounded-[18px]" />
          </div>
        </div>
      </div>

      {/* Mobile Checkout Section Skeleton - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="p-4 flex flex-col gap-4">
          {/* Estimated Total Skeleton */}
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>

          {/* Tax Info Skeleton */}
          <Skeleton className="h-3 w-full" />

          {/* Checkout Button Skeleton */}
          <Skeleton className="w-full h-[48px] rounded-[18px]" />
        </div>
        {/* Add bottom padding to prevent content from being hidden behind fixed checkout */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
