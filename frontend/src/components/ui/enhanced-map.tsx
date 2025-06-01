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
  Home
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
  type: 'satellite' | 'terrain' | 'hybrid' | 'discovery'
}

interface MapState {
  center: [number, number]
  zoom: number
  discoveries: Discovery[]
  selectedDiscovery: Discovery | null
  filters: {
    minConfidence: number
    dateRange: string
    types: string[]
    regions: string[]
  }
}

export function EnhancedMap() {
  const [mapState, setMapState] = useState<MapState>({
    center: [-3.4653, -62.2159], // Amazon Basin default
    zoom: 10,
    discoveries: [],
    selectedDiscovery: null,
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
      opacity: 0.7,
      visible: false,
      type: 'terrain'
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
  
  const mapRef = useRef<HTMLDivElement>(null)
  const webSocket = useWebSocket()

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
  }, [loadDiscoveries])

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
        models: ['YOLO8', 'Waldo', 'GPT-4V']
      })

      // Also try direct API call as backup
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon: lng,
          region: 'amazon_basin',
          confidence_threshold: mapState.filters.minConfidence / 100
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
  }, [isAnalyzing, webSocket, mapState.filters.minConfidence])

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
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Interactive Discovery Map</span>
              </CardTitle>
              <CardDescription>
                Real-time archaeological site visualization with satellite imagery
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Display */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full relative">
              {/* Map Placeholder - In a real implementation, this would be Leaflet/MapBox */}
              <div 
                ref={mapRef}
                className="w-full h-full bg-gradient-to-br from-green-100 to-blue-200 rounded-lg relative overflow-hidden cursor-crosshair"
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
                {/* Satellite overlay indicator */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Satellite className="h-4 w-4" />
                    <span>Satellite View</span>
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
                      <span className="text-sm">Analyzing...</span>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Layers Control */}
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
                    <Label className="text-sm">{layer.name}</Label>
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => toggleLayer(layer.id)}
                    />
                  </div>
                  {layer.visible && (
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
                  Re-analyze
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 