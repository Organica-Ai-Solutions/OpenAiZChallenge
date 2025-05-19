"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Compass, Maximize, Minimize, Info } from "lucide-react"

interface Site {
  id?: string
  location: {
    lat: number
    lon: number
  }
  confidence: number
  description: string
  name?: string
  type?: string
}

interface MapViewProps {
  sites: Site[]
  selectedSite?: Site | null
  onSiteSelect?: (site: Site) => void
  className?: string
}

// Create custom marker icon based on confidence level
const createMarkerIcon = (confidence: number, isSelected = false) => {
  let color = "#ef4444" // red for low confidence
  if (confidence >= 0.8) {
    color = "#16a34a" // green for high confidence
  } else if (confidence >= 0.5) {
    color = "#d97706" // amber for medium confidence
  }

  const iconHtml = `
    <div class="marker-icon" style="
      background-color: ${color};
      width: ${isSelected ? "16px" : "12px"};
      height: ${isSelected ? "16px" : "12px"};
      border-radius: 50%;
      border: ${isSelected ? "3px" : "2px"} solid white;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
    "></div>
  `

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
    iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
  })
}

// Component to fit map to bounds of all markers
function FitBoundsToMarkers({ sites }: { sites: Site[] }) {
  const map = useMap()

  useEffect(() => {
    if (sites.length > 0) {
      const bounds = L.latLngBounds(sites.map((site) => [site.location.lat, site.location.lon]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, sites])

  return null
}

// Component to center map on selected site
function CenterOnSelectedSite({ site }: { site: Site | null | undefined }) {
  const map = useMap()

  useEffect(() => {
    if (site) {
      map.setView([site.location.lat, site.location.lon], 10, {
        animate: true,
        duration: 1,
      })
    }
  }, [map, site])

  return null
}

// Fullscreen Control
function FullscreenControl() {
  const map = useMap()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const container = map.getContainer()

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if ((container as any).mozRequestFullScreen) {
        ;(container as any).mozRequestFullScreen()
      } else if ((container as any).webkitRequestFullscreen) {
        ;(container as any).webkitRequestFullscreen()
      } else if ((container as any).msRequestFullscreen) {
        ;(container as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        ;(document as any).mozCancelFullScreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("msfullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="leaflet-control leaflet-bar">
      <a
        href="#"
        role="button"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        onClick={(e) => {
          e.preventDefault()
          toggleFullscreen()
        }}
        className="flex items-center justify-center w-8 h-8 bg-background text-foreground border-b border-border hover:bg-muted"
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </a>
    </div>
  )
}

// Reset View Control
function ResetViewControl({ sites }: { sites: Site[] }) {
  const map = useMap()

  const resetView = (e: React.MouseEvent) => {
    e.preventDefault()
    if (sites.length > 0) {
      const bounds = L.latLngBounds(sites.map((site) => [site.location.lat, site.location.lon]))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      // Default view of Amazon region
      map.setView([-5.2, -54.5], 6)
    }
  }

  return (
    <div className="leaflet-control leaflet-bar">
      <a
        href="#"
        role="button"
        title="Reset view"
        onClick={resetView}
        className="flex items-center justify-center w-8 h-8 bg-background text-foreground hover:bg-muted"
      >
        <Compass size={16} />
      </a>
    </div>
  )
}

// Map Legend
function MapLegend() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`leaflet-control leaflet-bar bg-background border border-border rounded-md shadow-md transition-all duration-300 ${
        collapsed ? "w-8 h-8" : "p-3"
      }`}
    >
      {collapsed ? (
        <a
          href="#"
          role="button"
          title="Show legend"
          onClick={(e) => {
            e.preventDefault()
            setCollapsed(false)
          }}
          className="flex items-center justify-center w-8 h-8 text-foreground hover:bg-muted"
        >
          <Info size={16} />
        </a>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Confidence Levels</h3>
            <button
              onClick={() => setCollapsed(true)}
              className="text-muted-foreground hover:text-foreground"
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
  )
}

export function MapView({ sites, selectedSite, onSiteSelect, className }: MapViewProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  // Handle theme-based map styles
  const mapTileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  const attribution =
    theme === "dark"
      ? '© <a href="https://carto.com/attributions">CARTO</a>'
      : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  // Default location if no sites
  const defaultCenter = [-5.2, -54.5] // Amazon region
  const center = sites.length > 0 ? [sites[0].location.lat, sites[0].location.lon] : defaultCenter

  // Create cluster icon
  const createClusterCustomIcon = (cluster: any) =>
    L.divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: L.point(40, 40, true),
    })

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
        zoomControl={false}
        whenCreated={(map) => {
          mapRef.current = map
        }}
      >
        <TileLayer attribution={attribution} url={mapTileUrl} />

        {/* Custom controls */}
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control-container">
            <div className="leaflet-top leaflet-right">
              <ZoomControl position="topright" />
              <div className="leaflet-control-fullscreen leaflet-bar leaflet-control">
                <FullscreenControl />
              </div>
              <div className="leaflet-control-reset leaflet-bar leaflet-control mt-2">
                <ResetViewControl sites={sites} />
              </div>
            </div>
            <div className="leaflet-bottom leaflet-right">
              <div className="leaflet-control-legend leaflet-bar leaflet-control mb-6 mr-2">
                <MapLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Marker cluster group */}
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
          {sites.map((site) => (
            <Marker
              key={site.id || `${site.location.lat}-${site.location.lon}`}
              position={[site.location.lat, site.location.lon]}
              icon={createMarkerIcon(site.confidence, selectedSite && selectedSite.id === site.id)}
              eventHandlers={{
                click: () => onSiteSelect && onSiteSelect(site),
              }}
            >
              <Popup className="site-popup">
                <div className="p-2">
                  <h3 className="font-medium text-sm">{site.name || "Archaeological Site"}</h3>
                  <p className="text-xs mt-1 text-muted-foreground">{site.type || "Unknown type"}</p>
                  <p className="text-xs mt-2">
                    {site.description.length > 100 ? `${site.description.substring(0, 100)}...` : site.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium">Confidence: {(site.confidence * 100).toFixed(0)}%</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onSiteSelect && onSiteSelect(site)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Auto-fit bounds and center on selected site */}
        <FitBoundsToMarkers sites={sites} />
        {selectedSite && <CenterOnSelectedSite site={selectedSite} />}
      </MapContainer>

      {/* Add custom CSS for markers and clusters */}
      <style jsx global>{`
        .custom-marker-cluster {
          background-color: rgba(var(--primary-rgb), 0.6);
          background-clip: padding-box;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cluster-icon {
          color: white;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
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
  )
} 