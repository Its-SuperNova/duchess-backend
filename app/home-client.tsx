"use client";

import { useMemo } from "react";
import Hero from "@/components/block/hero";
import ProductCard from "@/components/productcard";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import {
  processProductForHomepage,
  isProductInStock,
  type ProcessedProduct,
} from "@/lib/utils";
import { toast } from "sonner";
import { useLayout } from "@/context/layout-context";

interface HomeClientProps {
  // Remove products prop since we'll fetch them dynamically
}

export default function HomeClient(props: HomeClientProps) {
  // Use cached products data with SWR
  const {
    products: rawProducts,
    isLoading: isLoadingProducts,
    error: productsError,
    refresh,
  } = useProducts();

  // Get layout information for responsive padding
  let getLayoutClasses = () => ({
    isCompact: false,
    isVeryCompact: false,
    mainContentClasses: "",
  });
  try {
    const layoutContext = useLayout();
    getLayoutClasses = layoutContext.getLayoutClasses;
  } catch (error) {
    // Layout context not available, use default values
  }

  const { isCompact, isVeryCompact } = getLayoutClasses();

  // Memoize responsive padding calculation
  const homePadding = useMemo(() => {
    return isVeryCompact ? "px-2" : isCompact ? "px-4" : "";
  }, [isVeryCompact, isCompact]);

  // Process and filter products from cached data
  const products = useMemo(() => {
    if (!rawProducts) return [];

    return rawProducts
      .filter((product) => isProductInStock(product))
      .map((product) => processProductForHomepage(product));
  }, [rawProducts]);

  const retryFetchProducts = async () => {
    try {
      await refresh();
      toast.success("Products loaded successfully");
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error("Failed to load products");
    }
  };

  // Product skeleton loader component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-[24px]">
      {/* Image skeleton */}
      <div className="relative">
        <div className="h-48 w-full bg-gray-200 animate-pulse rounded-[28px]" />
      </div>

      {/* Product details skeleton */}
      <div className="p-4">
        {/* Category and Product Name row with Veg indicator */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex-1">
            {/* Category skeleton */}
            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-2" />
            {/* Product name skeleton */}
            <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
          </div>

          {/* Veg indicator skeleton */}
          <div className="flex justify-end mb-[14px]">
            <div className="w-6 h-6 md:w-5 md:h-5 bg-gray-200 animate-pulse rounded-lg md:rounded-md" />
          </div>
        </div>

        {/* Rating and Price row */}
        <div className="flex justify-between items-center">
          {/* Rating skeleton */}
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full mr-1" />
            <div className="w-6 h-4 bg-gray-200 animate-pulse rounded" />
          </div>

          {/* Price skeleton - simplified to single price */}
          <div className="flex items-center">
            <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  // Products error component
  const ProductsError = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Failed to load products
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We couldn't load the products. Please try again.
        </p>
        <Button
          onClick={retryFetchProducts}
          variant="outline"
          className="mx-auto"
          disabled={isLoadingProducts}
        >
          {isLoadingProducts ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </div>
    </div>
  );

  // Products empty state component
  const ProductsEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No products available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Our delicious products will appear here once they're added to the
          catalog.
        </p>
        <Button
          onClick={retryFetchProducts}
          variant="outline"
          className="mx-auto"
          disabled={isLoadingProducts}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={`w-full overflow-x-hidden bg-white dark:bg-gray-900 ${homePadding}`}
    >
      {/* Hero Section */}
      <div className="w-full">
        <Hero />
      </div>

      {/* Products Section */}
      <div className="w-full">
        <section className="px-4 py-8 pt-0 md:pt-8 md:px-6 lg:px-8 w-full">
          {/* Products Grid with Loading States */}
          {isLoadingProducts ? (
            <>
              {/* Loading state for section title */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Popular Products
                </h2>
              </div>
              {productsError ? (
                <ProductsError />
              ) : products.length === 0 ? (
                <ProductsEmpty />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      rating={product.rating}
                      imageUrl={product.imageUrl}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      isVeg={product.isVeg}
                      description={product.description}
                      category={product.category}
                      hasOffer={product.hasOffer}
                      offerPercentage={product.offerPercentage}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Why We Are Best Banner - Mobile/Tablet Version */}
        <div className="block lg:hidden px-4 md:px-6 py-6 md:py-8 mb-20 w-full">
          <div className="rounded-3xl overflow-hidden shadow-md w-full">
            <Image
              src="/images/duchess-pastries-banner-mobile.png"
              alt="Why we are the best - Handcrafted fresh daily, delivered with care, affordable prices, and loved by thousands"
              width={800}
              height={200}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Why We Are Best Banner - Desktop Version */}
        <div className="hidden lg:block px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full">
          <div className="rounded-3xl overflow-hidden shadow-md w-full">
            <Image
              src="/images/duchess-pastries-banner-desktop.png"
              alt="Why we are the best - Handcrafted fresh daily, delivered with care, affordable prices, and loved by thousands"
              width={1280}
              height={320}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
