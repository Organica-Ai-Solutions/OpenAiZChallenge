// Google Maps API TypeScript definitions
declare global {
    interface Window {
      google: typeof google;
      initGoogleMaps: () => void;
      analyzeLocation: (coords: string) => void;
      currentInfoWindow: google.maps.InfoWindow;
      gm_authFailure: () => void;
    }
  
    namespace google {
      namespace maps {
        class Map {
          constructor(mapDiv: HTMLElement, opts?: MapOptions);
          addListener(eventName: string, handler: (event?: any) => void): void;
          setCenter(latLng: LatLng | LatLngLiteral): void;
          setZoom(zoom: number): void;
          setMapTypeId(mapTypeId: MapTypeId): void;
          getMapId(): string | null;
        }
  
        interface MapOptions {
          center?: LatLng | LatLngLiteral;
          zoom?: number;
          mapTypeId?: MapTypeId;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
          zoomControl?: boolean;
          styles?: MapTypeStyle[];
        }
  
        interface MapTypeStyle {
          featureType?: string;
          stylers: Array<{ [key: string]: any }>;
        }
  
        interface LatLngLiteral {
          lat: number;
          lng: number;
        }
  
        class LatLng {
          lat(): number;
          lng(): number;
        }
  
        enum MapTypeId {
          HYBRID = 'hybrid',
          ROADMAP = 'roadmap',
          SATELLITE = 'satellite',
          TERRAIN = 'terrain'
        }
  
        class Marker {
          constructor(opts?: MarkerOptions);
          addListener(eventName: string, handler: () => void): void;
          setMap(map: Map | null): void;
        }
  
        interface MarkerOptions {
          position?: LatLng | LatLngLiteral;
          map?: Map;
          title?: string;
          icon?: Symbol | string;
        }
  
        interface Symbol {
          path: SymbolPath;
          scale?: number;
          fillColor?: string;
          fillOpacity?: number;
          strokeColor?: string;
          strokeWeight?: number;
        }
  
        enum SymbolPath {
          CIRCLE = 0,
          FORWARD_CLOSED_ARROW = 1,
          FORWARD_OPEN_ARROW = 2,
          BACKWARD_CLOSED_ARROW = 3,
          BACKWARD_OPEN_ARROW = 4
        }
  
        class InfoWindow {
          constructor(opts?: InfoWindowOptions);
          open(map?: Map, anchor?: Marker): void;
          close(): void;
        }
  
        interface InfoWindowOptions {
          content?: string | Element;
          position?: LatLng | LatLngLiteral;
        }
  
        class Geocoder {
          geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void;
        }
  
        interface GeocoderRequest {
          address?: string;
          location?: LatLng | LatLngLiteral;
        }
  
        interface GeocoderResult {
          geometry: {
            location: LatLng;
          };
        }
  
        type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  
        interface MapMouseEvent {
          latLng: LatLng | null;
        }
  
        namespace marker {
          class AdvancedMarkerElement {
            constructor(options: {
              position: { lat: number; lng: number };
              map: Map;
              title?: string;
              content?: HTMLElement;
            });
            addListener(eventName: string, handler: Function): void;
          }
        }
      }
    }
  }
  
  export {} 