"use client"

import React, { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mountain, Layers3, Sparkles, Eye, RotateCcw } from "lucide-react"

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
  const [animationSpeed, setAnimationSpeed] = useState(1)

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
          antialias: true,
          projection: 'globe' as any // Enhanced globe projection
        })

        mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        mapInstance.on('load', () => {
          console.log('⚡ ENHANCED 3D: Map loaded - setting up spectacular terrain!')
          setMapLoaded(true)
          setupSpectacular3DTerrain(mapInstance)
          
          setTimeout(() => {
            addArchaeologicalFeatures(mapInstance)
            startTerrainAnimation(mapInstance)
          }, 1000)
        })

        mapInstance.on('click', (e) => {
          const newCoords = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`
          onCoordinateChange?.(newCoords)
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
      // Add multiple DEM sources for enhanced detail
      mapInstance.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })

      // Add enhanced terrain source
      mapInstance.addSource('terrain-rgb', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 256
      })

      // Set primary terrain with dramatic exaggeration
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

      // Dynamic sky layer
      mapInstance.addLayer({
        id: 'enhanced-sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
          'sky-atmosphere-color': 'rgba(85, 151, 210, 0.5)',
          'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.6)'
        }
      })

      console.log('🌍 SPECTACULAR TERRAIN: Enhanced 3D setup complete!')
    } catch (error) {
      console.warn('⚠️ Enhanced terrain warning:', error)
    }
  }

  // 🏛️ ADD ARCHAEOLOGICAL FEATURES
  const addArchaeologicalFeatures = (mapInstance: any) => {
    // Generate archaeological site data
    const archaeologicalSites = []
    for (let i = 0; i < 20; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.01
      const offsetLng = (Math.random() - 0.5) * 0.01
      const confidence = 0.4 + Math.random() * 0.6
      const siteType = ['mound', 'settlement', 'ceremonial', 'burial'][Math.floor(Math.random() * 4)]
      
      archaeologicalSites.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng + offsetLng, lat + offsetLat]
        },
        properties: {
          confidence: confidence,
          siteType: siteType,
          elevation: 120 + Math.random() * 40,
          size: Math.random() * 50 + 10
        }
      })
    }

    const sitesGeoJSON = {
      type: 'FeatureCollection',
      features: archaeologicalSites
    }

    mapInstance.addSource('archaeological-sites', {
      type: 'geojson',
      data: sitesGeoJSON
    })

    // 3D Archaeological markers
    mapInstance.addLayer({
      id: 'archaeological-3d',
      type: 'fill-extrusion',
      source: 'archaeological-sites',
      paint: {
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['get', 'confidence'],
          0.4, 5,
          1.0, 25
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-color': [
          'case',
          ['==', ['get', 'siteType'], 'mound'], '#FFD700',
          ['==', ['get', 'siteType'], 'settlement'], '#FF6B35',
          ['==', ['get', 'siteType'], 'ceremonial'], '#8A2BE2',
          '#32CD32'
        ],
        'fill-extrusion-opacity': 0.8
      }
    })

    // Glowing halos
    mapInstance.addLayer({
      id: 'archaeological-glow',
      type: 'circle',
      source: 'archaeological-sites',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 15,
          20, 50
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'siteType'], 'mound'], '#FFD700',
          ['==', ['get', 'siteType'], 'settlement'], '#FF6B35',
          ['==', ['get', 'siteType'], 'ceremonial'], '#8A2BE2',
          '#32CD32'
        ],
        'circle-opacity': 0.3,
        'circle-blur': 1
      }
    })
  }

  // 🎬 TERRAIN ANIMATION
  const startTerrainAnimation = (mapInstance: any) => {
    if (!isAnimating) return

    let animationFrame = 0
    const animate = () => {
      animationFrame++
      
      // Rotate camera around the center
      const bearing = (animationFrame * animationSpeed) % 360
      mapInstance.setBearing(bearing)
      
      // Dynamic exaggeration
      const dynamicExaggeration = exaggeration + Math.sin(animationFrame * 0.1) * 0.5
      mapInstance.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: dynamicExaggeration 
      })
      
      if (isAnimating) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  // 🎛️ VIEW MODE SWITCHER
  const switchViewMode = (newMode: typeof viewMode) => {
    if (!map.current) return
    
    setViewMode(newMode)
    map.current.setStyle(mapStyles[newMode])
    
    map.current.once('styledata', () => {
      setupSpectacular3DTerrain(map.current)
      if (showArchaeologicalFeatures) {
        setTimeout(() => addArchaeologicalFeatures(map.current), 500)
      }
    })
  }

  // 🎨 EXAGGERATION CONTROL
  const updateExaggeration = (newExaggeration: number) => {
    if (!map.current) return
    
    setExaggeration(newExaggeration)
    map.current.setTerrain({ 
      source: 'mapbox-dem', 
      exaggeration: newExaggeration 
    })
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

          <div className="absolute top-4 right-4 bg-slate-900/90 rounded-lg p-3 text-xs">
            <div className="text-cyan-300 mb-1 font-medium">🏔️ 3D Mode</div>
            <div className="text-green-400">ACTIVE</div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visualization Modes
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(mapStyles).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => switchViewMode(mode as typeof viewMode)}
                className="text-xs"
              >
                {mode.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* 3D Terrain Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Layers3 className="w-4 h-4" />
            3D Terrain Exaggeration
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Height Multiplier</span>
              <span className="text-cyan-400 font-mono">{exaggeration}x</span>
            </div>
            
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((mult) => (
                <Button
                  key={mult}
                  size="sm"
                  variant={exaggeration === mult ? "default" : "outline"}
                  onClick={() => updateExaggeration(mult)}
                  className="text-xs"
                >
                  {mult}x
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Animation Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Dynamic Animation
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Cinematic Rotation</span>
              <Button
                size="sm"
                variant={isAnimating ? "default" : "outline"}
                onClick={() => {
                  setIsAnimating(!isAnimating)
                  if (!isAnimating && map.current) {
                    startTerrainAnimation(map.current)
                  }
                }}
                className="text-xs"
              >
                {isAnimating ? '⏸️ PAUSE' : '▶️ START'}
              </Button>
            </div>

            {isAnimating && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Animation Speed</span>
                  <span className="text-cyan-400 font-mono">{animationSpeed}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1, 2, 3].map((speed) => (
                    <Button
                      key={speed}
                      size="sm"
                      variant={animationSpeed === speed ? "default" : "outline"}
                      onClick={() => setAnimationSpeed(speed)}
                      className="text-xs"
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Archaeological Features Toggle */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2">
                🏛️ Archaeological Sites
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Show 3D markers for discovered sites
              </p>
            </div>
            <Button
              size="sm"
              variant={showArchaeologicalFeatures ? "default" : "outline"}
              onClick={() => {
                setShowArchaeologicalFeatures(!showArchaeologicalFeatures)
                if (map.current) {
                  if (!showArchaeologicalFeatures) {
                    addArchaeologicalFeatures(map.current)
                  } else {
                    try {
                      map.current.removeLayer('archaeological-3d')
                      map.current.removeLayer('archaeological-glow')
                      map.current.removeSource('archaeological-sites')
                    } catch (e) { /* ignore */ }
                  }
                }
              }}
              className="text-xs"
            >
              {showArchaeologicalFeatures ? '✅ VISIBLE' : '👁️ HIDDEN'}
            </Button>
          </div>
        </div>

        {/* Status Info */}
        <div className="text-xs text-slate-400 text-center">
          🌍 Enhanced 3D terrain with dynamic LiDAR elevation data
          <br />
          Click map to update coordinates • Use controls for spectacular views
        </div>
      </CardContent>
    </Card>
  )
} 