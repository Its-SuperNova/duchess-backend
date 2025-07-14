import useSWR from "swr";

// Category interface matching your existing structure
interface Category {
  id: string;
  name: string;
  image: string | null;
  description?: string;
  is_active: boolean;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.categories;
};

// Custom hook for fetching categories with caching
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
    {
      // Cache for 10 minutes (categories change less frequently)
      dedupingInterval: 10 * 60 * 1000,
      // Revalidate on focus after 2 minutes
      focusThrottleInterval: 2 * 60 * 1000,
      // Revalidate in background every 30 minutes
      refreshInterval: 30 * 60 * 1000,
      // Keep previous data while loading new data
      keepPreviousData: true,
      // Retry on error up to 3 times
      errorRetryCount: 3,
      // Retry with exponential backoff
      errorRetryInterval: 1000,
      // Revalidate if data is stale (older than 10 minutes)
      revalidateIfStale: true,
      // Revalidate when window regains focus
      revalidateOnFocus: true,
      // Revalidate when network comes back online
      revalidateOnReconnect: true,
    }
  );

  // Filter active categories on the client side
  const activeCategories = data?.filter((category) => category.is_active) || [];

  return {
    categories: activeCategories,
    allCategories: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
