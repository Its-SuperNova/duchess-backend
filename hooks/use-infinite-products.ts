import { useState, useCallback, useEffect } from "react";
import { useInfiniteScroll } from "./use-infinite-scroll";

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

interface UseInfiniteProductsOptions {
  categorySlug: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseInfiniteProductsReturn {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  observerRef: (node: Element | null) => void;
}

export function useInfiniteProducts({
  categorySlug,
  pageSize = 4,
  enabled = true,
}: UseInfiniteProductsOptions): UseInfiniteProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    isIntersecting,
    isLoading: isIntersectionLoading,
    observerRef,
    setHasMore: setIntersectionHasMore,
    setIsLoading: setIntersectionLoading,
  } = useInfiniteScroll({
    enabled: enabled && hasMore,
    rootMargin: "100px", // Reduced margin for more responsive loading
  });

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      console.log("fetchProducts called:", { page, append });
      try {
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
        setIntersectionHasMore(newProducts.length === pageSize);

        if (page === 0) {
          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setHasMore(false);
        setIntersectionHasMore(false);
      } finally {
        setIntersectionLoading(false);
      }
    },
    [categorySlug, pageSize, setIntersectionHasMore, setIntersectionLoading]
  );

  const loadMore = useCallback(() => {
    console.log("loadMore called:", {
      isIntersectionLoading,
      hasMore,
      currentPage,
    });
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

  // Initial load
  useEffect(() => {
    if (enabled && categorySlug) {
      fetchProducts(0, false);
    }
  }, [enabled, categorySlug, fetchProducts]);

  // Auto-load more when intersection is detected
  useEffect(() => {
    console.log("Intersection effect:", {
      isIntersecting,
      hasMore,
      isInitialLoading,
      isIntersectionLoading,
    });
    if (isIntersecting && hasMore && !isInitialLoading) {
      console.log("Triggering loadMore from intersection");
      loadMore();
    }
  }, [isIntersecting, hasMore, isInitialLoading, loadMore]);

  return {
    products,
    isLoading: isInitialLoading,
    hasMore,
    error,
    loadMore,
    refresh,
    observerRef,
  };
}
