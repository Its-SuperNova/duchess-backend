import { useState, useCallback, useEffect, useRef } from "react";
import { getProductsByCategorySlugPaginated } from "@/lib/actions/products";

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

interface UseOptimizedInfiniteProductsOptions {
  categorySlug: string;
  pageSize?: number;
  initialProducts: Product[];
  initialHasMore?: boolean;
  totalCount?: number;
}

export function useOptimizedInfiniteProducts({
  categorySlug,
  pageSize = 4,
  initialProducts,
  initialHasMore = true,
  totalCount = 0,
}: UseOptimizedInfiniteProductsOptions) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntersectionLoading, setIsIntersectionLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false); // Use ref to prevent stale closure issues

  const loadMore = useCallback(async () => {
    // Use ref to check current loading state
    if (isLoadingRef.current || !hasMore) {
      console.log("LoadMore blocked:", {
        isLoading: isLoadingRef.current,
        hasMore,
      });
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setIsIntersectionLoading(true);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const nextPage = currentPage + 1;
      console.log("Loading next page:", nextPage);

      const result = await getProductsByCategorySlugPaginated(
        categorySlug,
        nextPage,
        pageSize
      );

      if (abortControllerRef.current.signal.aborted) {
        return; // Request was cancelled
      }

      if (result.products.length > 0) {
        setProducts((prev) => [...prev, ...result.products]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
        console.log(
          "Products loaded successfully:",
          result.products.length,
          "Has more:",
          result.hasMore
        );
      } else {
        setHasMore(false);
        console.log("No more products available");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled
      }
      console.error("Error loading more products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load more products"
      );
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setIsIntersectionLoading(false);
    }
  }, [categorySlug, pageSize, currentPage, hasMore]);

  // Intersection Observer for infinite scroll - FIXED
  useEffect(() => {
    let isObserving = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Only trigger if not currently loading and has more products
        if (
          target.isIntersecting &&
          hasMore &&
          !isLoadingRef.current &&
          !isObserving
        ) {
          console.log(
            "Intersection observer triggered - loading more products"
          );
          isObserving = true;

          // Add a small delay to prevent rapid firing
          setTimeout(() => {
            if (hasMore && !isLoadingRef.current) {
              loadMore();
            }
            isObserving = false;
          }, 200);
        }
      },
      {
        rootMargin: "200px", // Load more when 200px away from bottom
        threshold: 0.1,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [hasMore, loadMore]);

  const refresh = useCallback(() => {
    setProducts(initialProducts);
    setCurrentPage(0);
    setHasMore(initialHasMore);
    setError(null);
    setIsLoading(false);
    setIsIntersectionLoading(false);
    isLoadingRef.current = false;
  }, [initialProducts, initialHasMore]);

  return {
    products,
    isLoading,
    hasMore,
    error,
    refresh,
    observerRef,
    isIntersectionLoading,
    totalCount,
    loadMore, // Expose loadMore for manual triggering
  };
}
