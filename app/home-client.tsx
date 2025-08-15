"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import Hero from "@/components/block/hero";
import ProductCard from "@/components/productcard";
import { processProductForHomepage, ProcessedProduct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Fetcher function for SWR
const fetchProducts = async (): Promise<ProcessedProduct[]> => {
  const res = await fetch("/api/products/homepage", {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.products.map(processProductForHomepage);
};

// Skeleton loader for products
const ProductSkeleton = () => (
  <div className="bg-white rounded-[24px] animate-pulse">
    <div className="h-48 w-full bg-gray-200 rounded-[28px]" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-3/4 bg-gray-200 rounded" />
    </div>
  </div>
);

export default function HomeClient({
  initialProducts,
}: {
  initialProducts: ProcessedProduct[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const {
    data: products = initialProducts,
    isLoading,
    mutate,
  } = useSWR<ProcessedProduct[]>(
    isClient ? "/api/products/homepage" : null,
    fetchProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
      fallbackData: initialProducts,
      errorRetryCount: 2, // Limit retries to prevent infinite loops
      errorRetryInterval: 5000, // 5 second delay between retries
      keepPreviousData: true, // Keep previous data while loading new data
      revalidateIfStale: true, // Revalidate if data is stale
      // Add timeout to prevent hanging requests
      onSuccess: (data) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("Homepage products loaded successfully:", data.length);
        }
      },
      onError: (error) => {
        console.error("SWR error in homepage:", error);
        // Prevent infinite error loops
        if (error.message.includes("Failed to fetch")) {
          console.warn("Network error, will retry with backoff");
        }
      },
    }
  );

  // iOS-specific memory management
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Memoize products to prevent unnecessary re-renders and crashes
  const memoizedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    try {
      // Ensure we have valid product data before rendering
      const validProducts = products.filter(
        (product) =>
          product &&
          product.id &&
          product.name &&
          typeof product === "object" &&
          // Additional validation to prevent rendering crashes
          product.imageUrl !== undefined &&
          product.price !== undefined &&
          product.isVeg !== undefined
      );

      // iOS: Limit to 8 products to prevent memory issues
      // Android: Show all 12 products
      const maxProducts = isIOS ? 8 : 12;
      return validProducts.slice(0, maxProducts);
    } catch (error) {
      console.error("Error processing products:", error);
      // Return empty array if processing fails to prevent crash
      return [];
    }
  }, [products, isIOS]);

  // Add performance monitoring for debugging
  useEffect(() => {
    if (memoizedProducts.length > 0) {
      console.log(
        `Rendering ${memoizedProducts.length} products on homepage (iOS: ${isIOS})`
      );
      // Monitor memory usage in development
      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined"
      ) {
        if ("memory" in performance) {
          console.log("Memory usage:", (performance as any).memory);
        }
        // iOS-specific memory warning
        if (isIOS) {
          console.warn("iOS detected - using memory-optimized rendering");
        }
      }
    }
  }, [memoizedProducts.length, isIOS]);

  const retryFetch = async () => {
    try {
      await mutate();
      toast.success("Products refreshed");
    } catch {
      toast.error("Failed to refresh products");
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-white dark:bg-gray-900">
      {/* Hero section */}
      <Hero />

      {/* Featured Products */}
      <section className="px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Button onClick={retryFetch} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Error boundary wrapper for products */}
        <div className="relative">
          {memoizedProducts.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products available at the moment.
              </p>
              <Button onClick={retryFetch} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {isLoading ? (
                // Show skeletons while loading (iOS-optimized)
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: isIOS ? 8 : 12 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : (
                // Show products with iOS-specific optimization
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {memoizedProducts.map((p, i) => {
                    try {
                      return (
                        <ProductCard
                          key={p.id}
                          {...p}
                          priority={i < (isIOS ? 2 : 4)} // iOS: preload only 2, Android: preload 4
                        />
                      );
                    } catch (error) {
                      console.error(`Error rendering product ${p.id}:`, error);
                      // Return skeleton as fallback instead of crashing
                      return <ProductSkeleton key={`error-${p.id}`} />;
                    }
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* View all button */}
        <div className="flex justify-center mt-6">
          <Link href="/products">
            <Button variant="outline">View all products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
