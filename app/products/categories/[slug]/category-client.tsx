"use client";

import { useSimpleInfiniteProducts } from "@/hooks/use-simple-infinite-products";
import ProductCard from "@/components/productcard";
import { LoadingSpinnerWithText } from "@/components/ui/loading-spinner";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryClientProps {
  categorySlug: string;
  categoryName: string;
  initialProducts: any[];
}

export default function CategoryClient({
  categorySlug,
  categoryName,
  initialProducts,
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
    initialData: initialProducts, // ✅ hydrate with server data
  });

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
    } else if (product.selling_type === "both") {
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

    if (product.has_offer && product.offer_percentage && price > 0) {
      originalPrice = price;
      price = price * (1 - product.offer_percentage / 100);
    }

    if (price <= 0) {
      price = 100;
    }

    return { price, originalPrice };
  };

  if (error) {
    return (
      <div className="w-full">
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
    return <ProductSkeletonGrid count={4} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
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
    );
  }

  return (
    <div className="w-full">
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
              originalPrice={originalPrice > price ? originalPrice : undefined}
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

      {hasMore && (
        <div ref={observerRef} className="w-full py-8">
          {isIntersectionLoading ? (
            <LoadingSpinnerWithText text="Loading more products..." />
          ) : (
            <div className="flex justify-center">
              <p className="text-sm text-gray-500">Scroll down to load more</p>
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            You've reached the end of all products in this category!
          </p>
        </div>
      )}
    </div>
  );
}
