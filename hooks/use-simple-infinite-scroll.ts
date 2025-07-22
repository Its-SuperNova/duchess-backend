import { useState, useCallback, useEffect, useRef } from "react";

interface UseSimpleInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  enabled?: boolean;
}

export function useSimpleInfiniteScroll({
  onLoadMore,
  hasMore,
  enabled = true,
}: UseSimpleInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Setting up intersection observer:", {
      enabled,
      hasMore,
      observerRef: !!observerRef.current,
    });

    if (!enabled || !hasMore || !observerRef.current) {
      console.log("Intersection observer not set up:", {
        enabled,
        hasMore,
        hasObserver: !!observerRef.current,
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log("Intersection observer entry:", {
          isIntersecting: entry.isIntersecting,
          hasMore,
          isLoading,
          target: entry.target,
        });

        if (entry.isIntersecting && hasMore && !isLoading) {
          console.log("Intersection detected, loading more...");
          setIsLoading(true);
          onLoadMore();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    console.log("Observing element:", observerRef.current);
    observer.observe(observerRef.current);

    return () => {
      console.log("Disconnecting intersection observer");
      observer.disconnect();
    };
  }, [enabled, hasMore, isLoading, onLoadMore]);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    observerRef,
    isLoading,
    resetLoading,
  };
}
