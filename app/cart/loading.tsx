export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F4F4F7] dark:bg-[#202028]">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                          <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />

              {/* Coupon Section Skeleton */}
              <div className="mb-6">
                <div className="flex space-x-2 mb-3">
                  <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown Skeleton */}
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Checkout Button Skeleton */}
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />

              {/* Continue Shopping Skeleton */}
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
