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
  };
}

interface UseAllProductsInfiniteOptions {
  pageSize?: number;
  initialData?: Product[];
}

export function useAllProductsInfinite({
  pageSize = 12,
  initialData = [],
}: UseAllProductsInfiniteOptions) {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [currentPage, setCurrentPage] = useState(
    initialData.length > 0 ? 1 : 0
  );
  const [hasMore, setHasMore] = useState(true); // Always assume there might be more initially
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(
    initialData.length === 0
  );

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        console.log("Fetching all products:", { page, append });
        setError(null);

        const response = await fetch(
          `/api/products?page=${page}&limit=${pageSize}`
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

        // If we got a full page, there might be more products
        // If we got less than a full page, we've reached the end
        setHasMore(newProducts.length >= pageSize);

        // Debug logging
        console.log(
          "Setting hasMore:",
          newProducts.length >= pageSize,
          "Products received:",
          newProducts.length,
          "Page size:",
          pageSize
        );

        if (page === 0) {
          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setHasMore(false);
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(() => {
    if (hasMore) {
      const nextPage = currentPage + 1;
      console.log(
        "Loading next page:",
        nextPage,
        "Current total products:",
        products.length
      );
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [hasMore, currentPage, fetchProducts, products.length]);

  const refresh = useCallback(() => {
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    setIsInitialLoading(true);
    fetchProducts(0, false);
  }, [fetchProducts]);

  // Only fetch if we don't already have initialData
  useEffect(() => {
    if (initialData.length === 0) {
      fetchProducts(0, false);
    }
  }, [fetchProducts, initialData.length]);

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
