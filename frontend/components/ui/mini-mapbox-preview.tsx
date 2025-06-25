"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { MapPin, Eye, Layers, Zap } from 'lucide-react'

interface MiniMapboxPreviewProps {
  latitude: number
  longitude: number
  confidence: number
  name?: string
  onViewFullMap: () => void
  onAnalyze: () => void
}

export function MiniMapboxPreview({
  latitude,
  longitude,
  confidence,
  name,
  onViewFullMap,
  onAnalyze
}: MiniMapboxPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const initMiniMap = async () => {
      if (!mapContainer.current || map.current) return

      try {
        console.log('🗺️ Initializing mini Mapbox preview...')
        
        // Import Mapbox GL JS dynamically
        const mapboxgl = await import('mapbox-gl')
        
        // Use the working Mapbox token
        mapboxgl.default.accessToken = 'pk.eyJ1IjoicGVudGl1czAwIiwiYSI6ImNtYXRtZXpmZTB4djgya29mNWZ0dG5pZDUifQ.dmsZjiJKZ7dxGs5KHVEK2g'
        
        // Create mini map instance
        const mapInstance = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [longitude, latitude],
          zoom: 12,
          interactive: false, // Static preview
          attributionControl: false,
          logoPosition: 'bottom-right'
        })

        // Add marker for the discovery
        const marker = new mapboxgl.default.Marker({
          color: '#10B981', // Green marker
          scale: 0.8
        })
          .setLngLat([longitude, latitude])
          .addTo(mapInstance)

        // Add popup with discovery info
        const popup = new mapboxgl.default.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25
        })
          .setLngLat([longitude, latitude])
          .setHTML(`
            <div class="text-center p-2">
              <div class="font-semibold text-green-600">${name || 'Archaeological Site'}</div>
              <div class="text-sm text-gray-600">${confidence.toFixed(1)}% confidence</div>
            </div>
          `)
          .addTo(mapInstance)

        mapInstance.on('load', () => {
          console.log('✅ Mini Mapbox preview loaded!')
          setMapLoaded(true)
        })

        mapInstance.on('error', (e) => {
          console.warn('⚠️ Mini Mapbox error:', e)
          setMapError('Preview unavailable')
        })

        map.current = mapInstance

      } catch (error) {
        console.error('❌ Mini map initialization failed:', error)
        setMapError('Map preview unavailable')
      }
    }

    initMiniMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, confidence, name])

  if (mapError) {
    return (
      <div className="h-48 bg-slate-900/50 rounded-lg border border-slate-600 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{mapError}</p>
          <p className="text-xs text-slate-500 mt-1">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Mini Map Container */}
      <div 
        ref={mapContainer} 
        className="h-48 w-full rounded-lg overflow-hidden border border-slate-600"
        style={{ background: '#1e293b' }}
      />
      
      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
            <p className="text-sm text-slate-300">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Overlay Controls */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <Badge variant="secondary" className="bg-black/60 text-white text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          Latest Discovery
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-green-400 border-green-400 text-xs">
          {confidence.toFixed(1)}%
        </Badge>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
        <Button 
          size="sm" 
          className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
          onClick={onViewFullMap}
        >
          <Eye className="h-3 w-3 mr-1" />
          Full Map
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/20 text-xs"
          onClick={onAnalyze}
        >
          <Zap className="h-3 w-3 mr-1" />
          Analyze
        </Button>
      </div>
      
      {/* Coordinates Display */}
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-400">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
        {name && (
          <p className="text-sm text-slate-300 font-medium mt-1">{name}</p>
        )}
      </div>
    </div>
  )
} 