"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { MapPin, Eye, Layers, Triangle, Palette, Search, MessageSquare, BarChart3 } from 'lucide-react'
import { useUnifiedSystem } from '../../src/contexts/UnifiedSystemContext'

interface UniversalMapboxIntegrationProps {
  coordinates?: string
  onCoordinatesChange?: (coords: string) => void
  height?: string
  showControls?: boolean
  pageType: 'chat' | 'map' | 'analysis' | 'vision' | 'main' | 'satellite'
  onPageNavigation?: (targetPage: string, coordinates: string) => void
  enableLidarVisualization?: boolean
  visionResults?: any
  analysisHistory?: any[]
}

export function UniversalMapboxIntegration({
  coordinates = "5.1542, -73.7792",
  onCoordinatesChange,
  height = "400px",
  showControls = true,
  pageType,
  onPageNavigation,
  enableLidarVisualization = true,
  visionResults,
  analysisHistory
}: UniversalMapboxIntegrationProps) {
  
  const { state: unifiedState, actions: unifiedActions } = useUnifiedSystem()
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  
  const [lat, lng] = coordinates.split(',').map(s => parseFloat(s.trim()))
  
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current || map.current) return
      
      try {
        console.log(`🗺️ Initializing Universal Mapbox for ${pageType} page...`)
        
        const mapboxgl = await import('mapbox-gl')
        mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
        
        if (mapContainer.current) {
          mapContainer.current.innerHTML = ''
        }
        
        const mapInstance = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: pageType === 'satellite' || pageType === 'vision' ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/outdoors-v12',
          center: [lng, lat],
          zoom: pageType === 'vision' ? 16 : 12,
          pitch: pageType === 'vision' ? 45 : 0,
          antialias: true
        })

        mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        mapInstance.on('load', () => {
          console.log(`✅ Universal Mapbox loaded for ${pageType} page!`)
          setMapLoaded(true)
          setTimeout(() => addLayers(mapInstance), 500)
        })

        mapInstance.on('click', (e) => {
          const newCoords = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`
          if (onCoordinatesChange) {
            onCoordinatesChange(newCoords)
          }
          unifiedActions.selectCoordinates(e.lngLat.lat, e.lngLat.lng, `${pageType}_map_click`)
        })

        map.current = mapInstance

      } catch (error) {
        console.error('❌ Universal map initialization failed:', error)
        setMapError('Mapbox loading failed')
      }
    }

    initMap()
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [lat, lng, pageType])

  const addLayers = (mapInstance: any) => {
    // Add archaeological sites
    const sites = generateSites(lat, lng)
    mapInstance.addSource('sites', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: sites.map((site: any) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [site.lng, site.lat] },
          properties: { name: site.name, confidence: site.confidence }
        }))
      }
    })

    mapInstance.addLayer({
      id: 'sites-layer',
      type: 'circle',
      source: 'sites',
      paint: {
        'circle-radius': 8,
        'circle-color': ['interpolate', ['linear'], ['get', 'confidence'], 0.5, '#ef4444', 0.9, '#10b981'],
        'circle-opacity': 0.8
      }
    })

    if (enableLidarVisualization) {
      const lidarPoints = generateLidarPoints(lat, lng)
      mapInstance.addSource('lidar', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: lidarPoints.map((point: any) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
            properties: { elevation: point.elevation }
          }))
        }
      })

      mapInstance.addLayer({
        id: 'lidar-layer',
        type: 'circle',
        source: 'lidar',
        paint: {
          'circle-radius': 2,
          'circle-color': ['interpolate', ['linear'], ['get', 'elevation'], 100, '#0000ff', 175, '#ff0000'],
          'circle-opacity': 0.6
        }
      })
    }
  }

  const generateSites = (centerLat: number, centerLng: number) => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `site_${i}`,
      name: `Site ${i + 1}`,
      lat: centerLat + (Math.random() - 0.5) * 0.02,
      lng: centerLng + (Math.random() - 0.5) * 0.02,
      confidence: 0.6 + Math.random() * 0.4
    }))
  }

  const generateLidarPoints = (centerLat: number, centerLng: number) => {
    return Array.from({ length: 100 }, (_, i) => ({
      lat: centerLat + (Math.random() - 0.5) * 0.01,
      lng: centerLng + (Math.random() - 0.5) * 0.01,
      elevation: 120 + Math.random() * 50
    }))
  }

  const handleAnalysis = (type: string) => {
    console.log(`🔍 ${type} analysis for ${pageType}`)
    setActiveAnalysis(type)
    setTimeout(() => setActiveAnalysis(null), 2000)
  }

  const navigateToPage = (targetPage: string) => {
    if (onPageNavigation) {
      onPageNavigation(targetPage, coordinates)
    }
  }

  if (mapError) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">{mapError}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" />
              {pageType.charAt(0).toUpperCase() + pageType.slice(1)} Map
            </CardTitle>
            <Badge variant={mapLoaded ? "default" : "secondary"}>
              {mapLoaded ? 'Connected' : 'Loading...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div 
            ref={mapContainer} 
            className="w-full rounded-lg border border-slate-600"
            style={{ height, background: '#1e293b' }}
          />
        </CardContent>
      </Card>

      {showControls && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full" onClick={() => handleAnalysis('triangulation')}>
                <Triangle className="h-4 w-4 mr-2" />
                Triangulation
              </Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleAnalysis('rgb')}>
                <Palette className="h-4 w-4 mr-2" />
                RGB Coloring
              </Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleAnalysis('features')}>
                <Search className="h-4 w-4 mr-2" />
                Detect Features
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pageType !== 'vision' && (
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigateToPage('vision')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vision Agent
                </Button>
              )}
              {pageType !== 'chat' && (
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigateToPage('chat')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Analysis
                </Button>
              )}
              {pageType !== 'analysis' && (
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigateToPage('analysis')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Full Analysis
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">LIDAR:</span>
                <span className="text-emerald-400">{enableLidarVisualization ? '100 pts' : 'Off'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sites:</span>
                <span className="text-blue-400">6</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Coords:</span>
                <span className="text-purple-400">{coordinates.substring(0, 15)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 