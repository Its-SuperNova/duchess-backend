"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import ProductCard from "@/components/productcard";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  categories:
    | {
        name: string;
      }
    | {
        name: string;
      }[];
}

interface ProductListProps {
  categorySlug: string;
  categoryName: string;
  initialProducts: Product[];
  initialTotalCount: number;
  initialHasMore: boolean;
}

// Memoized price calculation function
const calculatePrice = (product: Product) => {
  let price = 0;
  let originalPrice = 0;

  if (product.selling_type === "weight" && product.weight_options?.length > 0) {
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
    const activeOption = product.piece_options.find((opt: any) => opt.isActive);
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

// Memoized ProductCard component for better performance
const MemoizedProductCard = memo(
  ({ product, index }: { product: Product; index: number }) => {
    const { price, originalPrice } = calculatePrice(product);

    return (
      <ProductCard
        key={`${product.id}-${index}`}
        id={product.id}
        name={product.name}
        rating={4.5}
        imageUrl={product.banner_image || "/images/categories/cake.png"}
        price={price}
        originalPrice={originalPrice > price ? originalPrice : undefined}
        isVeg={product.is_veg}
        description={product.name}
        category={
          Array.isArray(product.categories)
            ? product.categories[0]?.name
            : product.categories?.name || undefined
        }
        hasOffer={product.has_offer}
        offerPercentage={product.offer_percentage}
        priority={index < 4}
      />
    );
  }
);

MemoizedProductCard.displayName = "MemoizedProductCard";

function ProductList({
  categorySlug,
  categoryName,
  initialProducts,
  initialTotalCount,
  initialHasMore,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);

      const nextPage = currentPage + 1;
      const response = await fetch(
        `/api/products/category/${categorySlug}?page=${nextPage}&limit=4`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch more products");
      }

      const data = await response.json();
      const newProducts = data.products || [];

      setProducts((prev) => [...prev, ...newProducts]);
      setHasMore(data.pagination?.hasMore || false);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load more products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, currentPage, hasMore, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMoreProducts();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMoreProducts]);

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
        {products.map((product, index) => (
          <MemoizedProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="w-full py-8">
          {isLoading ? (
            <ProductSkeletonGrid count={4} />
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

export default memo(ProductList);
