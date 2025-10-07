"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, ShoppingCart, CheckCircle } from "lucide-react";

interface FreeDeliveryProgressProps {
  currentOrderValue: number;
  freeDeliveryThreshold: number;
  className?: string;
}

export function FreeDeliveryProgress({
  currentOrderValue,
  freeDeliveryThreshold,
  className = "",
}: FreeDeliveryProgressProps) {
  const progressPercentage = Math.min(
    (currentOrderValue / freeDeliveryThreshold) * 100,
    100
  );
  const remainingAmount = Math.max(
    freeDeliveryThreshold - currentOrderValue,
    0
  );
  const isEligible = currentOrderValue >= freeDeliveryThreshold;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-900">
              Free Delivery Progress
            </span>
          </div>
          <Badge
            variant={isEligible ? "default" : "secondary"}
            className={isEligible ? "bg-green-100 text-green-800" : ""}
          >
            {isEligible ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Eligible
              </div>
            ) : (
              "Not Eligible"
            )}
          </Badge>
        </div>

        {isEligible ? (
          <div className="text-center py-2">
            <div className="text-lg font-bold text-green-600 mb-1">
              🎉 You qualify for FREE delivery!
            </div>
            <p className="text-sm text-gray-600">
              Your order value of ₹{currentOrderValue} meets the free delivery
              threshold
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current order value</span>
              <span className="font-medium">₹{currentOrderValue}</span>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Free delivery threshold</span>
              <span className="font-medium">₹{freeDeliveryThreshold}</span>
            </div>

            <div className="text-center py-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Add ₹{remainingAmount.toFixed(0)} more
                </span>
              </div>
              <p className="text-xs text-blue-600">
                to qualify for free delivery
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500 text-center">
            Free delivery available on orders above ₹{freeDeliveryThreshold}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FreeDeliveryProgress;
