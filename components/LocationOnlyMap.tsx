"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface LocationOnlyMapProps {
  userCoordinates: { lat: number; lng: number };
  accuracy?: "exact" | "precise" | "approximate";
  className?: string;
}

export default function LocationOnlyMap({
  userCoordinates,
  accuracy = "approximate",
  className = "",
}: LocationOnlyMapProps) {
  // Generate Google Maps embed URL for location only (no directions)
  const generateLocationUrl = () => {
    if (!userCoordinates) return null;

    const userCoords = `${userCoordinates.lat},${userCoordinates.lng}`;
    const zoom = accuracy === "exact" ? 18 : accuracy === "precise" ? 16 : 14;

    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${userCoords}&zoom=${zoom}`;
  };

  const embedUrl = generateLocationUrl();

  if (!userCoordinates) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center ${className}`}
      >
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Location Selected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click "Get My Location" to see your position on the map
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Map */}
      <div className="bg-white dark:bg-[#202028] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          ) : (
            <div className="h-[500px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Map unavailable</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
