import React, { useEffect, useRef, useState } from 'react';

interface SatelliteLidarMapProps {
  satelliteData?: any;
  coordinates?: { lat: number; lng: number };
  onCoordinateChange?: (coords: { lat: number; lng: number }) => void;
  allSites?: any[];
}

declare global {
  interface Window {
    google?: any;
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
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Check if already loading to prevent multiple loads
      if (window.googleMapsLoaded) {
        return;
      }

      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setMapError('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
        setIsLoading(false);
        return;
      }

      // Mark as loading to prevent multiple loads
      window.googleMapsLoaded = true;

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      script.onerror = () => {
        setMapError('Failed to load Google Maps API. Please check your API key and internet connection.');
        setIsLoading(false);
        window.googleMapsLoaded = false;
      };
      
      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        // Script already exists, wait for it to load
        if (window.google && window.google.maps) {
          initializeMap();
        } else {
          // Wait a bit and try again
          setTimeout(() => {
            if (window.google && window.google.maps) {
              initializeMap();
            } else {
              setMapError('Google Maps API failed to load properly.');
              setIsLoading(false);
            }
          }, 2000);
        }
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) {
        setMapError('Google Maps API not available.');
        setIsLoading(false);
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 15,
          mapTypeId: 'satellite',
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
        new window.google.maps.Marker({
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
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });

        // Add archaeological sites markers
        allSites.forEach((site, index) => {
          const marker = new window.google.maps.Marker({
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
              scaledSize: new window.google.maps.Size(20, 20)
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
          new window.google.maps.Rectangle({
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
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize Google Maps.');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [coordinates, satelliteData, onCoordinateChange]);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.setCenter(coordinates);
    }
  }, [coordinates]);

  if (mapError) {
    return (
      <div className="relative w-full h-full">
        <div 
          className="w-full h-full rounded-lg bg-slate-800/50 border border-slate-700"
          style={{ minHeight: '400px' }}
        />
        
        {/* Error overlay */}
        <div className="absolute inset-0 bg-slate-800/90 flex items-center justify-center rounded-lg">
          <div className="text-center max-w-md p-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-white font-semibold mb-2">Map Unavailable</h3>
            <p className="text-slate-300 text-sm mb-4">{mapError}</p>
            <div className="bg-slate-700/50 p-3 rounded text-xs text-slate-400">
              <p>To enable Google Maps:</p>
              <p>1. Get an API key from Google Cloud Console</p>
              <p>2. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
            </div>
          </div>
        </div>

        {/* Info overlay */}
        <div className="absolute top-4 left-4 bg-slate-800/90 text-white p-3 rounded-lg text-sm">
          <div className="font-semibold mb-1">Satellite + LiDAR View</div>
          <div>Lat: {coordinates.lat.toFixed(6)}</div>
          <div>Lng: {coordinates.lng.toFixed(6)}</div>
          {satelliteData && (
            <div className="mt-2 text-green-400">
              ✓ LiDAR overlay ready
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading satellite map...</p>
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-slate-800/90 text-white p-3 rounded-lg text-sm">
        <div className="font-semibold mb-1">Satellite + LiDAR View</div>
        <div>Lat: {coordinates.lat.toFixed(6)}</div>
        <div>Lng: {coordinates.lng.toFixed(6)}</div>
        {satelliteData && (
          <div className="mt-2 text-green-400">
            ✓ LiDAR overlay active
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteLidarMap; 