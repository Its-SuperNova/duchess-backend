"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ProductGrid } from "./product-grid";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Product } from "../types";

interface ProductsInfiniteScrollProps {
  initialProducts: Product[];
}

export function ProductsInfiniteScroll({
  initialProducts,
}: ProductsInfiniteScrollProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Load 4 products per page consistently
  const getPageSize = () => {
    return 4; // Always load 4 products per page
  };

  // Use a ref to track the current page size to avoid stale closures
  const pageSizeRef = useRef(getPageSize());

  // Update page size on window resize
  useEffect(() => {
    const handleResize = () => {
      pageSizeRef.current = getPageSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        setError(null);
        setIsLoading(true);

        const pageSize = pageSizeRef.current;
        const response = await fetch(
          `/api/products?offset=${page * pageSize}&limit=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const newProducts = data.products || [];

        if (append) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        // If we got a full page, there might be more products
        const shouldHaveMore = newProducts.length >= pageSize;
        setHasMore(shouldHaveMore);

        // Safety check: if we got 0 products, definitely no more
        if (newProducts.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [hasMore, isLoading, currentPage, fetchProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
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
  }, [hasMore, isLoading, loadMore]);

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

  return (
    <div className="w-full">
      <ProductGrid products={products} />

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
            You've reached the end of all products!
          </p>
        </div>
      )}
    </div>
  );
}
