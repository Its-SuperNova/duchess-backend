import { Loader2 } from "lucide-react";

export default function PricingLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









