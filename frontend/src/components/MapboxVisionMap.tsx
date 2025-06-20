"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Satellite, 
  Layers, 
  Mountain, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download,
  MapPin,
  Crosshair,
  Zap,
  Activity,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MapboxVisionMapProps {
  coordinates?: { lat: number; lng: number }
  onCoordinateChange?: (coords: { lat: number; lng: number }) => void
  lidarData?: any
  satelliteData?: any
  analysisResults?: any
  height?: string
  className?: string
}

interface LayerConfig {
  id: string
  name: string
  type: 'satellite' | 'lidar' | 'analysis' | 'terrain'
  visible: boolean
  opacity: number
  color?: string
}

interface LidarVisualization {
  mode: 'elevation' | 'intensity' | 'classification' | 'slope' | 'hillshade' | 'contour' | 'spectral' | 'roughness' | 'anomaly'
  colorScheme: 'viridis' | 'terrain' | 'plasma' | 'inferno' | 'archaeological' | 'spectral'
  opacity: number
  pointSize: number
  filtering: {
    minElevation: number
    maxElevation: number
    vegetationFilter: boolean
    buildingFilter: boolean
    anomalyThreshold: number
    spectralBands: string[]
  }
  advanced: {
    terrainRoughness: boolean
    edgeDetection: boolean
    anomalyDetection: boolean
    spectralAnalysis: boolean
    temporalComparison: boolean
  }
}

export function MapboxVisionMap({
  coordinates = { lat: 5.1542, lng: -73.7792 }, // Lake Guatavita default
  onCoordinateChange,
  lidarData,
  satelliteData,
  analysisResults,
  height = "500px",
  className = ""
}: MapboxVisionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Layer management
  const [activeLayers, setActiveLayers] = useState<LayerConfig[]>([
    { id: 'satellite', name: 'Satellite Imagery', type: 'satellite', visible: true, opacity: 1.0 },
    { id: 'lidar-elevation', name: 'LiDAR Elevation', type: 'lidar', visible: false, opacity: 0.7, color: '#00ff00' },
    { id: 'lidar-intensity', name: 'LiDAR Intensity', type: 'lidar', visible: false, opacity: 0.6, color: '#ff6600' },
    { id: 'archaeological-sites', name: 'Archaeological Sites', type: 'analysis', visible: true, opacity: 0.8, color: '#ff0000' },
    { id: 'terrain-analysis', name: 'Terrain Analysis', type: 'terrain', visible: false, opacity: 0.5, color: '#0066ff' }
  ])
  
  // LiDAR visualization settings
  const [lidarViz, setLidarViz] = useState<LidarVisualization>({
    mode: 'elevation',
    colorScheme: 'viridis',
    opacity: 0.7,
    pointSize: 2,
    filtering: {
      minElevation: 0,
      maxElevation: 3000,
      vegetationFilter: false,
      buildingFilter: false,
      anomalyThreshold: 0.5,
      spectralBands: []
    },
    advanced: {
      terrainRoughness: false,
      edgeDetection: false,
      anomalyDetection: false,
      spectralAnalysis: false,
      temporalComparison: false
    }
  })
  
  // Analysis overlay settings
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(true)
  const [analysisOpacity, setAnalysisOpacity] = useState(0.6)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  
  // Map style and view settings
  const [mapStyle, setMapStyle] = useState('satellite-v9')
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [bearing, setBearing] = useState(0)
  const [pitch, setPitch] = useState(0)
  
  // Backend data fetching with caching
  const [backendLidarData, setBackendLidarData] = useState<any>(null)
  const [backendSatelliteData, setBackendSatelliteData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(false)
  
  // Performance optimization: Data caching
  const [dataCache, setDataCache] = useState<Map<string, any>>(new Map())
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    layerCount: 0,
    pointCount: 0,
    cacheHits: 0,
    cacheMisses: 0
  })

  // Mapbox token - using the provided token
  const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVudGl1czAwIiwiYSI6ImNtYXRtZXpmZTB4djgya29mNWZ0dG5pZDUifQ.dmsZjiJKZ7dxGs5KHVEK2g'
  
  // Optimized LIDAR data fetching with caching
  const fetchLidarData = useCallback(async (coords: { lat: number; lng: number }) => {
    const startTime = performance.now()
    const cacheKey = `lidar_${coords.lat.toFixed(4)}_${coords.lng.toFixed(4)}_${lidarViz.mode}`
    
    // Check cache first
    if (dataCache.has(cacheKey)) {
      const cachedData = dataCache.get(cacheKey)
      setBackendLidarData(cachedData)
      setPerformanceMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }))
      console.log('✅ LIDAR data loaded from cache')
      return
    }
    
    try {
      setDataLoading(true)
      setPerformanceMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }))
      
      const response = await fetch('http://localhost:8000/lidar/data/latest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: {
            lat: coords.lat,
            lng: coords.lng
          },
          radius: 1000,
          resolution: 'high',
          include_dtm: true,
          include_dsm: true,
          include_intensity: true,
          visualization_mode: lidarViz.mode,
          advanced_features: lidarViz.advanced
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setBackendLidarData(data)
        
        // Cache the data (limit cache size to 50 entries)
        if (dataCache.size >= 50) {
          const firstKey = dataCache.keys().next().value
          if (firstKey) {
            dataCache.delete(firstKey)
          }
        }
        dataCache.set(cacheKey, data)
        setDataCache(new Map(dataCache))
        
        const renderTime = performance.now() - startTime
        setPerformanceMetrics(prev => ({ 
          ...prev, 
          renderTime: renderTime,
          pointCount: data.features?.length || 0
        }))
        
        console.log('✅ LIDAR data loaded from backend')
      } else {
        console.log('⚠️ LIDAR backend unavailable, using mock data')
      }
    } catch (error) {
      console.log('⚠️ LIDAR fetch failed, using mock data')
    } finally {
      setDataLoading(false)
      setLastUpdateTime(Date.now())
    }
  }, [dataCache, lidarViz.mode, lidarViz.advanced])
  
  // Fetch real satellite data from backend
  const fetchSatelliteData = useCallback(async (coords: { lat: number; lng: number }) => {
    try {
      setDataLoading(true)
      const response = await fetch('http://localhost:8000/satellite/imagery/latest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: {
            lat: coords.lat,
            lng: coords.lng
          },
          radius: 1000
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setBackendSatelliteData(data)
        console.log('✅ Satellite data loaded from backend')
      } else {
        console.log('⚠️ Satellite backend unavailable, using mock data')
      }
    } catch (error) {
      console.log('⚠️ Satellite fetch failed, using mock data')
    } finally {
      setDataLoading(false)
    }
  }, [])
  
  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return

    const initializeMap = async () => {
      try {
        // Load Mapbox GL JS dynamically
        const mapboxgl = await import('mapbox-gl')
        
        // Verify Mapbox GL JS is properly loaded
        if (!mapboxgl.default || !mapboxgl.default.Map) {
          throw new Error('Mapbox GL JS failed to load properly')
        }
        
        // Set access token
        mapboxgl.default.accessToken = MAPBOX_TOKEN
        
        // Performance optimizations for Mapbox
        const mapOptions = {
          container: mapContainer.current!,
          style: 'mapbox://styles/pentius00/cmc32tqj601xj01s27vfa415t',
          center: [coordinates.lng, coordinates.lat] as [number, number],
          zoom: 16,
          pitch: viewMode === '3d' ? 45 : 0,
          bearing: bearing,
          antialias: true,
          // Performance optimizations
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          fadeDuration: 300,
          crossSourceCollisions: false,
          // Reduce unnecessary repaints
          maxBounds: [
            [coordinates.lng - 0.1, coordinates.lat - 0.1],
            [coordinates.lng + 0.1, coordinates.lat + 0.1]
          ] as [[number, number], [number, number]]
        }
        
        // Create map instance with optimized options
        const mapInstance = new mapboxgl.default.Map(mapOptions)

        map.current = mapInstance

        // Wait for map to load
        mapInstance.on('load', async () => {
          setMapLoaded(true)
          setIsLoading(false)
          initializeMapLayers()
          
          // Add controls with error handling
          try {
            await addMapControls()
          } catch (error) {
            console.warn('Failed to add map controls, continuing without them:', error)
          }
        })

        // Handle map errors
        mapInstance.on('error', (e) => {
          console.error('Mapbox error:', e)
          setMapError('Failed to load map. Please check your internet connection.')
          setIsLoading(false)
        })

        // Handle click events
        mapInstance.on('click', (e) => {
          const newCoords = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          }
          onCoordinateChange?.(newCoords)
          updateAnalysisPoint(newCoords)
        })

      } catch (error) {
        console.error('Error initializing Mapbox:', error)
        setMapError('Failed to initialize map. Mapbox GL JS not available.')
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Initialize map layers
  const initializeMapLayers = useCallback(() => {
    if (!map.current || !mapLoaded) return

    try {
      // Add LiDAR elevation layer
      addLidarLayers()
      
      // Add archaeological analysis layer
      addAnalysisLayers()
      
      // Add terrain analysis layer
      addTerrainLayers()
      
      // Add analysis point marker
      updateAnalysisPoint(coordinates)

    } catch (error) {
      console.error('Error initializing map layers:', error)
    }
  }, [mapLoaded, activeLayers, coordinates])

  // Add LiDAR visualization layers with advanced modes
  const addLidarLayers = useCallback(() => {
    if (!map.current) return

    try {
      // Remove existing layers first for clean updates
      const layersToRemove = ['lidar-elevation-layer', 'lidar-intensity-layer', 'lidar-spectral-layer', 'lidar-roughness-layer', 'lidar-anomaly-layer']
      layersToRemove.forEach(layerId => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId)
        }
      })

      // Add layers based on current visualization mode
      switch (lidarViz.mode) {
        case 'elevation':
          addElevationLayer()
          break
        case 'intensity':
          addIntensityLayer()
          break
        case 'spectral':
          addSpectralLayer()
          break
        case 'roughness':
          addRoughnessLayer()
          break
        case 'anomaly':
          addAnomalyLayer()
          break
        default:
          addElevationLayer()
      }

    } catch (error) {
      console.error('Error adding LiDAR layers:', error)
    }
  }, [lidarData, lidarViz, activeLayers, coordinates])

  // Add elevation visualization layer
  const addElevationLayer = useCallback(() => {
    if (!map.current) return

    const lidarElevationData = generateLidarElevationData(coordinates, backendLidarData || lidarData)
    
    if (!map.current.getSource('lidar-elevation')) {
      map.current.addSource('lidar-elevation', {
        type: 'geojson',
        data: lidarElevationData
      })
    } else {
      (map.current.getSource('lidar-elevation') as any).setData(lidarElevationData)
    }

    if (!map.current.getLayer('lidar-elevation-layer')) {
      const colorScheme = lidarViz.colorScheme === 'archaeological' ? 
        getArchaeologicalColorScheme('elevation', 'elevation') :
        [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.1, 'rgba(0, 255, 255, 0.5)',
          0.3, 'rgba(0, 255, 0, 0.7)',
          0.5, 'rgba(255, 255, 0, 0.8)',
          0.7, 'rgba(255, 165, 0, 0.9)',
          1, 'rgba(255, 0, 0, 1)'
        ]

      map.current.addLayer({
        id: 'lidar-elevation-layer',
        type: 'heatmap',
        source: 'lidar-elevation',
        layout: {
          visibility: activeLayers.find(l => l.id === 'lidar-elevation')?.visible ? 'visible' : 'none'
        },
        paint: {
          'heatmap-weight': ['get', 'elevation'],
          'heatmap-intensity': lidarViz.advanced.edgeDetection ? 1.5 : 1,
          'heatmap-color': colorScheme,
          'heatmap-radius': lidarViz.pointSize * 10,
          'heatmap-opacity': lidarViz.opacity
        }
      })
    }
  }, [coordinates, lidarData, lidarViz, activeLayers])

  // Add intensity visualization layer
  const addIntensityLayer = useCallback(() => {
    if (!map.current) return

    const lidarIntensityData = generateLidarIntensityData(coordinates, backendLidarData || lidarData)
    
    if (!map.current.getSource('lidar-intensity')) {
      map.current.addSource('lidar-intensity', {
        type: 'geojson',
        data: lidarIntensityData
      })
    } else {
      (map.current.getSource('lidar-intensity') as any).setData(lidarIntensityData)
    }

    if (!map.current.getLayer('lidar-intensity-layer')) {
      map.current.addLayer({
        id: 'lidar-intensity-layer',
        type: 'circle',
        source: 'lidar-intensity',
        layout: {
          visibility: activeLayers.find(l => l.id === 'lidar-intensity')?.visible ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': lidarViz.pointSize,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, '#000080',
            50, '#0000ff',
            100, '#00ff00',
            150, '#ffff00',
            200, '#ff8000',
            255, '#ff0000'
          ],
          'circle-opacity': lidarViz.opacity,
          'circle-stroke-width': lidarViz.advanced.edgeDetection ? 1 : 0,
          'circle-stroke-color': '#ffffff'
        }
      })
    }
  }, [coordinates, lidarData, lidarViz, activeLayers])

  // Add spectral analysis layer
  const addSpectralLayer = useCallback(() => {
    if (!map.current) return

    const spectralData = generateSpectralAnalysisData(coordinates, backendSatelliteData || satelliteData)
    
    if (!map.current.getSource('lidar-spectral')) {
      map.current.addSource('lidar-spectral', {
        type: 'geojson',
        data: spectralData
      })
    } else {
      (map.current.getSource('lidar-spectral') as any).setData(spectralData)
    }

    if (!map.current.getLayer('lidar-spectral-layer')) {
      map.current.addLayer({
        id: 'lidar-spectral-layer',
        type: 'circle',
        source: 'lidar-spectral',
        layout: {
          visibility: 'visible'
        },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'anomaly_score'],
            0, lidarViz.pointSize,
            1, lidarViz.pointSize * 2
          ],
          'circle-color': getArchaeologicalColorScheme('spectral', 'ndvi'),
          'circle-opacity': lidarViz.opacity,
          'circle-stroke-width': [
            'case',
            ['>', ['get', 'anomaly_score'], 0.4],
            2,
            0
          ],
          'circle-stroke-color': '#ff0000'
        }
      })
    }
  }, [coordinates, satelliteData, lidarViz])

  // Add terrain roughness layer
  const addRoughnessLayer = useCallback(() => {
    if (!map.current) return

    const roughnessData = generateTerrainRoughnessData(coordinates, backendLidarData || lidarData)
    
    if (!map.current.getSource('lidar-roughness')) {
      map.current.addSource('lidar-roughness', {
        type: 'geojson',
        data: roughnessData
      })
    } else {
      (map.current.getSource('lidar-roughness') as any).setData(roughnessData)
    }

    if (!map.current.getLayer('lidar-roughness-layer')) {
      map.current.addLayer({
        id: 'lidar-roughness-layer',
        type: 'circle',
        source: 'lidar-roughness',
        layout: {
          visibility: 'visible'
        },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'roughness'],
            0, lidarViz.pointSize * 0.5,
            15, lidarViz.pointSize * 2
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'roughness'],
            0, '#0000ff',      // Smooth - blue
            5, '#00ff00',      // Moderate - green
            10, '#ffff00',     // Rough - yellow
            15, '#ff0000'      // Very rough - red
          ],
          'circle-opacity': lidarViz.opacity,
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'archaeological_indicator'], 'high'],
            3,
            0
          ],
          'circle-stroke-color': '#ff00ff'
        }
      })
    }
  }, [coordinates, lidarData, lidarViz])

  // Add archaeological anomaly layer
  const addAnomalyLayer = useCallback(() => {
    if (!map.current) return

    const anomalyData = generateArchaeologicalAnomalyData(coordinates, analysisResults)
    
    if (!map.current.getSource('lidar-anomaly')) {
      map.current.addSource('lidar-anomaly', {
        type: 'geojson',
        data: anomalyData
      })
    } else {
      (map.current.getSource('lidar-anomaly') as any).setData(anomalyData)
    }

    if (!map.current.getLayer('lidar-anomaly-layer')) {
      map.current.addLayer({
        id: 'lidar-anomaly-layer',
        type: 'circle',
        source: 'lidar-anomaly',
        layout: {
          visibility: 'visible'
        },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'confidence'],
            0, lidarViz.pointSize,
            1, lidarViz.pointSize * 3
          ],
          'circle-color': getArchaeologicalColorScheme('anomaly', 'anomaly_score'),
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'confidence'],
            0, lidarViz.opacity * 0.3,
            1, lidarViz.opacity
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'archaeological_potential'], 'very_high'],
            4,
            ['==', ['get', 'archaeological_potential'], 'high'],
            2,
            0
          ],
          'circle-stroke-color': '#ffffff'
        }
      })
    }
  }, [coordinates, analysisResults, lidarViz])

  // Add archaeological analysis layers
  const addAnalysisLayers = useCallback(() => {
    if (!map.current) return

    try {
      // Generate archaeological sites data
      const archaeologicalSites = generateArchaeologicalSitesData(coordinates, analysisResults)
      
      if (!map.current.getSource('archaeological-sites')) {
        map.current.addSource('archaeological-sites', {
          type: 'geojson',
          data: archaeologicalSites
        })
      }

      // Add archaeological sites layer
      if (!map.current.getLayer('archaeological-sites-layer')) {
        map.current.addLayer({
          id: 'archaeological-sites-layer',
          type: 'circle',
          source: 'archaeological-sites',
          layout: {
            visibility: activeLayers.find(l => l.id === 'archaeological-sites')?.visible ? 'visible' : 'none'
          },
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'confidence'],
              0, 5,
              1, 15
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'confidence'],
              0, '#ff6b6b',
              0.5, '#ffa500',
              0.8, '#32cd32',
              1, '#00ff00'
            ],
            'circle-opacity': analysisOpacity,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      // Add archaeological labels
      if (!map.current.getLayer('archaeological-labels')) {
        map.current.addLayer({
          id: 'archaeological-labels',
          type: 'symbol',
          source: 'archaeological-sites',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 2],
            'text-anchor': 'top',
            visibility: showAnalysisOverlay ? 'visible' : 'none'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 2
          }
        })
      }

    } catch (error) {
      console.error('Error adding analysis layers:', error)
    }
  }, [analysisResults, analysisOpacity, showAnalysisOverlay, activeLayers, coordinates])

  // Add terrain analysis layers
  const addTerrainLayers = useCallback(() => {
    if (!map.current) return

    try {
      // Add terrain contour lines
      const contourData = generateContourData(coordinates)
      
      if (!map.current.getSource('terrain-contours')) {
        map.current.addSource('terrain-contours', {
          type: 'geojson',
          data: contourData
        })
      }

      if (!map.current.getLayer('terrain-contours-layer')) {
        map.current.addLayer({
          id: 'terrain-contours-layer',
          type: 'line',
          source: 'terrain-contours',
          layout: {
            visibility: activeLayers.find(l => l.id === 'terrain-analysis')?.visible ? 'visible' : 'none'
          },
          paint: {
            'line-color': '#8B4513',
            'line-width': 1,
            'line-opacity': 0.7
          }
        })
      }

    } catch (error) {
      console.error('Error adding terrain layers:', error)
    }
  }, [activeLayers, coordinates])

  // Add map controls
  const addMapControls = useCallback(async () => {
    if (!map.current) return

    try {
      // Import Mapbox GL JS to access controls
      const mapboxgl = await import('mapbox-gl')

      // Add navigation control
      const nav = new mapboxgl.default.NavigationControl()
      map.current.addControl(nav, 'top-right')

      // Add scale control
      const scale = new mapboxgl.default.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      })
      map.current.addControl(scale, 'bottom-left')

      // Add fullscreen control
      const fullscreen = new mapboxgl.default.FullscreenControl()
      map.current.addControl(fullscreen, 'top-right')

    } catch (error) {
      console.error('Error adding map controls:', error)
    }
  }, [])

  // Update analysis point marker
  const updateAnalysisPoint = useCallback((coords: { lat: number; lng: number }) => {
    if (!map.current) return

    try {
      // Remove existing marker
      if (map.current.getLayer('analysis-point')) {
        map.current.removeLayer('analysis-point')
      }
      if (map.current.getSource('analysis-point')) {
        map.current.removeSource('analysis-point')
      }

      // Add new analysis point
      map.current.addSource('analysis-point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          },
          properties: {
            name: 'Analysis Point'
          }
        }
      })

      map.current.addLayer({
        id: 'analysis-point',
        type: 'circle',
        source: 'analysis-point',
        paint: {
          'circle-radius': 12,
          'circle-color': '#ff0000',
          'circle-opacity': 0.8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      })

      // Fly to new coordinates
      map.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 15,
        duration: 1000
      })

    } catch (error) {
      console.error('Error updating analysis point:', error)
    }
  }, [])

  // Update layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ))

    if (map.current) {
      const layer = activeLayers.find(l => l.id === layerId)
      if (layer) {
        const visibility = layer.visible ? 'none' : 'visible'
        const mapLayerId = `${layerId}-layer`
        if (map.current.getLayer(mapLayerId)) {
          map.current.setLayoutProperty(mapLayerId, 'visibility', visibility)
        }
      }
    }
  }, [activeLayers])

  // Update layer opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setActiveLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ))

    if (map.current) {
      const mapLayerId = `${layerId}-layer`
      if (map.current.getLayer(mapLayerId)) {
        const layer = map.current.getLayer(mapLayerId)
        const paintProperty = layer.type === 'circle' ? 'circle-opacity' : 
                            layer.type === 'heatmap' ? 'heatmap-opacity' :
                            layer.type === 'raster' ? 'raster-opacity' : 'opacity'
        map.current.setPaintProperty(mapLayerId, paintProperty, opacity)
      }
    }
  }, [])

  // Generate LiDAR elevation data (with backend integration)
  const generateLidarElevationData = (center: { lat: number; lng: number }, data?: any) => {
    // If real data is available from backend, use it
    if (data && data.lidar_analysis) {
      try {
        const lidarPoints = data.lidar_analysis.elevation_points || []
        return {
          type: 'FeatureCollection',
          features: lidarPoints.map((point: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lng || center.lng, point.lat || center.lat]
            },
            properties: {
              elevation: point.elevation || 1000,
              intensity: point.intensity || 128
            }
          }))
        }
      } catch (error) {
        console.log('Using mock LIDAR data due to data format issue')
      }
    }
    
    // Generate enhanced mock data based on coordinates
    const points = []
    const gridSize = 0.001 // ~100m spacing
    
    // Create more realistic elevation patterns
    const baseElevation = getBaseElevationForCoords(center)
    
    for (let i = -10; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        const lat = center.lat + (i * gridSize)
        const lng = center.lng + (j * gridSize)
        
        // Create terrain-like elevation variations
        const distance = Math.sqrt(i*i + j*j)
        const elevation = baseElevation + 
          Math.sin(i * 0.5) * 20 + 
          Math.cos(j * 0.3) * 15 + 
          Math.random() * 10 - 5
        
        points.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            elevation: elevation,
            intensity: Math.random() * 255,
            classification: Math.floor(Math.random() * 5)
          }
        })
      }
    }
    
    return {
      type: 'FeatureCollection',
      features: points
    }
  }
  
  // Get realistic base elevation for coordinates
  const getBaseElevationForCoords = (coords: { lat: number; lng: number }) => {
    // Lake Guatavita area (default)
    if (Math.abs(coords.lat - 5.1542) < 0.1 && Math.abs(coords.lng + 73.7792) < 0.1) {
      return 3100 // ~3100m elevation for Lake Guatavita
    }
    // Nazca Lines
    if (Math.abs(coords.lat + 14.7390) < 0.1 && Math.abs(coords.lng + 75.1300) < 0.1) {
      return 520 // ~520m elevation for Nazca
    }
    // Machu Picchu
    if (Math.abs(coords.lat + 13.1631) < 0.1 && Math.abs(coords.lng + 72.5450) < 0.1) {
      return 2430 // ~2430m elevation for Machu Picchu
    }
    // Default elevation based on latitude (rough approximation)
    return Math.max(0, 1000 + (Math.abs(coords.lat) * 50))
  }

  // Generate mock LiDAR intensity data
  const generateLidarIntensityData = (center: { lat: number; lng: number }, data?: any) => {
    const points = []
    const gridSize = 0.0005 // ~50m spacing
    
    for (let i = -20; i <= 20; i++) {
      for (let j = -20; j <= 20; j++) {
        const lat = center.lat + (i * gridSize)
        const lng = center.lng + (j * gridSize)
        const intensity = Math.random() * 255
        
        points.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            intensity: intensity,
            classification: Math.floor(Math.random() * 5) // 0-4 classification
          }
        })
      }
    }
    
    return {
      type: 'FeatureCollection',
      features: points
    }
  }

  // Generate archaeological sites data (with backend integration)
  const generateArchaeologicalSitesData = (center: { lat: number; lng: number }, results?: any) => {
    // If real analysis results are available, use them
    if (results && results.detection_results && Array.isArray(results.detection_results)) {
      try {
        return {
          type: 'FeatureCollection',
          features: results.detection_results.map((detection: any, index: number) => {
            // Parse coordinates if available
            let coords = [center.lng, center.lat]
            if (detection.coordinates) {
              const coordMatch = detection.coordinates.match(/([-\d.]+),\s*([-\d.]+)/)
              if (coordMatch) {
                coords = [parseFloat(coordMatch[2]), parseFloat(coordMatch[1])]
              }
            }
            
            // Add small offset if no specific coordinates
            if (coords[0] === center.lng && coords[1] === center.lat) {
              coords[0] += (Math.random() - 0.5) * 0.01
              coords[1] += (Math.random() - 0.5) * 0.01
            }
            
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: coords
              },
              properties: {
                name: detection.type || `Feature ${index + 1}`,
                confidence: detection.confidence || 0.5,
                type: detection.feature_type || detection.type || 'unknown',
                description: detection.description || detection.archaeological_significance || 'Archaeological feature detected',
                size_estimate: detection.size_estimate,
                model_source: detection.model_source || 'AI Analysis'
              }
            }
          })
        }
      } catch (error) {
        console.log('Using mock archaeological data due to format issue')
      }
    }
    
    // Enhanced mock data with more realistic archaeological features
    const sites = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng + 0.002, center.lat + 0.001]
        },
        properties: {
          name: 'Potential Settlement Complex',
          confidence: 0.85,
          type: 'settlement',
          description: 'Elevated platform with regular geometry and evidence of structured layout'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng - 0.001, center.lat + 0.002]
        },
        properties: {
          name: 'Ceremonial Structure',
          confidence: 0.72,
          type: 'ceremonial',
          description: 'Circular formation with central feature, possibly ritual significance'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng + 0.001, center.lat - 0.001]
        },
        properties: {
          name: 'Earthwork Complex',
          confidence: 0.91,
          type: 'earthwork',
          description: 'Linear earthwork with defensive characteristics and strategic positioning'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng - 0.0015, center.lat - 0.0015]
        },
        properties: {
          name: 'Agricultural Terraces',
          confidence: 0.68,
          type: 'agricultural',
          description: 'Stepped terrain formations indicating ancient farming practices'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng + 0.0025, center.lat - 0.0005]
        },
        properties: {
          name: 'Possible Road Network',
          confidence: 0.79,
          type: 'infrastructure',
          description: 'Linear features suggesting ancient transportation routes'
        }
      }
    ]
    
    return {
      type: 'FeatureCollection',
      features: sites
    }
  }

  // Generate contour data
  // Advanced LIDAR visualization: Spectral Analysis
  const generateSpectralAnalysisData = (center: { lat: number; lng: number }, data?: any) => {
    const features: any[] = []
    const radius = 0.005 // ~500m radius
    
    // Generate spectral analysis points
    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * 2 * Math.PI
      const distance = Math.random() * radius
      const lat = center.lat + distance * Math.cos(angle)
      const lng = center.lng + distance * Math.sin(angle)
      
      // Simulate spectral bands (NIR, Red, Green, Blue)
      const nir = Math.random() * 255
      const red = Math.random() * 255
      const green = Math.random() * 255
      const blue = Math.random() * 255
      
      // Calculate NDVI (Normalized Difference Vegetation Index)
      const ndvi = (nir - red) / (nir + red)
      
      // Calculate spectral anomaly score
      const anomalyScore = Math.abs(ndvi - 0.3) + Math.random() * 0.2
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          spectral_nir: nir,
          spectral_red: red,
          spectral_green: green,
          spectral_blue: blue,
          ndvi: ndvi,
          anomaly_score: anomalyScore,
          vegetation_index: ndvi > 0.3 ? 'high' : 'low',
          archaeological_potential: anomalyScore > 0.4 ? 'high' : 'medium'
        }
      })
    }
    
    return {
      type: 'FeatureCollection',
      features
    }
  }

  // Advanced LIDAR visualization: Terrain Roughness
  const generateTerrainRoughnessData = (center: { lat: number; lng: number }, data?: any) => {
    const features: any[] = []
    const radius = 0.005
    const baseElevation = getBaseElevationForCoords(center)
    
    // Generate terrain roughness analysis
    for (let i = 0; i < 150; i++) {
      const angle = (i / 150) * 2 * Math.PI
      const distance = Math.random() * radius
      const lat = center.lat + distance * Math.cos(angle)
      const lng = center.lng + distance * Math.sin(angle)
      
      // Calculate terrain roughness (standard deviation of nearby elevations)
      const localElevations = []
      for (let j = 0; j < 9; j++) {
        const localAngle = (j / 9) * 2 * Math.PI
        const localDist = 0.0001 * Math.random()
        const localElevation = baseElevation + 
          Math.sin((lat + localDist * Math.cos(localAngle)) * 100) * 20 +
          Math.cos((lng + localDist * Math.sin(localAngle)) * 100) * 15
        localElevations.push(localElevation)
      }
      
      const meanElevation = localElevations.reduce((a, b) => a + b) / localElevations.length
      const roughness = Math.sqrt(
        localElevations.reduce((sum, elev) => sum + Math.pow(elev - meanElevation, 2), 0) / localElevations.length
      )
      
      // High roughness may indicate archaeological features
      const archaeologicalIndicator = roughness > 8 ? 'high' : roughness > 4 ? 'medium' : 'low'
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          roughness: roughness,
          elevation: meanElevation,
          archaeological_indicator: archaeologicalIndicator,
          feature_type: roughness > 10 ? 'structure' : roughness > 6 ? 'earthwork' : 'natural'
        }
      })
    }
    
    return {
      type: 'FeatureCollection',
      features
    }
  }

  // Advanced LIDAR visualization: Archaeological Anomaly Detection
  const generateArchaeologicalAnomalyData = (center: { lat: number; lng: number }, data?: any) => {
    const features: any[] = []
    const radius = 0.005
    const baseElevation = getBaseElevationForCoords(center)
    
    // Generate archaeological anomaly detection points
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * 2 * Math.PI
      const distance = Math.random() * radius
      const lat = center.lat + distance * Math.cos(angle)
      const lng = center.lng + distance * Math.sin(angle)
      
      // Multi-factor anomaly detection
      const elevationAnomaly = Math.abs(
        Math.sin(lat * 1000) * 5 + Math.cos(lng * 1000) * 3 - baseElevation
      ) / 10
      
      const vegetationAnomaly = Math.random() * 0.5 + 0.2
      const soilAnomaly = Math.random() * 0.4 + 0.1
      const geometricAnomaly = Math.random() * 0.6 + 0.1
      
      // Composite anomaly score
      const compositeScore = (elevationAnomaly + vegetationAnomaly + soilAnomaly + geometricAnomaly) / 4
      
      // Determine anomaly type based on characteristics
      let anomalyType = 'natural'
      let confidence = 0
      
      if (compositeScore > 0.7) {
        anomalyType = 'structure'
        confidence = 0.85 + Math.random() * 0.1
      } else if (compositeScore > 0.5) {
        anomalyType = 'earthwork'
        confidence = 0.65 + Math.random() * 0.15
      } else if (compositeScore > 0.3) {
        anomalyType = 'disturbance'
        confidence = 0.45 + Math.random() * 0.15
      }
      
      if (compositeScore > 0.3) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            anomaly_score: compositeScore,
            anomaly_type: anomalyType,
            confidence: confidence,
            elevation_anomaly: elevationAnomaly,
            vegetation_anomaly: vegetationAnomaly,
            soil_anomaly: soilAnomaly,
            geometric_anomaly: geometricAnomaly,
            archaeological_potential: confidence > 0.7 ? 'very_high' : confidence > 0.5 ? 'high' : 'medium'
          }
        })
      }
    }
    
    return {
      type: 'FeatureCollection',
      features
    }
  }

  // Enhanced color schemes for archaeological visualization
  const getArchaeologicalColorScheme = (mode: string, value: string) => {
    const schemes = {
      archaeological: {
        elevation: [
          'interpolate',
          ['linear'],
          ['get', value],
          0, '#1a1a2e',      // Deep blue for water/low areas
          0.2, '#16213e',    // Dark blue-purple
          0.4, '#0f3460',    // Blue
          0.6, '#533a71',    // Purple - potential archaeological zones
          0.8, '#7d4f73',    // Purple-pink - likely archaeological features
          1, '#d2691e'       // Orange-brown - definite structures
        ],
        anomaly: [
          'interpolate',
          ['linear'],
          ['get', value],
          0, 'rgba(0, 100, 0, 0.1)',      // Low anomaly - transparent green
          0.3, 'rgba(255, 255, 0, 0.5)',  // Medium anomaly - yellow
          0.5, 'rgba(255, 165, 0, 0.7)',  // High anomaly - orange
          0.7, 'rgba(255, 69, 0, 0.8)',   // Very high anomaly - red-orange
          1, 'rgba(139, 0, 0, 1)'         // Extreme anomaly - dark red
        ],
        spectral: [
          'interpolate',
          ['linear'],
          ['get', value],
          -1, '#8B4513',     // Bare soil - brown
          -0.1, '#DEB887',   // Dry vegetation - burlywood
          0.1, '#9ACD32',    // Sparse vegetation - yellow-green
          0.3, '#228B22',    // Moderate vegetation - forest green
          0.5, '#006400',    // Dense vegetation - dark green
          1, '#000080'       // Water/shadow - navy blue
        ]
      }
    }
    
    return schemes.archaeological[mode as keyof typeof schemes.archaeological] || schemes.archaeological.elevation
  }

  const generateContourData = (center: { lat: number; lng: number }) => {
    const contours: any[] = []
    const elevations = [1000, 1020, 1040, 1060, 1080, 1100]
    
    elevations.forEach((elevation, index) => {
      const radius = 0.003 + (index * 0.0005)
      const points: number[][] = []
      
      for (let angle = 0; angle <= 360; angle += 10) {
        const rad = (angle * Math.PI) / 180
        const lat = center.lat + (radius * Math.cos(rad))
        const lng = center.lng + (radius * Math.sin(rad))
        points.push([lng, lat])
      }
      
      contours.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: points
        },
        properties: {
          elevation: elevation
        }
      })
    })
    
    return {
      type: 'FeatureCollection',
      features: contours
    }
  }

  // Update coordinates when prop changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateAnalysisPoint(coordinates)
    }
  }, [coordinates, mapLoaded, updateAnalysisPoint])
  
  // Fetch backend data when coordinates change
  useEffect(() => {
    if (coordinates) {
      fetchLidarData(coordinates)
      fetchSatelliteData(coordinates)
    }
  }, [coordinates, fetchLidarData, fetchSatelliteData])

  // Update layers when data changes
  useEffect(() => {
    if (mapLoaded) {
      addLidarLayers()
      addAnalysisLayers()
      addTerrainLayers()
    }
  }, [lidarData, satelliteData, analysisResults, backendLidarData, backendSatelliteData, mapLoaded, addLidarLayers, addAnalysisLayers, addTerrainLayers])

  if (mapError) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Map Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{mapError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden border"
        style={{ height }}
      />
      
      {/* Loading Overlay */}
      {(isLoading || dataLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <div className="animate-spin text-4xl mb-4">🛰️</div>
            <p>{isLoading ? 'Loading Mapbox Vision Map...' : 'Fetching LIDAR & Satellite Data...'}</p>
            {dataLoading && (
              <p className="text-sm text-slate-300 mt-2">Connecting to backend services...</p>
            )}
          </div>
        </div>
      )}

      {/* Layer Controls */}
      <Card className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Tabs defaultValue="layers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="lidar">LiDAR</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layers" className="space-y-2 mt-3">
              {activeLayers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => toggleLayer(layer.id)}
                      className="scale-75"
                    />
                    <Label className="text-xs">{layer.name}</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([value]) => updateLayerOpacity(layer.id, value / 100)}
                      max={100}
                      step={5}
                      className="w-16"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="lidar" className="space-y-3 mt-3">
              <div>
                <Label className="text-xs">Visualization Mode</Label>
                <Select value={lidarViz.mode} onValueChange={(value: any) => 
                  setLidarViz(prev => ({ ...prev, mode: value }))
                }>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevation">Elevation</SelectItem>
                    <SelectItem value="intensity">Intensity</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="slope">Slope</SelectItem>
                    <SelectItem value="hillshade">Hillshade</SelectItem>
                    <SelectItem value="contour">Contour</SelectItem>
                    <SelectItem value="spectral">Spectral</SelectItem>
                    <SelectItem value="roughness">Terrain Roughness</SelectItem>
                    <SelectItem value="anomaly">Archaeological Anomaly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Color Scheme</Label>
                <Select value={lidarViz.colorScheme} onValueChange={(value: any) => 
                  setLidarViz(prev => ({ ...prev, colorScheme: value }))
                }>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viridis">Viridis</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                    <SelectItem value="inferno">Inferno</SelectItem>
                    <SelectItem value="archaeological">Archaeological</SelectItem>
                    <SelectItem value="spectral">Spectral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Point Size: {lidarViz.pointSize}px</Label>
                <Slider
                  value={[lidarViz.pointSize]}
                  onValueChange={([value]) => setLidarViz(prev => ({ ...prev, pointSize: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs">Anomaly Threshold: {lidarViz.filtering.anomalyThreshold}</Label>
                <Slider
                  value={[lidarViz.filtering.anomalyThreshold]}
                  onValueChange={([value]) => setLidarViz(prev => ({ 
                    ...prev, 
                    filtering: { ...prev.filtering, anomalyThreshold: value }
                  }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Advanced Features</Label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edge-detection" className="text-xs">Edge Detection</Label>
                    <Switch
                      id="edge-detection"
                      checked={lidarViz.advanced.edgeDetection}
                      onCheckedChange={(checked) => 
                        setLidarViz(prev => ({ 
                          ...prev, 
                          advanced: { ...prev.advanced, edgeDetection: checked }
                        }))
                      }
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="anomaly-detection" className="text-xs">Anomaly Detection</Label>
                    <Switch
                      id="anomaly-detection"
                      checked={lidarViz.advanced.anomalyDetection}
                      onCheckedChange={(checked) => 
                        setLidarViz(prev => ({ 
                          ...prev, 
                          advanced: { ...prev.advanced, anomalyDetection: checked }
                        }))
                      }
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="spectral-analysis" className="text-xs">Spectral Analysis</Label>
                    <Switch
                      id="spectral-analysis"
                      checked={lidarViz.advanced.spectralAnalysis}
                      onCheckedChange={(checked) => 
                        setLidarViz(prev => ({ 
                          ...prev, 
                          advanced: { ...prev.advanced, spectralAnalysis: checked }
                        }))
                      }
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="terrain-roughness" className="text-xs">Terrain Roughness</Label>
                    <Switch
                      id="terrain-roughness"
                      checked={lidarViz.advanced.terrainRoughness}
                      onCheckedChange={(checked) => 
                        setLidarViz(prev => ({ 
                          ...prev, 
                          advanced: { ...prev.advanced, terrainRoughness: checked }
                        }))
                      }
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Analysis Overlay</Label>
                <Switch
                  checked={showAnalysisOverlay}
                  onCheckedChange={setShowAnalysisOverlay}
                  className="scale-75"
                />
              </div>
              
              <div>
                <Label className="text-xs">Analysis Opacity: {Math.round(analysisOpacity * 100)}%</Label>
                <Slider
                  value={[analysisOpacity * 100]}
                  onValueChange={([value]) => setAnalysisOpacity(value / 100)}
                  max={100}
                  step={5}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">3D View</Label>
                <Switch
                  checked={viewMode === '3d'}
                  onCheckedChange={(checked) => {
                    setViewMode(checked ? '3d' : '2d')
                    if (map.current) {
                      map.current.easeTo({
                        pitch: checked ? 45 : 0,
                        duration: 1000
                      })
                    }
                  }}
                  className="scale-75"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Map Info */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-3 h-3" />
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Badge variant="secondary" className={`text-xs ${backendSatelliteData ? 'border-green-400 text-green-300' : 'border-amber-400 text-amber-300'}`}>
            <Satellite className="w-3 h-3 mr-1" />
            {backendSatelliteData ? 'Live Satellite' : 'Mock Satellite'}
          </Badge>
          <Badge variant="secondary" className={`text-xs ${backendLidarData ? 'border-green-400 text-green-300' : 'border-amber-400 text-amber-300'}`}>
            <Mountain className="w-3 h-3 mr-1" />
            {backendLidarData ? 'Live LiDAR' : 'Mock LiDAR'}
          </Badge>
          <Badge variant="secondary" className={`text-xs ${analysisResults ? 'border-green-400 text-green-300' : 'border-slate-400 text-slate-300'}`}>
            <Eye className="w-3 h-3 mr-1" />
            {analysisResults ? 'Live Analysis' : 'No Analysis'}
          </Badge>
        </div>
        
        {/* Performance Metrics */}
        <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-gray-600">
          <span>Render: {performanceMetrics.renderTime.toFixed(1)}ms</span>
          <span>Points: {performanceMetrics.pointCount}</span>
          <span>Cache: {performanceMetrics.cacheHits}/{performanceMetrics.cacheHits + performanceMetrics.cacheMisses}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Map Data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Map Data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
                <Crosshair className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Center on Analysis Point</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default MapboxVisionMap 