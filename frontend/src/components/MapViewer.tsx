"use client"

import type React from "react"
import { useEffect, useState, useRef, memo, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layers, MapIcon, Database } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { AmazonArchaeologicalSites, ArchaeologicalSite } from '../types/archaeological-site'

// Define types for Leaflet components to avoid direct imports
type MapContainerProps = {
  center: [number, number]
  zoom: number
  style: React.CSSProperties
  whenCreated?: (map: any) => void
  onClick?: (e: any) => void
  children: React.ReactNode
}

type TileLayerProps = {
  url: string
  attribution: string
}

type MarkerProps = {
  position: [number, number]
  icon?: any
  children?: React.ReactNode
}

type PopupProps = {
  children: React.ReactNode
}

type CircleProps = {
  center: [number, number]
  radius: number
  pathOptions: any
}

type GeoJSONProps = {
  data: any
  style: (feature: any) => any
  onEachFeature: (feature: any, layer: any) => void
}

// Memoize known sites to prevent regeneration
const KNOWN_SITES: Array<{
  name: string
  coordinates: LatLngTuple
  description: string
  confidence: number
  type: string
}> = AmazonArchaeologicalSites.map(site => ({
  name: site.name,
  coordinates: site.coordinates as LatLngTuple,
  description: site.features.map(f => f.description).join('; '),
  confidence: site.confidenceScore,
  type: site.type
}));

// Memoize mock LIDAR data
const MOCK_LIDAR_DATA: FeatureCollection = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature",
      properties: {
        name: "Potential Settlement",
        confidence: 85,
        type: "Settlement",
        description: "Rectangular pattern consistent with human modification",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-53.22, -12.26],
            [-53.22, -12.25],
            [-53.21, -12.25],
            [-53.21, -12.26],
            [-53.22, -12.26],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Linear Feature",
        confidence: 72,
        type: "Road",
        description: "Possible ancient road or causeway",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-53.23, -12.27],
          [-53.21, -12.25],
        ],
      },
    },
  ],
}

interface MapViewerProps {
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
}

// Memoized Map Container Component
const MapContainerComponent = memo(({ 
  leafletComponents,
  mapCenter,
  mapZoom,
  activeBaseMap,
  showKnownSites,
  showLidarData,
  selectedCoordinates,
  handleMapClick,
  lidarStyle,
  setMapRef,
  knownSites,
  mockLidarData
}: {
  leafletComponents: any
  mapCenter: [number, number]
  mapZoom: number
  activeBaseMap: string
  showKnownSites: boolean
  showLidarData: boolean
  selectedCoordinates: [number, number] | null
  handleMapClick: (e: any) => void
  lidarStyle: (feature: any) => any
  setMapRef: (map: any) => void
  knownSites: Array<{
    name: string
    coordinates: LatLngTuple
    description: string
    confidence: number
    type: string
  }>
  mockLidarData: FeatureCollection
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    let map: any;
    const container = mapContainerRef.current;

    const initMap = async () => {
      // Prevent multiple initializations
      if (isMapInitialized || !container || !leafletComponents) return;

      try {
        const L = await import('leaflet');
        
        // Ensure any existing map is properly removed
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Ensure the container is clean and ready
        if (container.children.length > 0) {
          container.innerHTML = '';
        }

        // Create new map instance with safe initialization
        map = L.map(container, {
          center: mapCenter,
          zoom: mapZoom,
          preferCanvas: true,
          attributionControl: true,
          zoomControl: true
        });

        // Store reference and mark as initialized
        mapInstanceRef.current = map;
        setMapRef(map);
        setIsMapInitialized(true);

        // Add click event listener
        map.on('click', handleMapClick);

        // Add initial tile layer
        let tileLayer;
        if (activeBaseMap === "satellite") {
          tileLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            }
          );
        } else if (activeBaseMap === "terrain") {
          tileLayer = L.tileLayer(
            "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
            {
              attribution: "&copy; <a href='http://stamen.com'>Stamen Design</a> &mdash; Map data &copy; OpenStreetMap contributors"
            }
          );
        } else {
          tileLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution: "&copy; OpenStreetMap contributors"
            }
          );
        }

        tileLayer.addTo(map);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapInitialized(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          setIsMapInitialized(false);
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
      }
    };
  }, [mapCenter, mapZoom, activeBaseMap, leafletComponents, handleMapClick, setMapRef, isMapInitialized]);

  // Update map view when center or zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;
    mapInstanceRef.current.setView(mapCenter, mapZoom, { animate: true });
  }, [mapCenter, mapZoom, isMapInitialized]);

  // Update markers when showKnownSites changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = window.L;

    // Remove existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (showKnownSites) {
      knownSites.forEach((site) => {
        const marker = L.marker(site.coordinates, {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: rgba(52, 211, 153, 0.8); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })
        });

        marker.bindPopup(`
          <div class="p-1">
            <h3 class="font-bold text-sm">${site.name}</h3>
            <p class="text-xs mt-1">${site.description}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs px-2 py-1 rounded-full border">${site.type}</span>
              <span class="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white">${site.confidence}% confidence</span>
            </div>
          </div>
        `);

        marker.addTo(map);
      });
    }
  }, [showKnownSites, knownSites]);

  // Update LIDAR data when showLidarData changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = window.L;
    
    // Remove existing GeoJSON layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    if (showLidarData) {
      const geoJsonLayer = L.geoJSON(mockLidarData, {
        style: lidarStyle,
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties;
          layer.bindPopup(`
            <div>
              <h3 class="font-bold text-sm">${props.name}</h3>
              <p class="text-xs mt-1">${props.description}</p>
              <div class="mt-2">
                <span class="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">${props.type}</span>
                <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full ml-1">${props.confidence}% confidence</span>
              </div>
            </div>
          `);
        }
      });
      geoJsonLayer.addTo(map);
    }
  }, [showLidarData, lidarStyle, mockLidarData]);

  // Update selected marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = window.L;
    
    // Remove existing selected marker
    map.eachLayer((layer: any) => {
      if (layer._icon && layer._icon.className.includes('selected-marker')) {
        map.removeLayer(layer);
      }
    });

    if (selectedCoordinates) {
      const marker = L.marker(selectedCoordinates, {
        icon: new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          className: 'selected-marker'
        })
      });

      marker.bindPopup(`
        <div class="p-1">
          <h3 class="font-bold text-sm">Selected Location</h3>
          <p class="text-xs mt-1">
            ${selectedCoordinates[0].toFixed(4)}, ${selectedCoordinates[1].toFixed(4)}
          </p>
        </div>
      `);

      marker.addTo(map);
    }
  }, [selectedCoordinates]);

  // Render map container
  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '500px', 
        width: '100%', 
        position: 'relative', 
        zIndex: 1 
      }} 
    />
  );
});

MapContainerComponent.displayName = 'MapContainerComponent';

export default function MapViewer({ initialCoordinates, onCoordinateSelect }: MapViewerProps) {
  // Use state for client-side only rendering
  const [isClient, setIsClient] = useState(false);
  const [activeBaseMap, setActiveBaseMap] = useState<string>("satellite")
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null)
  const [lidarOpacity, setLidarOpacity] = useState<number>(70)
  const [showKnownSites, setShowKnownSites] = useState<boolean>(true)
  const [showLidarData, setShowLidarData] = useState<boolean>(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159]) // Default to Central Amazon
  const [mapZoom, setMapZoom] = useState<number>(5)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [leafletComponents, setLeafletComponents] = useState<any>(null)
  const mapRef = useRef<any>(null)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Leaflet components dynamically
  useEffect(() => {
    if (!isClient) return;

    let mounted = true
    let mapInstance: any = null

    async function loadLeaflet() {
      try {
        await import("leaflet/dist/leaflet.css")
        const L = await import("leaflet")
        const RL = await import("react-leaflet")

        if (mounted) {
          setLeafletComponents({
            MapContainer: RL.MapContainer,
            TileLayer: RL.TileLayer,
            Marker: RL.Marker,
            Popup: RL.Popup,
            Circle: RL.Circle,
            GeoJSON: RL.GeoJSON,
            useMap: RL.useMap,
            Icon: L.Icon,
            divIcon: L.divIcon,
          })
          setLeafletLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load Leaflet:", error)
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
      if (mapRef.current) {
        try {
          // Safely remove the map instance
          mapRef.current.remove()
        } catch (error) {
          console.warn('Error removing map instance:', error)
        }
        mapRef.current = null
      }
    }
  }, [isClient])

  // Parse initial coordinates if provided
  useEffect(() => {
    if (initialCoordinates) {
      const parts = initialCoordinates.split(",").map((part) => Number.parseFloat(part.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setSelectedCoordinates([parts[0], parts[1]])
        setMapCenter([parts[0], parts[1]])
        setMapZoom(12)
      }
    }
  }, [initialCoordinates])

  // Prevent hydration mismatch by checking client-side rendering
  if (!isClient) {
    return null;
  }

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng
    const formattedCoords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    setSelectedCoordinates([lat, lng])
    if (onCoordinateSelect) {
      onCoordinateSelect(formattedCoords)
    }
  }

  const lidarStyle = (feature: any) => {
    const confidence = feature.properties.confidence || 70
    const opacity = confidence / 100

    switch (feature.geometry.type) {
      case "Polygon":
        return {
          fillColor: "#10b981",
          weight: 2,
          opacity: opacity,
          color: "#059669",
          fillOpacity: opacity * 0.4,
        }
      case "LineString":
        return {
          color: "#6366f1",
          weight: 3,
          opacity: opacity,
        }
      default:
        return {
          fillColor: "#10b981",
          weight: 2,
          opacity: opacity,
          color: "#059669",
          fillOpacity: opacity * 0.4,
        }
    }
  }

  const setMapRef = (map: any) => {
    // Safely set map reference, preventing multiple initializations
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (error) {
        console.warn('Error removing previous map reference:', error);
      }
    }
    mapRef.current = map;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeBaseMap} onValueChange={setActiveBaseMap} className="w-auto">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="satellite" className="px-3 py-1 text-xs">
              Satellite
            </TabsTrigger>
            <TabsTrigger value="terrain" className="px-3 py-1 text-xs">
              Terrain
            </TabsTrigger>
            <TabsTrigger value="osm" className="px-3 py-1 text-xs">
              Street
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-sites" checked={showKnownSites} onCheckedChange={setShowKnownSites} />
            <Label htmlFor="show-sites" className="text-xs">
              Known Sites
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-lidar" checked={showLidarData} onCheckedChange={setShowLidarData} />
            <Label htmlFor="show-lidar" className="text-xs">
              LIDAR Data
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="h-[400px] rounded-lg overflow-hidden border">
            {leafletLoaded && leafletComponents && (
              <MapContainerComponent
                leafletComponents={leafletComponents}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                activeBaseMap={activeBaseMap}
                showKnownSites={showKnownSites}
                showLidarData={showLidarData}
                selectedCoordinates={selectedCoordinates}
                handleMapClick={handleMapClick}
                lidarStyle={lidarStyle}
                setMapRef={setMapRef}
                knownSites={KNOWN_SITES}
                mockLidarData={MOCK_LIDAR_DATA}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <MapIcon className="h-4 w-4 mr-2 text-emerald-600" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lidar-opacity" className="text-xs">
                  LIDAR Overlay Opacity: {lidarOpacity}%
                </Label>
                <Slider
                  id="lidar-opacity"
                  min={0}
                  max={100}
                  step={5}
                  value={[lidarOpacity]}
                  onValueChange={(value) => setLidarOpacity(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Quick Navigation</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setMapCenter([-3.4653, -62.2159])}
                  >
                    Central Amazon
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setMapCenter([-12.2551, -53.2134])}
                  >
                    Xingu River Basin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setMapCenter([-9.8282, -67.9452])}
                  >
                    Acre Geoglyphs
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Data Layers</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center">
                      <Database className="h-3 w-3 mr-1" /> Satellite Imagery
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center">
                      <Layers className="h-3 w-3 mr-1" /> LIDAR Data
                    </span>
                    <Badge variant={showLidarData ? "default" : "outline"} className="text-xs">
                      {showLidarData ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center">
                      <MapIcon className="h-3 w-3 mr-1" /> Known Sites
                    </span>
                    <Badge variant={showKnownSites ? "default" : "outline"} className="text-xs">
                      {showKnownSites ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedCoordinates && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selected Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono">
                  {selectedCoordinates[0].toFixed(6)}, {selectedCoordinates[1].toFixed(6)}
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    if (onCoordinateSelect) {
                      onCoordinateSelect(`${selectedCoordinates[0].toFixed(4)}, ${selectedCoordinates[1].toFixed(4)}`)
                    }
                  }}
                >
                  Analyze This Location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
