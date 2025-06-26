"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Triangle, Palette, RefreshCw, Target, Layers, Map, Eye, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EnhancedHDMapboxLidarProps {
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

export function EnhancedHDMapboxLidar({
  coordinates,
  setCoordinates,
  lidarVisualization,
  lidarProcessing,
  lidarResults,
  visionResults,
  backendStatus,
  processLidarTriangulation,
  processLidarRGBColoring
}: EnhancedHDMapboxLidarProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hdZoomLevel, setHdZoomLevel] = useState(2)
  const [colorScheme, setColorScheme] = useState('elevation_rainbow')
  const [visualizationMode, setVisualizationMode] = useState('point_cloud')
  const [elevationExaggeration, setElevationExaggeration] = useState([3])
  const [pointSize, setPointSize] = useState([2])
  const [triangulationActive, setTriangulationActive] = useState(false)
  const [rgbColoringActive, setRgbColoringActive] = useState(false)
  const [hdData, setHdData] = useState<any>(null)

  // Parse coordinates
  const [lat, lng] = coordinates.split(',').map(s => parseFloat(s.trim()))

  const initMap = useCallback(async () => {
    if (map.current || !mapContainer.current) return

    try {
      // Dynamic import of Mapbox
      const mapboxgl = (await import('mapbox-gl')).default
      
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: [lng, lat],
        zoom: 16,
        pitch: 60,
        bearing: 0,
        antialias: true
      })

      map.current.on('load', () => {
        setMapLoaded(true)
        console.log('✅ Enhanced HD Mapbox map loaded')
        
        // Add terrain for better 3D visualization
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        })
        
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })
        
        // Load initial HD LiDAR data
        loadHDLidarData()
      })

      map.current.on('click', (e: any) => {
        const newCoords = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`
        setCoordinates(newCoords)
      })

    } catch (error) {
      console.error('❌ Map initialization failed:', error)
    }
  }, [lat, lng, setCoordinates])

  const loadHDLidarData = useCallback(async () => {
    if (!map.current || !mapLoaded) return

    try {
      console.log(`🔍 Loading HD LiDAR data: ${hdZoomLevel}m resolution`)
      
      const response = await fetch('http://localhost:8000/lidar/data/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: { lat: lat, lng: lng },
          radius: hdZoomLevel * 100,
          resolution: hdZoomLevel <= 2 ? 'ultra_high' : hdZoomLevel <= 4 ? 'high' : 'medium',
          include_dtm: true,
          include_dsm: true,
          include_intensity: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setHdData(data)
        console.log('✅ HD LiDAR data loaded:', data)
        
        // Clear existing layers
        clearLidarLayers()
        
        // Render based on current visualization mode
        renderLidarVisualization(data)
        
      } else {
        console.warn('⚠️ HD LiDAR API unavailable, using demo data')
        generateDemoData()
      }
    } catch (error) {
      console.error('❌ HD LiDAR loading error:', error)
      generateDemoData()
    }
  }, [lat, lng, hdZoomLevel, mapLoaded])

  const clearLidarLayers = useCallback(() => {
    if (!map.current) return

    const layersToRemove = [
      'lidar-points-layer',
      'lidar-triangulation-layer', 
      'lidar-rgb-layer',
      'lidar-structures-layer',
      'lidar-dem-layer'
    ]

    layersToRemove.forEach(layerId => {
      try {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
        if (map.current.getSource(layerId.replace('-layer', ''))) {
          map.current.removeSource(layerId.replace('-layer', ''))
        }
      } catch (e) {
        // Layer doesn't exist, continue
      }
    })
  }, [])

  const renderLidarVisualization = useCallback((data: any) => {
    if (!map.current || !data) return

    try {
      console.log(`🎨 Rendering ${visualizationMode} with ${colorScheme} colors`)

      // Render point cloud
      if (visualizationMode === 'point_cloud' || visualizationMode === 'hybrid') {
        renderPointCloud(data)
      }

      // Render triangulated mesh
      if (visualizationMode === 'triangulated_mesh' || visualizationMode === 'hybrid') {
        renderTriangulatedMesh(data)
      }

      // Render RGB colored points
      if (rgbColoringActive) {
        renderRGBPoints(data)
      }

      // Render archaeological structures
      if (data.archaeological_features) {
        renderArchaeologicalFeatures(data.archaeological_features)
      }

    } catch (error) {
      console.error('❌ Visualization rendering error:', error)
    }
  }, [visualizationMode, colorScheme, triangulationActive, rgbColoringActive, elevationExaggeration, pointSize])

  const renderPointCloud = useCallback((data: any) => {
    if (!map.current || !data.visualization_data?.point_cloud) return

    const pointCloudData = data.visualization_data.point_cloud
    
    map.current.addSource('lidar-points', {
      type: 'geojson',
      data: pointCloudData
    })

    map.current.addLayer({
      id: 'lidar-points-layer',
      type: 'circle',
      source: 'lidar-points',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, pointSize[0] * 0.5,
          16, pointSize[0],
          20, pointSize[0] * 2
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.8,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.3
      }
    })

    console.log(`✅ Point cloud rendered: ${pointCloudData.features.length} points`)
  }, [pointSize])

  const renderTriangulatedMesh = useCallback((data: any) => {
    if (!map.current || !data.visualization_data?.triangulated_surface) return

    const triangulatedData = data.visualization_data.triangulated_surface
    
    map.current.addSource('lidar-triangulation', {
      type: 'geojson',
      data: triangulatedData
    })

    map.current.addLayer({
      id: 'lidar-triangulation-layer',
      type: 'fill-extrusion',
      source: 'lidar-triangulation',
      paint: {
        'fill-extrusion-color': ['get', 'fill_color'],
        'fill-extrusion-height': [
          '*',
          ['get', 'avg_elevation'],
          elevationExaggeration[0]
        ],
        'fill-extrusion-opacity': ['get', 'fill_opacity'],
        'fill-extrusion-base': 0
      }
    })

    console.log(`✅ Triangulated mesh rendered: ${triangulatedData.features.length} triangles`)
  }, [elevationExaggeration])

  const renderRGBPoints = useCallback((data: any) => {
    if (!map.current || !data.visualization_data?.rgb_colored_points) return

    const rgbData = data.visualization_data.rgb_colored_points
    
    map.current.addSource('lidar-rgb', {
      type: 'geojson',
      data: rgbData
    })

    map.current.addLayer({
      id: 'lidar-rgb-layer',
      type: 'circle',
      source: 'lidar-rgb',
      paint: {
        'circle-radius': pointSize[0] + 1,
        'circle-color': ['get', 'rgb_color'],
        'circle-opacity': 0.9,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#000000'
      }
    })

    console.log(`✅ RGB colored points rendered: ${rgbData.features.length} points`)
  }, [pointSize])

  const renderArchaeologicalFeatures = useCallback((features: any[]) => {
    if (!map.current || !features.length) return

    const featureData = {
      type: 'FeatureCollection',
      features: features.map(feature => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [feature.coordinates.lng, feature.coordinates.lat]
        },
        properties: {
          ...feature,
          color: feature.significance === 'high' ? '#FF4500' : '#FFA500'
        }
      }))
    }
    
    map.current.addSource('lidar-structures', {
      type: 'geojson',
      data: featureData
    })

    map.current.addLayer({
      id: 'lidar-structures-layer',
      type: 'circle',
      source: 'lidar-structures',
      paint: {
        'circle-radius': 8,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })

    console.log(`✅ Archaeological features rendered: ${features.length} structures`)
  }, [])

  const generateDemoData = useCallback(() => {
    console.log('🎭 Generating demo HD LiDAR data')
    
    // Create demo data similar to the reference images
    const demoData = {
      success: true,
      zoom_level: hdZoomLevel,
      archaeological_features: Array.from({ length: 15 }, (_, i) => ({
        type: 'archaeological_feature',
        coordinates: {
          lat: lat + (Math.random() - 0.5) * 0.01,
          lng: lng + (Math.random() - 0.5) * 0.01
        },
        elevation: 120 + Math.random() * 20,
        confidence: 0.7 + Math.random() * 0.3,
        significance: Math.random() > 0.5 ? 'high' : 'medium'
      })),
      visualization_data: {
        point_cloud: {
          type: 'FeatureCollection',
          features: Array.from({ length: 500 }, (_, i) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                lng + (Math.random() - 0.5) * 0.01,
                lat + (Math.random() - 0.5) * 0.01,
                120 + Math.random() * 25
              ]
            },
            properties: {
              elevation: 120 + Math.random() * 25,
              color: getColorForElevation(120 + Math.random() * 25)
            }
          }))
        }
      }
    }
    
    setHdData(demoData)
    renderLidarVisualization(demoData)
  }, [lat, lng, hdZoomLevel, renderLidarVisualization])

  const getColorForElevation = (elevation: number) => {
    // Rainbow color scheme like professional LiDAR software
    const normalized = Math.max(0, Math.min(1, (elevation - 115) / 30))
    
    if (normalized < 0.2) return '#0000FF'      // Blue
    if (normalized < 0.4) return '#00FFFF'      // Cyan  
    if (normalized < 0.6) return '#00FF00'      // Green
    if (normalized < 0.8) return '#FFFF00'      // Yellow
    return '#FF0000'                            // Red
  }

  const handleHDZoomChange = useCallback((newZoom: number) => {
    setHdZoomLevel(newZoom)
    console.log(`🔍 HD zoom changed to ${newZoom}m`)
    // Reload data with new zoom level
    setTimeout(loadHDLidarData, 100)
  }, [loadHDLidarData])

  const handleTriangulationToggle = useCallback(() => {
    setTriangulationActive(!triangulationActive)
    setVisualizationMode(triangulationActive ? 'point_cloud' : 'triangulated_mesh')
    console.log(`🔺 Triangulation ${!triangulationActive ? 'activated' : 'deactivated'}`)
    
    // Call parent function
    processLidarTriangulation()
    
    // Re-render visualization
    if (hdData) {
      setTimeout(() => renderLidarVisualization(hdData), 100)
    }
  }, [triangulationActive, processLidarTriangulation, hdData, renderLidarVisualization])

  const handleRGBColoringToggle = useCallback(() => {
    setRgbColoringActive(!rgbColoringActive)
    console.log(`🎨 RGB coloring ${!rgbColoringActive ? 'activated' : 'deactivated'}`)
    
    // Call parent function
    processLidarRGBColoring()
    
    // Re-render visualization
    if (hdData) {
      setTimeout(() => renderLidarVisualization(hdData), 100)
    }
  }, [rgbColoringActive, processLidarRGBColoring, hdData, renderLidarVisualization])

  const handleStructuresDetection = useCallback(() => {
    console.log('🏛️ Detecting archaeological structures...')
    
    if (hdData?.archaeological_features) {
      // Highlight existing structures
      renderArchaeologicalFeatures(hdData.archaeological_features)
      
      // Show summary
      const structureCount = hdData.archaeological_features.length
      const highConfidence = hdData.archaeological_features.filter((f: any) => f.confidence > 0.8).length
      
      console.log(`🏛️ Archaeological Structures Detected!\n📊 Total Features: ${structureCount}\n🎯 High Confidence: ${highConfidence}\n🔍 HD Resolution: ${hdZoomLevel}m\n✅ Structures highlighted on map`)
    }
  }, [hdData, hdZoomLevel])

  // Initialize map
  useEffect(() => {
    initMap()
  }, [initMap])

  // Reload data when coordinates change
  useEffect(() => {
    if (mapLoaded) {
      loadHDLidarData()
    }
  }, [coordinates, mapLoaded, loadHDLidarData])

  // Update visualization when settings change
  useEffect(() => {
    if (hdData) {
      renderLidarVisualization(hdData)
    }
  }, [visualizationMode, colorScheme, elevationExaggeration, pointSize, hdData, renderLidarVisualization])

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Map className="w-5 h-5 text-blue-400" />
          HD LiDAR Visualization System
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {hdZoomLevel}m HD
          </Badge>
          <Badge variant="outline" className={triangulationActive ? "text-purple-400 border-purple-400" : "text-slate-400 border-slate-400"}>
            {triangulationActive ? 'Triangulated' : 'Point Cloud'}
          </Badge>
          <Badge variant="outline" className={rgbColoringActive ? "text-green-400 border-green-400" : "text-slate-400 border-slate-400"}>
            {rgbColoringActive ? 'RGB' : 'Elevation'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-600"
          />
          
          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading HD LiDAR Map...</span>
              </div>
            </div>
          )}
          
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/90 rounded-lg p-3 text-xs max-w-xs">
            <div className="text-slate-300 mb-2 font-medium">📍 Location:</div>
            <div className="text-cyan-300 font-mono">{coordinates}</div>
            <div className="text-slate-400 mt-1">Click map to update</div>
          </div>

          {/* Visualization Info */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg p-3 text-xs">
            <div className="text-slate-300 mb-2 font-medium">🎨 Active Settings:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${triangulationActive ? 'bg-purple-400' : 'bg-slate-600'}`}></div>
                <span className="text-slate-400">Triangulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${rgbColoringActive ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                <span className="text-slate-400">RGB Coloring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-slate-400">HD: {hdZoomLevel}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* HD Zoom Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              HD Zoom Resolution (1-5 meters)
            </h4>
            <div className="text-xs text-slate-400">
              Ultra-High Definition
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((zoom) => (
              <Button
                key={zoom}
                size="sm"
                variant={hdZoomLevel === zoom ? "default" : "outline"}
                className={`text-xs ${
                  hdZoomLevel === zoom 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => handleHDZoomChange(zoom)}
                disabled={lidarProcessing.isProcessing || !mapLoaded}
              >
                {zoom}m
              </Button>
            ))}
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>1-2m: Ultra-High (Micro-features)</span>
              <span>Structures, walls, small artifacts</span>
            </div>
            <div className="flex justify-between">
              <span>3-5m: High-Detail (Site overview)</span>
              <span>Mounds, plazas, large features</span>
            </div>
          </div>
        </div>

        {/* Processing Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant={triangulationActive ? "default" : "outline"}
            className={`text-sm ${
              triangulationActive 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
            onClick={handleTriangulationToggle}
            disabled={lidarProcessing.isProcessing || !mapLoaded}
          >
            <Triangle className="w-4 h-4 mr-2" />
            {triangulationActive ? 'Disable' : 'Apply'} Triangulation
          </Button>
          
          <Button 
            variant={rgbColoringActive ? "default" : "outline"}
            className={`text-sm ${
              rgbColoringActive 
                ? "bg-green-600 hover:bg-green-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
            onClick={handleRGBColoringToggle}
            disabled={lidarProcessing.isProcessing || !mapLoaded}
          >
            <Palette className="w-4 h-4 mr-2" />
            {rgbColoringActive ? 'Disable' : 'Apply'} RGB Coloring
          </Button>
          
          <Button 
            variant="outline" 
            className="text-sm border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={handleStructuresDetection}
            disabled={lidarProcessing.isProcessing || !mapLoaded}
          >
            <Layers className="w-4 h-4 mr-2" />
            Detect Structures
          </Button>
        </div>

        {/* Visualization Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Color Scheme</label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="elevation_rainbow">Rainbow (Elevation)</SelectItem>
                <SelectItem value="terrain">Natural Terrain</SelectItem>
                <SelectItem value="archaeological">Archaeological</SelectItem>
                <SelectItem value="intensity">Intensity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Visualization Mode</label>
            <Select value={visualizationMode} onValueChange={setVisualizationMode}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="point_cloud">Point Cloud</SelectItem>
                <SelectItem value="triangulated_mesh">Triangulated Mesh</SelectItem>
                <SelectItem value="hybrid">Hybrid (Points + Mesh)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Elevation Exaggeration: {elevationExaggeration[0]}x
            </label>
            <Slider
              value={elevationExaggeration}
              onValueChange={setElevationExaggeration}
              max={10}
              min={1}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Point Size: {pointSize[0]}px
            </label>
            <Slider
              value={pointSize}
              onValueChange={setPointSize}
              max={8}
              min={1}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Status Information */}
        {hdData && (
          <div className="bg-slate-700/50 rounded-lg p-3 text-xs">
            <div className="text-slate-300 mb-2 font-medium">📊 HD LiDAR Data Status:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <div className="text-slate-400">Features:</div>
                <div className="text-white font-mono">
                  {hdData.archaeological_features?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Resolution:</div>
                <div className="text-white font-mono">{hdZoomLevel}m HD</div>
              </div>
              <div>
                <div className="text-slate-400">Processing:</div>
                <div className="text-white font-mono">
                  {hdData.hd_capabilities?.detail_level || 'Standard'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Quality:</div>
                <div className="text-white font-mono">
                  {hdData.hd_capabilities?.triangulation_quality || 'Good'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 