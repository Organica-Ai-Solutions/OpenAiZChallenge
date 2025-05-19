"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2, AlertCircle } from "lucide-react"
import type { SiteData } from "@/types"

// Dynamically import the MapboxMapViewer component with no SSR
const MapboxMapViewer = dynamic(() => import("./MapboxMapViewer").catch(() => () => <SimpleMapFallback />), {
  ssr: false,
  loading: () => <MapLoading />
})

function MapLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  )
}

export function SimpleMapFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
      <div className="text-red-500 flex flex-col items-center p-4 text-center">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-sm mb-2">Map could not be loaded</p>
        <p className="text-xs mb-4">Please check your configuration and try again.</p>
      </div>
    </div>
  )
}

interface DynamicMapViewerProps {
  sites?: SiteData[]
  selectedSite?: SiteData | null
  onSiteSelect?: (site: SiteData) => void
  initialCoordinates?: string
  onCoordinateSelect?: (coords: string) => void
}

export default function DynamicMapViewer({
  sites = [],
  selectedSite = null,
  onSiteSelect = () => {},
  initialCoordinates,
  onCoordinateSelect
}: DynamicMapViewerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <MapLoading />
  }

  return (
    <div className="h-full w-full">
      <MapboxMapViewer
        sites={sites}
        selectedSite={selectedSite}
        onSiteSelect={onSiteSelect}
        initialCoordinates={initialCoordinates}
        onCoordinateSelect={onCoordinateSelect}
      />
    </div>
  )
} 