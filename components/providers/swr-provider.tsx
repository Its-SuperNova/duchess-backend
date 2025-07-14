"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global error handler
        onError: (error, key) => {
          console.error("SWR Error:", { error, key });
        },
        // Global loading indicator could be added here
        onLoadingSlow: (key) => {
          console.warn("SWR Slow loading:", key);
        },
        // Global success handler
        onSuccess: (data, key) => {
          // Optional: Log successful fetches in development
          if (process.env.NODE_ENV === "development") {
            console.log("SWR Success:", key);
          }
        },
        // Default options for all SWR hooks
        refreshInterval: 0, // Disable auto-refresh by default (individual hooks can override)
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
        focusThrottleInterval: 5000, // Throttle focus revalidation to 5 seconds
        keepPreviousData: false, // Individual hooks can override this
      }}
    >
      {children}
    </SWRConfig>
  );
}
