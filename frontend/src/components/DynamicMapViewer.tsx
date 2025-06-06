"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import SimpleMapFallback from "./SimpleMapFallback"
import type { SiteData } from "@/types/site-data"

// Create a loading component
const MapLoading = () => (
  <div className="h-full flex items-center justify-center bg-muted rounded-lg">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-muted-foreground">Loading interactive map...</p>
    </div>
  </div>
)

// Dynamically import the PigeonMapViewer component with no SSR
const PigeonMapViewer = dynamic(() => import("./PigeonMapViewer"), {
  ssr: false,
  loading: MapLoading,
})

interface DynamicMapViewerProps {
  sites?: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
  className?: string
}

export default function DynamicMapViewer({ 
  sites = [], 
  onSiteSelect, 
  selectedSite = null,
  initialCoordinates,
  onCoordinateSelect,
  className
}: DynamicMapViewerProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Only render on client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <MapLoading />
  }

  return (
    <div className={className}>
      <PigeonMapViewer 
        sites={sites} 
        onSiteSelect={onSiteSelect} 
        selectedSite={selectedSite}
        initialCoordinates={initialCoordinates ? initialCoordinates.split(',').map(coord => Number.parseFloat(coord.trim())) as [number, number] : undefined}
        onCoordinateSelect={onCoordinateSelect}
      />
    </div>
  )
}