"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { MapPin, Satellite, Database } from "lucide-react"
import type { SiteData } from "@/types/site-data"
import { Map, Marker } from 'pigeon-maps'

interface PigeonMapViewerProps {
  sites: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  className?: string
  initialCoordinates?: [number, number]
  initialZoom?: number
  onCoordinateSelect?: (coords: string) => void
}

export function PigeonMapViewer({
  sites,
  onSiteSelect,
  selectedSite,
  className,
  initialCoordinates = [-3.4653, -62.2159],
  initialZoom = 5,
  onCoordinateSelect,
}: PigeonMapViewerProps) {
  const mapRef = useRef<any>(null)
  const [center, setCenter] = useState<[number, number]>(initialCoordinates)
  const [zoom, setZoom] = useState(initialZoom)
  const [backendSites, setBackendSites] = useState<any[]>([])
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking")

  // Fetch real archaeological sites from backend
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        // Check backend health first
        const healthResponse = await fetch("http://localhost:8000/system/health")
        if (healthResponse.ok) {
          setBackendStatus("online")
          
          // Try to get research sites
          try {
            const sitesResponse = await fetch("http://localhost:8000/research/sites")
            if (sitesResponse.ok) {
              const sitesData = await sitesResponse.json()
              setBackendSites(sitesData)
              console.log("Loaded real archaeological sites:", sitesData)
            }
          } catch (error) {
            console.log("Research sites endpoint not available")
          }
        } else {
          setBackendStatus("offline")
        }
      } catch (error) {
        setBackendStatus("offline")
        console.log("Backend is offline, using predefined locations")
      }
    }

    fetchBackendData()
  }, [])

  const handleLocationSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()))
    setCenter([lat, lng])
    setZoom(7)
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  // Predefined locations (fallback when backend is offline)
  const predefinedLocations = [
    { name: "Central Amazon", coords: "-3.4653, -62.2159", type: "demo" as const },
    { name: "Xingu River (Kuhikugu)", coords: "-12.2551, -53.2134", type: "demo" as const },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452", type: "demo" as const },
    { name: "Llanos de Moxos", coords: "-14.0000, -65.5000", type: "demo" as const },
  ]

  // Combine backend sites with predefined locations
  const allLocations = [
    ...backendSites.map(site => ({
      name: site.name || `Site ${site.id}`,
      coords: `${site.latitude || site.lat}, ${site.longitude || site.lon}`,
      type: "backend" as const,
      confidence: site.confidence,
      description: site.description
    })),
    ...predefinedLocations
  ]

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Backend Status Indicator */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === "online" ? "bg-green-500" : 
            backendStatus === "offline" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
          }`} />
          <span className="text-sm font-medium">
            Backend: {backendStatus === "online" ? "Connected" : backendStatus === "offline" ? "Offline" : "Checking..."}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {backendStatus === "online" && (
            <>
              <div className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{backendSites.length} real sites</span>
              </div>
              <div className="flex items-center gap-1">
                <Satellite className="w-3 h-3" />
                <span>{predefinedLocations.length} reference sites</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Component */}
      <div className="w-full h-[400px] rounded-lg overflow-hidden border">
        <Map
          ref={mapRef}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center)
            setZoom(zoom)
          }}
        >
          {allLocations.map((location, index) => {
            const [lat, lng] = location.coords.split(',').map(coord => parseFloat(coord.trim()))
            if (isNaN(lat) || isNaN(lng)) return null
            
            return (
              <Marker
                key={`${location.type}-${index}`}
                width={location.type === "backend" ? 60 : 50}
                anchor={[lat, lng]}
                onClick={() => handleLocationSelect(location.coords)}
                color={location.type === "backend" ? "#059669" : "#3b82f6"}
              />
            )
          })}
        </Map>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allLocations.slice(0, 8).map((location, index) => (
          <button
            key={`${location.type}-${index}`}
            onClick={() => handleLocationSelect(location.coords)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group text-left ${
              location.type === "backend" 
                ? "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900" 
                : "bg-muted/50 border-border hover:bg-muted"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              location.type === "backend"
                ? "bg-green-500/20 group-hover:bg-green-500/30"
                : "bg-blue-500/20 group-hover:bg-blue-500/30"
            }`}>
              {location.type === "backend" ? (
                <Database className="w-4 h-4 text-green-600" />
              ) : (
                <MapPin className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {location.name}
                {location.type === "backend" && (
                  <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded dark:bg-green-800 dark:text-green-200">
                    REAL
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground font-mono truncate">{location.coords}</div>
              {location.type === "backend" && location.confidence && (
                <div className="text-xs text-muted-foreground">
                  Confidence: {Math.round(location.confidence * 100)}%
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Analysis Suggestion */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Click any location to analyze coordinates • 
          {backendStatus === "online" ? " Backend connected for real analysis" : " Demo mode active"}
        </p>
      </div>
    </div>
  )
}

export default PigeonMapViewer
