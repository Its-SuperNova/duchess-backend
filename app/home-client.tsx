"use client";

import { useEffect, useState } from "react";
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
  const [visibleCount, setVisibleCount] = useState(8); // Start with 8 products like products page
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
      keepPreviousData: true, // Keep previous data while loading new data (like products page)
      revalidateIfStale: true, // Revalidate if data is stale
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

  // Progressive loading function - same pattern as products page
  const loadMoreProducts = async () => {
    if (isLoadingMore || visibleCount >= products.length) return;

    setIsLoadingMore(true);

    // Simulate loading delay for smooth UX (like products page)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 4, products.length));
      setIsLoadingMore(false);
    }, 300);
  };

  // Intersection Observer for infinite scroll (like products page)
  useEffect(() => {
    if (typeof window === "undefined" || visibleCount >= products.length)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && visibleCount < products.length) {
            loadMoreProducts();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start loading 100px before reaching the element
      }
    );

    // Observe the last visible product to trigger loading more
    const lastProduct = document.querySelector("[data-last-product]");
    if (lastProduct) {
      observer.observe(lastProduct);
    }

    return () => observer.disconnect();
  }, [visibleCount, products.length]);

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
          {products.length === 0 && !isLoading ? (
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
                // Show skeletons while loading
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : (
                // Show products progressively (like products page) with error boundary
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.slice(0, visibleCount).map((p, i) => {
                    try {
                      return (
                        <ProductCard
                          key={p.id}
                          {...p}
                          priority={i < 4} // preload first 4 images
                          data-last-product={
                            i === visibleCount - 1 ? "true" : undefined
                          }
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

              {/* Skeleton loading for remaining products (like products page) */}
              {!isLoading && visibleCount < products.length && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {Array.from({
                    length: Math.min(4, products.length - visibleCount),
                  }).map((_, index) => (
                    <ProductSkeleton key={`skeleton-${index}`} />
                  ))}
                  {/* Loading indicator */}
                  {isLoadingMore && (
                    <div className="col-span-full flex justify-center py-4">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-sm">
                          Loading more products...
                        </span>
                      </div>
                    </div>
                  )}
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
