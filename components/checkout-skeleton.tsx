import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F6FB] pb-28">
      {/* Header Skeleton */}
      <div className="bg-[#F5F6FB]">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-6 w-24 absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none" />
            <div className="w-9 md:hidden"></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Note Section Skeleton */}
            <Card className="mx-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </Card>

            {/* Address Section Skeleton */}
            <Card className="mx-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
              <Skeleton className="h-16 w-full rounded" />
            </Card>

            {/* Contact Section Skeleton */}
            <Card className="mx-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded" />
                <Skeleton className="h-12 w-full rounded" />
              </div>
            </Card>

            {/* Customization Section Skeleton */}
            <Card className="mx-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-6 w-12 rounded" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Section Skeleton */}
            <Card className="mx-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-32 w-full rounded" />
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <Card className="mx-4 p-4">
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-3 rounded" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>

              {/* Cart Items Skeleton */}
              <div className="space-y-3 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-16 rounded" />
                        <Skeleton className="h-4 w-12 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown Skeleton */}
              <div className="space-y-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                ))}
              </div>

              {/* Total Skeleton */}
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </div>

              {/* Place Order Button Skeleton */}
              <Skeleton className="h-12 w-full rounded-lg" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
