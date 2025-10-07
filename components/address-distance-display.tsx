"use client";

import { MapPin, Clock } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/distance";
import { getDisplayDistance } from "@/lib/address-utils";
import type { Address } from "@/lib/supabase";

interface AddressDistanceDisplayProps {
  address: Address;
  className?: string;
}

export default function AddressDistanceDisplay({
  address,
  className = "",
}: AddressDistanceDisplayProps) {
  // Convert stored distance back to display format
  const displayDistance = getDisplayDistance(address.distance);
  const hasDistance = typeof displayDistance === "number";

  if (!hasDistance) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-gray-400 ${className}`}
      >
        <MapPin className="h-3 w-3" />
        <span>Distance unavailable</span>
      </div>
    );
  }

  // Show distance with 1 decimal place precision
  const formattedDistance =
    displayDistance! < 1
      ? `${Math.round(displayDistance! * 1000)}m`
      : `${displayDistance!.toFixed(1)}km`;
  const formattedDuration = address.duration
    ? formatDuration(address.duration)
    : null;

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      <div className="flex items-center gap-1 text-blue-600">
        <MapPin className="h-3 w-3" />
        <span className="font-medium">{formattedDistance}</span>
      </div>
      {formattedDuration && (
        <div className="flex items-center gap-1 text-green-600">
          <Clock className="h-3 w-3" />
          <span className="font-medium">~{formattedDuration}</span>
        </div>
      )}
    </div>
  );
}
