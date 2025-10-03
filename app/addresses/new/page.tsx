"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Navigation, Search, X, ArrowLeft } from "lucide-react";
import { MapPointWave, HomeSmile, Buildings } from "@solar-icons/react";
import { HiMapPin, HiMiniMapPin } from "react-icons/hi2";
import { GrLocation } from "react-icons/gr";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Google Maps types are handled by @types/google.maps

// Extend Window interface for marker reference
declare global {
  interface Window {
    selectedLocationMarker?: google.maps.Marker;
  }
}

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
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<
    "Home" | "Work" | "Other"
  >("Home");
  const [otherAddressName, setOtherAddressName] = useState("");
  const [mounted, setMounted] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);

    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Prevent body scrolling
    document.body.style.overflow = "hidden";

    // Fix for iOS Safari/Chrome viewport height issues
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    // Cleanup: restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", setVH);
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mounted) return;

    const initializeMapWithDelay = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map
      ) {
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
    }, 1000);
  }, [mounted]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("Google Maps script already exists, waiting for load...");
      // Wait for the script to load
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log("Google Maps loaded from existing script");
          initializeMap(1);
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up global callback
    (window as any).initGoogleMaps = () => {
      console.log("Google Maps script loaded successfully");
      setTimeout(() => {
        initializeMap(1);
      }, 200);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  };

  const initializeMap = (attempt = 1) => {
    // Check if Google Maps is fully loaded
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      if (attempt < 10) {
        console.log(
          `Google Maps not ready, retrying in 200ms... (attempt ${attempt}/10)`
        );
        setTimeout(() => {
          initializeMap(attempt + 1);
        }, 200);
        return;
      } else {
        console.error("Google Maps failed to load after 10 attempts");
        setRetryCount(10);
        return;
      }
    }

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

    // Set default location - Barathipuram, Coimbatore coordinates
    const defaultLocation = { lat: 11.0045, lng: 76.9615 };

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
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

      // Update location when map is dragged
      map.addListener("dragend", () => {
        const center = map.getCenter()!;
        const latLng = { lat: center.lat(), lng: center.lng() };

        // Clear any existing selected location marker
        if (window.selectedLocationMarker) {
          window.selectedLocationMarker.setMap(null);
          window.selectedLocationMarker = undefined;
        }

        reverseGeocode(latLng.lat, latLng.lng);
      });

      // Update location when map is clicked
      map.addListener("click", (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          map.setCenter({ lat, lng });

          // Clear any existing selected location marker
          if (window.selectedLocationMarker) {
            window.selectedLocationMarker.setMap(null);
            window.selectedLocationMarker = undefined;
          }

          reverseGeocode(lat, lng);
        }
      });

      // Store map instance for later use
      mapInstanceRef.current = map;

      setMapLoaded(true);
      console.log("Map initialized successfully");

      // Automatically get user's current location after map loads (only if not localhost)
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("192.168") ||
        window.location.protocol === "http:";

      if (!isLocalhost) {
        setTimeout(() => {
          getCurrentLocation();
        }, 1000);
      } else {
        // For localhost, set the fallback location immediately
        setTimeout(() => {
          getCurrentLocation();
        }, 500);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setRetryCount(5);
    }
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
          location: new google.maps.LatLng(11.0168, 76.9558), // Coimbatore coordinates
          radius: 50000, // 50km radius around Coimbatore
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
    // Check if map is available
    if (!mapInstanceRef.current) {
      console.error("Map not initialized yet");
      return;
    }

    // First, try to get detailed place information
    const service = new google.maps.places.PlacesService(
      mapInstanceRef.current
    );
    service.getDetails(
      {
        placeId: result.place_id,
        fields: ["geometry", "formatted_address", "address_components"],
      },
      (place: any, status: any) => {
        console.log("Place details status:", status);
        console.log("Place details:", place);

        if (status === "OK" && place && place.geometry) {
          const lat = place.geometry.location!.lat();
          const lng = place.geometry.location!.lng();

          console.log("Selected location coordinates:", { lat, lng });

          setSelectedLocation({
            lat,
            lng,
            address: place.formatted_address || result.formatted_address,
            area: extractAreaFromAddress(
              place.formatted_address || result.formatted_address
            ),
          });

          // Update map center and add marker
          if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;

            // Clear any existing markers
            if (window.selectedLocationMarker) {
              window.selectedLocationMarker.setMap(null);
            }

            // Center map on selected location
            map.setCenter({ lat, lng });
            map.setZoom(16);

            // Add a marker for the selected location
            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: place.formatted_address || result.formatted_address,
              icon: {
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#7a0000"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 24),
              },
              animation: google.maps.Animation.DROP,
            });

            console.log("Marker added to map:", marker);

            // Store marker reference for cleanup
            window.selectedLocationMarker = marker;
          }
        } else {
          console.error("Failed to get place details:", status);
          // Fallback: Use geocoding to get coordinates from the description
          console.log("Attempting fallback geocoding for:", result.description);

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: result.description },
            (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();

                console.log("Fallback coordinates:", { lat, lng });

                setSelectedLocation({
                  lat,
                  lng,
                  address: result.formatted_address || result.description,
                  area: extractAreaFromAddress(result.description),
                });

                // Update map center and add marker
                if (mapInstanceRef.current) {
                  const map = mapInstanceRef.current;

                  // Clear any existing markers
                  if (window.selectedLocationMarker) {
                    window.selectedLocationMarker.setMap(null);
                  }

                  // Center map on selected location
                  map.setCenter({ lat, lng });
                  map.setZoom(16);

                  // Add a marker for the selected location
                  const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: result.description,
                    icon: {
                      url:
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#7a0000"/>
                        </svg>
                      `),
                      scaledSize: new google.maps.Size(24, 24),
                      anchor: new google.maps.Point(12, 24),
                    },
                    animation: google.maps.Animation.DROP,
                  });

                  console.log("Fallback marker added to map:", marker);

                  // Store marker reference for cleanup
                  window.selectedLocationMarker = marker;
                }
              } else {
                console.error("Fallback geocoding also failed:", status);
              }
            }
          );
        }
      }
    );

    setSearchQuery(result.description);
    setShowSearchResults(false);
  };

  const getCurrentLocation = () => {
    // Check if we're on localhost/development
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("192.168") ||
      window.location.protocol === "http:";

    if (isLocalhost) {
      // Use fallback location for localhost - Barathipuram, Coimbatore
      const fallbackLat = 11.0045;
      const fallbackLng = 76.9615;

      console.log("Using fallback location for localhost");

      // Update map center to fallback location
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({
          lat: fallbackLat,
          lng: fallbackLng,
        });
        mapInstanceRef.current.setZoom(16);
      }

      // Set fallback address
      setSelectedLocation({
        lat: fallbackLat,
        lng: fallbackLng,
        address: "Barathipuram, Coimbatore, Tamil Nadu 641103, India",
        area: "Barathipuram",
      });

      return;
    }

    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser. Please enter your address manually."
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
          // Clear any existing selected location marker
          if (window.selectedLocationMarker) {
            window.selectedLocationMarker.setMap(null);
            window.selectedLocationMarker = undefined;
          }

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
            radius: 40,
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

  // Shared search content component
  const SearchContent = () => (
    <>
      {/* Search Input in Search Component */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
          style={{ color: "#7a0000" }}
        />
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-10 py-3 bg-white rounded-xl focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Use Current Location Button */}
      {!searchQuery && (
        <button
          onClick={() => {
            getCurrentLocation();
            if (isMobile) {
              setShowSearchDrawer(false);
            } else {
              setShowSearchDialog(false);
            }
          }}
          className="w-full flex items-center justify-start gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <MapPointWave weight="Bold" color="#7a0000" size={16} />
          <div className="flex-1 text-left">
            <div className="font-medium" style={{ color: "#7a0000" }}>
              Use current location
            </div>
            {selectedLocation && (
              <div className="text-xs text-gray-500 w-[70%] truncate">
                {selectedLocation.address}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Search Results */}
      <div className="max-h-96 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((result, index) => (
              <button
                key={result.place_id}
                onClick={() => {
                  handleLocationSelect(result);
                  // Don't close drawer immediately, let the location selection complete
                  setTimeout(() => {
                    if (isMobile) {
                      setShowSearchDrawer(false);
                    } else {
                      setShowSearchDialog(false);
                    }
                  }, 500);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <HiMapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
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
        ) : searchQuery ? (
          <div className="p-4 text-center text-gray-500">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Start typing to search for locations
          </div>
        )}
      </div>
    </>
  );

  const handleSaveAddress = () => {
    if (!selectedLocation) {
      alert("Please select a location first.");
      return;
    }

    // Generate a temporary ID for the address
    const tempAddressId = `temp_${Date.now()}`;

    // Store the address data in sessionStorage for the confirmation page
    const addressData = {
      location: selectedLocation,
      details: addressDetails,
      addressType: selectedAddressType,
      otherAddressName: otherAddressName,
      tempId: tempAddressId,
    };

    sessionStorage.setItem("pendingAddress", JSON.stringify(addressData));

    // Redirect to confirmation page
    window.location.href = `/addresses/confirm/${tempAddressId}`;
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <div className="max-w-[1200px] mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 z-50 bg-white">
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
        <div className="flex-shrink-0 px-4 pb-3 bg-white">
          <div className="flex gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: "#7a0000" }}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onClick={() => {
                  if (isMobile) {
                    setShowSearchDrawer(true);
                  } else {
                    setShowSearchDialog(true);
                  }
                }}
                readOnly
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
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

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-2">
              {/* Use Current Location Button */}
              {mounted && (
                <button
                  onClick={getCurrentLocation}
                  className="px-4 py-2.5 bg-white border-2 text-[#7a0000] hover:bg-[#7a0000]/10 rounded-full flex items-center gap-2 transition-colors whitespace-nowrap"
                  style={{ borderColor: "#7a0000" }}
                >
                  <MapPointWave weight="Bold" color="#7a0000" size={16} />
                  <span className="hidden lg:inline">Use current location</span>
                  <span className="lg:hidden">Current</span>
                </button>
              )}

              {/* Confirm Location Button */}
              <button
                onClick={() => {
                  if (selectedLocation) {
                    setShowAddressDrawer(true);
                  } else {
                    alert(
                      "Please select a location first by using the search or current location."
                    );
                  }
                }}
                className="px-4 py-2.5 text-white hover:opacity-90 rounded-full flex items-center gap-2 transition-colors whitespace-nowrap"
                style={{ backgroundColor: "#7a0000" }}
              >
                <MapPointWave weight="Bold" color="white" size={16} />
                <span className="hidden lg:inline">Confirm location</span>
                <span className="lg:hidden">Confirm</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 h-full md:p-4">
          <div
            ref={mapRef}
            className="w-full h-full min-h-[400px] md:rounded-2xl md:overflow-hidden"
          />

          {/* Fixed Center Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <HiMiniMapPin
              className="h-8 w-8 drop-shadow-lg"
              style={{ color: "#7a0000" }}
            />
          </div>

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

          {/* Fixed Center Pin Instruction */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
              Move pin to your exact delivery location
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
            </div>
          </div>

          {/* Mobile Floating Buttons */}
          <div className="md:hidden">
            {/* Confirm Location Button */}
            <button
              onClick={() => {
                if (selectedLocation) {
                  setShowAddressDrawer(true);
                } else {
                  alert(
                    "Please select a location first by using the search or current location."
                  );
                }
              }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 text-white hover:opacity-90 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
              style={{ backgroundColor: "#7a0000" }}
            >
              <MapPointWave weight="Bold" color="white" size={16} />
              Confirm location
            </button>

            {/* Use Current Location Button */}
            {mounted && (
              <button
                onClick={getCurrentLocation}
                className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 bg-white text-[#7a0000] hover:bg-[#7a0000]/10 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
              >
                <MapPointWave weight="Bold" color="#7a0000" size={16} />
                Use current location
              </button>
            )}
          </div>
        </div>

        {/* Search Drawer */}
        <Drawer open={showSearchDrawer} onOpenChange={setShowSearchDrawer}>
          <DrawerContent className="bg-[#f5f6fa]">
            <div className="max-w-md ">
              <DrawerHeader className="bg-[#f5f6fa]">
                <div className="flex items-center justify-between">
                  <DrawerTitle>Select a location</DrawerTitle>
                  <button
                    onClick={() => setShowSearchDrawer(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </DrawerHeader>

              <div className="px-4 space-y-4 bg-[#f5f6fa]">
                <SearchContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Search Dialog - Desktop Only */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="bg-[#f5f6fa] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Select a location
                <button
                  onClick={() => setShowSearchDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <SearchContent />
            </div>
          </DialogContent>
        </Dialog>

        {/* Address Details Drawer */}
        <Drawer open={showAddressDrawer} onOpenChange={setShowAddressDrawer}>
          <DrawerContent>
            <div className="max-w-md mx-auto">
              <DrawerHeader>
                <DrawerTitle>Confirm Address</DrawerTitle>
              </DrawerHeader>

              {selectedLocation && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <div className="p-3 bg-[#f5f6fa] rounded-xl">
                      <div className="flex items-start gap-1">
                        <HiMapPin
                          className="h-5 w-5 flex-shrink-0 mt-[1px]"
                          style={{ color: "#7a0000" }}
                        />
                        <p className="text-gray-900 text-[14px]">
                          {selectedLocation.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      placeholder="Apartment, building, landmark..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent resize-none text-sm placeholder:text-sm"
                      style={
                        { "--tw-ring-color": "#7a0000" } as React.CSSProperties
                      }
                      rows={1}
                    />
                  </div>

                  {/* Save Address As Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Save address as
                    </label>
                    <div className="flex gap-2">
                      {/* Home Button */}
                      <button
                        onClick={() => setSelectedAddressType("Home")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                          selectedAddressType === "Home"
                            ? "bg-[#7a0000]/10 border-[#7a0000] text-[#7a0000]"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <HomeSmile className="w-4 h-4" />
                        Home
                      </button>

                      {/* Work Button */}
                      <button
                        onClick={() => setSelectedAddressType("Work")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                          selectedAddressType === "Work"
                            ? "bg-[#7a0000]/10 border-[#7a0000] text-[#7a0000]"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Buildings className="w-4 h-4" />
                        Work
                      </button>

                      {/* Other Button */}
                      <button
                        onClick={() => setSelectedAddressType("Other")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                          selectedAddressType === "Other"
                            ? "bg-[#7a0000]/10 border-[#7a0000] text-[#7a0000]"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <GrLocation className="w-4 h-4" />
                        Other
                      </button>
                    </div>

                    {/* Other Address Name Input */}
                    {selectedAddressType === "Other" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={otherAddressName}
                          onChange={(e) => setOtherAddressName(e.target.value)}
                          placeholder="Enter address name"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-sm placeholder:text-sm"
                          style={
                            {
                              "--tw-ring-color": "#7a0000",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DrawerFooter>
                <button
                  onClick={handleSaveAddress}
                  className="w-full px-4 py-3 text-white rounded-full hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "#7a0000" }}
                >
                  Confirm Address
                </button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
