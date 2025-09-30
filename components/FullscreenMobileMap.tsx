"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Navigation,
  Route,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SHOP_LOCATION } from "@/lib/shop-config";

interface FullscreenMobileMapProps {
  userCoordinates?: { lat: number; lng: number };
  distance?: number;
  duration?: number;
  accuracy?: "exact" | "precise" | "approximate";
  onClose?: () => void;
}

export default function FullscreenMobileMap({
  userCoordinates,
  distance,
  duration,
  accuracy = "approximate",
  onClose,
}: FullscreenMobileMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate Google Maps URL for directions
  const generateDirectionsUrl = () => {
    if (!userCoordinates) return null;

    const shopCoords = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
    const userCoords = `${userCoordinates.lat},${userCoordinates.lng}`;

    return `https://www.google.com/maps/dir/${shopCoords}/${userCoords}`;
  };

  // Generate Google Maps embed URL
  const generateEmbedUrl = () => {
    if (!userCoordinates) return null;

    const userCoords = `${userCoordinates.lat},${userCoordinates.lng}`;

    // If distance is available, show directions. Otherwise, show location only
    if (distance && duration) {
      const shopCoords = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
      return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${shopCoords}&destination=${userCoords}&mode=driving`;
    } else {
      // Show location only
      const zoom = accuracy === "exact" ? 18 : accuracy === "precise" ? 16 : 14;
      return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${userCoords}&zoom=${zoom}`;
    }
  };

  const directionsUrl = generateDirectionsUrl();
  const embedUrl = generateEmbedUrl();

  // Accuracy color mapping
  const getAccuracyColor = () => {
    switch (accuracy) {
      case "exact":
        return "text-green-600 bg-green-50 border-green-200";
      case "precise":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "approximate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getAccuracyIcon = () => {
    switch (accuracy) {
      case "exact":
        return "🎯";
      case "precise":
        return "📍";
      case "approximate":
        return "📮";
      default:
        return "📍";
    }
  };

  if (!userCoordinates || !userCoordinates.lat || !userCoordinates.lng) {
    return (
      <div className="lg:hidden fixed inset-0 bg-white dark:bg-[#202028] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Location Map
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* No Location Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Location Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Click "Get My Location" to see your position on the map
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:hidden fixed inset-0 bg-white dark:bg-[#202028] z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202028]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {distance && duration ? "Route to Shop" : "Your Location"}
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccuracyColor()}`}
          >
            {getAccuracyIcon()}{" "}
            {accuracy.charAt(0).toUpperCase() + accuracy.slice(1)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Location Info Bar */}
      {!isFullscreen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {userCoordinates.lat.toFixed(6)},{" "}
                {userCoordinates.lng.toFixed(6)}
              </span>
            </div>

            {distance && duration && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-600">
                  <Route className="h-4 w-4" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Navigation className="h-4 w-4" />
                  <span>{duration} min</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Map */}
      <div className="flex-1 relative">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        ) : (
          <div className="h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Map unavailable
              </p>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        {directionsUrl && (
          <div className="absolute bottom-4 right-4">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">Open in Maps</span>
            </a>
          </div>
        )}
      </div>

      {/* Bottom Info Panel */}
      {!isFullscreen && distance && duration && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {distance.toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Distance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {duration} min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Delivery Time
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
