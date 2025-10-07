"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Info,
  Gift,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DeliveryFeeDisplayProps {
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
  orderValue: number;
  address?: {
    fullAddress: string;
    distance: number;
    distanceInKm: number;
    zone: string;
  };
  freeDeliveryThreshold?: number;
}

export function DeliveryFeeDisplay({
  deliveryCharge,
  isFreeDelivery,
  calculationMethod,
  details,
  orderValue,
  address,
  freeDeliveryThreshold = 500,
}: DeliveryFeeDisplayProps) {
  const progressToFreeDelivery = Math.min(
    (orderValue / freeDeliveryThreshold) * 100,
    100
  );
  const remainingForFreeDelivery = Math.max(
    freeDeliveryThreshold - orderValue,
    0
  );

  const getCalculationMethodIcon = () => {
    switch (calculationMethod) {
      case "order_value":
        return <Gift className="h-4 w-4 text-green-600" />;
      case "distance":
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case "fallback":
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Truck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCalculationMethodText = () => {
    switch (calculationMethod) {
      case "order_value":
        return isFreeDelivery ? "Free Delivery" : "Fixed Delivery";
      case "distance":
        return "Distance Based";
      case "fallback":
        return "Standard Rate";
      default:
        return "Calculated";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Delivery Fee Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Delivery Fee</span>
          </div>
          <div className="flex items-center gap-2">
            {getCalculationMethodIcon()}
            <Badge
              variant={isFreeDelivery ? "default" : "secondary"}
              className={isFreeDelivery ? "bg-green-100 text-green-800" : ""}
            >
              {getCalculationMethodText()}
            </Badge>
          </div>
        </div>

        {/* Delivery Fee Amount */}
        <div className="text-center py-2">
          <div className="text-3xl font-bold text-gray-900">
            {isFreeDelivery ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${deliveryCharge}`
            )}
          </div>
          {isFreeDelivery && (
            <p className="text-sm text-green-600 font-medium">
              Order qualifies for free delivery!
            </p>
          )}
        </div>

        {/* Free Delivery Progress */}
        {!isFreeDelivery && orderValue < freeDeliveryThreshold && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Free delivery progress</span>
              <span className="font-medium">
                ₹{remainingForFreeDelivery} more needed
              </span>
            </div>
            <Progress value={progressToFreeDelivery} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              Add ₹{remainingForFreeDelivery.toFixed(0)} more for free delivery
            </p>
          </div>
        )}

        {/* Address Information */}
        {address && (
          <div className="border-t pt-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Delivery Address
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {address.fullAddress}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Distance: {address.distanceInKm.toFixed(1)} km</span>
                  <span>Zone: {address.zone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Details */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              Calculation Details
            </span>
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            {calculationMethod === "distance" && details.matchingRange && (
              <p>
                Distance: {details.distance?.toFixed(1)} km
                <br />
                Range: {details.matchingRange.start_km}-
                {details.matchingRange.end_km} km
                <br />
                Rate: ₹{details.matchingRange.price}
              </p>
            )}

            {calculationMethod === "order_value" && (
              <p>
                Order Value: ₹{orderValue}
                <br />
                Threshold: ₹{details.orderValueThreshold}
                <br />
                Type: {isFreeDelivery ? "Free" : "Fixed"}
              </p>
            )}

            {calculationMethod === "fallback" && (
              <p>
                Using standard delivery rate
                <br />
                Distance: {details.distance?.toFixed(1)} km
              </p>
            )}
          </div>
        </div>

        {/* Delivery Time Estimate */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              Estimated Delivery Time
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {address?.distanceInKm && address.distanceInKm <= 5
              ? "30-45 minutes"
              : address?.distanceInKm && address.distanceInKm <= 10
              ? "45-60 minutes"
              : "60-90 minutes"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeliveryFeeDisplay;
