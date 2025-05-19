import React, { useState, useCallback, useMemo, useEffect } from "react"
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { SiteData } from "@/types"
import type { ViewStateChangeEvent } from 'react-map-gl'

interface MapboxMapViewerProps {
  sites?: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
}

const parseCoordinates = (coordsString?: string): [number, number] | null => {
  if (!coordsString) return null;
  
  try {
    const [latStr, lonStr] = coordsString.split(',').map(coord => coord.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    
    if (isNaN(lat) || isNaN(lon)) {
      console.warn("[MapboxMapViewer] Invalid coordinate format:", coordsString);
      return null;
    }
    
    return [lat, lon];
  } catch (error) {
    console.warn("[MapboxMapViewer] Error parsing coordinates:", coordsString, error);
    return null;
  }
}

const validateMapboxToken = (token?: string): boolean => {
  // Check if token exists and starts with 'pk.'
  if (!token) {
    console.error("[MapboxMapViewer] No Mapbox token provided");
    return false;
  }

  if (!token.startsWith('pk.')) {
    console.error("[MapboxMapViewer] Invalid Mapbox token. Must start with 'pk.'");
    return false;
  }

  // Optional: Add more validation if needed (e.g., token length, format)
  return true;
}

export default function MapboxMapViewer({
  sites = [],
  onSiteSelect = () => {},
  selectedSite = null,
  initialCoordinates,
  onCoordinateSelect
}: MapboxMapViewerProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    latitude: -5.2,
    longitude: -54.5,
    zoom: 5
  });

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (validateMapboxToken(token)) {
      setMapboxToken(token || null);
      setTokenError(null);
    } else {
      setMapboxToken(null);
      setTokenError("Invalid Mapbox access token. Please check your configuration.");
    }
  }, []);

  const initialLocation = useMemo(() => {
    const parsedInitial = parseCoordinates(initialCoordinates);
    if (parsedInitial) {
      return {
        latitude: parsedInitial[0],
        longitude: parsedInitial[1],
        zoom: 10
      };
    }
    
    if (sites.length > 0) {
      const firstSiteCoords = parseCoordinates(sites[0].coordinates);
      if (firstSiteCoords) {
        return {
          latitude: firstSiteCoords[0],
          longitude: firstSiteCoords[1],
          zoom: 10
        };
      }
    }
    
    return viewState;
  }, [initialCoordinates, sites]);

  const handleMapClick = useCallback((event: any) => {
    if (onCoordinateSelect) {
      const { lat, lng } = event.lngLat;
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onCoordinateSelect(coords);
    }
  }, [onCoordinateSelect]);

  const handleViewStateChange = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  }, []);

  if (tokenError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-red-500 flex flex-col items-center p-4 text-center">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p className="text-sm mb-2">Mapbox Configuration Error</p>
          <p className="text-xs mb-4">{tokenError}</p>
          <Button variant="destructive" size="sm">
            Check Configuration
          </Button>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-yellow-500 flex flex-col items-center p-4 text-center">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p className="text-sm mb-2">Mapbox Token Loading</p>
          <p className="text-xs mb-4">Validating Mapbox access token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Map
        {...viewState}
        onMove={handleViewStateChange}
        onClick={handleMapClick}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/standard"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {sites.map((site) => {
          const coords = parseCoordinates(site.coordinates);
          if (!coords) return null;

          return (
            <Marker
              key={site.id}
              latitude={coords[0]}
              longitude={coords[1]}
              onClick={() => onSiteSelect(site)}
            >
              <div 
                className="rounded-full w-4 h-4 bg-blue-500 border-2 border-white shadow-md"
                style={{ 
                  backgroundColor: site.confidence >= 80 ? 'green' : 
                                   site.confidence >= 50 ? 'orange' : 'red' 
                }}
              />
            </Marker>
          );
        })}
      </Map>
    </div>
  );
} 