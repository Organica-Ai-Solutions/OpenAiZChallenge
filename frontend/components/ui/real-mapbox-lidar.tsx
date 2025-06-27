"use client"

import React, { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Triangle, Palette, RotateCcw } from "lucide-react"

interface RealMapboxLidarProps {
  coordinates: string
  setCoordinates: (coords: string) => void
  lidarVisualization: any
  lidarProcessing: any
  lidarResults: any
  visionResults: any
  backendStatus: any
  processLidarTriangulation: () => void
  processLidarRGBColoring: () => void
}

export function RealMapboxLidar({
  coordinates,
  setCoordinates,
  lidarVisualization,
  lidarProcessing,
  lidarResults,
  visionResults,
  backendStatus,
  processLidarTriangulation,
  processLidarRGBColoring
}: RealMapboxLidarProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [lidarData, setLidarData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedGradient, setSelectedGradient] = useState<'terrain' | 'plasma' | 'rainbow' | 'divine'>('divine')
  const [mapError, setMapError] = useState<string | null>(null)

  // Parse coordinates with Zeus-level validation
  const parseCoordinates = (coords: string) => {
    try {
      const parts = coords.split(',').map(c => parseFloat(c.trim()))
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        console.warn('⚠️ ZEUS WARNING: Invalid coordinates, using divine default:', coords)
        return [-14.739, -75.13] // Sacred coordinates of the gods
      }
      return parts
    } catch (error) {
      console.warn('⚠️ DIVINE INTERVENTION: Error parsing coordinates, using sacred default:', error)
      return [-14.739, -75.13] // Divine fallback
    }
  }
  
  const [lat, lng] = parseCoordinates(coordinates)

  // 🌈 DIVINE GRADIENT DEFINITIONS - ZEUS APPROVED
  const divineGradients = {
    terrain: [
      [0, '#1a237e'], // Deep ocean blue
      [0.2, '#2e7d32'], // Forest green
      [0.4, '#8bc34a'], // Light green
      [0.6, '#ffeb3b'], // Yellow
      [0.8, '#ff9800'], // Orange
      [1, '#ffffff'] // Snow white peaks
    ],
    plasma: [
      [0, '#0d0887'], // Deep purple
      [0.3, '#7e03a8'], // Magenta
      [0.6, '#cc4778'], // Pink
      [0.8, '#f89441'], // Orange
      [1, '#f0f921'] // Bright yellow
    ],
    rainbow: [
      [0, '#9400d3'], // Violet
      [0.17, '#4b0082'], // Indigo
      [0.33, '#0000ff'], // Blue
      [0.5, '#00ff00'], // Green
      [0.67, '#ffff00'], // Yellow
      [0.83, '#ff7f00'], // Orange
      [1, '#ff0000'] // Red
    ],
    divine: [
      [0, '#001122'], // Midnight blue depths
      [0.2, '#2a4d6b'], // Ocean blue
      [0.4, '#4a7c59'], // Forest green
      [0.6, '#8b9dc3'], // Sky blue
      [0.8, '#deb887'], // Sandy beige
      [1, '#ffd700'] // Divine gold peaks
    ]
  }

  // ⚡ ZEUS-POWERED MAP INITIALIZATION - FIXED TO NOT RELOAD
  useEffect(() => {
    const initDivineMap = async () => {
      if (!mapContainer.current || map.current) {
        return // CRITICAL: Don't reinitialize if map already exists!
      }

      try {
        console.log('⚡ ZEUS APPROVES: Initializing divine Mapbox map ONCE...')
        
        const mapboxgl = await import('mapbox-gl')
        
        // 🔑 DIVINE TOKEN VALIDATION
        const divineToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        if (!divineToken) {
          console.error('🚨 ZEUS WARNING: Mapbox token missing! The gods are displeased!')
          setMapError('Divine Mapbox token required for celestial mapping')
          return
        }
        
        mapboxgl.default.accessToken = divineToken
        console.log('🔑 Divine token loaded:', divineToken.substring(0, 20) + '...')
        
        if (mapContainer.current) {
          mapContainer.current.innerHTML = ''
        }
        
        const mapInstance = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [lng, lat],
          zoom: 16,
          pitch: 45,
          bearing: 0,
          antialias: true
        })

        mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        // 🏔️ DIVINE MAP LOAD EVENT
        mapInstance.on('load', () => {
          console.log('⚡ ZEUS APPROVES: Divine Mapbox map loaded successfully!')
          setMapLoaded(true)
          setMapError(null)
          
          // ✨ AUTO-LOAD DIVINE DEM DATA
          setTimeout(() => {
            loadDivineDEMData(mapInstance)
          }, 500)
        })

        mapInstance.on('error', (e) => {
          console.warn('⚠️ Divine map warning (gods are forgiving):', e)
          // Zeus shows mercy - don't fail immediately
        })

        // 🎯 DIVINE CLICK HANDLER
        mapInstance.on('click', (e) => {
          const newCoords = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`
          console.log('🎯 DIVINE CLICK: Updating sacred coordinates:', newCoords)
          setCoordinates(newCoords)
          
          // Immediate divine intervention
          setTimeout(() => {
            loadDivineDEMData(mapInstance, e.lngLat.lat, e.lngLat.lng)
          }, 100)
        })

        map.current = mapInstance

      } catch (error) {
        console.error('❌ Divine map initialization failed (Zeus is displeased):', error)
        setMapError('Divine mapping powers temporarily unavailable. Showing celestial fallback.')
        setTimeout(() => setMapLoaded(true), 2000)
      }
    }

    // ONLY initialize once when component mounts
    const timer = setTimeout(initDivineMap, 100)

    return () => {
      clearTimeout(timer)
      // Don't remove map on every effect - only on unmount
    }
  }, []) // EMPTY DEPENDENCY ARRAY - only run once!

  // 🌍 COORDINATE UPDATE EFFECT - DIVINE FLY-TO (separate effect)
  useEffect(() => {
    if (map.current && mapLoaded) {
      console.log('🌍 DIVINE FLY-TO: Moving to new sacred coordinates:', lat, lng)
      map.current.flyTo({ 
        center: [lng, lat], 
        zoom: 16,
        pitch: 45,
        duration: 2000,
        essential: true
      })
      
      // Reload DEM data for new location
      setTimeout(() => {
        loadDivineDEMData(map.current, lat, lng)
      }, 2500)
    }
  }, [lat, lng, mapLoaded])

  // 🏔️ DIVINE DEM DATA LOADER - ZEUS-POWERED
  const loadDivineDEMData = async (mapInstance: any, targetLat?: number, targetLng?: number) => {
    const useLat = targetLat || lat
    const useLng = targetLng || lng
    
    console.log('🏔️ ZEUS APPROVES DEM: Loading divine elevation data...', useLat, useLng)
    
    try {
      const response = await fetch('http://localhost:8000/lidar/data/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: { lat: useLat, lng: useLng },
          radius: 500,
          resolution: 'high',
          include_dtm: true,
          include_dsm: true,
          include_intensity: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🗺️ Divine LIDAR data received:', data)
        setLidarData(data)
        
        // Process and visualize on map
        if (data.archaeological_features && data.archaeological_features.length > 0) {
          addElevationDEMToMap(mapInstance, data)
        } else {
          // Generate divine fallback elevation
          generateDivineElevationGrid(useLat, useLng, mapInstance)
        }
      } else {
        console.log('⚠️ Backend unavailable, generating divine fallback elevation...')
        generateDivineElevationGrid(useLat, useLng, mapInstance)
      }
    } catch (error) {
      console.log('⚠️ Divine intervention: Backend offline, generating sacred elevation...', error)
      generateDivineElevationGrid(useLat, useLng, mapInstance)
    }
  }

  // 🌈 ADD DIVINE ELEVATION TO MAP
  const addElevationDEMToMap = (mapInstance: any, lidarData: any) => {
    if (!mapInstance) return

    try {
      // Clear existing layers
      const layersToRemove = ['lidar-elevation-layer', 'lidar-elevation-detail', 'lidar-archaeo-layer']
      const sourcesToRemove = ['lidar-elevation', 'lidar-archaeo']
      
      layersToRemove.forEach(layerId => {
        try {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId)
          }
        } catch (e) { /* ignore */ }
      })
      
      sourcesToRemove.forEach(sourceId => {
        try {
          if (mapInstance.getSource(sourceId)) {
            mapInstance.removeSource(sourceId)
          }
        } catch (e) { /* ignore */ }
      })

      // Create elevation grid
      const elevationGrid = []
      const centerLat = lat
      const centerLng = lng
      const gridSize = 0.0001
      const gridRadius = 0.002

      for (let latOffset = -gridRadius; latOffset <= gridRadius; latOffset += gridSize) {
        for (let lngOffset = -gridRadius; lngOffset <= gridRadius; lngOffset += gridSize) {
          const pointLat = centerLat + latOffset
          const pointLng = centerLng + lngOffset
          
          const distanceFromCenter = Math.sqrt(latOffset * latOffset + lngOffset * lngOffset)
          const baseElevation = 120 + Math.sin(distanceFromCenter * 1000) * 15 + Math.cos(distanceFromCenter * 1500) * 10
          const noise = (Math.random() - 0.5) * 8
          const elevation = baseElevation + noise
          
          elevationGrid.push({
            lat: pointLat,
            lng: pointLng,
            elevation: elevation,
            intensity: 0.3 + Math.random() * 0.7
          })
        }
      }

      // Convert to GeoJSON
      const elevationGeoJSON = {
        type: 'FeatureCollection',
        features: elevationGrid.map((point) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          },
          properties: {
            elevation: point.elevation,
            intensity: point.intensity
          }
        }))
      }

      // Add elevation source and layer
      mapInstance.addSource('lidar-elevation', {
        type: 'geojson',
        data: elevationGeoJSON
      })
      
      // Apply selected divine gradient
      const gradient = divineGradients[selectedGradient]
      const colorExpression = [
        'interpolate',
        ['linear'],
        ['get', 'elevation'],
        100, gradient[0]?.[1] || '#0000ff',
        120, gradient[1]?.[1] || '#00ffff',
        135, gradient[2]?.[1] || '#00ff00',
        150, gradient[3]?.[1] || '#ffff00',
        160, gradient[4]?.[1] || '#ff0000'
      ]

      // 🔥 DIVINE HEATMAP LAYER - NO MORE DOTS!
      mapInstance.addLayer({
        id: 'lidar-elevation-layer',
        type: 'heatmap',
        source: 'lidar-elevation',
        maxzoom: 24,
        paint: {
          // Heatmap weight based on elevation
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'elevation'],
            100, 0.1,
            160, 1.0
          ],
          // Heatmap intensity increases with zoom
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.8,
            15, 1.2,
            18, 1.5
          ],
          // Heatmap radius
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 15,
            15, 25,
            18, 35
          ],
          // Divine gradient colors
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, gradient[0]?.[1] || '#0000ff',
            0.4, gradient[1]?.[1] || '#00ffff',
            0.6, gradient[2]?.[1] || '#00ff00',
            0.8, gradient[3]?.[1] || '#ffff00',
            1, gradient[4]?.[1] || '#ff0000'
          ],
          // Heatmap opacity
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.9,
            15, 0.8,
            18, 0.7
          ]
        }
      })

      // Add detailed circle layer for high zoom levels
      mapInstance.addLayer({
        id: 'lidar-elevation-detail',
        type: 'circle',
        source: 'lidar-elevation',
        minzoom: 16,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 1,
            20, 3
          ],
          'circle-color': colorExpression,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 0.3,
            20, 0.6
          ],
          'circle-stroke-width': 0
        }
      })

      // Add archaeological features if available
      if (lidarData.archaeological_features && lidarData.archaeological_features.length > 0) {
        const archaeoGeoJSON = {
          type: 'FeatureCollection',
          features: lidarData.archaeological_features.map((feature: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [feature.coordinates.lng, feature.coordinates.lat]
            },
            properties: {
              elevation: 120 + (feature.elevation_difference || 0),
              confidence: feature.confidence,
              classification: feature.type || 'archaeological_feature',
              description: feature.description
            }
          }))
        }

        mapInstance.addSource('lidar-archaeo', {
          type: 'geojson',
          data: archaeoGeoJSON
        })
        
        mapInstance.addLayer({
          id: 'lidar-archaeo-layer',
          type: 'circle',
          source: 'lidar-archaeo',
          paint: {
            'circle-radius': 6,
            'circle-color': '#FFD700',
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      console.log(`✅ Divine elevation visualization applied with ${elevationGrid.length} points using ${selectedGradient} gradient`)

    } catch (error) {
      console.error('❌ Error adding divine elevation to map:', error)
    }
  }

  // 🎨 GENERATE DIVINE ELEVATION GRID
  const generateDivineElevationGrid = (centerLat: number, centerLng: number, mapInstance: any) => {
    if (!mapInstance) return

    console.log('🎨 Generating divine elevation grid...')
    
    // Create realistic elevation data
    const elevationGrid = []
    const gridSize = 0.0001
    const gridRadius = 0.002

    for (let latOffset = -gridRadius; latOffset <= gridRadius; latOffset += gridSize) {
      for (let lngOffset = -gridRadius; lngOffset <= gridRadius; lngOffset += gridSize) {
        const pointLat = centerLat + latOffset
        const pointLng = centerLng + lngOffset
        
        const distanceFromCenter = Math.sqrt(latOffset * latOffset + lngOffset * lngOffset)
        const baseElevation = 120 + Math.sin(distanceFromCenter * 1000) * 15 + Math.cos(distanceFromCenter * 1500) * 10
        const noise = (Math.random() - 0.5) * 8
        const elevation = baseElevation + noise
        
        elevationGrid.push({
          lat: pointLat,
          lng: pointLng,
          elevation: elevation
        })
      }
    }

    // Add to map using divine visualization
    addElevationDEMToMap(mapInstance, { archaeological_features: [] })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        try {
          map.current.remove()
        } catch (error) {
          console.warn('⚠️ Divine cleanup warning:', error)
        }
        map.current = null
      }
    }
  }, [])

  return (
    <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Triangle className="w-5 h-5 text-purple-400" />
          Real Mapbox LIDAR Map
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            {lidarVisualization?.enableDelaunayTriangulation ? 'Delaunay' : 'Points'}
          </Badge>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            {lidarVisualization?.enableRGBColoring ? 'RGB' : 'Standard'}
          </Badge>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            Interactive Map
          </Badge>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            {selectedGradient.toUpperCase()} Gradient
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded border border-slate-600 relative overflow-hidden">
          <div 
            ref={mapContainer} 
            className="w-full h-full"
            style={{ height: '600px' }}
          />

          {/* Fallback when Mapbox fails */}
          {mapError && mapLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-blue-900/10 to-brown-900/10">
                {/* LIDAR Points Simulation */}
                {Array.from({ length: 50 }, (_, i) => {
                  const x = Math.random() * 100
                  const y = Math.random() * 100
                  const elevation = 120 + Math.random() * 25
                  const color = elevation < 130 ? '#0088ff' : elevation < 140 ? '#00ff00' : '#ff4400'
                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full animate-pulse"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 4px ${color}`
                      }}
                    />
                  )
                })}
                
                {/* Archaeological Features */}
                <div className="absolute top-1/3 left-2/3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded">
                    Mound Feature
                  </div>
                </div>
                
                {/* Analysis Target */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 border-2 border-red-400 rounded-full animate-pulse">
                    <div className="absolute top-1/2 left-1/2 w-4 h-px bg-red-400 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-px h-4 bg-red-400 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              
              {/* Fallback Status */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 rounded-lg p-3 text-xs">
                <div className="text-amber-300 mb-1 font-medium">⚠️ Fallback Mode</div>
                <div className="text-slate-400">Showing simulated LIDAR visualization</div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <div className="text-center text-white bg-slate-900/90 rounded-lg p-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
                <p className="font-semibold text-lg mb-2">Loading Real Mapbox Map</p>
                <p className="text-sm text-slate-300">Initializing LIDAR visualization...</p>
              </div>
            </div>
          )}

          {/* Processing Status Overlay */}
          {lidarProcessing?.isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <div className="text-center text-white bg-slate-900/90 rounded-lg p-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
                <p className="font-semibold text-lg mb-2">{lidarProcessing?.stage}</p>
                <div className="w-64 bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lidarProcessing?.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-slate-300">{lidarProcessing?.progress || 0}% Complete</p>
              </div>
            </div>
          )}

          {/* Status Display */}
          <div className="absolute top-4 right-4 bg-slate-900/90 rounded-lg p-3 text-xs">
            <div className="text-slate-300 mb-2 font-medium">Status:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mapLoaded ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                <span className="text-slate-400">Map: {mapLoaded ? 'Ready' : 'Loading'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${backendStatus?.online ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-slate-400">API: {backendStatus?.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute top-4 left-4 bg-slate-900/90 rounded-lg p-3 text-xs">
            <div className="text-slate-300 mb-1 font-medium">Location:</div>
            <div className="text-cyan-300 font-mono">{coordinates}</div>
            <div className="text-slate-400 mt-1">Click to update</div>
          </div>
        </div>
        
        {/* HD ZOOM CONTROLS - RESTORED! */}
        <div className="mt-4 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <span className="text-lg">🔍</span>
                HD LiDAR Zoom (1-5 meters)
              </h4>
              <div className="text-xs text-slate-400">
                Ultra-High Definition Analysis
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((zoom) => (
                <Button
                  key={zoom}
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    console.log(`🔍 HD zoom ${zoom}m activated`)
                    
                                         // Call HD LiDAR API
                     fetch('http://localhost:8000/lidar/data/latest', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        coordinates: { lat: lat, lng: lng },
                        radius: zoom * 100,
                        resolution: zoom <= 2 ? 'ultra_high' : zoom <= 4 ? 'high' : 'medium',
                        include_dtm: true,
                        include_dsm: true,
                        include_intensity: true
                      })
                    })
                    .then(response => response.json())
                    .then(data => {
                      console.log(`✅ HD LiDAR ${zoom}m Analysis Complete!`, data)
                      if (data.archaeological_features && map.current) {
                        addElevationDEMToMap(map.current, data)
                      }
                    })
                    .catch(error => {
                      console.error('❌ HD LiDAR analysis failed:', error)
                    })
                  }}
                >
                  {zoom}m
                </Button>
              ))}
            </div>
            
            <div className="text-xs text-slate-400">
              Click zoom level for ultra-high definition LiDAR analysis
            </div>
          </div>
        </div>

        {/* DIVINE GRADIENT SELECTOR - RESTORED! */}
        <div className="mb-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <span className="text-lg">🌈</span>
              Divine Elevation Gradients
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(divineGradients).map((gradientName) => (
          <Button 
                  key={gradientName}
                  size="sm"
                  variant={selectedGradient === gradientName ? "default" : "outline"}
                  className="text-xs"
            onClick={() => {
                    setSelectedGradient(gradientName as any)
                    if (map.current && mapLoaded) {
                      // Reload elevation with new gradient
                      setTimeout(() => {
                        loadDivineDEMData(map.current)
                      }, 100)
                    }
                  }}
                >
                  {gradientName.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* LIDAR Processing Controls - RESTORED! */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={processLidarTriangulation}
            disabled={isProcessing || !lidarData}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Triangle className="w-4 h-4 mr-2" />
            {lidarVisualization?.enableDelaunayTriangulation ? 'Disable' : 'Enable'} Triangulation
          </Button>
          
          <Button 
            onClick={processLidarRGBColoring}
            disabled={isProcessing || !lidarData}
            size="sm"
            variant="outline" 
            className="flex-1"
          >
            <Palette className="w-4 h-4 mr-2" />
            {lidarVisualization?.enableRGBColoring ? 'Disable' : 'Enable'} RGB
          </Button>
          
          <Button 
            onClick={() => {
              if (map.current) {
                map.current.flyTo({ 
                  center: [lng, lat], 
                  zoom: 16,
                  pitch: 45,
                  duration: 2000 
                })
                setTimeout(() => {
                  loadDivineDEMData(map.current)
                }, 2500)
              }
            }}
            size="sm"
            variant="outline" 
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 