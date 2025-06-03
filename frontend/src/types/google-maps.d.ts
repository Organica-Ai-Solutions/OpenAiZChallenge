// Google Maps API TypeScript definitions
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
    analyzeLocation: (coords: string) => void;
    currentInfoWindow: google.maps.InfoWindow;
    gm_authFailure: () => void;
  }

  namespace google.maps {
    interface Map {
      getMapId(): string | null;
    }

    namespace marker {
      class AdvancedMarkerElement {
        constructor(options: {
          position: { lat: number; lng: number };
          map: google.maps.Map;
          title?: string;
          content?: HTMLElement;
        });
        addListener(eventName: string, handler: Function): void;
      }
    }
  }
}

export {} 