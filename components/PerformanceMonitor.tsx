"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  scriptLoadTime: number;
  orderCreationTime: number;
  paymentDialogOpenTime: number;
  totalCheckoutTime: number;
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export default function PerformanceMonitor({
  onMetrics,
}: PerformanceMonitorProps) {
  const startTime = useRef<number>(Date.now());
  const scriptLoadStart = useRef<number>(0);
  const orderCreationStart = useRef<number>(0);
  const paymentDialogStart = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    scriptLoadTime: 0,
    orderCreationTime: 0,
    paymentDialogOpenTime: 0,
    totalCheckoutTime: 0,
  });

  useEffect(() => {
    // Monitor script loading performance
    const checkRazorpayReady = () => {
      if ((window as any).Razorpay) {
        const scriptLoadTime = Date.now() - scriptLoadStart.current;
        metrics.current.scriptLoadTime = scriptLoadTime;
        console.log(`Razorpay script loaded in ${scriptLoadTime}ms`);
      } else {
        setTimeout(checkRazorpayReady, 100);
      }
    };

    scriptLoadStart.current = Date.now();
    checkRazorpayReady();

    // Monitor order creation performance
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0] as string;
      if (url.includes("/api/razorpay/create-order")) {
        orderCreationStart.current = Date.now();
        console.log("Order creation started");

        return originalFetch.apply(this, args).then((response) => {
          const orderCreationTime = Date.now() - orderCreationStart.current;
          metrics.current.orderCreationTime = orderCreationTime;
          console.log(`Order created in ${orderCreationTime}ms`);
          return response;
        });
      }
      return originalFetch.apply(this, args);
    };

    // Monitor payment dialog opening
    const originalRazorpay = (window as any).Razorpay;
    if (originalRazorpay) {
      (window as any).Razorpay = function (options: any) {
        paymentDialogStart.current = Date.now();
        console.log("Payment dialog opening started");

        const instance = new originalRazorpay(options);
        const originalOpen = instance.open;

        instance.open = function () {
          const paymentDialogOpenTime = Date.now() - paymentDialogStart.current;
          metrics.current.paymentDialogOpenTime = paymentDialogOpenTime;
          console.log(`Payment dialog opened in ${paymentDialogOpenTime}ms`);

          // Calculate total checkout time
          metrics.current.totalCheckoutTime = Date.now() - startTime.current;
          console.log(
            `Total checkout time: ${metrics.current.totalCheckoutTime}ms`
          );

          // Send metrics to parent component
          onMetrics?.(metrics.current);

          return originalOpen.call(this);
        };

        return instance;
      };
    }

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      if (originalRazorpay) {
        (window as any).Razorpay = originalRazorpay;
      }
    };
  }, [onMetrics]);

  return null; // This component doesn't render anything
}
