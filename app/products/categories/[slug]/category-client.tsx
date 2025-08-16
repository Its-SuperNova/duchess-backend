"use client";

import { useSimpleInfiniteProducts } from "@/hooks/use-simple-infinite-products";
import ProductCard from "@/components/productcard";
import { LoadingSpinnerWithText } from "@/components/ui/loading-spinner";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryClientProps {
  categorySlug: string;
  categoryName: string;
}

export default function CategoryClient({
  categorySlug,
  categoryName,
}: CategoryClientProps) {
  const {
    products,
    isLoading,
    hasMore,
    error,
    observerRef,
    isIntersectionLoading,
  } = useSimpleInfiniteProducts({
    categorySlug,
    pageSize: 4,
  });

  // Debug logging
  console.log("CategoryClient render:", {
    products: products.length,
    isLoading,
    hasMore,
    error,
    isIntersectionLoading,
  });

  // Calculate price from product options
  const calculatePrice = (product: any) => {
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
      (product.weight_options?.length > 0 || product.piece_options?.length > 0)
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
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto md:px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? "s" : ""} loaded
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any, i) => {
            const { price, originalPrice } = calculatePrice(product);

            return (
              <ProductCard
                key={`${product.id}-${i}`}
                id={product.id}
                name={product.name}
                rating={4.5}
                imageUrl={product.banner_image || "/images/categories/cake.png"}
                price={price}
                originalPrice={
                  originalPrice > price ? originalPrice : undefined
                }
                isVeg={product.is_veg}
                description={product.name}
                category={product.categories?.name}
                hasOffer={product.has_offer}
                offerPercentage={product.offer_percentage}
                priority={i < 4}
              />
            );
          })}
        </div>

        {/* Intersection Observer Target */}
        {hasMore && (
          <div ref={observerRef} className="w-full py-8 flex justify-center">
            {isIntersectionLoading ? (
              <LoadingSpinnerWithText text="Loading more products..." />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Scroll down to load more
                </p>
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
          </div>
        )}
      </div>
    </div>
  );
}
