"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Route, ExternalLink } from "lucide-react";
import { SHOP_LOCATION } from "@/lib/shop-config";

interface InteractiveMapProps {
  userCoordinates?: { lat: number; lng: number };
  distance?: number;
  duration?: number;
  accuracy?: "exact" | "precise" | "approximate";
  className?: string;
}

export default function InteractiveMap({
  userCoordinates,
  distance,
  duration,
  accuracy = "approximate",
  className = "",
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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

    const shopCoords = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;
    const userCoords = `${userCoordinates.lat},${userCoordinates.lng}`;

    // Create a map that shows both locations
    const centerLat = (SHOP_LOCATION.latitude + userCoordinates.lat) / 2;
    const centerLng = (SHOP_LOCATION.longitude + userCoordinates.lng) / 2;

    return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${shopCoords}&destination=${userCoords}&mode=driving`;
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
      {/* Location Info */}
      <div className="bg-white dark:bg-[#202028] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Location
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccuracyColor()}`}
          >
            {getAccuracyIcon()}{" "}
            {accuracy.charAt(0).toUpperCase() + accuracy.slice(1)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>
              {userCoordinates.lat.toFixed(6)}, {userCoordinates.lng.toFixed(6)}
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

      {/* Interactive Map */}
      <div className="bg-white dark:bg-[#202028] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Route to Shop
            </h3>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Maps
              </a>
            )}
          </div>
        </div>

        <div className="relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          ) : (
            <div className="h-[300px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Map unavailable</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Information */}
      {distance && duration && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Delivery Information
          </h4>
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

      {/* Accuracy Information */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Location Accuracy
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Exact (GPS):</strong> Within 10 meters
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Precise (Address):</strong> Within 50 meters
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Approximate (Pincode):</strong> Within 500 meters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

