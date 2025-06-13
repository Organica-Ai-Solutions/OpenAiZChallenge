import React, { useEffect, useRef, useState } from 'react';

interface SatelliteLidarMapProps {
  satelliteData?: any;
  coordinates?: { lat: number; lng: number };
  onCoordinateChange?: (coords: { lat: number; lng: number }) => void;
  allSites?: any[];
}

declare global {
  interface Window {
    initMap?: () => void;
    googleMapsLoaded?: boolean;
  }
}

const SatelliteLidarMap: React.FC<SatelliteLidarMapProps> = ({
  satelliteData,
  coordinates = { lat: 20.6843, lng: -88.5678 }, // Default to Chichen Itza
  onCoordinateChange,
  allSites = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Google Maps loading events from the main GoogleMapsLoader
    const handleGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      }
    };

    const handleGoogleMapsError = () => {
      setMapError('Google Maps API failed to load. Please check your API key configuration.');
      setIsLoading(false);
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // Listen for global Google Maps events
      window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      window.addEventListener('google-maps-error', handleGoogleMapsError);

      // If no Google Maps API key is configured, show fallback
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setMapError('Google Maps API key not configured. Using demo mode.');
        setIsLoading(false);
      }
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      window.removeEventListener('google-maps-error', handleGoogleMapsError);
    };
  }, [coordinates]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      setMapError('Google Maps API not available.');
      setIsLoading(false);
      return;
    }

    try {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        mapTypeId: (window as any).google.maps.MapTypeId.SATELLITE,
        styles: [
          {
            featureType: 'all',
            stylers: [{ saturation: -20 }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add click listener for coordinate updates
      map.addListener('click', (event: any) => {
        const newCoords = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        onCoordinateChange?.(newCoords);
      });

      // Add marker for current location
      new (window as any).google.maps.Marker({
        position: coordinates,
        map: map,
        title: 'Analysis Point',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(24, 24)
        }
      });

      // Add archaeological sites markers
      allSites.forEach((site, index) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: site.lat, lng: site.lng },
          map: map,
          title: `${site.name} (${Math.round(site.confidence * 100)}% confidence)`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#f97316" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(20, 20)
          }
        });

        // Add info window for archaeological sites
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #000; font-family: Arial, sans-serif; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: bold;">
                ${site.name}
              </h3>
              <p style="margin: 0 0 4px 0; font-size: 12px;">
                <strong>Confidence:</strong> ${Math.round(site.confidence * 100)}%
              </p>
              <p style="margin: 0 0 4px 0; font-size: 12px;">
                <strong>Discovery:</strong> ${site.discovery_date}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px;">
                <strong>Significance:</strong> ${site.cultural_significance}
              </p>
              <p style="margin: 0; font-size: 11px; color: #666;">
                <strong>Sources:</strong> ${site.data_sources.join(', ')}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          // Also update coordinates when clicking on a site
          onCoordinateChange?.({ lat: site.lat, lng: site.lng });
        });
      });

      // Simulate LiDAR data overlay (placeholder for now)
      if (satelliteData) {
        // This would be where we'd add custom overlays for LiDAR data
        // For now, we'll add a simple rectangle to show the concept
        new (window as any).google.maps.Rectangle({
          bounds: {
            north: coordinates.lat + 0.001,
            south: coordinates.lat - 0.001,
            east: coordinates.lng + 0.001,
            west: coordinates.lng - 0.001
          },
          map: map,
          fillColor: '#00ff00',
          fillOpacity: 0.2,
          strokeColor: '#00ff00',
          strokeOpacity: 0.8,
          strokeWeight: 2
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing satellite map:', error);
      setMapError('Failed to initialize map. Please try refreshing the page.');
      setIsLoading(false);
    }
  };

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.setCenter(coordinates);
      mapInstanceRef.current.setZoom(15);
    }
  }, [coordinates]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-600">{mapError}</div>
          <div className="mt-2 text-xs text-gray-500">
            Showing demo satellite view for coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <div className="animate-spin text-2xl mb-2">🛰️</div>
          <div className="text-sm text-gray-600">Loading satellite imagery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Overlay info */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        🛰️ Satellite View | 📡 LiDAR Enhanced
      </div>
      
      {/* Coordinates display */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default SatelliteLidarMap; 