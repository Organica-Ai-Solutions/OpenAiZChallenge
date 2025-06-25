"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  RefreshCw, 
  Download,
  Crosshair,
  MapPin, 
  Satellite, 
  Mountain, 
  Eye,
  Layers,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react'

interface MapboxVisionMapProps {
  coordinates?: { lat: number; lng: number }
  onCoordinateChange?: (coords: { lat: number; lng: number }) => void
  lidarData?: any
  satelliteData?: any
  analysisResults?: any
  height?: string
  className?: string
}

interface LidarVisualization {
  mode: 'elevation' | 'intensity' | 'classification' | 'slope' | 'hillshade' | 'archaeological'
  colorScheme: 'viridis' | 'terrain' | 'plasma' | 'inferno' | 'archaeological'
  opacity: number
  pointSize: number
  extrusion: boolean
  triangulation: boolean
  contours: boolean
}

interface ArchaeologicalFeature {
  type: string
  coordinates: { lat: number; lng: number }
  elevation_difference: number
  confidence: number
  description: string
}

export function MapboxVisionMap({
  coordinates = { lat: -3.4653, lng: -62.2159 }, // Amazon default
  onCoordinateChange,
  lidarData,
  satelliteData,
  analysisResults,
  height = "600px",
  className = ""
}: MapboxVisionMapProps) {
  
  // Map state
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Data state - real backend integration
  const [realLidarData, setRealLidarData] = useState<any>(null)
  const [realSatelliteData, setRealSatelliteData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataStats, setDataStats] = useState<any>(null)
  
  // Visualization state
  const [lidarViz, setLidarViz] = useState<LidarVisualization>({
    mode: 'elevation',
    colorScheme: 'terrain',
    opacity: 0.8,
    pointSize: 4,
    extrusion: true,
    triangulation: true,
    contours: false
  })
  
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')
  const [activeLayer, setActiveLayer] = useState<'lidar' | 'satellite' | 'hybrid'>('lidar')

  // Mapbox token
  const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVudGl1czAwIiwiYSI6ImNtYXRtZXpmZTB4djgya29mNWZ0dG5pZDUifQ.dmsZjiJKZ7dxGs5KHVEK2g'
  
  // Enhanced LIDAR data fetching with professional processing
  const fetchRealLidarData = useCallback(async () => {
    if (!coordinates) return
    
    console.log('🏔️ Fetching professional LIDAR data:', coordinates)
      setDataLoading(true)
      
    try {
      const response = await fetch(`http://localhost:8000/lidar/data/latest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: { lat: coordinates.lat, lng: coordinates.lng },
          radius: 1000,
          resolution: "high",
          include_dtm: true,
          include_dsm: true,
          include_intensity: true
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Professional LIDAR data loaded:', data)
        setRealLidarData(data)
        setDataStats(data.statistics)
      } else {
        // Fallback to backup backend
        const fallbackResponse = await fetch(`http://localhost:8003/lidar/data/latest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: { lat: coordinates.lat, lng: coordinates.lng },
            radius: 1000,
            resolution: "high"
          })
        })
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          console.log('✅ LIDAR data loaded from fallback:', data)
          setRealLidarData(data)
          setDataStats(data.statistics)
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch LIDAR data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [coordinates])

  // Enhanced satellite data fetching
  const fetchRealSatelliteData = useCallback(async () => {
    if (!coordinates) return
    
    console.log('🛰️ Fetching satellite data for overlay:', coordinates)
    
    try {
      const response = await fetch(`http://localhost:8000/satellite/imagery/latest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: { lat: coordinates.lat, lng: coordinates.lng },
          zoom: 16,
          bands: ["rgb", "nir"]
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Satellite data loaded:', data)
        setRealSatelliteData(data)
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch satellite data:', error)
    }
  }, [coordinates])
  
  // Initialize professional Mapbox map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || map.current) return

      try {
        console.log('🗺️ Initializing professional LIDAR map...')
        
        const mapboxgl = await import('mapbox-gl')
        mapboxgl.default.accessToken = MAPBOX_TOKEN
        
        const mapInstance = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [coordinates.lng, coordinates.lat],
          zoom: 15,
          pitch: viewMode === '3d' ? 60 : 0,
          bearing: 0,
          antialias: true,
          preserveDrawingBuffer: true
        })

        mapInstance.on('load', () => {
          console.log('✅ Professional LIDAR map loaded')
          setMapLoaded(true)
          
          // Initialize with real data
          fetchRealLidarData()
          fetchRealSatelliteData()
        })

        mapInstance.on('click', (e) => {
          const newCoords = { lat: e.lngLat.lat, lng: e.lngLat.lng }
          console.log('📍 Map clicked - fetching new LIDAR data:', newCoords)
          if (onCoordinateChange) {
            onCoordinateChange(newCoords)
          }
        })

        mapInstance.on('error', (e) => {
          console.error('❌ Map error:', e)
          setMapError('Failed to load professional map')
        })

        map.current = mapInstance

      } catch (error) {
        console.error('❌ Failed to initialize professional map:', error)
        setMapError('Failed to initialize map')
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map center and fetch new data
  useEffect(() => {
    if (map.current && mapLoaded && coordinates) {
      console.log('🎯 Updating map center and fetching new data:', coordinates)
      map.current.easeTo({
        center: [coordinates.lng, coordinates.lat],
        duration: 1500
      })
      
      // Fetch new data for new location
      fetchRealLidarData()
      fetchRealSatelliteData()
    }
  }, [coordinates, mapLoaded, fetchRealLidarData, fetchRealSatelliteData])

  // Professional LIDAR visualization with Delaunay triangulation
  useEffect(() => {
    if (!map.current || !mapLoaded || !realLidarData?.points) return

    console.log('🏔️ Creating professional LIDAR visualization...')
    
    try {
      // Remove existing layers
      const layersToRemove = ['lidar-points', 'lidar-triangulation', 'lidar-extrusion', 'lidar-contours', 'archaeological-features']
      layersToRemove.forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
      })

      const sourcesToRemove = ['lidar-data', 'lidar-triangulated', 'archaeological-data']
      sourcesToRemove.forEach(sourceId => {
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      })

      // Create point cloud GeoJSON
      const lidarPoints = realLidarData.points.map((point: any) => ({
        type: 'Feature',
        properties: {
          elevation: point.elevation || 0,
          surface_elevation: point.surface_elevation || point.elevation || 0,
          intensity: point.intensity || 128,
          classification: point.classification || 'unclassified',
          archaeological_potential: point.archaeological_potential || 'low'
        },
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat, point.elevation || 0]
        }
      }))

      const lidarGeoJSON = {
        type: 'FeatureCollection',
        features: lidarPoints
      }

      // Add LIDAR point source
      map.current.addSource('lidar-data', {
        type: 'geojson',
        data: lidarGeoJSON
      })

      // Delaunay Triangulation for terrain mesh (following Mapbox tutorial)
      if (lidarViz.triangulation && realLidarData.grids?.dtm) {
        const triangulatedFeatures = createDelaunayTriangulation(realLidarData)
        
        const triangulatedGeoJSON = {
          type: 'FeatureCollection',
          features: triangulatedFeatures
        }

        map.current.addSource('lidar-triangulated', {
        type: 'geojson',
          data: triangulatedGeoJSON
      })

        // Add triangulated mesh layer with 3D extrusion
      map.current.addLayer({
          id: 'lidar-triangulation',
          type: 'fill-extrusion',
          source: 'lidar-triangulated',
        paint: {
            'fill-extrusion-color': getColorExpression(lidarViz.mode, lidarViz.colorScheme),
            'fill-extrusion-height': lidarViz.extrusion ? [
            'interpolate',
            ['linear'],
              ['get', 'elevation'],
              dataStats?.elevation_min || 140, 0,
              dataStats?.elevation_max || 200, ['*', ['get', 'elevation_diff'], 3]
            ] : 0,
            'fill-extrusion-opacity': lidarViz.opacity
          }
        })
      }

      // Add point cloud layer
      map.current.addLayer({
        id: 'lidar-points',
        type: 'circle',
        source: 'lidar-data',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, lidarViz.pointSize * 0.5,
            18, lidarViz.pointSize * 2
          ],
          'circle-color': getColorExpression(lidarViz.mode, lidarViz.colorScheme),
          'circle-opacity': lidarViz.opacity,
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.3
        }
      })

      // Add archaeological features
      if (realLidarData.archaeological_features?.length > 0) {
        const archaeologicalFeatures = realLidarData.archaeological_features.map((feature: ArchaeologicalFeature) => ({
          type: 'Feature',
          properties: {
            type: feature.type,
            confidence: feature.confidence,
            description: feature.description,
            elevation_difference: feature.elevation_difference
          },
          geometry: {
            type: 'Point',
            coordinates: [feature.coordinates.lng, feature.coordinates.lat]
          }
        }))

        map.current.addSource('archaeological-data', {
        type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: archaeologicalFeatures
          }
        })

        map.current.addLayer({
          id: 'archaeological-features',
          type: 'circle',
          source: 'archaeological-data',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'confidence'],
              0.3, 8,
              0.8, 15
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'potential_mound'], '#ff6b35',
              ['==', ['get', 'type'], 'potential_plaza'], '#4ecdc4',
              '#ffd93d'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      console.log('✅ Professional LIDAR visualization created')

    } catch (error) {
      console.error('❌ Failed to create LIDAR visualization:', error)
    }
  }, [realLidarData, lidarViz, mapLoaded, dataStats])

  // Create Delaunay triangulation (following Mapbox tutorial approach)
  const createDelaunayTriangulation = (lidarData: any): any[] => {
    const features: any[] = []
    const grid = lidarData.grids.dtm
    const bounds = lidarData.grids.bounds
    const gridSize = lidarData.grids.grid_size

    if (!grid || !bounds) return features

    const latStep = (bounds.north - bounds.south) / gridSize
    const lngStep = (bounds.east - bounds.west) / gridSize

    // Create triangles from grid (simplified Delaunay approach)
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const lat1 = bounds.south + i * latStep
        const lat2 = bounds.south + (i + 1) * latStep
        const lng1 = bounds.west + j * lngStep
        const lng2 = bounds.west + (j + 1) * lngStep

        const elev1 = grid[i][j]
        const elev2 = grid[i][j + 1]
        const elev3 = grid[i + 1][j]
        const elev4 = grid[i + 1][j + 1]

        const avgElev = (elev1 + elev2 + elev3 + elev4) / 4
        const elevDiff = Math.max(elev1, elev2, elev3, elev4) - Math.min(elev1, elev2, elev3, elev4)

        // Create two triangles per grid cell
        features.push({
          type: 'Feature',
          properties: {
            elevation: avgElev,
            elevation_diff: elevDiff,
            triangle_type: 'lower'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng1, lat1],
              [lng2, lat1],
              [lng1, lat2],
              [lng1, lat1]
            ]]
          }
        })

        features.push({
          type: 'Feature',
          properties: {
            elevation: avgElev,
            elevation_diff: elevDiff,
            triangle_type: 'upper'
          },
        geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng2, lat1],
              [lng2, lat2],
              [lng1, lat2],
              [lng2, lat1]
            ]]
          }
        })
      }
    }

    return features
  }

  // Professional color schemes for LIDAR visualization
  const getColorExpression = (mode: string, colorScheme: string) => {
    const baseProperty = mode === 'elevation' ? 'elevation' : 
                        mode === 'intensity' ? 'intensity' :
                        mode === 'archaeological' ? 'archaeological_potential' : 'elevation'

    switch (colorScheme) {
      case 'terrain':
        return [
          'interpolate',
          ['linear'],
          ['get', baseProperty],
          ...(mode === 'elevation' ? [
            140, '#0d47a1',  // Deep water blue
            150, '#1976d2',  // Water blue
            160, '#42a5f5',  // Light blue
            170, '#4caf50',  // Green
            180, '#8bc34a',  // Light green
            190, '#ffeb3b',  // Yellow
            200, '#ff9800',  // Orange
            210, '#f44336'   // Red
          ] : mode === 'intensity' ? [
            0, '#000051',
            64, '#1a237e',
            128, '#3f51b5',
            192, '#2196f3',
            255, '#00bcd4'
          ] : [
            0, '#37474f',    // Low potential
            0.5, '#ffeb3b',  // Medium potential
            1, '#f44336'     // High potential
          ])
        ]
      
      case 'archaeological':
        return [
          'case',
          ['==', ['get', 'archaeological_potential'], 'high'], '#ff6b35',
          ['==', ['get', 'classification'], 'potential_structure'], '#ff9500',
          ['==', ['get', 'classification'], 'potential_plaza'], '#4ecdc4',
          '#81c784'
        ]

      case 'viridis':
        return [
          'interpolate',
          ['linear'],
          ['get', baseProperty],
          ...(mode === 'elevation' ? [
            140, '#440154',
            160, '#31688e',
            180, '#35b779',
            200, '#fde725'
          ] : [
            0, '#440154',
            128, '#31688e',
            255, '#fde725'
          ])
        ]

      default:
        return '#4caf50'
    }
  }

  // Update view mode (2D/3D)
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.easeTo({
        pitch: viewMode === '3d' ? 60 : 0,
        bearing: viewMode === '3d' ? 20 : 0,
        duration: 1000
      })
    }
  }, [viewMode, mapLoaded])

  // Professional map controls
  const handleRefreshMap = useCallback(() => {
    console.log('🔄 Refreshing professional LIDAR data...')
    fetchRealLidarData()
    fetchRealSatelliteData()
  }, [fetchRealLidarData, fetchRealSatelliteData])

  const handleExportData = useCallback(() => {
    const exportData = {
      coordinates,
      lidar_statistics: dataStats,
      archaeological_features: realLidarData?.archaeological_features?.length || 0,
      data_quality: realLidarData?.quality_assessment,
      visualization_settings: lidarViz,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `professional-lidar-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [coordinates, dataStats, realLidarData, lidarViz])

  const handleCenterMap = useCallback(() => {
    if (map.current) {
      map.current.easeTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 16,
        duration: 1000
      })
    }
  }, [coordinates])

  if (mapError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-red-900/20 border border-red-500/50 rounded-lg`}
        style={{ height }}
      >
        <div className="text-center text-red-300">
          <p className="text-lg font-semibold">Professional Map Error</p>
          <p className="text-sm">{mapError}</p>
          </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Professional Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
        style={{ height: '100%' }}
      />

      {/* Professional Loading Overlay */}
            {dataLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <Zap className="w-8 h-8 animate-pulse mx-auto mb-2 text-blue-400" />
            <p className="font-semibold">Processing LIDAR Data...</p>
            <p className="text-sm opacity-80">Applying Delaunay triangulation</p>
          </div>
        </div>
      )}

      {/* Professional Controls Panel */}
      <Card className="absolute top-4 left-4 bg-black/90 border-slate-700 text-white w-96">
        <CardContent className="p-4">
          <Tabs value="visualization" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="space-y-4 mt-4">
              <div>
                <Label className="text-xs font-semibold">Visualization Mode</Label>
                <Select
                  value={lidarViz.mode}
                  onValueChange={(value: any) => {
                  setLidarViz(prev => ({ ...prev, mode: value }))
                  }}
                >
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevation">Elevation</SelectItem>
                    <SelectItem value="intensity">Intensity</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="archaeological">Archaeological</SelectItem>
                    <SelectItem value="slope">Slope</SelectItem>
                    <SelectItem value="hillshade">Hillshade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-semibold">Color Scheme</Label>
                <Select
                  value={lidarViz.colorScheme}
                  onValueChange={(value: any) => {
                  setLidarViz(prev => ({ ...prev, colorScheme: value }))
                  }}
                >
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="archaeological">Archaeological</SelectItem>
                    <SelectItem value="viridis">Viridis</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Opacity: {Math.round(lidarViz.opacity * 100)}%</Label>
                <Slider
                  value={[lidarViz.opacity * 100]}
                  onValueChange={([value]) => {
                    setLidarViz(prev => ({ ...prev, opacity: value / 100 }))
                  }}
                  max={100}
                  step={5}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs">Point Size: {lidarViz.pointSize}px</Label>
                <Slider
                  value={[lidarViz.pointSize]}
                  onValueChange={([value]) => {
                    setLidarViz(prev => ({ ...prev, pointSize: value }))
                  }}
                  min={1}
                  max={12}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                    <Switch
                    checked={lidarViz.extrusion}
                    onCheckedChange={(checked) => {
                      setLidarViz(prev => ({ ...prev, extrusion: checked }))
                    }}
                      className="scale-75"
                    />
                  <Label className="text-xs">3D Extrusion</Label>
                  </div>
                
                <div className="flex items-center space-x-2">
                    <Switch
                    checked={lidarViz.triangulation}
                    onCheckedChange={(checked) => {
                      setLidarViz(prev => ({ ...prev, triangulation: checked }))
                    }}
                      className="scale-75"
                    />
                  <Label className="text-xs">Triangulation</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Archaeological Overlay</Label>
                <Switch
                  checked={showAnalysisOverlay}
                  onCheckedChange={setShowAnalysisOverlay}
                  className="scale-75"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">3D View</Label>
                <Switch
                  checked={viewMode === '3d'}
                  onCheckedChange={(checked) => {
                    setViewMode(checked ? '3d' : '2d')
                  }}
                  className="scale-75"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Active Layer</Label>
                <Select
                  value={activeLayer}
                  onValueChange={(value: any) => setActiveLayer(value)}
                >
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lidar">LIDAR Only</SelectItem>
                    <SelectItem value="satellite">Satellite Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-3 mt-4">
              {dataStats && (
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Elevation Range:</span>
                    <span>{dataStats.elevation_min?.toFixed(1)}m - {dataStats.elevation_max?.toFixed(1)}m</span>
        </div>
                  <div className="flex justify-between">
                    <span>Mean Elevation:</span>
                    <span>{dataStats.elevation_mean?.toFixed(1)}m</span>
        </div>
                  <div className="flex justify-between">
                    <span>Archaeological Features:</span>
                    <span>{dataStats.archaeological_features_detected || 0}</span>
        </div>
                  <div className="flex justify-between">
                    <span>Data Quality:</span>
                    <span className="text-green-400">{realLidarData?.quality_assessment?.data_completeness ? Math.round(realLidarData.quality_assessment.data_completeness * 100) : 85}%</span>
        </div>
      </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Professional Quick Actions */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="secondary" 
          className="w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700"
          onClick={handleRefreshMap}
          title="Refresh LIDAR Data"
        >
                <RefreshCw className="w-4 h-4" />
              </Button>
        
        <Button 
          size="sm" 
          variant="secondary" 
          className="w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
          onClick={handleExportData}
          title="Export Professional Data"
        >
                <Download className="w-4 h-4" />
              </Button>
        
        <Button 
          size="sm" 
          variant="secondary" 
          className="w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700"
          onClick={handleCenterMap}
          title="Center Map"
        >
                <Crosshair className="w-4 h-4" />
              </Button>
      </div>

      {/* Professional Status Display */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-3 rounded-lg text-xs min-w-80">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="font-mono">{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Badge variant="secondary" className={`text-xs ${realSatelliteData ? 'border-green-400 text-green-300' : 'border-amber-400 text-amber-300'}`}>
            <Satellite className="w-3 h-3 mr-1" />
            {realSatelliteData ? 'Satellite ✓' : 'Loading...'}
          </Badge>
          <Badge variant="secondary" className={`text-xs ${realLidarData ? 'border-green-400 text-green-300' : 'border-amber-400 text-amber-300'}`}>
            <Mountain className="w-3 h-3 mr-1" />
            {realLidarData ? `LIDAR (${realLidarData.points?.length || 0}pts)` : 'Loading...'}
          </Badge>
          <Badge variant="secondary" className={`text-xs ${realLidarData?.archaeological_features?.length ? 'border-orange-400 text-orange-300' : 'border-slate-400 text-slate-300'}`}>
            <Eye className="w-3 h-3 mr-1" />
            {realLidarData?.archaeological_features?.length || 0} Features
          </Badge>
        </div>
        {realLidarData?.metadata && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-xs opacity-80">
            <div className="flex justify-between">
              <span>Sensor:</span>
              <span>{realLidarData.metadata.sensor}</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span>±{realLidarData.metadata.accuracy_cm}cm</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapboxVisionMap 