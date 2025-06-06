"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Script from "next/script"
import { 
  MapPin, 
  Satellite, 
  Search, 
  Target, 
  Eye,
  RefreshCw,
  Download,
  Share,
  Mountain,
  Activity,
  AlertCircle,
  CheckCircle,
  Brain,
  Wifi,
  WifiOff,
  Plus,
  Minus,
  Zap,
  Save,
  Layers,
  Filter,
  Database,
  Settings,
  Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { config, makeBackendRequest, isBackendAvailable } from "../lib/config"

// Interfaces matching the main map page
interface ArchaeologicalSite {
  id: string
  name: string
  coordinates: string
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
  type: 'settlement' | 'ceremonial' | 'burial' | 'agricultural' | 'trade' | 'defensive'
  period: string
  size_hectares?: number
  preservation_status: 'excellent' | 'good' | 'fair' | 'poor'
  threat_level: 'low' | 'medium' | 'high' | 'critical'
}

interface MapLayer {
  id: string
  name: string
  type: 'satellite' | 'terrain' | 'lidar' | 'historical' | 'infrastructure'
  visible: boolean
  opacity: number
  description: string
}

interface ArchaeologicalMapViewerProps {
  onSiteSelect?: (site: ArchaeologicalSite) => void
  onCoordinateAnalyze?: (coordinates: string) => void
  className?: string
}

// Enhanced color scheme for archaeological mapping
const SITE_COLORS = {
  settlement: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-800', dot: '#f59e0b' },
  ceremonial: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', dot: '#8b5cf6' },
  burial: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-800', dot: '#6b7280' },
  agricultural: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', dot: '#10b981' },
  trade: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', dot: '#3b82f6' },
  defensive: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', dot: '#ef4444' }
}

const CONFIDENCE_COLORS = {
  high: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', accent: '#10b981' },
  medium: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', accent: '#3b82f6' },
  low: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', accent: '#f59e0b' },
  very_low: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', accent: '#ef4444' }
}

const THREAT_COLORS = {
  low: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600', icon: '🟢' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', icon: '🟡' },
  high: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', icon: '🟠' },
  critical: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', icon: '🔴' }
}

export default function ArchaeologicalMapViewer({ 
  onSiteSelect, 
  onCoordinateAnalyze,
  className = "" 
}: ArchaeologicalMapViewerProps) {
  // Core state
  const [sites, setSites] = useState<ArchaeologicalSite[]>([])
  const [selectedSite, setSelectedSite] = useState<ArchaeologicalSite | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159])
  const [mapZoom, setMapZoom] = useState(6)
  
  // UI state
  const [activeTab, setActiveTab] = useState("sites")
  const [backendOnline, setBackendOnline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  
  // Search and filters
  const [confidenceFilter, setConfidenceFilter] = useState(70)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map layers matching main page
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'satellite',
      name: 'Satellite Imagery',
      type: 'satellite',
      visible: true,
      opacity: 100,
      description: 'High-resolution satellite imagery for archaeological analysis'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      type: 'terrain',
      visible: false,
      opacity: 80,
      description: 'Digital elevation model and topographic features'
    },
    {
      id: 'lidar',
      name: 'LIDAR Data',
      type: 'lidar',
      visible: false,
      opacity: 60,
      description: 'Light Detection and Ranging scan data with elevation points'
    },
    {
      id: 'historical',
      name: 'Historical Maps',
      type: 'historical',
      visible: false,
      opacity: 50,
      description: 'Historical maps and cultural territory overlays'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      type: 'infrastructure',
      visible: false,
      opacity: 30,
      description: 'Modern infrastructure and development impact analysis'
    }
  ])

  // Refs
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const layerOverlaysRef = useRef<{[key: string]: any}>({})

  // Layer data and overlays
  const [layerData, setLayerData] = useState<{[key: string]: any}>({})
  const [layersLoading, setLayersLoading] = useState<{[key: string]: boolean}>({})

  // Check backend status using secure configuration
  const checkBackend = useCallback(async () => {
    try {
      console.log('🔍 Map: Checking backend connectivity...')
      const isOnline = await isBackendAvailable()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        console.log('✅ Map: Backend online - will use real data')
      } else {
        console.log('❌ Map: Backend is offline')
        
        if (config.dataSources.useRealDataOnly) {
          setMapError('Backend required for real data mode. Please start the backend service.')
          return
        }
      }
    } catch (err) {
      console.error('Map backend check failed:', err)
      setBackendOnline(false)
      
      if (config.dataSources.useRealDataOnly) {
        setMapError('Failed to connect to backend. Real data mode requires backend connection.')
      }
    }
  }, [])

  // Load sites using real backend data
  const loadSites = useCallback(async () => {
    setLoading(true)
    setMapError(null)
    
    try {
      console.log('🏛️ Map: Loading archaeological sites from backend...')
      
      const response = await makeBackendRequest(
        `${config.dataSources.endpoints.sites}?max_sites=50&min_confidence=0.5`,
        { method: 'GET' }
      )

      if (response.success) {
        // Ensure all sites have required properties with safe defaults
        const processedSites = response.data.map((site: any) => ({
          ...site,
          // Ensure required properties exist with defaults
          threat_level: site.threat_level || 'medium',
          preservation_status: site.preservation_status || 'good',
          period: site.period || 'Pre-Columbian',
          data_sources: site.data_sources || ['satellite'],
          type: site.type || 'settlement',
          confidence: typeof site.confidence === 'number' ? site.confidence : 75
        }))
        
        setSites(processedSites)
        setLastUpdate(new Date().toISOString())
        console.log(`✅ Map: Loaded ${processedSites.length} real archaeological sites from backend`)
        
        // Update map markers
        if (googleMapRef.current && processedSites.length > 0) {
          updateMapMarkers(processedSites)
        }
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('❌ Map: Failed to load real site data:', err)
      
      if (config.dataSources.useRealDataOnly) {
        setMapError('Failed to load real site data. Please check backend connection.')
        setSites([])
      } else {
        setMapError('Backend unavailable. Contact system administrator.')
        setSites([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize Google Maps (matching main page implementation)
  const initializeGoogleMaps = useCallback(() => {
    if (!mapRef.current || !window.google || !googleMapsLoaded) return

    try {
      console.log('🗺️ Map: Initializing Google Maps...')
      
      const mapOptions = {
        center: { lat: mapCenter[0], lng: mapCenter[1] },
        zoom: mapZoom,
        mapTypeId: window.google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        rotateControl: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }

      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
      
      // Add click listener for coordinate analysis
      googleMapRef.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        console.log('🎯 Map: Clicked coordinates:', coordinates)
        if (onCoordinateAnalyze) {
          onCoordinateAnalyze(coordinates)
        }
      })

      console.log('✅ Map: Google Maps initialized successfully')
      
      // Load sites after map is ready
      if (sites.length > 0) {
        updateMapMarkers(sites)
      } else {
        loadSites()
      }
      
    } catch (error) {
      console.error('❌ Map: Failed to initialize Google Maps:', error)
      setMapError(`Failed to initialize map: ${(error as Error).message}`)
    }
  }, [mapCenter, mapZoom, googleMapsLoaded, sites, onCoordinateAnalyze])

  // Update map markers with real site data
  const updateMapMarkers = useCallback((sitesToShow: ArchaeologicalSite[]) => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers for each site
    sitesToShow.forEach(site => {
      try {
        const coords = site.coordinates.split(', ').map(Number)
        if (coords.length !== 2) return
        
        const [lat, lng] = coords
        
        // Create marker with confidence-based color
        const markerColorData = getConfidenceColor(site.confidence)
        const markerIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColorData.accent,
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: site.name,
          icon: markerIcon
        })

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${site.name}</h3>
              <p style="margin: 4px 0; color: #666;"><strong>Type:</strong> ${site.type}</p>
              <p style="margin: 4px 0; color: #666;"><strong>Confidence:</strong> ${(site.confidence * 100).toFixed(0)}%</p>
              <p style="margin: 4px 0; color: #666;"><strong>Period:</strong> ${site.period}</p>
              <p style="margin: 4px 0; color: #666;"><strong>Size:</strong> ${site.size_hectares || 'Unknown'} ha</p>
              <div style="margin-top: 8px;">
                <button onclick="window.analyzeSite('${site.coordinates}')" 
                        style="background: #3B82F6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                  Analyze Site
                </button>
              </div>
            </div>
          `
        })

        // Add click listener
        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker)
          setSelectedSite(site)
          if (onSiteSelect) {
            onSiteSelect(site)
          }
        })

        markersRef.current.push(marker)
      } catch (error) {
        console.warn('Failed to create marker for site:', site.name, error)
      }
    })

    console.log(`✅ Map: Added ${markersRef.current.length} site markers`)
  }, [onSiteSelect])

  // Global function for analyze button in info windows
  useEffect(() => {
    (window as any).analyzeSite = (coordinates: string) => {
      console.log('🎯 Map: Analyzing site at coordinates:', coordinates)
      if (onCoordinateAnalyze) {
        onCoordinateAnalyze(coordinates)
      }
    }
    
    return () => {
      delete (window as any).analyzeSite
    }
  }, [onCoordinateAnalyze])

  // Filter sites based on current filters
  const filteredSites = sites.filter(site => {
    if (typeFilter !== 'all' && site.type !== typeFilter) return false
    if (site.confidence < confidenceFilter) return false
    return true
  })

  // Helper functions for color coding
  const getConfidenceLevel = (confidence: number): keyof typeof CONFIDENCE_COLORS => {
    if (confidence >= 90) return 'high'
    if (confidence >= 75) return 'medium'
    if (confidence >= 60) return 'low'
    return 'very_low'
  }

  const getSiteColor = (site: ArchaeologicalSite) => {
    const type = site?.type || 'settlement'
    return SITE_COLORS[type] || SITE_COLORS.settlement
  }

  const getConfidenceColor = (confidence: number) => {
    const level = getConfidenceLevel(confidence || 75)
    return CONFIDENCE_COLORS[level]
  }

  const getThreatColor = (threatLevel?: ArchaeologicalSite['threat_level']) => {
    if (!threatLevel || !(threatLevel in THREAT_COLORS)) {
      return THREAT_COLORS.medium // Default fallback
    }
    return THREAT_COLORS[threatLevel]
  }

  const handleSiteClick = (site: ArchaeologicalSite) => {
    const coords = site.coordinates.split(', ').map(Number)
    if (coords.length === 2) {
      setMapCenter([coords[0], coords[1]])
      setMapZoom(14)
      setSelectedSite(site)
      if (onSiteSelect) onSiteSelect(site)
    }
  }

  const handleCoordinateClick = (coordinates: string) => {
    if (onCoordinateAnalyze) {
      onCoordinateAnalyze(coordinates)
    }
  }

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ))
  }

  // Update layer opacity
  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ))
  }

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      await checkBackend()
      if (backendOnline || !config.dataSources.useRealDataOnly) {
        await loadSites()
      }
    }
    
    initialize()
    
    // Set up periodic backend checks
    const interval = setInterval(checkBackend, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkBackend, loadSites, backendOnline])

  // Initialize Google Maps when loaded
  useEffect(() => {
    if (googleMapsLoaded) {
      initializeGoogleMaps()
    }
  }, [googleMapsLoaded, initializeGoogleMaps])

  return (
    <div className={`h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-lg overflow-hidden ${className}`}>
      {/* Google Maps loading handled by centralized GoogleMapsLoader */}

      {/* Enhanced Header with Professional Styling */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Archaeological Sites Map</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{filteredSites.length} sites discovered</span>
                <span>•</span>
                {backendOnline ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5">
                    <Database className="h-3 w-3 mr-1" />
                    Real Data
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 px-2 py-0.5">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSites}
              disabled={loading}
              className="hover:bg-blue-50 border-blue-200 text-blue-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'layers' ? 'sites' : 'layers')}
              className="hover:bg-purple-50 border-purple-200 text-purple-700 transition-colors"
            >
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
          </div>
        </div>
        
        {/* Enhanced Filters Section */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-slate-700">Type:</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-8 text-xs border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="settlement">🏘️ Settlement</SelectItem>
                <SelectItem value="ceremonial">🏛️ Ceremonial</SelectItem>
                <SelectItem value="burial">⚱️ Burial</SelectItem>
                <SelectItem value="agricultural">🌾 Agricultural</SelectItem>
                <SelectItem value="trade">🛣️ Trade</SelectItem>
                <SelectItem value="defensive">🛡️ Defensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-slate-700">Min Confidence:</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[confidenceFilter]}
                onValueChange={([value]) => setConfidenceFilter(value)}
                max={100}
                min={0}
                step={5}
                className="w-24"
              />
              <Badge variant="outline" className="text-xs px-2 py-1 min-w-12">
                {confidenceFilter}%
              </Badge>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
              <Clock className="h-3 w-3" />
              Updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {mapError && (
        <div className="mx-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Connection Error</h4>
                <p className="text-sm text-red-700 mt-1">{mapError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex h-[calc(100%-140px)]">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 bg-slate-100">
              <TabsTrigger value="sites" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Target className="h-4 w-4 mr-1" />
                Sites
              </TabsTrigger>
              <TabsTrigger value="layers" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Layers className="h-4 w-4 mr-1" />
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sites" className="flex-1 px-4 py-2">
              <div className="space-y-3">
                {filteredSites.length > 0 ? (
                  filteredSites.map(site => {
                    const siteColor = getSiteColor(site)
                    const confidenceColor = getConfidenceColor(site.confidence)
                    const threatColor = getThreatColor(site.threat_level)
                    
                    return (
                      <Card 
                        key={site.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                          selectedSite?.id === site.id 
                            ? `${siteColor.border} bg-blue-50 shadow-md` 
                            : `${confidenceColor.border} hover:bg-slate-50`
                        }`}
                        onClick={() => handleSiteClick(site)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                                {site.name}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1">
                                {site.coordinates}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={`${confidenceColor.bg} ${confidenceColor.text} text-xs px-2 py-0.5`}>
                                {site.confidence}%
                              </Badge>
                              <Badge className={`${siteColor.bg} ${siteColor.text} text-xs px-2 py-0.5`}>
                                {site.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Period:</span>
                              <span className="text-slate-800 font-medium">{site.period}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Status:</span>
                              <div className="flex items-center gap-1">
                                <span className={`${threatColor.text} font-medium`}>
                                  {site.preservation_status}
                                </span>
                                <span className="text-sm">{threatColor.icon}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {site.data_sources.map(source => (
                                <Badge 
                                  key={source} 
                                  variant="outline" 
                                  className="text-xs px-2 py-0.5 border-slate-300 text-slate-600"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCoordinateClick(site.coordinates)
                              }}
                              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Analyze Site
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No sites match current filters</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setTypeFilter('all')
                        setConfidenceFilter(0)
                      }}
                      className="mt-2"
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="layers" className="flex-1 px-4 py-2">
              <div className="space-y-3">
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">Map Layers</h4>
                  <p className="text-xs text-slate-600">Toggle layers to enhance archaeological analysis</p>
                </div>
                
                {layers.map(layer => (
                  <Card key={layer.id} className="border border-slate-200 hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={layer.visible}
                            onCheckedChange={() => toggleLayer(layer.id)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <div>
                            <Label className="text-sm font-medium text-slate-800">{layer.name}</Label>
                            <p className="text-xs text-slate-600 mt-0.5">{layer.description}</p>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {layer.type}
                        </Badge>
                      </div>
                      
                      {layer.visible && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-slate-600">Opacity</Label>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {layer.opacity}%
                            </Badge>
                          </div>
                          <Slider
                            value={[layer.opacity]}
                            onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
                            max={100}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                <div className="pt-4 border-t border-slate-200">
                  <h5 className="font-medium text-slate-800 text-sm mb-3">Quick Presets</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLayers(prev => prev.map(layer => ({
                          ...layer,
                          visible: layer.id === 'satellite' || layer.id === 'terrain'
                        })))
                      }}
                      className="justify-start text-xs hover:bg-amber-50 border-amber-200 text-amber-700"
                    >
                      🏔️ Topographic View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLayers(prev => prev.map(layer => ({
                          ...layer,
                          visible: layer.id === 'satellite' || layer.id === 'lidar'
                        })))
                      }}
                      className="justify-start text-xs hover:bg-purple-50 border-purple-200 text-purple-700"
                    >
                      🔍 Archaeological Analysis
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLayers(prev => prev.map(layer => ({
                          ...layer,
                          visible: layer.id === 'satellite' || layer.id === 'historical'
                        })))
                      }}
                      className="justify-start text-xs hover:bg-blue-50 border-blue-200 text-blue-700"
                    >
                      📜 Historical Context
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLayers(prev => prev.map(layer => ({
                          ...layer,
                          visible: layer.id === 'satellite' || layer.id === 'infrastructure'
                        })))
                      }}
                      className="justify-start text-xs hover:bg-red-50 border-red-200 text-red-700"
                    >
                      ⚠️ Conservation Threats
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full min-h-[600px]" />
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Loading real archaeological data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 