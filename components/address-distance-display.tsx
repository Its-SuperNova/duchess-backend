"use client";

import { MapPin, Clock } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/distance-utils";
import type { Address } from "@/lib/supabase";

interface AddressDistanceDisplayProps {
  address: Address;
  className?: string;
}

export default function AddressDistanceDisplay({
  address,
  className = "",
}: AddressDistanceDisplayProps) {
  // Directly use the distance and duration from the address object
  const hasDistance = typeof address.distance === "number";

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

  const formattedDistance = formatDistance(address.distance!);
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
