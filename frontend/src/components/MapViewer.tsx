"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layers, MapIcon, Database } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

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

// Known archaeological sites data
const knownSites = [
  {
    name: "Kuhikugu",
    coordinates: [-12.2551, -53.2134],
    description: "Patchwork of 20 settlements at the headwaters of the Xingu River",
    confidence: 95,
    type: "Settlement",
  },
  {
    name: "Geoglyphs of Acre",
    coordinates: [-9.8282, -67.9452],
    description: "Geometric earthworks discovered in the western Amazon",
    confidence: 90,
    type: "Geoglyph",
  },
  {
    name: "Llanos de Moxos",
    coordinates: [-14.0, -65.5],
    description: "Complex of raised fields, canals, and causeways",
    confidence: 88,
    type: "Agricultural",
  },
]

// Mock LIDAR data overlay (GeoJSON)
const mockLidarData = {
  type: "FeatureCollection",
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

export default function MapViewer({ initialCoordinates, onCoordinateSelect }: MapViewerProps) {
  const [activeBaseMap, setActiveBaseMap] = useState<string>("satellite")
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null)
  const [lidarOpacity, setLidarOpacity] = useState<number>(70)
  const [showKnownSites, setShowKnownSites] = useState<boolean>(true)
  const [showLidarData, setShowLidarData] = useState<boolean>(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159]) // Default to Central Amazon
  const [mapZoom, setMapZoom] = useState<number>(5)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [leafletComponents, setLeafletComponents] = useState<{
    MapContainer: React.ComponentType<MapContainerProps>
    TileLayer: React.ComponentType<TileLayerProps>
    Marker: React.ComponentType<MarkerProps>
    Popup: React.ComponentType<PopupProps>
    Circle: React.ComponentType<CircleProps>
    GeoJSON: React.ComponentType<GeoJSONProps>
    useMap: () => any
    Icon: any
    divIcon: any
  } | null>(null)

  const mapRef = useRef<any>(null)

  // Load Leaflet components dynamically
  useEffect(() => {
    async function loadLeaflet() {
      try {
        // Import Leaflet CSS
        await import("leaflet/dist/leaflet.css")

        // Import Leaflet and react-leaflet components
        const L = await import("leaflet")
        const RL = await import("react-leaflet")

        // Create marker icons
        const markerIcon = new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        // Custom marker for archaeological sites
        const siteIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: rgba(52, 211, 153, 0.8); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })

        // Store Leaflet components and icons
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
      } catch (error) {
        console.error("Failed to load Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

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

  // Handle map click to select coordinates
  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng
    const formattedCoords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    setSelectedCoordinates([lat, lng])
    if (onCoordinateSelect) {
      onCoordinateSelect(formattedCoords)
    }
  }

  // Style function for GeoJSON features
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

  // Function to go to a specific location
  const goToLocation = (coords: [number, number]) => {
    setMapCenter(coords)
    setMapZoom(12)
    if (mapRef.current) {
      mapRef.current.setView(coords, 12)
    }
  }

  // Component to set the map view based on coordinates
  function SetViewOnClick({ coords }: { coords: [number, number] }) {
    const map = leafletComponents?.useMap()

    useEffect(() => {
      if (map) {
        map.setView(coords, 12)
      }
    }, [coords, map])

    return null
  }

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
            {leafletLoaded && leafletComponents ? (
              <leafletComponents.MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => (mapRef.current = map)}
                onClick={handleMapClick}
              >
                {/* Base map layers */}
                {activeBaseMap === "satellite" && (
                  <leafletComponents.TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                  />
                )}
                {activeBaseMap === "terrain" && (
                  <leafletComponents.TileLayer
                    url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
                    attribution="&copy; <a href='http://stamen.com'>Stamen Design</a> &mdash; Map data &copy; OpenStreetMap contributors"
                  />
                )}
                {activeBaseMap === "osm" && (
                  <leafletComponents.TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                  />
                )}

                {/* Known archaeological sites */}
                {showKnownSites &&
                  knownSites.map((site, index) => (
                    <leafletComponents.Marker
                      key={index}
                      position={site.coordinates}
                      icon={leafletComponents.divIcon({
                        className: "custom-div-icon",
                        html: `<div style="background-color: rgba(52, 211, 153, 0.8); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    >
                      <leafletComponents.Popup>
                        <div className="p-1">
                          <h3 className="font-bold text-sm">{site.name}</h3>
                          <p className="text-xs mt-1">{site.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {site.type}
                            </Badge>
                            <Badge className="bg-emerald-500 text-xs">{site.confidence}% confidence</Badge>
                          </div>
                        </div>
                      </leafletComponents.Popup>
                    </leafletComponents.Marker>
                  ))}

                {/* LIDAR data overlay */}
                {showLidarData && (
                  <leafletComponents.GeoJSON
                    data={mockLidarData}
                    style={lidarStyle}
                    onEachFeature={(feature, layer) => {
                      const props = feature.properties
                      layer.bindPopup(`
                        <div>
                          <h3 class="font-bold text-sm">${props.name}</h3>
                          <p class="text-xs mt-1">${props.description}</p>
                          <div class="mt-2">
                            <span class="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">${props.type}</span>
                            <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full ml-1">${props.confidence}% confidence</span>
                          </div>
                        </div>
                      `)
                    }}
                  />
                )}

                {/* Selected coordinates marker */}
                {selectedCoordinates && (
                  <>
                    <leafletComponents.Marker
                      position={selectedCoordinates}
                      icon={
                        new leafletComponents.Icon({
                          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41],
                        })
                      }
                    >
                      <leafletComponents.Popup>
                        <div className="p-1">
                          <h3 className="font-bold text-sm">Selected Location</h3>
                          <p className="text-xs font-mono mt-1">
                            {selectedCoordinates[0].toFixed(4)}, {selectedCoordinates[1].toFixed(4)}
                          </p>
                          <Button
                            size="sm"
                            className="mt-2 w-full text-xs"
                            onClick={() => {
                              if (onCoordinateSelect) {
                                onCoordinateSelect(
                                  `${selectedCoordinates[0].toFixed(4)}, ${selectedCoordinates[1].toFixed(4)}`,
                                )
                              }
                            }}
                          >
                            Analyze This Location
                          </Button>
                        </div>
                      </leafletComponents.Popup>
                    </leafletComponents.Marker>
                    <leafletComponents.Circle
                      center={selectedCoordinates}
                      radius={2000}
                      pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.1 }}
                    />
                  </>
                )}

                {/* Update view when coordinates change */}
                {mapCenter && <SetViewOnClick coords={mapCenter} />}
              </leafletComponents.MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted">
                <div className="text-center p-4">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Loading Map...</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Please wait while we load the interactive map components.
                  </p>
                </div>
              </div>
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
                    onClick={() => goToLocation([-3.4653, -62.2159])}
                  >
                    Central Amazon
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => goToLocation([-12.2551, -53.2134])}
                  >
                    Xingu River Basin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => goToLocation([-9.8282, -67.9452])}
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
