"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface DeliveryCalculationResult {
  deliveryCharge: number;
  isFreeDelivery: boolean;
  calculationMethod: "order_value" | "distance" | "fallback";
  details: {
    distance?: number;
    orderValue?: number;
    orderValueThreshold?: number;
    matchingRange?: {
      start_km: number;
      end_km: number;
      price: number;
    };
  };
  address?: {
    id: string;
    fullAddress: string;
    distance: number;
    distanceInKm: number;
    zone: string;
  };
  orderValue: number;
  breakdown: {
    subtotal: number;
    deliveryCharge: number;
    total: number;
  };
}

interface UseDeliveryCalculationProps {
  checkoutId?: string;
}

export function useDeliveryCalculation({
  checkoutId,
}: UseDeliveryCalculationProps = {}) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [deliveryData, setDeliveryData] =
    useState<DeliveryCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateDelivery = useCallback(
    async ({
      addressId,
      orderValue,
      addressText,
      distance,
    }: {
      addressId?: string;
      orderValue: number;
      addressText?: string;
      distance?: number;
    }) => {
      if (!orderValue || orderValue <= 0) {
        setError("Valid order value is required");
        return null;
      }

      setIsCalculating(true);
      setError(null);

      try {
        console.log("🚚 Calculating delivery charge:", {
          addressId,
          orderValue,
          addressText,
          distance,
          checkoutId,
        });

        const response = await fetch("/api/calculate-delivery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addressId,
            orderValue,
            checkoutId,
            addressText,
            distance,
          }),
        });

        const data = await response.json();
        console.log("📡 Delivery calculation response:", data);

        if (!response.ok) {
          console.error("❌ Delivery calculation failed:", {
            status: response.status,
            statusText: response.statusText,
            data,
          });
          throw new Error(data.error || "Failed to calculate delivery charge");
        }

        if (data.success) {
          setDeliveryData(data);
          console.log("✅ Delivery calculation successful:", data);

          // Show success toast for free delivery
          if (data.isFreeDelivery) {
            toast({
              title: "🎉 Free Delivery!",
              description: "Your order qualifies for free delivery",
              variant: "default",
            });
          }

          return data;
        } else {
          throw new Error(data.error || "Calculation failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Delivery calculation error:", errorMessage);
        setError(errorMessage);

        toast({
          title: "Delivery Calculation Failed",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [checkoutId, toast]
  );

  const clearDeliveryData = useCallback(() => {
    setDeliveryData(null);
    setError(null);
  }, []);

  const getQuickDeliveryEstimate = useCallback(
    async (orderValue: number, distance?: number) => {
      if (!orderValue || orderValue <= 0) return null;

      try {
        const params = new URLSearchParams({
          orderValue: orderValue.toString(),
          ...(distance && { distance: distance.toString() }),
        });

        const response = await fetch(`/api/calculate-delivery?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
          return data;
        }
        return null;
      } catch (err) {
        console.error("Quick delivery estimate error:", err);
        return null;
      }
    },
    []
  );

  return {
    calculateDelivery,
    getQuickDeliveryEstimate,
    clearDeliveryData,
    isCalculating,
    deliveryData,
    error,
    // Computed values
    deliveryCharge: deliveryData?.deliveryCharge || 0,
    isFreeDelivery: deliveryData?.isFreeDelivery || false,
    totalWithDelivery: deliveryData?.breakdown?.total || 0,
  };
}

export default useDeliveryCalculation;
