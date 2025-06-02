"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Slider } from "../../../components/ui/slider"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { 
  MapPin, 
  Satellite, 
  Layers, 
  Search, 
  Target, 
  Zap,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Globe,
  Navigation,
  Crosshair,
  Mountain,
  Trees,
  Waves,
  Home,
  Radar,
  Activity,
  Minimize2,
  Maximize2
} from "lucide-react"
import { useWebSocket } from "../../lib/websocket"

interface Discovery {
  id: string
  lat: number
  lng: number
  confidence: number
  type: string
  timestamp: Date
  description: string
  region: string
  models_used: string[]
}

interface MapLayer {
  id: string
  name: string
  url: string
  opacity: number
  visible: boolean
  type: 'satellite' | 'terrain' | 'hybrid' | 'lidar' | 'discovery'
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'difference'
}

interface MapState {
  center: [number, number]
  zoom: number
  discoveries: Discovery[]
  selectedDiscovery: Discovery | null
  lidarIntensity: number
  terrainLidarBlend: number
  filters: {
    minConfidence: number
    dateRange: string
    types: string[]
    regions: string[]
  }
}

interface LidarData {
  elevation: number[][]
  intensity: number[][]
  coverage: number
  resolution: number
}

export function EnhancedMap() {
  const [mapState, setMapState] = useState<MapState>({
    center: [-3.4653, -62.2159], // Amazon Basin default
    zoom: 10,
    discoveries: [],
    selectedDiscovery: null,
    lidarIntensity: 0.5,
    terrainLidarBlend: 0, // 0 = full terrain, 1 = full LIDAR
    filters: {
      minConfidence: 70,
      dateRange: '7d',
      types: [],
      regions: []
    }
  })
  
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'satellite',
      name: 'Satellite',
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      opacity: 1,
      visible: true,
      type: 'satellite'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      opacity: 0.8,
      visible: true,
      type: 'terrain',
      blendMode: 'normal'
    },
    {
      id: 'lidar',
      name: 'LIDAR',
      url: 'mock://lidar-data',
      opacity: 0,
      visible: true,
      type: 'lidar',
      blendMode: 'overlay'
    },
    {
      id: 'hybrid',
      name: 'Hybrid',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      opacity: 1,
      visible: false,
      type: 'hybrid'
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [lidarData, setLidarData] = useState<LidarData | null>(null)
  const [showLidarControls, setShowLidarControls] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webSocket = useWebSocket()

  // Mock LIDAR data generation
  const generateMockLidarData = (): LidarData => {
    const size = 100
    const elevation: number[][] = []
    const intensity: number[][] = []
    
    for (let i = 0; i < size; i++) {
      elevation[i] = []
      intensity[i] = []
      for (let j = 0; j < size; j++) {
        // Generate realistic elevation data with noise
        const baseElevation = Math.sin(i / 10) * Math.cos(j / 10) * 50
        const noise = (Math.random() - 0.5) * 10
        elevation[i][j] = Math.max(0, baseElevation + noise + 100)
        
        // Generate intensity based on elevation and random features
        intensity[i][j] = Math.random() * 0.8 + 0.2
      }
    }
    
    return {
      elevation,
      intensity,
      coverage: 85 + Math.random() * 15,
      resolution: 0.5
    }
  }

  // Load LIDAR data
  const loadLidarData = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from backend
      const response = await fetch(`http://localhost:8000/lidar/data?lat=${mapState.center[0]}&lng=${mapState.center[1]}`)
      
      if (response.ok) {
        const data = await response.json()
        setLidarData(data)
      } else {
        throw new Error('Backend unavailable')
      }
    } catch (error) {
      console.log('Using mock LIDAR data')
      setLidarData(generateMockLidarData())
    }
  }, [mapState.center])

  // Render LIDAR visualization on canvas
  const renderLidarOverlay = useCallback(() => {
    if (!lidarData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        
        // Map canvas coordinates to LIDAR data
        const lidarX = Math.floor((x / width) * lidarData.elevation.length)
        const lidarY = Math.floor((y / height) * lidarData.elevation[0].length)
        
        if (lidarX < lidarData.elevation.length && lidarY < lidarData.elevation[0].length) {
          const elevation = lidarData.elevation[lidarX][lidarY]
          const intensity = lidarData.intensity[lidarX][lidarY]
          
          // Create color based on elevation and intensity
          const normalizedElevation = Math.min(1, elevation / 200)
          const hue = 240 - (normalizedElevation * 120) // Blue to red gradient
          const saturation = intensity * 100
          const lightness = 30 + (normalizedElevation * 40)
          
          // Convert HSL to RGB
          const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100)
          
          data[i] = rgb[0]     // Red
          data[i + 1] = rgb[1] // Green
          data[i + 2] = rgb[2] // Blue
          data[i + 3] = Math.floor(mapState.terrainLidarBlend * intensity * 255) // Alpha
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [lidarData, mapState.terrainLidarBlend])

  // HSL to RGB conversion utility
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Update terrain-LIDAR blend
  const updateTerrainLidarBlend = useCallback((value: number) => {
    setMapState(prev => ({ ...prev, terrainLidarBlend: value }))
    
    // Update layer opacities for smooth transition
    setLayers(prev => prev.map(layer => {
      if (layer.id === 'terrain') {
        return { ...layer, opacity: 1 - value }
      }
      if (layer.id === 'lidar') {
        return { ...layer, opacity: value }
      }
      return layer
    }))
  }, [])

  // Mock discoveries for demo
  const generateMockDiscoveries = (): Discovery[] => {
    const types = ['settlement', 'ceremonial', 'agricultural', 'pathway', 'burial']
    const regions = ['Amazon Basin', 'Andes Mountains', 'Cerrado', 'Atlantic Forest']
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `discovery_${i}`,
      lat: -5 + Math.random() * 10,
      lng: -65 + Math.random() * 10,
      confidence: 60 + Math.random() * 40,
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      description: `Potential ${types[Math.floor(Math.random() * types.length)]} site detected`,
      region: regions[Math.floor(Math.random() * regions.length)],
      models_used: ['YOLO8', 'Waldo', 'GPT-4V'].slice(0, Math.floor(Math.random() * 3) + 1)
    }))
  }

  const loadDiscoveries = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/research/sites', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const sites = await response.json()
        const discoveries = sites.map((site: any) => ({
          id: site.id,
          lat: parseFloat(site.coordinates.split(',')[0]),
          lng: parseFloat(site.coordinates.split(',')[1]),
          confidence: site.confidence || 75,
          type: site.type || 'unknown',
          timestamp: new Date(site.discovered_at || Date.now()),
          description: site.description || 'Archaeological site',
          region: site.region || 'Unknown',
          models_used: site.models_used || ['AI']
        }))
        
        setMapState(prev => ({ ...prev, discoveries }))
      } else {
        throw new Error('Backend unavailable')
      }
    } catch (error) {
      console.log('Using mock discoveries')
      setMapState(prev => ({ ...prev, discoveries: generateMockDiscoveries() }))
    }
  }, [])

  useEffect(() => {
    loadDiscoveries()
    loadLidarData()
  }, [loadDiscoveries, loadLidarData])

  // Re-render LIDAR overlay when data or blend changes
  useEffect(() => {
    renderLidarOverlay()
  }, [renderLidarOverlay])

  // WebSocket listeners for real-time updates
  useEffect(() => {
    const unsubscribeDiscovery = webSocket.subscribe('discovery', (discoveryData: any) => {
      const newDiscovery: Discovery = {
        id: discoveryData.id,
        lat: discoveryData.lat,
        lng: discoveryData.lng,
        confidence: discoveryData.confidence,
        type: discoveryData.type,
        timestamp: new Date(discoveryData.timestamp),
        description: discoveryData.description,
        region: discoveryData.region,
        models_used: discoveryData.models_used || []
      }
      
      setMapState(prev => ({
        ...prev,
        discoveries: [newDiscovery, ...prev.discoveries]
      }))
    })

    const unsubscribeAnalysis = webSocket.subscribe('analysis_update', (update: any) => {
      if (update.analysisId === currentAnalysisId) {
        setAnalysisProgress(update.progress)
        if (update.status === 'completed' || update.status === 'failed') {
          setIsAnalyzing(false)
          setCurrentAnalysisId(null)
          setAnalysisProgress(0)
        }
      }
    })

    return () => {
      unsubscribeDiscovery()
      unsubscribeAnalysis()
    }
  }, [webSocket, currentAnalysisId])

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysisProgress(10)
    
    const analysisId = `analysis_${Date.now()}`
    setCurrentAnalysisId(analysisId)

    try {
      // Request analysis via WebSocket
      webSocket.requestAnalysis(`${lat}, ${lng}`, {
        analysisId,
        priority: 'high',
        models: ['YOLO8', 'Waldo', 'GPT-4V'],
        includeLidar: mapState.terrainLidarBlend > 0.3
      })

      // Also try direct API call as backup
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon: lng,
          region: 'amazon_basin',
          confidence_threshold: mapState.filters.minConfidence / 100,
          include_lidar: mapState.terrainLidarBlend > 0.3
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Analysis result:', result)
      }
      
    } catch (error) {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
      setCurrentAnalysisId(null)
      setAnalysisProgress(0)
    }
  }, [isAnalyzing, webSocket, mapState.filters.minConfidence, mapState.terrainLidarBlend])

  const filteredDiscoveries = mapState.discoveries.filter(discovery => {
    if (discovery.confidence < mapState.filters.minConfidence) return false
    if (mapState.filters.types.length > 0 && !mapState.filters.types.includes(discovery.type)) return false
    if (mapState.filters.regions.length > 0 && !mapState.filters.regions.includes(discovery.region)) return false
    
    // Date filter
    const daysDiff = (Date.now() - discovery.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    switch (mapState.filters.dateRange) {
      case '24h': return daysDiff <= 1
      case '7d': return daysDiff <= 7
      case '30d': return daysDiff <= 30
      default: return true
    }
  })

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer.id === 'terrain' || layer.id === 'lidar' ? layer // Keep terrain/lidar as they are
        : { ...layer, visible: false }
    ))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }

  const getDiscoveryIcon = (type: string) => {
    switch (type) {
      case 'settlement': return <Home className="h-4 w-4" />
      case 'ceremonial': return <Mountain className="h-4 w-4" />
      case 'agricultural': return <Trees className="h-4 w-4" />
      case 'pathway': return <Navigation className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 80) return 'text-blue-600 bg-blue-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Interactive Discovery Map</span>
                <Badge variant="outline" className="ml-2">
                  <Radar className="h-3 w-3 mr-1" />
                  LIDAR Enhanced
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time archaeological site visualization with satellite imagery and LIDAR integration
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant={showLidarControls ? "default" : "outline"}
                onClick={() => setShowLidarControls(!showLidarControls)}
              >
                <Activity className="h-4 w-4 mr-2" />
                LIDAR Controls
              </Button>
              <Button size="sm" onClick={loadDiscoveries}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search Coordinates</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="lat, lng or location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Min Confidence: {mapState.filters.minConfidence}%</Label>
              <Slider
                value={[mapState.filters.minConfidence]}
                onValueChange={([value]) => 
                  setMapState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, minConfidence: value }
                  }))
                }
                max={100}
                min={50}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Terrain ↔ LIDAR: {Math.round(mapState.terrainLidarBlend * 100)}%</Label>
              <Slider
                value={[mapState.terrainLidarBlend]}
                onValueChange={([value]) => updateTerrainLidarBlend(value)}
                max={1}
                min={0}
                step={0.01}
                className="bg-gradient-to-r from-green-500 to-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Terrain</span>
                <span>LIDAR</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select 
                value={mapState.filters.dateRange}
                onValueChange={(value) =>
                  setMapState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, dateRange: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Analysis Status</Label>
              <div className="flex items-center space-x-2">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{analysisProgress}%</span>
                  </div>
                ) : (
                  <Badge variant="outline">Ready</Badge>
                )}
              </div>
            </div>
          </div>

          {/* LIDAR Advanced Controls */}
          {showLidarControls && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium mb-4 flex items-center">
                <Radar className="h-4 w-4 mr-2" />
                LIDAR Advanced Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>LIDAR Intensity: {Math.round(mapState.lidarIntensity * 100)}%</Label>
                  <Slider
                    value={[mapState.lidarIntensity]}
                    onValueChange={([value]) => 
                      setMapState(prev => ({ ...prev, lidarIntensity: value }))
                    }
                    max={1}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage: {lidarData?.coverage.toFixed(1)}%</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Resolution: {lidarData?.resolution}m
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={loadLidarData}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reload
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Map Display */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full relative">
              {/* Enhanced Map with LIDAR overlay */}
              <div 
                ref={mapRef}
                className="w-full h-full relative overflow-hidden cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = (e.clientX - rect.left) / rect.width
                  const y = (e.clientY - rect.top) / rect.height
                  
                  // Convert to lat/lng (mock calculation)
                  const lat = mapState.center[0] + (0.5 - y) * 0.1
                  const lng = mapState.center[1] + (x - 0.5) * 0.1
                  
                  handleMapClick(lat, lng)
                }}
              >
                {/* Base terrain layer */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-200 rounded-lg transition-opacity duration-500"
                  style={{ 
                    opacity: 1 - mapState.terrainLidarBlend,
                    backgroundImage: `
                      radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                      linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)
                    `
                  }}
                />

                {/* LIDAR overlay canvas */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full rounded-lg transition-opacity duration-500"
                  width={800}
                  height={600}
                  style={{ 
                    opacity: mapState.terrainLidarBlend * mapState.lidarIntensity,
                    mixBlendMode: 'overlay'
                  }}
                />

                {/* Layer indicators */}
                <div className="absolute top-4 left-4 space-y-2">
                  {layers.filter(l => l.visible).map(layer => (
                    <div key={layer.id} className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center space-x-2 text-sm">
                        {layer.type === 'satellite' && <Satellite className="h-4 w-4" />}
                        {layer.type === 'terrain' && <Mountain className="h-4 w-4" />}
                        {layer.type === 'lidar' && <Radar className="h-4 w-4" />}
                        {layer.type === 'hybrid' && <Globe className="h-4 w-4" />}
                        <span>{layer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(layer.opacity * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Blend ratio indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Mountain className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {Math.round((1 - mapState.terrainLidarBlend) * 100)}%
                      </span>
                    </div>
                    <div className="w-16 h-2 bg-gradient-to-r from-green-500 to-purple-500 rounded-full relative">
                      <div 
                        className="absolute top-0 w-2 h-2 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2"
                        style={{ left: `${mapState.terrainLidarBlend * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Radar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">
                        {Math.round(mapState.terrainLidarBlend * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crosshair cursor indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <Crosshair className="h-6 w-6 text-red-500 opacity-50" />
                </div>

                {/* Discovery markers */}
                {filteredDiscoveries.map((discovery) => (
                  <div
                    key={discovery.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${50 + (discovery.lng - mapState.center[1]) * 1000}%`,
                      top: `${50 - (discovery.lat - mapState.center[0]) * 1000}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMapState(prev => ({ ...prev, selectedDiscovery: discovery }))
                    }}
                  >
                    <div className={`p-2 rounded-full shadow-lg ${getConfidenceColor(discovery.confidence)} border-2 border-white hover:scale-110 transition-transform`}>
                      {getDiscoveryIcon(discovery.type)}
                    </div>
                  </div>
                ))}

                {/* Analysis indicator */}
                {isAnalyzing && (
                  <div className="absolute bottom-4 left-4 bg-blue-500 text-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">Analyzing with {mapState.terrainLidarBlend > 0.3 ? 'LIDAR + ' : ''}AI...</span>
                      <div className="w-16 bg-blue-300 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Layers Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>Map Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center space-x-2">
                      {layer.type === 'satellite' && <Satellite className="h-3 w-3" />}
                      {layer.type === 'terrain' && <Mountain className="h-3 w-3" />}
                      {layer.type === 'lidar' && <Radar className="h-3 w-3" />}
                      {layer.type === 'hybrid' && <Globe className="h-3 w-3" />}
                      <span>{layer.name}</span>
                    </Label>
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => toggleLayer(layer.id)}
                      disabled={layer.type === 'lidar' || layer.type === 'terrain'}
                    />
                  </div>
                  {layer.visible && layer.type !== 'lidar' && layer.type !== 'terrain' && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Opacity: {Math.round(layer.opacity * 100)}%</Label>
                      <Slider
                        value={[layer.opacity * 100]}
                        onValueChange={([value]) => updateLayerOpacity(layer.id, value / 100)}
                        max={100}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* LIDAR Status */}
              {lidarData && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Radar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">LIDAR Status</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span>{lidarData.coverage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span>{lidarData.resolution}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blend:</span>
                      <span>{Math.round(mapState.terrainLidarBlend * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discovery Info */}
          {mapState.selectedDiscovery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Discovery Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm capitalize">{mapState.selectedDiscovery.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confidence</Label>
                  <Badge className={getConfidenceColor(mapState.selectedDiscovery.confidence)}>
                    {mapState.selectedDiscovery.confidence.toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Coordinates</Label>
                  <p className="text-sm font-mono">
                    {mapState.selectedDiscovery.lat.toFixed(4)}, {mapState.selectedDiscovery.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <p className="text-sm">{mapState.selectedDiscovery.region}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Models Used</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mapState.selectedDiscovery.models_used.map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Re-analyze with LIDAR
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Discovery Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total:</span>
                <span className="font-medium">{filteredDiscoveries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>High Confidence:</span>
                <span className="font-medium">
                  {filteredDiscoveries.filter(d => d.confidence >= 80).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Recent (7d):</span>
                <span className="font-medium">
                  {filteredDiscoveries.filter(d => 
                    (Date.now() - d.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= 7
                  ).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>LIDAR Enhanced:</span>
                <span className="font-medium text-purple-600">
                  {mapState.terrainLidarBlend > 0.1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 