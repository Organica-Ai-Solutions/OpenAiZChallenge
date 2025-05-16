"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader } from "lucide-react"
import SimpleMapFallback from "./SimpleMapFallback"

// Create a loading component
const MapLoading = () => (
  <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
    <div className="text-center">
      <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
      <p className="text-sm text-muted-foreground">Loading interactive map...</p>
    </div>
  </div>
)

// Dynamically import the MapViewer component with no SSR
const MapViewer = dynamic(() => import("./MapViewer").catch(() => () => <SimpleMapFallback />), {
  ssr: false,
  loading: MapLoading,
})

interface DynamicMapViewerProps {
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
}

export default function DynamicMapViewer({ initialCoordinates, onCoordinateSelect }: DynamicMapViewerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  // Only render on client-side
  useEffect(() => {
    setIsMounted(true)

    // Set a timeout to show fallback if loading takes too long
    const timeout = setTimeout(() => {
      setLoadFailed(true)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  if (!isMounted) {
    return <MapLoading />
  }

  if (loadFailed) {
    return <SimpleMapFallback onCoordinateSelect={onCoordinateSelect} />
  }

  return <MapViewer initialCoordinates={initialCoordinates} onCoordinateSelect={onCoordinateSelect} />
}
