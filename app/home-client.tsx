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
    }
  );

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

        {isLoading ? (
          // Show skeletons while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          // Show products
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                {...p}
                priority={i < 4} // preload first 4 images
              />
            ))}
          </div>
        )}

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
