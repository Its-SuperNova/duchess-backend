"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
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
  const orderCreationStart = useRef<number>(0);
  const paymentDialogStart = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    orderCreationTime: 0,
    paymentDialogOpenTime: 0,
    totalCheckoutTime: 0,
  });

  useEffect(() => {
    // Monitor order creation performance
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0] as string;
      if (url.includes("/api/orders/create")) {
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
    const handlePaymentStart = () => {
      paymentDialogStart.current = Date.now();
      console.log("Payment dialog opening started");
    };

    const handlePaymentComplete = () => {
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
    };

    // Add event listeners for payment events
    window.addEventListener("payment-start", handlePaymentStart);
    window.addEventListener("payment-complete", handlePaymentComplete);

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("payment-start", handlePaymentStart);
      window.removeEventListener("payment-complete", handlePaymentComplete);
    };
  }, [onMetrics]);

  return null; // This component doesn't render anything
}
