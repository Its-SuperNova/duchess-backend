import { useState, useCallback, useEffect } from "react";
import { useSimpleInfiniteScroll } from "./use-simple-infinite-scroll";

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

interface UseSimpleInfiniteProductsOptions {
  categorySlug: string;
  pageSize?: number;
  initialProducts?: Product[];
}

export function useSimpleInfiniteProducts({
  categorySlug,
  pageSize = 4,
  initialProducts = [],
}: UseSimpleInfiniteProductsOptions) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(
    initialProducts.length === 0
  );

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        console.log("Fetching products:", { page, append });
        setError(null);

        const response = await fetch(
          `/api/products/category/${categorySlug}?page=${page}&limit=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const newProducts = data.products || [];
        console.log("API response:", {
          page,
          productsCount: newProducts.length,
          hasMore: newProducts.length === pageSize,
        });

        if (append) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(newProducts.length === pageSize);

        if (page === 0) {
          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setHasMore(false);
      }
    },
    [categorySlug, pageSize]
  );

  const loadMore = useCallback(() => {
    if (hasMore) {
      const nextPage = currentPage + 1;
      console.log("Loading next page:", nextPage);
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [hasMore, currentPage, fetchProducts]);

  const refresh = useCallback(() => {
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    setIsInitialLoading(true);
    fetchProducts(0, false);
  }, [fetchProducts]);

  // Initial load - only if we don't have initial products
  useEffect(() => {
    if (categorySlug && initialProducts.length === 0) {
      fetchProducts(0, false);
    } else if (initialProducts.length > 0) {
      // If we have initial products, set hasMore based on whether we expect more
      // This is a simple heuristic - if initial products are less than pageSize, probably no more
      setHasMore(initialProducts.length >= pageSize);
      setIsInitialLoading(false);
    }
  }, [categorySlug, fetchProducts, initialProducts.length, pageSize]);

  const {
    observerRef,
    isLoading: isIntersectionLoading,
    resetLoading,
  } = useSimpleInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    enabled: !isInitialLoading,
  });

  // Reset loading state after products are fetched
  useEffect(() => {
    if (isIntersectionLoading && products.length > 0) {
      resetLoading();
    }
  }, [products.length, isIntersectionLoading, resetLoading]);

  return {
    products,
    isLoading: isInitialLoading,
    hasMore,
    error,
    refresh,
    observerRef,
    isIntersectionLoading,
  };
}
