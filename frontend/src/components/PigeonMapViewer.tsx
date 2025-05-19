"use client"

import { useState, useCallback, useRef } from "react"
import { MapPin } from "lucide-react"
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

  const handleLocationSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()))
    setCenter([lat, lng])
    setZoom(7)
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  // Predefined locations
  const locations = [
    { name: "Central Amazon", coords: "-3.4653, -62.2159" },
    { name: "Xingu River", coords: "-12.2551, -53.2134" },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452" },
    { name: "Llanos de Moxos", coords: "-14.0000, -65.5000" },
  ]

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Map Component */}
      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-800">
        <Map
          ref={mapRef}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center)
            setZoom(zoom)
          }}
        >
          {locations.map((location) => {
            const [lat, lng] = location.coords.split(',').map(coord => parseFloat(coord.trim()))
            return (
              <Marker
                key={location.name}
                width={50}
                anchor={[lat, lng]}
                onClick={() => handleLocationSelect(location.coords)}
              />
            )
          })}
        </Map>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-2 gap-4">
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => handleLocationSelect(location.coords)}
            className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="font-medium text-white">{location.name}</div>
              <div className="text-sm text-gray-500 font-mono">{location.coords}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Simple Mode Link */}
      <p className="text-center text-sm text-gray-500 hover:text-gray-400 cursor-pointer">
        Having trouble with the map? Try simple mode
      </p>
    </div>
  )
}

export default PigeonMapViewer
