import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Category Title Skeleton */}
        <Skeleton className="h-10 w-48 mb-6" />

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-[24px]">
              {/* Product Image Skeleton with Favorite Button */}
              <div className="relative">
                <Skeleton className="h-48 w-full rounded-[28px]" />
                {/* Favorite Button Skeleton */}
                <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Product Details Skeleton */}
              <div className="p-4">
                {/* Category and Product Name Row */}
                <div className="flex justify-between items-end mb-2">
                  <div className="flex-1">
                    {/* Category Skeleton */}
                    <Skeleton className="h-3 w-16 mb-1" />
                    {/* Product Name Skeleton */}
                    <Skeleton className="h-6 w-3/4 mb-2" />
                  </div>
                  {/* Veg Indicator Skeleton */}
                  <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Rating and Price Row */}
                <div className="flex justify-between items-center">
                  {/* Rating Skeleton */}
                  <div className="flex items-center bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                    <Skeleton className="w-4 h-4 rounded mr-1" />
                    <Skeleton className="w-6 h-4 rounded" />
                  </div>
                  {/* Price Skeleton */}
                  <Skeleton className="w-16 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
