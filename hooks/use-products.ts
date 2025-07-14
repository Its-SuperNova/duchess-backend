import useSWR from "swr";
import { ProcessedProduct } from "@/lib/utils";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.products;
};

// Custom hook for fetching products with caching
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<ProcessedProduct[]>(
    "/api/products",
    fetcher,
    {
      // Cache for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
      // Revalidate on focus after 1 minute
      focusThrottleInterval: 60 * 1000,
      // Revalidate in background every 10 minutes
      refreshInterval: 10 * 60 * 1000,
      // Keep previous data while loading new data
      keepPreviousData: true,
      // Retry on error up to 3 times
      errorRetryCount: 3,
      // Retry with exponential backoff
      errorRetryInterval: 1000,
      // Revalidate if data is stale (older than 5 minutes)
      revalidateIfStale: true,
      // Revalidate when window regains focus
      revalidateOnFocus: true,
      // Revalidate when network comes back online
      revalidateOnReconnect: true,
    }
  );

  return {
    products: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
