"use client";

import React from "react";
import { MapPin, Clock, Route, ExternalLink } from "lucide-react";
import { SHOP_LOCATION } from "@/lib/shop-config";

interface RouteInfoProps {
  distance?: number;
  duration?: number;
  area?: string;
  pincode?: string;
  showMapLink?: boolean;
}

export default function RouteInfoDisplay({
  distance,
  duration,
  area,
  pincode,
  showMapLink = true,
}: RouteInfoProps) {
  if (!distance || !duration) {
    return null;
  }

  // Generate Google Maps directions link
  const generateMapLink = () => {
    if (!area || !pincode) return null;

    const destination = encodeURIComponent(
      `${area}, ${pincode}, Coimbatore, Tamil Nadu, India`
    );
    // Use exact coordinates for shop location to avoid wrong business mapping
    const shopCoordinates = `${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`;

    return `https://www.google.com/maps/dir/${shopCoordinates}/${destination}`;
  };

  const mapLink = generateMapLink();

  return (
    <div className="space-y-3">
      {/* Route Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Distance Card */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              {distance}km away
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">Distance</p>
          </div>
        </div>

        {/* Duration Card */}
        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">
              ~{duration} mins
            </p>
            <p className="text-purple-600 dark:text-purple-400 text-xs">
              Delivery time
            </p>
          </div>
        </div>
      </div>

      {/* Map Link */}
      {showMapLink && mapLink && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Route className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              View Route on Map
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs">
              Get directions via Google Maps
            </p>
          </div>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Accuracy Note */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl">
        <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
          📍 Distance calculated using real road routes • ⏱️ Time includes
          traffic estimates
        </p>
      </div>
    </div>
  );
}
