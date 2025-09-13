"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import Hero from "@/components/block/hero";
import ProductCard from "@/components/productcard";
import { ProcessedProduct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

interface HomepageSection {
  id: string;
  name: string;
  title: string;
  description?: string;
  display_order: number;
  max_products: number;
  current_products_count: number;
  products: ProcessedProduct[];
}

export default function HomeClient({
  initialProducts,
  sectionsWithProducts,
}: {
  initialProducts?: ProcessedProduct[];
  sectionsWithProducts?: HomepageSection[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // iOS-specific memory management
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Use sections if available, otherwise fall back to initialProducts for backward compatibility
  const sections =
    sectionsWithProducts ||
    (initialProducts
      ? [
          {
            id: "legacy",
            name: "featured",
            title: "Featured Products",
            description: "Our handpicked selection of premium products",
            display_order: 1,
            max_products: 12,
            current_products_count: initialProducts.length,
            products: initialProducts,
          },
        ]
      : []);

  // Memoize sections to prevent unnecessary re-renders and crashes
  const memoizedSections = useMemo(() => {
    if (!sections || sections.length === 0) return [];

    try {
      return sections.map((section) => ({
        ...section,
        products: section.products.filter(
          (product) =>
            product &&
            product.id &&
            product.name &&
            typeof product === "object" &&
            // Additional validation to prevent rendering crashes
            product.imageUrl !== undefined &&
            product.price !== undefined &&
            product.isVeg !== undefined
        ),
      }));
    } catch (error) {
      console.error("Error processing sections:", error);
      // Return empty array if processing fails to prevent crash
      return [];
    }
  }, [sections]);

  // Add performance monitoring for debugging
  useEffect(() => {
    const totalProducts = memoizedSections.reduce(
      (total, section) => total + section.products.length,
      0
    );
    if (totalProducts > 0) {
      console.log(
        `Rendering ${memoizedSections.length} sections with ${totalProducts} total products on homepage (iOS: ${isIOS})`
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
  }, [memoizedSections, isIOS]);

  return (
    <div className="w-full overflow-x-hidden bg-white dark:bg-gray-900">
      {/* Hero section */}
      <Hero />

      {/* Product Sections */}
      {memoizedSections.length === 0 ? (
        <section className="px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products available at the moment.
            </p>
          </div>
        </section>
      ) : (
        memoizedSections.map((section) => (
          <section key={section.id} className="px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-gray-600 mt-2">{section.description}</p>
                )}
              </div>
            </div>

            {/* Products display */}
            <div className="relative">
              {section.products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No products in this section at the moment.
                  </p>
                </div>
              ) : (
                // Show products with iOS-specific optimization
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {section.products.map((p, i) => {
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
            </div>
          </section>
        ))
      )}

      {/* View all button */}
      <div className="flex justify-center mt-6 px-4">
        <Link href="/products">
          <Button variant="outline">View all products</Button>
        </Link>
      </div>
    </div>
  );
}
