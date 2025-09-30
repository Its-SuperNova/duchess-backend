"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MapPin, Navigation, Search, X, ArrowLeft } from "lucide-react";
import { MapPointWave } from "@solar-icons/react";

// Google Maps types are handled by @types/google.maps

interface Location {
  lat: number;
  lng: number;
  address: string;
  area: string;
}

interface SearchResult {
  place_id: string;
  description: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function NewAddressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [addressDetails, setAddressDetails] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    const initializeMapWithDelay = () => {
      if (typeof window !== "undefined" && window.google) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          initializeMap(1);
        }, 100);
      } else {
        loadGoogleMapsScript();
      }
    };

    // Use a longer delay to ensure DOM is fully rendered
    setTimeout(() => {
      initializeMapWithDelay();
    }, 500);
  }, []);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
      console.error("Google Maps API key is missing!");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => {
      console.log("Google Maps script loaded");
      initializeMap(1);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  };

  const initializeMap = (attempt = 1) => {
    if (!mapRef.current) {
      if (attempt < 5) {
        console.error(
          `Map ref is not available, retrying in 500ms... (attempt ${attempt}/5)`
        );
        setTimeout(() => {
          initializeMap(attempt + 1);
        }, 500);
        return;
      } else {
        console.error("Map ref failed to initialize after 5 attempts");
        setRetryCount(5);
        return;
      }
    }

    console.log("Initializing Google Map...");
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 11.0168, lng: 76.9558 }, // Default Coimbatore coordinates
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Add fixed center pin
    const centerPin = new google.maps.Marker({
      position: map.getCenter()!,
      map: map,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 12 32 12 32S24 18.6 24 12C24 5.4 18.6 0 12 0Z" fill="#FF0000"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
            <circle cx="12" cy="12" r="2" fill="#FF0000"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 32),
        anchor: new google.maps.Point(12, 32),
      },
      draggable: false,
      zIndex: 1000,
    });

    // Add pulsing circle animation
    const pulsingCircle = new google.maps.Circle({
      strokeColor: "#4285F4",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#4285F4",
      fillOpacity: 0.2,
      map: map,
      center: map.getCenter()!,
      radius: 50,
    });

    // Update location when map is dragged
    map.addListener("dragend", () => {
      const center = map.getCenter()!;
      const latLng = { lat: center.lat(), lng: center.lng() };
      centerPin.setPosition(latLng);
      pulsingCircle.setCenter(latLng);
      reverseGeocode(latLng.lat, latLng.lng);
    });

    // Update location when map is clicked
    map.addListener("click", (event: any) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        map.setCenter({ lat, lng });
        centerPin.setPosition({ lat, lng });
        pulsingCircle.setCenter({ lat, lng });
        reverseGeocode(lat, lng);
      }
    });

    // Store map instance for later use
    mapInstanceRef.current = map;

    setMapLoaded(true);
    console.log("Map initialized successfully");

    // Automatically get user's current location after map loads
    setTimeout(() => {
      getCurrentLocation();
    }, 1000);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const result = results[0];
          setSelectedLocation({
            lat,
            lng,
            address: result.formatted_address,
            area: extractAreaFromAddress(result.formatted_address),
          });
        }
      }
    );
  };

  const extractAreaFromAddress = (address: string): string => {
    const parts = address.split(",");
    return parts[0]?.trim() || "";
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "in" },
          types: ["geocode"],
        },
        (predictions: any, status: any) => {
          if (status === "OK" && predictions) {
            setSearchResults(
              predictions.map((prediction: any) => ({
                place_id: prediction.place_id,
                description: prediction.description,
                formatted_address: prediction.description,
                geometry: {
                  location: {
                    lat: 0,
                    lng: 0,
                  },
                },
              }))
            );
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error("Search error:", error);
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    const service = new google.maps.places.PlacesService(mapRef.current!);
    service.getDetails(
      {
        placeId: result.place_id,
        fields: ["geometry", "formatted_address", "address_components"],
      },
      (place: any, status: any) => {
        if (status === "OK" && place && place.geometry) {
          const lat = place.geometry.location!.lat();
          const lng = place.geometry.location!.lng();

          setSelectedLocation({
            lat,
            lng,
            address: place.formatted_address || result.formatted_address,
            area: extractAreaFromAddress(
              place.formatted_address || result.formatted_address
            ),
          });

          // Update map center
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);
          }
        }
      }
    );

    setSearchQuery(result.description);
    setShowSearchResults(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser. Please enter your address manually."
      );
      return;
    }

    // Check if we're on localhost/development
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("192.168") ||
      window.location.protocol === "http:";

    if (isLocalhost) {
      alert(
        "Location access is restricted on localhost. Please use the search bar or manual address input instead."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        reverseGeocode(lat, lng);

        // Update map center using stored map instance
        console.log("Updating map center to current location");
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);

          // Add blue pulsing circle for current location
          const currentLocationCircle = new google.maps.Circle({
            strokeColor: "#4285F4",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#4285F4",
            fillOpacity: 0.3,
            map: mapInstanceRef.current,
            center: { lat, lng },
            radius: 50,
          });

          // Add blue dot marker for current location center
          const currentLocationMarker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="6" r="6" fill="#4285F4"/>
                  <circle cx="6" cy="6" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(12, 12),
              anchor: new google.maps.Point(6, 6),
            },
            draggable: false,
            zIndex: 1001,
          });
        }

        setSelectedLocation({
          lat,
          lng,
          address: "Current Location",
          area: "Getting address...",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to get your current location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please allow location access in your browser settings or enter your address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information unavailable. Please enter your address manually.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please try again or enter your address manually.";
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSaveAddress = () => {
    if (!selectedLocation || !addressDetails.trim()) {
      alert("Please select a location and enter address details.");
      return;
    }

    console.log("Saving address:", {
      location: selectedLocation,
      details: addressDetails,
    });

    alert("Address saved successfully!");
  };

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Link href="/addresses" className="flex items-center">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            Select delivery location
          </h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-gray-100">
        <div ref={mapRef} className="w-full h-full min-h-[400px]" />

        {/* Fallback when map is not loaded */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              {retryCount < 5 ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </>
              ) : (
                <>
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-gray-600 mb-2">Map failed to load</p>
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      setMapLoaded(false);
                      initializeMap(1);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Manual Location Input */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              const address = prompt("Enter your address manually:");
              if (address) {
                handleSearch(address);
              }
            }}
            className="bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            📍 Enter Address
          </button>
        </div>

        {/* Fixed Center Pin Instruction */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
            Move pin to your exact delivery location
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={getCurrentLocation}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
        >
          <MapPointWave weight="Bold" color="red" size={16} />
          {typeof window !== "undefined" &&
          (window.location.hostname.includes("192.168") ||
            window.location.protocol === "http:")
            ? "Search location"
            : "Use current location"}
        </button>

        {/* Google Logo */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          Google
        </div>
      </div>

      {/* Search Results Overlay */}
      {showSearchResults && (
        <div className="absolute top-32 left-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <button
                  key={result.place_id}
                  onClick={() => handleLocationSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {result.description.split(",")[0]}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {result.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}

      {/* Backdrop for search results */}
      {showSearchResults && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
}
