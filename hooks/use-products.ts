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
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<ProcessedProduct[]>(
    // Request a smaller initial page to reduce payload and memory on mobile
    "/api/products?limit=12&offset=0",
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
    }
  );

  return {
    products: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
