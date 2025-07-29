import { useState, useCallback, useEffect } from "react";
import { useSimpleInfiniteScroll } from "./use-simple-infinite-scroll";

interface Product {
  id: string;
  name: string;
  banner_image: string;
  is_veg: boolean;
  price: number;
  categories: {
    name: string;
  };
}

interface UseSimpleInfiniteProductsOptions {
  categorySlug: string;
  pageSize?: number;
  initialData?: Product[]; // ✅ new
}

export function useSimpleInfiniteProducts({
  categorySlug,
  pageSize = 4,
  initialData = [], // ✅ default empty
}: UseSimpleInfiniteProductsOptions) {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [currentPage, setCurrentPage] = useState(
    initialData.length > 0 ? 1 : 0 // ✅ if preloaded, start on page 1
  );
  const [hasMore, setHasMore] = useState(
    initialData.length === pageSize // ✅ if we got a full page, assume more exists
  );
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(
    initialData.length === 0
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

  // ✅ Only fetch if we don’t already have initialData
  useEffect(() => {
    if (categorySlug && initialData.length === 0) {
      fetchProducts(0, false);
    }
  }, [categorySlug, fetchProducts, initialData.length]);

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
