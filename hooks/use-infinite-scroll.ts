import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isIntersecting: boolean;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  observerRef: (node: Element | null) => void;
}

export function useInfiniteScroll({
  threshold = 0.1,
  rootMargin = "100px",
  enabled = true,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      console.log("Intersection observer callback:", {
        isIntersecting: entry.isIntersecting,
        hasMore,
        isLoading,
        enabled,
      });
      setIsIntersecting(entry.isIntersecting);

      if (entry.isIntersecting && hasMore && !isLoading && enabled) {
        console.log("Setting isLoading to true");
        setIsLoading(true);
      }
    },
    [hasMore, isLoading, enabled]
  );

  const observerRefCallback = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node && enabled) {
        observerRef.current = new IntersectionObserver(observerCallback, {
          threshold,
          rootMargin,
        });
        observerRef.current.observe(node);
        elementRef.current = node;
      }
    },
    [observerCallback, threshold, rootMargin, enabled]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
    }
  }, [isLoading, hasMore]);

  return {
    isIntersecting,
    isLoading,
    hasMore,
    loadMore,
    setHasMore,
    setIsLoading,
    observerRef: observerRefCallback,
  };
}
