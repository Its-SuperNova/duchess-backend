// Performance optimization utilities for checkout flow

// Preload Razorpay script globally
let razorpayScriptPromise: Promise<boolean> | null = null;

export function preloadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;

    // Production optimizations
    script.crossOrigin = "anonymous";

    // Preconnect to Razorpay domains
    const preconnectLink = document.createElement("link");
    preconnectLink.rel = "preconnect";
    preconnectLink.href = "https://checkout.razorpay.com";
    document.head.appendChild(preconnectLink);

    const preconnectLink2 = document.createElement("link");
    preconnectLink2.rel = "preconnect";
    preconnectLink2.href = "https://api.razorpay.com";
    document.head.appendChild(preconnectLink2);

    script.onload = () => {
      console.log("Razorpay script preloaded successfully");
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to preload Razorpay script");
      razorpayScriptPromise = null;
      resolve(false);
    };

    // Set a timeout for preloading
    const timeout = setTimeout(() => {
      console.error("Razorpay script preload timeout");
      razorpayScriptPromise = null;
      resolve(false);
    }, 2000); // Reduced timeout for production

    script.onload = () => {
      clearTimeout(timeout);
      console.log("Razorpay script preloaded successfully");
      resolve(true);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error("Failed to preload Razorpay script");
      razorpayScriptPromise = null;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

// Preload critical images
export function preloadImages(imageUrls: string[]): void {
  if (typeof window === "undefined") return;

  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

// Preload API endpoints with connection pooling
export function preloadAPIEndpoints(endpoints: string[]): void {
  if (typeof window === "undefined") return;

  endpoints.forEach((endpoint) => {
    // Use fetch with no-cache to preload
    fetch(endpoint, {
      method: "HEAD",
      cache: "no-cache",
      mode: "cors",
    }).catch(() => {
      // Ignore errors for preloading
    });
  });
}

// Optimize checkout flow performance
export function optimizeCheckoutFlow(): void {
  if (typeof window === "undefined") return;

  // Preload Razorpay script
  preloadRazorpayScript();

  // Preload critical images
  preloadImages([
    "/duchess-logo.png",
    // Add other critical images here
  ]);

  // Preload API endpoints
  preloadAPIEndpoints([
    "/api/razorpay/create-order",
    "/api/razorpay/verify-payment",
    // Add other critical endpoints here
  ]);

  // Add DNS prefetch for better performance
  const dnsPrefetch = document.createElement("link");
  dnsPrefetch.rel = "dns-prefetch";
  dnsPrefetch.href = "https://checkout.razorpay.com";
  document.head.appendChild(dnsPrefetch);

  const dnsPrefetch2 = document.createElement("link");
  dnsPrefetch2.rel = "dns-prefetch";
  dnsPrefetch2.href = "https://api.razorpay.com";
  document.head.appendChild(dnsPrefetch2);
}

// Check if Razorpay is ready
export function isRazorpayReady(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Razorpay;
}

// Wait for Razorpay to be ready
export function waitForRazorpay(timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isRazorpayReady()) {
      resolve(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (isRazorpayReady()) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        resolve(true);
      }
    }, 50); // Faster checking interval

    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      resolve(false);
    }, timeout);
  });
}

// Production-specific performance monitoring
export function monitorPerformance(operation: string, startTime: number): void {
  const duration = Date.now() - startTime;
  console.log(`Performance: ${operation} took ${duration}ms`);

  // Send to analytics if needed
  if (duration > 2000) {
    console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
  }
}
