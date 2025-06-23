"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface MapContextType {
  // Shared coordinates
  coordinates: { lat: number; lng: number }
  setCoordinates: (coords: { lat: number; lng: number }) => void
  
  // Archaeological discoveries
  discoveries: any[]
  addDiscovery: (discovery: any) => void
  
  // Map synchronization
  syncMaps: boolean
  setSyncMaps: (sync: boolean) => void
  
  // Analysis results
  lastAnalysis: any
  setLastAnalysis: (analysis: any) => void
  
  // Active page tracking
  activePage: 'vision' | 'map' | 'analysis' | null
  setActivePage: (page: 'vision' | 'map' | 'analysis' | null) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinatesState] = useState({ lat: 5.1542, lng: -73.7792 })
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [syncMaps, setSyncMaps] = useState(true)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [activePage, setActivePage] = useState<'vision' | 'map' | 'analysis' | null>(null)

  const setCoordinates = useCallback((coords: { lat: number; lng: number }) => {
    console.log('🗺️ MapContext: Coordinates updated:', coords)
    setCoordinatesState(coords)
  }, [])

  const addDiscovery = useCallback((discovery: any) => {
    console.log('🏛️ MapContext: New discovery added:', discovery)
    setDiscoveries(prev => [discovery, ...prev])
  }, [])

  const value: MapContextType = {
    coordinates,
    setCoordinates,
    discoveries,
    addDiscovery,
    syncMaps,
    setSyncMaps,
    lastAnalysis,
    setLastAnalysis,
    activePage,
    setActivePage
  }

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}

export default MapContext 