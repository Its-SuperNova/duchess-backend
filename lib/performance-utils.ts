// Performance optimization utilities for checkout flow

// Preload external scripts
export function preloadExternalScript(src: string): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log(`External script preloaded successfully: ${src}`);
      resolve(true);
    };

    script.onerror = () => {
      console.error(`Failed to preload external script: ${src}`);
      resolve(false);
    };

    // Set a timeout for preloading
    const timeout = setTimeout(() => {
      console.error(`External script preload timeout: ${src}`);
      resolve(false);
    }, 3000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log(`External script preloaded successfully: ${src}`);
      resolve(true);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error(`Failed to preload external script: ${src}`);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

// Preload API endpoints
export function preloadAPIEndpoints(endpoints: string[]): void {
  if (typeof window === "undefined") return;

  endpoints.forEach((endpoint) => {
    // Prefetch the endpoint
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = endpoint;
    document.head.appendChild(link);
  });
}

// Optimize checkout flow performance
export function optimizeCheckoutFlow(): void {
  if (typeof window === "undefined") return;

  // Note: Most API endpoints require authentication or specific parameters
  // and cannot be safely prefetched. Instead, we focus on other optimizations.

  // DNS prefetch for external domains
}

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window === "undefined") return;

  const start = performance.now();
  fn();
  const end = performance.now();

  console.log(`Performance: ${name} took ${end - start} milliseconds`);
}

// Check if external script is ready
export function isExternalScriptReady(scriptName: string): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any)[scriptName];
}

// Wait for external script to be ready
export function waitForExternalScript(
  scriptName: string,
  timeout = 3000
): Promise<boolean> {
  return new Promise((resolve) => {
    if (isExternalScriptReady(scriptName)) {
      resolve(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (isExternalScriptReady(scriptName)) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(false);
    }, timeout);
  });
}
