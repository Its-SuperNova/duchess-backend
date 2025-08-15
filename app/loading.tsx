import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Skeleton */}
      <div className="relative h-96 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-6" />
            <Skeleton className="h-12 w-32 mx-auto" />
          </div>
        </div>
      </div>

      {/* Products Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map(
            (
              _,
              i // Exactly 12 featured products
            ) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-[24px] p-4"
              >
                <Skeleton className="h-48 w-full rounded-[28px] mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
