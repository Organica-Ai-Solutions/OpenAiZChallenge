"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useTheme } from "next-themes"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import { Compass, Info } from "lucide-react"

// Import types
import { SiteData } from "@/types"

interface MapViewerImplProps {
  sites: SiteData[]
  selectedSite: SiteData | null
  onSiteSelect: (site: SiteData) => void
  className?: string
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
}

// Parse coordinates from string to [lat, lng] array
const parseCoordinates = (coords?: string): [number, number] | null => {
  if (!coords) return null;
  
  try {
    const [latStr, lonStr] = coords.split(',').map(coord => coord.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    
    if (isNaN(lat) || isNaN(lon)) {
      console.warn('Invalid coordinate format:', coords);
      return null;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.warn('Coordinates out of valid range:', coords);
      return null;
    }
    
    return [lat, lon];
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
}

// Convert site coordinates to location object
const transformSite = (site: SiteData): SiteData & { location: { lat: number, lng: number } } => {
  const coords = parseCoordinates(site.coordinates);
  return {
    ...site,
    location: {
      lat: coords ? coords[0] : 0,
      lng: coords ? coords[1] : 0
    }
  };
}

// Create marker icon based on confidence level
const createMarkerIcon = (confidence: number, isSelected = false) => {
  let color = "#ef4444" // red
  if (confidence >= 0.8) {
    color = "#16a34a" // green
  } else if (confidence >= 0.5) {
    color = "#d97706" // amber
  }

  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${isSelected ? "16px" : "12px"};
      height: ${isSelected ? "16px" : "12px"};
      border-radius: 50%;
      border: ${isSelected ? "3px" : "2px"} solid white;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
    "></div>
  `
  return L.divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
    iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
  })
}

// Component to fit map to markers
function FitBoundsToMarkers({ sites }: { sites: Array<SiteData & { location: { lat: number, lng: number } }> }) {
  const map = useMap();
  
  useEffect(() => {
    if (sites.length > 0) {
      const validSites = sites.filter(site => 
        site.location && 
        typeof site.location.lat === 'number' && 
        typeof site.location.lng === 'number'
      );
      
      if (validSites.length > 0) {
        const bounds = L.latLngBounds(validSites.map(site => [site.location.lat, site.location.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, sites]);
  
  return null;
}

// Component to center on selected site
function CenterOnSelectedSite({ site }: { site: (SiteData & { location: { lat: number, lng: number } }) | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && site && site.location && 
        typeof site.location.lat === 'number' && 
        typeof site.location.lng === 'number') {
      map.setView([site.location.lat, site.location.lng], 10, {
        animate: true,
        duration: 1,
      });
    }
  }, [map, site]);
  
  return null;
}

// Reset view control
function ResetViewControl({ sites }: { sites: Array<SiteData & { location: { lat: number, lng: number } }> }) {
  const map = useMap();
  
  const resetView = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (sites.length > 0) {
      const validSites = sites.filter(site => 
        site.location && 
        typeof site.location.lat === 'number' && 
        typeof site.location.lng === 'number'
      );
      
      if (validSites.length > 0) {
        const bounds = L.latLngBounds(validSites.map(site => [site.location.lat, site.location.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView([-5.2, -54.5], 6);
      }
    } else {
      map.setView([-5.2, -54.5], 6);
    }
  };
  
  return (
    <div className="leaflet-control leaflet-bar">
      <a 
        href="#" 
        role="button" 
        title="Reset view" 
        onClick={resetView} 
        className="flex items-center justify-center w-8 h-8 bg-white text-black hover:bg-gray-100"
      >
        <Compass size={16} />
      </a>
    </div>
  );
}

// Map legend component
function MapLegend() {
  const [collapsed, setCollapsed] = useState(true);
  
  return (
    <div className={`leaflet-control leaflet-bar bg-white border border-gray-300 rounded-md shadow-md transition-all duration-300 ${collapsed ? "w-8 h-8" : "p-3"}`}>
      {collapsed ? (
        <a 
          href="#" 
          role="button" 
          title="Show legend" 
          onClick={(e) => { e.preventDefault(); setCollapsed(false); }} 
          className="flex items-center justify-center w-full h-full text-black hover:bg-gray-100"
        >
          <Info size={16} />
        </a>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Confidence Levels</h3>
            <button 
              onClick={() => setCollapsed(true)} 
              className="text-gray-500 hover:text-gray-700" 
              aria-label="Close legend"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
              <span>High (≥80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600 border border-white"></div>
              <span>Medium (50-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
              <span>Low (&lt;50%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component
function MapContent({
  sites,
  selectedSite,
  onSiteSelect,
  initialCoordinates,
  onCoordinateSelect,
}: Omit<MapViewerImplProps, 'className'>) {
  const { theme } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  
  // Transform sites with proper location data
  const transformedSites = useMemo(() => 
    sites.map(site => transformSite(site)),
  [sites]);

  // Transform selected site
  const transformedSelectedSite = useMemo(() => 
    selectedSite ? transformSite(selectedSite) : null,
  [selectedSite]);

  // Initialize selected position from initialCoordinates
  useEffect(() => {
    const parsedInitial = parseCoordinates(initialCoordinates);
    if (parsedInitial) {
      setSelectedPosition(parsedInitial);
    }
  }, [initialCoordinates]);

  // Handle map click for coordinate selection
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onCoordinateSelect) {
      const { lat, lng } = e.latlng;
      const formattedCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedPosition([lat, lng]);
      onCoordinateSelect(formattedCoords);
    }
  };

  // Get map tile URL based on theme
  const mapTileUrl = theme === "dark" 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  
  // Get attribution
  const attribution = theme === "dark"
    ? '© <a href="https://carto.com/attributions">CARTO</a>'
    : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  return (
    <>
      <TileLayer 
        attribution={attribution} 
        url={mapTileUrl} 
      />
      
      {/* Map Controls */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control-container">
          <div className="leaflet-top leaflet-right">
            <ZoomControl position="topright" />
            <div className="leaflet-control-reset leaflet-bar leaflet-control mt-2">
              <ResetViewControl sites={transformedSites} />
            </div>
          </div>
          <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control-legend leaflet-bar leaflet-control mb-2 mr-2">
              <MapLegend />
            </div>
          </div>
        </div>
      </div>
      
      {/* Site Markers */}
      {transformedSites.map((site) => {
        if (!site.location || typeof site.location.lat !== 'number' || typeof site.location.lng !== 'number') {
          return null;
        }
        
        const isSelected = selectedSite && selectedSite.id === site.id ? true : false;
        
        return (
          <Marker
            key={site.id || `${site.location.lat}-${site.location.lng}`}
            position={[site.location.lat, site.location.lng]}
            icon={createMarkerIcon(site.confidence / 100, isSelected)}
            eventHandlers={{
              click: () => onSiteSelect(site),
            }}
          >
            <Popup className="site-popup">
              <div className="p-2">
                <h3 className="font-medium text-sm">{site.name || "Archaeological Site"}</h3>
                <p className="text-xs mt-1 text-gray-500">{site.type || "Unknown type"}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium">
                    Confidence: {(site.confidence || 0).toFixed(0)}%
                  </span>
                  <button 
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => onSiteSelect(site)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Selected coordinates marker */}
      {selectedPosition && (
        <Marker
          position={selectedPosition}
          icon={L.divIcon({
            html: `<div style="
              background-color: #3b82f6;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
            "></div>`,
            className: "selected-position-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        >
          <Popup className="coordinate-popup">
            <div className="p-2">
              <h3 className="font-medium text-sm">Selected Location</h3>
              <p className="text-xs text-gray-500">
                {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Map Utilities */}
      <FitBoundsToMarkers sites={transformedSites} />
      {transformedSelectedSite && <CenterOnSelectedSite site={transformedSelectedSite} />}
    </>
  );
}

export default function MapViewerImpl({
  sites = [],
  selectedSite = null,
  onSiteSelect = () => {},
  className = "",
  initialCoordinates,
  onCoordinateSelect,
}: MapViewerImplProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`map-container-${Math.random().toString(36).substring(2, 9)}`).current;
  
  // Get coordinates from initialCoordinates or first site or default
  const initialLocation = useMemo(() => {
    const parsedInitial = parseCoordinates(initialCoordinates);
    if (parsedInitial) {
      return parsedInitial;
    }
    
    if (sites.length > 0) {
      const coords = parseCoordinates(sites[0].coordinates);
      if (coords) return coords;
    }
    
    return [-5.2, -54.5] as [number, number]; // Default to Amazon region
  }, [initialCoordinates, sites]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // If not mounted (server-side), return a placeholder
  if (!mounted) {
    return (
      <div className={`relative h-full w-full rounded-md overflow-hidden bg-gray-200 ${className}`} 
           id={uniqueId}
           ref={mapContainerRef}
      />
    );
  }

  // Handle map click for coordinate selection
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onCoordinateSelect) {
      const { lat, lng } = e.latlng;
      const formattedCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onCoordinateSelect(formattedCoords);
    }
  };

  return (
    <div className={`relative h-full w-full rounded-md overflow-hidden ${className}`} 
         id={uniqueId}
         ref={mapContainerRef}>
      <MapContainer
        key={`map-${theme}-${uniqueId}`}
        center={initialLocation as L.LatLngExpression}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
        onClick={handleMapClick}
      >
        <MapContent
          sites={sites}
          selectedSite={selectedSite}
          onSiteSelect={onSiteSelect}
          initialCoordinates={initialCoordinates}
          onCoordinateSelect={onCoordinateSelect}
        />
      </MapContainer>

      {/* Custom Styles */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 220px !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
} 