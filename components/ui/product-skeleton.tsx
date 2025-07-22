import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-[24px] animate-pulse",
        className
      )}
    >
      {/* Product Image Skeleton */}
      <div className="relative">
        <div className="h-48 w-full rounded-[28px] bg-gray-200 dark:bg-gray-700" />
        {/* Favorite Button Skeleton */}
        <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Product Details Skeleton */}
      <div className="p-4">
        {/* Category and Product Name Row */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex-1">
            {/* Category Skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1" />
            {/* Product Name Skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
          {/* Veg Indicator Skeleton */}
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Rating and Price Row */}
        <div className="flex justify-between items-center">
          {/* Rating Skeleton */}
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-1" />
            <div className="w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          {/* Price Skeleton */}
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
