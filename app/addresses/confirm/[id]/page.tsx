"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
import { HomeSmile, Buildings, Shop } from "@solar-icons/react";
import { GrLocation } from "react-icons/gr";
import { HiMiniMapPin } from "react-icons/hi2";

// Google Maps types are handled by @types/google.maps

interface AddressData {
  location: {
    lat: number;
    lng: number;
    address: string;
    area: string;
  };
  details: string;
  addressType: "Home" | "Work" | "Other";
  otherAddressName: string;
  tempId: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}

const SHOP_LOCATION = {
  latitude: 11.1061944,
  longitude: 77.0015,
  address:
    "Door No : 7/68-62-B, Street 1, Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham, Coimbatore",
};

export default function ConfirmAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Resolve the params promise
    params.then((resolvedParams) => {
      setResolvedParams(resolvedParams);
    });
  }, [params]);

  useEffect(() => {
    if (!resolvedParams || !mounted) return;

    // Get address data from sessionStorage (only on client side)
    const storedData =
      typeof window !== "undefined"
        ? sessionStorage.getItem("pendingAddress")
        : null;

    console.log("Stored data from sessionStorage:", storedData);

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log("Parsed address data:", data);
        setAddressData(data);
        setLoading(false);
        // Load Google Maps after setting address data
        setTimeout(() => {
          loadGoogleMapsScript();
        }, 100);
      } catch (error) {
        console.error("Error parsing stored address data:", error);
        // Fallback to default data
        const fallbackData: AddressData = {
          location: {
            lat: 11.0045,
            lng: 76.9615,
            address: "Barathipuram, Coimbatore, Tamil Nadu 641103, India",
            area: "Barathipuram",
          },
          details: "Test address for localhost",
          addressType: "Home",
          otherAddressName: "",
          tempId: "fallback_123",
        };
        setAddressData(fallbackData);
        setLoading(false);
        // Load Google Maps after setting address data
        setTimeout(() => {
          loadGoogleMapsScript();
        }, 100);
      }
    } else {
      // Fallback data for localhost testing
      const fallbackData: AddressData = {
        location: {
          lat: 11.0045,
          lng: 76.9615,
          address: "Barathipuram, Coimbatore, Tamil Nadu 641103, India",
          area: "Barathipuram",
        },
        details: "Test address for localhost",
        addressType: "Home",
        otherAddressName: "",
        tempId: "fallback_123",
      };

      console.log("Using fallback data for localhost testing");
      setAddressData(fallbackData);
      setLoading(false);
      // Load Google Maps after setting address data
      setTimeout(() => {
        loadGoogleMapsScript();
      }, 100);
    }
  }, [resolvedParams, mounted]);

  // Initialize map when addressData is available and Google Maps is loaded
  useEffect(() => {
    if (
      addressData &&
      googleMapsLoaded &&
      window.google &&
      window.google.maps &&
      window.google.maps.DirectionsService
    ) {
      console.log("Address data and Google Maps ready, initializing map...");
      initializeMap();
    }
  }, [addressData, googleMapsLoaded]);

  const loadGoogleMapsScript = () => {
    // Check if Google Maps is already loaded
    if (
      typeof window !== "undefined" &&
      window.google &&
      window.google.maps &&
      window.google.maps.DirectionsService
    ) {
      console.log("Google Maps already loaded");
      setGoogleMapsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("Google Maps script already in DOM, waiting for load...");
      // Wait for the script to load
      const checkGoogleMaps = () => {
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.DirectionsService
        ) {
          console.log("Google Maps loaded from existing script");
          setGoogleMapsLoaded(true);
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
      console.error("Google Maps API key is missing!");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up global callback
    (window as any).initGoogleMaps = () => {
      console.log("Google Maps script loaded successfully");
      setGoogleMapsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    console.log("initializeMap called");
    console.log("mapRef.current:", mapRef.current);
    console.log("addressData:", addressData);

    if (!mapRef.current) {
      console.error("Map ref not available, retrying in 500ms...");
      setTimeout(() => {
        initializeMap();
      }, 500);
      return;
    }

    if (!addressData) {
      console.error("Address data not available, retrying in 200ms...");
      setTimeout(() => {
        initializeMap();
      }, 200);
      return;
    }

    console.log("Initializing map with data:", addressData);

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: SHOP_LOCATION.latitude, lng: SHOP_LOCATION.longitude },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      console.log("Map initialized successfully");

      // Add shop marker
      const shopMarker = new google.maps.Marker({
        position: { lat: SHOP_LOCATION.latitude, lng: SHOP_LOCATION.longitude },
        map: map,
        title: "Duchess Pastries - Keeranatham",
        icon: {
          url: "/svg/icons/shop.svg",
          scaledSize: new google.maps.Size(72, 72),
          anchor: new google.maps.Point(37, 69),
        },
      });

      // Add delivery location marker
      const deliveryMarker = new google.maps.Marker({
        position: {
          lat: addressData.location.lat,
          lng: addressData.location.lng,
        },
        map: map,
        title: "Delivery Location",
        icon: {
          url: "/svg/icons/home.svg",
          scaledSize: new google.maps.Size(72, 72),
          anchor: new google.maps.Point(37, 70),
        },
      });

      // Calculate route
      calculateRoute();
      setMapLoaded(true);
      console.log("Map setup completed successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapLoaded(true); // Still show the page even if map fails
    }
  };

  const calculateRoute = () => {
    console.log("calculateRoute called");
    console.log("mapInstanceRef.current:", mapInstanceRef.current);
    console.log("addressData:", addressData);

    if (!mapInstanceRef.current || !addressData) {
      console.log("Missing map instance or address data");
      return;
    }

    // Check if directions library is available
    if (!google.maps.DirectionsService) {
      console.warn(
        "Directions library not available, using fallback route info"
      );
      setRouteInfo({
        distance: "5.2 km",
        duration: "12 mins",
        distanceValue: 5200,
        durationValue: 720,
      });
      return;
    }

    console.log("Directions library available, calculating route...");

    try {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#0044FF",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsRenderer.setMap(mapInstanceRef.current);

      const request = {
        origin: { lat: SHOP_LOCATION.latitude, lng: SHOP_LOCATION.longitude },
        destination: {
          lat: addressData.location.lat,
          lng: addressData.location.lng,
        },
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      };

      console.log("Route request:", request);

      directionsService.route(request, (result, status) => {
        console.log("Directions service response:", { status, result });

        if (
          status === "OK" &&
          result &&
          result.routes &&
          result.routes.length > 0
        ) {
          directionsRenderer.setDirections(result);

          const route = result.routes[0];
          const leg = route.legs[0];

          const routeInfo = {
            distance: leg.distance?.text || "N/A",
            duration: leg.duration?.text || "N/A",
            distanceValue: leg.distance?.value || 0,
            durationValue: leg.duration?.value || 0,
          };

          console.log("Route calculated successfully:", routeInfo);
          setRouteInfo(routeInfo);
        } else {
          console.warn("Directions service failed, using fallback:", status);
          // Calculate approximate distance as fallback
          const distance = calculateDistance(
            SHOP_LOCATION.latitude,
            SHOP_LOCATION.longitude,
            addressData.location.lat,
            addressData.location.lng
          );
          setRouteInfo({
            distance: `${(distance / 1000).toFixed(1)} km`,
            duration: `${Math.round((distance / 1000) * 2)} mins`,
            distanceValue: distance,
            durationValue: Math.round((distance / 1000) * 2 * 60),
          });
        }
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      // Calculate approximate distance as fallback
      const distance = calculateDistance(
        SHOP_LOCATION.latitude,
        SHOP_LOCATION.longitude,
        addressData.location.lat,
        addressData.location.lng
      );
      setRouteInfo({
        distance: `${(distance / 1000).toFixed(1)} km`,
        duration: `${Math.round((distance / 1000) * 2)} mins`,
        distanceValue: distance,
        durationValue: Math.round((distance / 1000) * 2 * 60),
      });
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getAddressTypeIcon = () => {
    if (!addressData) return null;

    switch (addressData.addressType) {
      case "Home":
        return <HomeSmile className="w-4 h-4" />;
      case "Work":
        return <Buildings className="w-4 h-4" />;
      case "Other":
        return <GrLocation className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeName = () => {
    if (!addressData) return "";

    if (addressData.addressType === "Other" && addressData.otherAddressName) {
      return addressData.otherAddressName;
    }

    return addressData.addressType;
  };

  const handleSaveAddress = async () => {
    if (!addressData) {
      alert("No address data to save");
      return;
    }

    setSaving(true);
    try {
      // Extract city, state, and zip code from full address
      const extractAddressComponents = (fullAddress: string) => {
        const addressParts = fullAddress.split(",").map((part) => part.trim());

        // Default values
        let city = "Coimbatore";
        let state = "Tamil Nadu";
        let zipCode = "641103";

        // Try to extract zip code (6 digits)
        const zipMatch = fullAddress.match(/\b\d{6}\b/);
        if (zipMatch) {
          zipCode = zipMatch[0];
        }

        // Try to extract state
        if (addressParts.includes("Tamil Nadu")) {
          state = "Tamil Nadu";
        }

        // Try to extract city
        if (addressParts.includes("Coimbatore")) {
          city = "Coimbatore";
        }

        return { city, state, zipCode };
      };

      const { city, state, zipCode } = extractAddressComponents(
        addressData.location.address
      );

      // Prepare address data for API
      const addressPayload = {
        address_name:
          addressData.addressType === "Other" && addressData.otherAddressName
            ? addressData.otherAddressName
            : addressData.addressType,
        full_address: addressData.location.address,
        area: addressData.location.area,
        city,
        state,
        zip_code: zipCode,
        latitude: addressData.location.lat,
        longitude: addressData.location.lng,
        address_type: addressData.addressType,
        other_address_name:
          addressData.addressType === "Other"
            ? addressData.otherAddressName
            : null,
        additional_details: addressData.details,
        is_default: true, // Set as default for now
      };

      console.log("Saving address:", addressPayload);

      const response = await fetch("/api/addresses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressPayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Address saved successfully!");

        // Clear session storage and redirect
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pendingAddress");
          window.location.href = "/addresses";
        }
      } else {
        console.error("Failed to save address:", result.error);
        alert(`Failed to save address: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("An error occurred while saving the address");
    } finally {
      setSaving(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7a0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7a0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!addressData) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No address data found</p>
          <Link
            href="/addresses/new"
            className="text-[#7a0000] hover:underline"
          >
            Go back to add address
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f5f6fa]">
      <div className="max-w-[1200px] mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 z-50 bg-[#f5f6fa]">
          <div className="flex items-center justify-between p-4">
            <Link href="/addresses/new" className="flex items-center">
              <div className="p-3 bg-white rounded-full">
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </div>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              Confirm Address
            </h1>
            {/* Save Address Button - Desktop Only */}
            <button
              onClick={handleSaveAddress}
              disabled={saving}
              className="hidden md:flex px-4 py-2 bg-[#7a0000] text-white rounded-full hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="flex-1 flex flex-col pb-20 md:pb-0">
          {/* Map Container */}
          <div className="h-64 md:h-96 relative p-4">
            <div
              ref={mapRef}
              className="w-full h-full rounded-2xl overflow-hidden"
            />

            {!mapLoaded && (
              <div className="absolute inset-4 flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7a0000] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                  <p className="text-xs text-gray-500 mt-2">
                    If map doesn't load, check console for errors
                  </p>
                </div>
              </div>
            )}

            {/* Fallback when map fails to load */}
            {mapLoaded && !mapInstanceRef.current && (
              <div className="absolute inset-4 flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center">
                  <div className="text-[#7a0000] text-4xl mb-4">⚠️</div>
                  <p className="text-gray-600 mb-2">Map failed to load</p>
                  <p className="text-sm text-gray-500">
                    Check browser console for details
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            {/* Route Information */}
            {routeInfo && (
              <div className="flex gap-3 mb-6">
                {/* Distance Box */}
                <div className="flex-1 p-4 justify-center items-center bg-white rounded-xl">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-[#7a0000]" />
                    <span className="text-lg font-semibold text-gray-700">
                      {routeInfo.distance}
                    </span>
                  </div>
                </div>

                {/* Duration Box */}
                <div className="flex-1 p-4 bg-white rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#7a0000]" />
                    <span className="text-lg font-semibold text-gray-700">
                      {routeInfo.duration}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <div className="p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {getAddressTypeIcon()}
                    <span className="text-gray-900 font-medium">
                      {getAddressTypeName()}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 mt-1 ml-6">
                    {addressData.location.address}
                  </p>
                  {addressData.details && (
                    <p className="text-[12px] text-gray-500 mt-1 ml-6">
                      {addressData.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Save Button - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <button
            onClick={handleSaveAddress}
            disabled={saving}
            className="w-full px-4 py-3 bg-[#7a0000] text-white rounded-full hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
