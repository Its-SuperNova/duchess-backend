import useSWR from "swr";
import { ProcessedProduct } from "@/lib/utils";

// Fetcher function for SWR with pagination params
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.products;
};

// Custom hook for fetching products with caching
export function useProducts({
  limit = 12,
  offset = 0,
  initialData,
}: { limit?: number; offset?: number; initialData?: any[] } = {}) {
  const key = `/api/products?limit=${Math.max(
    1,
    Math.min(100, limit)
  )}&offset=${Math.max(0, offset)}`;

  const { data, error, isLoading, mutate } = useSWR<ProcessedProduct[]>(
    key,
    fetcher,
    {
      // Avoid aggressive background refresh on mobile; rely on edge caching
      dedupingInterval: 5 * 60 * 1000,
      focusThrottleInterval: 2 * 60 * 1000,
      refreshInterval: 0,
      keepPreviousData: true,
      errorRetryCount: 2,
      errorRetryInterval: 1500,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      fallbackData: initialData as any,
    }
  );

  return {
    products: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
