"use client"

import React, { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mountain, Layers3, Sparkles, Eye } from "lucide-react"

interface Enhanced3DLidarDemoProps {
  coordinates: string
  onCoordinateChange?: (coords: string) => void
}

export function Enhanced3DLidarDemo({ 
  coordinates,
  onCoordinateChange 
}: Enhanced3DLidarDemoProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [viewMode, setViewMode] = useState<'satellite' | 'terrain' | 'archaeological'>('archaeological')
  const [exaggeration, setExaggeration] = useState(3)
  const [showArchaeologicalFeatures, setShowArchaeologicalFeatures] = useState(true)

  const parseCoordinates = (coords: string) => {
    try {
      const parts = coords.split(',').map(c => parseFloat(c.trim()))
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return [-14.739, -75.13] // Sacred Inca coordinates
      }
      return parts
    } catch (error) {
      return [-14.739, -75.13]
    }
  }
  
  const [lat, lng] = parseCoordinates(coordinates)

  // 🎨 ENHANCED 3D STYLES
  const mapStyles = {
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    terrain: 'mapbox://styles/mapbox/outdoors-v12',
    archaeological: 'mapbox://styles/mapbox/dark-v11'
  }

  // ⚡ INITIALIZE ENHANCED 3D MAP
  useEffect(() => {
    const initEnhanced3DMap = async () => {
      if (!mapContainer.current || map.current) return

      try {
        console.log('🏔️ ENHANCED 3D: Initializing spectacular terrain map...')
        
        const mapboxgl = await import('mapbox-gl')
        const divineToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        
        if (!divineToken) {
          console.error('🚨 Enhanced 3D requires Mapbox token!')
          return
        }
        
        mapboxgl.default.accessToken = divineToken
        
        if (mapContainer.current) {
          mapContainer.current.innerHTML = ''
        }
        
        const mapInstance = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: mapStyles[viewMode],
          center: [lng, lat],
          zoom: 15,
          pitch: 70, // Dramatic 3D angle
          bearing: 0,
          antialias: true
        })

        mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        mapInstance.on('load', () => {
          console.log('⚡ ENHANCED 3D: Map loaded - setting up spectacular terrain!')
          setMapLoaded(true)
          setupSpectacular3DTerrain(mapInstance)
        })

        map.current = mapInstance

      } catch (error) {
        console.error('❌ Enhanced 3D initialization failed:', error)
      }
    }

    initEnhanced3DMap()
  }, [])

  // 🌍 SPECTACULAR 3D TERRAIN SETUP
  const setupSpectacular3DTerrain = (mapInstance: any) => {
    try {
      // Add DEM source for 3D terrain
      mapInstance.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })

      // Set terrain with dramatic exaggeration
      mapInstance.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: exaggeration
      })

      // Enhanced atmospheric fog
      mapInstance.setFog({
        color: 'rgb(220, 220, 255)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.03,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.8
      })

      console.log('🌍 SPECTACULAR TERRAIN: Enhanced 3D setup complete!')
    } catch (error) {
      console.warn('⚠️ Enhanced terrain warning:', error)
    }
  }

  return (
    <Card className="bg-slate-900/90 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mountain className="w-5 h-5 text-cyan-400" />
          Enhanced 3D LiDAR Terrain Demo
          <Badge variant="secondary" className="bg-cyan-900/50 text-cyan-300">
            SPECTACULAR
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Map Container */}
        <div className="relative h-96 rounded-lg overflow-hidden border border-slate-600">
          <div ref={mapContainer} className="w-full h-full" />
          
          {!mapLoaded && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
                <p className="font-semibold">Loading Enhanced 3D Terrain</p>
                <p className="text-sm text-slate-300">Preparing spectacular visualization...</p>
              </div>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute top-4 left-4 bg-slate-900/90 rounded-lg p-3 text-xs">
            <div className="text-cyan-300 mb-1 font-medium">📍 Location</div>
            <div className="text-white font-mono">{coordinates}</div>
          </div>
        </div>

        {/* 3D Terrain Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Layers3 className="w-4 h-4" />
            3D Terrain Exaggeration
          </h4>
          
          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((mult) => (
              <Button
                key={mult}
                size="sm"
                variant={exaggeration === mult ? "default" : "outline"}
                onClick={() => setExaggeration(mult)}
                className="text-xs"
              >
                {mult}x
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center">
          🌍 Enhanced 3D terrain with dynamic LiDAR elevation data
        </div>
      </CardContent>
    </Card>
  )
} 