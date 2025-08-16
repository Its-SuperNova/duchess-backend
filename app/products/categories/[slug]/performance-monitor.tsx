"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          const lcp = entry.startTime;
          setMetrics((prev) => ({
            ...prev,
            largestContentfulPaint: lcp,
          }));
        }
      }
    });

    // Observe LCP
    observer.observe({ entryTypes: ["largest-contentful-paint"] });

    // Get FCP
    const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
    if (fcpEntry) {
      setMetrics((prev) => ({
        ...prev,
        firstContentfulPaint: fcpEntry.startTime,
      }));
    }

    // Get CLS
    let clsValue = 0;
    const observer2 = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics((prev) => ({
        ...prev,
        cumulativeLayoutShift: clsValue,
      }));
    });

    observer2.observe({ entryTypes: ["layout-shift"] });

    return () => {
      observer.disconnect();
      observer2.disconnect();
    };
  }, []);

  if (!metrics || process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-semibold">Performance Metrics</div>
      <div>FCP: {metrics.firstContentfulPaint?.toFixed(0)}ms</div>
      <div>LCP: {metrics.largestContentfulPaint?.toFixed(0)}ms</div>
      <div>CLS: {metrics.cumulativeLayoutShift?.toFixed(3)}</div>
    </div>
  );
}
