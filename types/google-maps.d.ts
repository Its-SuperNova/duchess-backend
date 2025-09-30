declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng | undefined;
      setZoom(zoom: number): void;
      addListener(eventName: string, handler: Function): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setCenter(center: LatLng | LatLngLiteral): void;
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (
          results: GeocoderResult[] | null,
          status: GeocoderStatus
        ) => void
      ): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      styles?: MapTypeStyle[];
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      icon?: string | Icon | Symbol;
      draggable?: boolean;
      zIndex?: number;
    }

    interface CircleOptions {
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      center?: LatLng | LatLngLiteral;
      radius?: number;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface Symbol {
      path: string;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    interface Size {
      width: number;
      height: number;
    }

    interface Point {
      x: number;
      y: number;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: object[];
    }

    interface GeocoderRequest {
      location?: LatLng | LatLngLiteral;
      address?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: GeocoderGeometry;
    }

    interface GeocoderGeometry {
      location: LatLng;
    }

    enum GeocoderStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      INVALID_REQUEST = "INVALID_REQUEST",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
    }

    interface MapMouseEvent {
      latLng?: LatLng;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompleteRequest,
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(mapDiv: Element);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (
            place: PlaceResult | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface AutocompleteRequest {
        input: string;
        componentRestrictions?: ComponentRestrictions;
        types?: string[];
      }

      interface AutocompletePrediction {
        place_id: string;
        description: string;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        formatted_address?: string;
        geometry?: PlaceGeometry;
      }

      interface PlaceGeometry {
        location?: LatLng;
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
      }

      interface ComponentRestrictions {
        country: string;
      }
    }
  }
}

export {};
