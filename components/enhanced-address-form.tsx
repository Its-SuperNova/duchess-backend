"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Target, AlertCircle } from "lucide-react";

interface EnhancedAddressFormProps {
  onLocationSelect: (location: {
    coordinates?: { lat: number; lng: number };
    address: string;
    accuracy: "exact" | "precise" | "approximate";
  }) => void;
}

export default function EnhancedAddressForm({
  onLocationSelect,
}: EnhancedAddressFormProps) {
  const [locationMethod, setLocationMethod] = useState<
    "gps" | "address" | "pincode"
  >("gps");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Method 1: Get GPS coordinates (Most Accurate)
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("GPS not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy;

        console.log("📍 GPS Location obtained:", {
          lat: latitude,
          lng: longitude,
          accuracy: `${accuracy}m`,
        });

        onLocationSelect({
          coordinates: { lat: latitude, lng: longitude },
          address: `${latitude}, ${longitude}`,
          accuracy:
            accuracy < 10 ? "exact" : accuracy < 50 ? "precise" : "approximate",
        });

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Method 2: Use Google Maps Places API for address autocomplete
  const handleAddressSelect = (address: string) => {
    onLocationSelect({
      address,
      accuracy: "precise",
    });
  };

  // Method 3: Use pincode + area (current method)
  const handlePincodeSelect = (pincode: string, area: string) => {
    onLocationSelect({
      address: `${area}, ${pincode}, Coimbatore, Tamil Nadu, India`,
      accuracy: "approximate",
    });
  };

  return (
    <div className="space-y-6">
      {/* Location Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choose Location Method</h3>

        {/* GPS Method - Most Accurate */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Navigation className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">GPS Location (Most Accurate)</h4>
                <p className="text-sm text-gray-600">
                  Get your exact coordinates for precise delivery
                </p>
              </div>
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Get My Location
                </>
              )}
            </button>
          </div>

          {locationError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{locationError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Method - Very Accurate */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Full Address (Very Accurate)</h4>
              <p className="text-sm text-gray-600">
                Enter complete street address with landmarks
              </p>
            </div>
          </div>
        </div>

        {/* Pincode Method - Current Method */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <MapPin className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium">Pincode + Area (Approximate)</h4>
              <p className="text-sm text-gray-600">
                Current method - good for general area delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Indicators */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Accuracy Levels:</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">
              <strong>Exact (GPS):</strong> Within 10 meters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">
              <strong>Precise (Address):</strong> Within 50 meters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">
              <strong>Approximate (Pincode):</strong> Within 500 meters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

