"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useTheme } from "next-themes"

// Fix for Leaflet marker icons in Next.js
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

interface Site {
  id?: string
  location: {
    lat: number
    lon: number
  }
  confidence: number
  description: string
}

interface MapViewProps {
  sites: Site[]
  selectedSite?: Site | null
  onSiteSelect?: (site: Site) => void
  className?: string
}

export function MapView({ sites, selectedSite, onSiteSelect, className }: MapViewProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle theme-based map styles
  const mapTileUrl = theme === "dark" 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  
  const attribution = theme === "dark"
    ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  // Default location if no sites
  const defaultCenter = [-5.2, -54.5] // Amazon region
  const center = sites.length > 0 
    ? [sites[0].location.lat, sites[0].location.lon] 
    : defaultCenter

  // Fix for hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`h-[400px] rounded-md bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className={`h-[400px] rounded-md overflow-hidden ${className}`}>
      <MapContainer 
        center={center as [number, number]} 
        zoom={6} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={attribution}
          url={mapTileUrl}
        />
        {sites.map((site) => (
          <Marker 
            key={site.id || `${site.location.lat}-${site.location.lon}`}
            position={[site.location.lat, site.location.lon]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSiteSelect && onSiteSelect(site)
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-medium">Archaeological Site</h3>
                <p className="text-sm mt-1">{site.description.substring(0, 100)}...</p>
                <p className="text-sm mt-1">Confidence: {(site.confidence * 100).toFixed(1)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 