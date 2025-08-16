"use client";

import { useOptimizedInfiniteProducts } from "@/hooks/use-optimized-infinite-products";
import ProductCard from "@/components/productcard";
import { LoadingSpinnerWithText } from "@/components/ui/loading-spinner";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { memo, useMemo, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  banner_image: string;
  is_veg: boolean;
  has_offer: boolean;
  offer_percentage: number;
  weight_options: any[];
  piece_options: any[];
  selling_type: string;
  categories: {
    name: string;
  }[];
}

interface CategoryClientProps {
  categorySlug: string;
  categoryName: string;
  initialProducts: Product[];
  initialHasMore: boolean;
  totalCount: number;
}

const CategoryClient = memo(function CategoryClient({
  categorySlug,
  categoryName,
  initialProducts,
  initialHasMore,
  totalCount,
}: CategoryClientProps) {
  const {
    products,
    isLoading,
    hasMore,
    error,
    observerRef,
    isIntersectionLoading,
    loadMore,
  } = useOptimizedInfiniteProducts({
    categorySlug,
    pageSize: 4,
    initialProducts,
    initialHasMore,
    totalCount,
  });

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`CategoryClient render time: ${endTime - startTime}ms`);
    };
  });

  // Debug logging
  console.log("CategoryClient render:", {
    products: products.length,
    isLoading,
    hasMore,
    error,
    isIntersectionLoading,
    initialProductsCount: initialProducts.length,
    totalCount,
  });

  // Calculate price from product options - OPTIMIZED with memoization
  const calculatePrice = useMemo(() => {
    return (product: Product) => {
      let price = 0;
      let originalPrice = 0;

      if (
        product.selling_type === "weight" &&
        product.weight_options?.length > 0
      ) {
        const activeOption = product.weight_options.find(
          (opt: any) => opt.isActive
        );
        if (activeOption) {
          price = parseFloat(activeOption.price) || 0;
          originalPrice = price;
        }
      } else if (
        product.selling_type === "piece" &&
        product.piece_options?.length > 0
      ) {
        const activeOption = product.piece_options.find(
          (opt: any) => opt.isActive
        );
        if (activeOption) {
          price = parseFloat(activeOption.price) || 0;
          originalPrice = price;
        }
      } else if (
        product.selling_type === "both" &&
        (product.weight_options?.length > 0 ||
          product.piece_options?.length > 0)
      ) {
        if (product.weight_options?.length > 0) {
          const activeWeightOption = product.weight_options.find(
            (opt: any) => opt.isActive
          );
          if (activeWeightOption) {
            price = parseFloat(activeWeightOption.price) || 0;
            originalPrice = price;
          }
        }
        if (price === 0 && product.piece_options?.length > 0) {
          const activePieceOption = product.piece_options.find(
            (opt: any) => opt.isActive
          );
          if (activePieceOption) {
            price = parseFloat(activePieceOption.price) || 0;
            originalPrice = price;
          }
        }
      }

      // Apply offer if available
      if (product.has_offer && product.offer_percentage && price > 0) {
        originalPrice = price;
        price = price * (1 - product.offer_percentage / 100);
      }

      // If no price found, use a fallback
      if (price <= 0) {
        price = 100;
      }

      return { price, originalPrice };
    };
  }, []);

  // Memoize product cards to prevent unnecessary re-renders
  const productCards = useMemo(() => {
    return products.map((product: Product, i) => {
      const { price, originalPrice } = calculatePrice(product);

      return (
        <ProductCard
          key={`${product.id}-${i}`}
          id={product.id}
          name={product.name}
          rating={4.5}
          imageUrl={product.banner_image || "/images/categories/cake.png"}
          price={price}
          originalPrice={originalPrice > price ? originalPrice : undefined}
          isVeg={product.is_veg}
          description={product.name}
          category={product.categories?.[0]?.name}
          hasOffer={product.has_offer}
          offerPercentage={product.offer_percentage}
          priority={i < 4}
        />
      );
    });
  }, [products, calculatePrice]);

  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-sm text-gray-600 mt-4">
          Please refresh the page to try again.
        </p>
      </div>
    );
  }

  // Show loading only if we don't have initial products
  if (isLoading && products.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold capitalize mb-6">{categoryName}</h1>
        <ProductSkeletonGrid count={4} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found in this category
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any products in the "{categoryName}" category.
          </p>
          <p className="text-sm text-gray-500">
            Please check back later or try a different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4 py-8">
        <div className="max-w-[1200px] mx-auto md:px-4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
            <div className="text-right">
              <p className="text-gray-600">
                {products.length} of {totalCount} products loaded
              </p>
              {totalCount > products.length && (
                <p className="text-sm text-gray-500">Scroll to load more</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productCards}
          </div>

          {/* Intersection Observer Target */}
          {hasMore && (
            <div ref={observerRef} className="w-full py-8 flex justify-center">
              {isIntersectionLoading ? (
                <LoadingSpinnerWithText text="Loading more products..." />
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Scroll down to load more
                  </p>
                  {/* Debug info */}
                  <div className="text-xs text-gray-400 mb-4">
                    <p>Products loaded: {products.length}</p>
                    <p>Total available: {totalCount}</p>
                    <p>Has more: {hasMore ? "Yes" : "No"}</p>
                    <p>Current page: {Math.floor(products.length / 4)}</p>
                  </div>
                  {/* Manual load more button as fallback */}
                  <button
                    onClick={() => {
                      console.log("Manual load more clicked");
                      loadMore();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          )}

          {/* End of products indicator */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600">
                You've reached the end of all products in this category!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total: {totalCount} products
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default CategoryClient;
