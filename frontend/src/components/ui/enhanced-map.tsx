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
  AlertCircle,
  CheckCircle
} from "lucide-react"

// Real backend data interfaces
interface RealSiteData {
  site_id: string
  name: string
  coordinates: string // "lat, lng" format
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
}

interface MapLayer {
  id: string
  name: string
  url: string
  opacity: number
  visible: boolean
  type: 'satellite' | 'terrain' | 'hybrid' | 'lidar' | 'roadmap'
  blendMode?: 'normal' | 'multiply' | 'overlay'
}

interface MapState {
  center: [number, number]
  zoom: number
  sites: RealSiteData[]
  selectedSite: RealSiteData | null
  filters: {
    minConfidence: number
    dateRange: string
    dataSource: string
    region: string
  }
}

// Helper functions (moved outside component for reusability)
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return '#10B981' // emerald
  if (confidence >= 80) return '#3B82F6' // blue
  if (confidence >= 70) return '#F59E0B' // amber
  return '#EF4444' // red
}

const getSiteTypeIcon = (site: RealSiteData) => {
  const significance = site.cultural_significance.toLowerCase()
  if (significance.includes('ceremonial')) return <Mountain className="h-4 w-4" />
  if (significance.includes('settlement')) return <Home className="h-4 w-4" />
  if (significance.includes('trade')) return <Navigation className="h-4 w-4" />
  if (significance.includes('fishing')) return <Waves className="h-4 w-4" />
  return <MapPin className="h-4 w-4" />
}

// Fallback Map Component (for when Google Maps is not available)
function FallbackMap({ 
  sites, 
  center, 
  onSiteClick, 
  onMapClick 
}: {
  sites: RealSiteData[]
  center: [number, number]
  onSiteClick: (site: RealSiteData) => void
  onMapClick: (lat: number, lng: number) => void
}) {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // Convert to lat/lng based on center and zoom
    const lat = center[0] + (0.5 - y) * 0.2 // ±0.1 degree range
    const lng = center[1] + (x - 0.5) * 0.2
    
    setSelectedCoords([lat, lng])
    onMapClick(lat, lng)
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-emerald-900 to-blue-900 rounded-lg overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 cursor-crosshair"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
        onClick={handleGridClick}
      >
        {/* Coordinate Labels */}
        <div className="absolute top-2 left-2 text-xs text-white/70 font-mono">
          {center[0].toFixed(3)}, {center[1].toFixed(3)}
        </div>
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="h-6 w-6 text-red-400 opacity-70" />
        </div>

        {/* Site Markers */}
        {sites.map((site) => {
          const [lat, lng] = site.coordinates.split(', ').map(Number)
          const x = 50 + ((lng - center[1]) / 0.2) * 100 // Convert to percentage
          const y = 50 - ((lat - center[0]) / 0.2) * 100
          
          // Only show sites within visible area
          if (x < 0 || x > 100 || y < 0 || y > 100) return null
          
          return (
            <div
              key={site.site_id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={(e) => {
                e.stopPropagation()
                onSiteClick(site)
              }}
            >
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-150"
                style={{ backgroundColor: getConfidenceColor(site.confidence * 100) }}
              />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                {site.name}
              </div>
            </div>
          )
        })}

        {/* Selected Coordinates */}
        {selectedCoords && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${50 + ((selectedCoords[1] - center[1]) / 0.2) * 100}%`, 
              top: `${50 - ((selectedCoords[0] - center[0]) / 0.2) * 100}%` 
            }}
          >
            <div className="w-4 h-4 border-2 border-yellow-400 bg-yellow-400/30 rounded-full animate-pulse" />
          </div>
        )}

        {/* Scale Reference */}
        <div className="absolute bottom-4 left-4 text-xs text-white/70">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-0.5 bg-white/70" />
            <span>~20km</span>
          </div>
        </div>

        {/* Map Type Indicator */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
          Coordinate Grid View
        </div>
      </div>
    </div>
  )
}

export function EnhancedMap() {
  const [mapState, setMapState] = useState<MapState>({
    center: [-3.4653, -62.2159], // Amazon Basin default
    zoom: 6,
    sites: [],
    selectedSite: null,
    filters: {
      minConfidence: 70,
      dateRange: '7d',
      dataSource: 'all',
      region: 'all'
    }
  })
  
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'satellite',
      name: 'Satellite',
      url: 'satellite',
      opacity: 1,
      visible: true,
      type: 'satellite'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      url: 'terrain',
      opacity: 0.8,
      visible: false,
      type: 'terrain'
    },
    {
      id: 'hybrid',
      name: 'Hybrid',
      url: 'hybrid',
      opacity: 1,
      visible: false,
      type: 'hybrid'
    },
    {
      id: 'roadmap',
      name: 'Roadmap',
      url: 'roadmap',
      opacity: 1,
      visible: false,
      type: 'roadmap'
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lidarIntensity, setLidarIntensity] = useState(0.5)
  const [terrainBlend, setTerrainBlend] = useState(0.3)
  const [backendOnline, setBackendOnline] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Load real archaeological sites from backend
  const loadRealSites = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test backend health
      const healthResponse = await fetch('http://localhost:8000/system/health')
      setBackendOnline(healthResponse.ok)
      
      if (!healthResponse.ok) {
        throw new Error('Backend offline')
      }

      // Load real archaeological sites
      const sitesResponse = await fetch('http://localhost:8000/research/sites?max_sites=50')
      
      if (sitesResponse.ok) {
        const sites: RealSiteData[] = await sitesResponse.json()
        setMapState(prev => ({ ...prev, sites }))
        console.log('✅ Loaded', sites.length, 'real archaeological sites')
        
        // Update map markers
        updateMapMarkers(sites)
      } else {
        throw new Error('Failed to load sites')
      }
    } catch (error) {
      console.error('❌ Failed to load real sites:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect to backend')
      setBackendOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) {
      console.log('⏳ Waiting for Google Maps to load...')
      return
    }

    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: mapState.center[0], lng: mapState.center[1] },
        zoom: mapState.zoom,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }]
          }
        ]
      }

      googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions)
      
      // Map click handler for analysis
      googleMapRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          handleMapClick(lat, lng)
        }
      })

      console.log('✅ Google Maps initialized')
      loadRealSites()
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error)
      setError('Failed to initialize map')
    }
  }, [mapState.center, mapState.zoom, loadRealSites])

  // Update map markers with real site data
  const updateMapMarkers = useCallback((sites: RealSiteData[]) => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add markers for filtered sites
    const filteredSites = sites.filter(site => {
      if (site.confidence * 100 < mapState.filters.minConfidence) return false
      if (mapState.filters.dataSource !== 'all' && !site.data_sources.includes(mapState.filters.dataSource)) return false
      return true
    })

    filteredSites.forEach(site => {
      const [lat, lng] = site.coordinates.split(', ').map(Number)
      
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current || undefined,
        title: site.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getConfidenceColor(site.confidence * 100),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      // Info window for site details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${site.name}</h4>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Confidence:</strong> ${(site.confidence * 100).toFixed(1)}%</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Discovered:</strong> ${new Date(site.discovery_date).toLocaleDateString()}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Significance:</strong> ${site.cultural_significance}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Data Sources:</strong> ${site.data_sources.join(', ')}</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        setMapState(prev => ({ ...prev, selectedSite: site }))
        if (googleMapRef.current) {
          infoWindow.open(googleMapRef.current, marker)
        }
      })

      markersRef.current.push(marker)
    })

    console.log('✅ Updated map with', filteredSites.length, 'site markers')
  }, [mapState.filters])

  // Handle map click for analysis
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (!backendOnline) return

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon: lng })
      })

      if (response.ok) {
        const analysis = await response.json()
        console.log('✅ Analysis result:', analysis)
        
        // Show analysis result
        const infoWindow = new google.maps.InfoWindow({
          position: { lat, lng },
          content: `
            <div style="color: black; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937;">Analysis Result</h4>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(1)}%</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Pattern:</strong> ${analysis.pattern_type}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Description:</strong> ${analysis.description}</p>
            </div>
          `
        })
        
        if (googleMapRef.current) {
          infoWindow.open(googleMapRef.current)
        }
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [backendOnline])

  // Toggle map layers
  const toggleLayer = useCallback((layerId: string) => {
    if (!googleMapRef.current) return

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible
        
        // Update Google Maps layer
        switch (layerId) {
          case 'satellite':
            if (newVisible) googleMapRef.current?.setMapTypeId(google.maps.MapTypeId.SATELLITE)
            break
          case 'terrain':
            if (newVisible) googleMapRef.current?.setMapTypeId(google.maps.MapTypeId.TERRAIN)
            break
          case 'hybrid':
            if (newVisible) googleMapRef.current?.setMapTypeId(google.maps.MapTypeId.HYBRID)
            break
          case 'roadmap':
            if (newVisible) googleMapRef.current?.setMapTypeId(google.maps.MapTypeId.ROADMAP)
            break
        }
        
        return { ...layer, visible: newVisible }
      } else {
        return { ...layer, visible: false } // Only one layer visible at a time
      }
    }))
  }, [])

  // Search function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !googleMapRef.current) return

    try {
      // Try to parse as coordinates
      const coords = searchQuery.split(',').map(s => parseFloat(s.trim()))
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const [lat, lng] = coords
        googleMapRef.current.setCenter({ lat, lng })
        googleMapRef.current.setZoom(12)
        setMapState(prev => ({ ...prev, center: [lat, lng], zoom: 12 }))
        handleMapClick(lat, lng)
        return
      }

      // Use Geocoding API for location names
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results?.[0] && googleMapRef.current) {
          const location = results[0].geometry.location
          googleMapRef.current.setCenter(location)
          googleMapRef.current.setZoom(12)
          setMapState(prev => ({ 
            ...prev, 
            center: [location.lat(), location.lng()], 
            zoom: 12 
          }))
        }
      })
    } catch (error) {
      console.error('❌ Search failed:', error)
    }
  }, [searchQuery])

  // Export functionality
  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total_sites: mapState.sites.length,
      filtered_sites: mapState.sites.filter(site => 
        site.confidence * 100 >= mapState.filters.minConfidence
      ),
      map_center: mapState.center,
      filters: mapState.filters,
      backend_status: backendOnline ? 'online' : 'offline'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nis-map-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [mapState, backendOnline])

  // Check if Google Maps is available
  const isGoogleMapsAvailable = typeof window !== 'undefined' && window.google && window.google.maps

  // Initialize map when Google Maps loads or use fallback
  useEffect(() => {
    if (isGoogleMapsAvailable) {
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps) {
          initializeMap()
        } else {
          setTimeout(checkGoogleMaps, 100)
        }
      }
      checkGoogleMaps()
    } else {
      // Use fallback mode
      console.log('🗺️ Using fallback map mode')
      loadRealSites()
    }
  }, [initializeMap, loadRealSites, isGoogleMapsAvailable])

  // Update markers when filters change
  useEffect(() => {
    if (mapState.sites.length > 0) {
      updateMapMarkers(mapState.sites)
    }
  }, [mapState.sites, mapState.filters, updateMapMarkers])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendOnline) {
        loadRealSites()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [backendOnline, loadRealSites])

  const filteredSites = mapState.sites.filter(site => {
    if (site.confidence * 100 < mapState.filters.minConfidence) return false
    if (mapState.filters.dataSource !== 'all' && !site.data_sources.includes(mapState.filters.dataSource)) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      <div className={`border rounded-lg p-4 ${backendOnline ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {backendOnline ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${backendOnline ? 'text-emerald-100' : 'text-red-100'}`}>
                NIS Protocol Backend {backendOnline ? 'Online' : 'Offline'}
              </p>
              <p className={`text-sm ${backendOnline ? 'text-emerald-300' : 'text-red-300'}`}>
                {backendOnline ? `${mapState.sites.length} archaeological sites loaded` : 'Cannot load real data'} • 
                {isGoogleMapsAvailable ? ' Google Maps Active' : ' Fallback Grid Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={backendOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}>
              {filteredSites.length} sites shown
            </Badge>
            <Badge variant="outline" className={isGoogleMapsAvailable ? 'border-blue-500/50 text-blue-400' : 'border-yellow-500/50 text-yellow-400'}>
              {isGoogleMapsAvailable ? 'Enhanced' : 'Grid View'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="h-5 w-5 text-emerald-400" />
                <span>Interactive Archaeological Map</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time archaeological site visualization with Google Maps integration
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={loadRealSites} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-600 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-slate-300">Search Location</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="lat, lng or place name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button size="sm" onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Confidence Filter */}
            <div className="space-y-2">
              <Label className="text-slate-300">Min Confidence: {mapState.filters.minConfidence}%</Label>
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
                className="[&_[role=slider]]:bg-emerald-500"
              />
            </div>

            {/* Data Source Filter */}
            <div className="space-y-2">
              <Label className="text-slate-300">Data Source</Label>
              <Select 
                value={mapState.filters.dataSource}
                onValueChange={(value) =>
                  setMapState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, dataSource: value }
                  }))
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="lidar">LIDAR</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LIDAR Intensity */}
            <div className="space-y-2">
              <Label className="text-slate-300">LIDAR Intensity: {Math.round(lidarIntensity * 100)}%</Label>
              <Slider
                value={[lidarIntensity]}
                onValueChange={([value]) => setLidarIntensity(value)}
                max={1}
                min={0}
                step={0.01}
                className="[&_[role=slider]]:bg-purple-500"
              />
            </div>

            {/* Terrain Blend */}
            <div className="space-y-2">
              <Label className="text-slate-300">Terrain Blend: {Math.round(terrainBlend * 100)}%</Label>
              <Slider
                value={[terrainBlend]}
                onValueChange={([value]) => setTerrainBlend(value)}
                max={1}
                min={0}
                step={0.01}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Display */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] bg-slate-800 border-slate-700">
            <CardContent className="p-0 h-full relative">
              {loading && (
                <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-3 text-white">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                    <span>Loading archaeological sites...</span>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="absolute bottom-4 left-4 bg-blue-500 text-white rounded-lg p-3 z-10">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Analyzing location...</span>
                  </div>
                </div>
              )}

              {/* Conditional Map Rendering */}
              {isGoogleMapsAvailable ? (
                <div 
                  ref={mapRef}
                  className="w-full h-full rounded-lg"
                  style={{ minHeight: '600px' }}
                />
              ) : (
                <FallbackMap
                  sites={filteredSites}
                  center={mapState.center}
                  onSiteClick={(site) => setMapState(prev => ({ ...prev, selectedSite: site }))}
                  onMapClick={handleMapClick}
                />
              )}
              
              {error && (
                <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center">
                  <div className="text-center text-white">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-600">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reload Page
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Layer Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>Map Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <Label className="text-sm flex items-center space-x-2 text-slate-300">
                    {layer.type === 'satellite' && <Satellite className="h-3 w-3" />}
                    {layer.type === 'terrain' && <Mountain className="h-3 w-3" />}
                    {layer.type === 'hybrid' && <Globe className="h-3 w-3" />}
                    {layer.type === 'roadmap' && <Navigation className="h-3 w-3" />}
                    <span>{layer.name}</span>
                  </Label>
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => toggleLayer(layer.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Site Info */}
          {mapState.selectedSite && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>Site Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-400">Name</Label>
                  <p className="text-sm text-white">{mapState.selectedSite.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-400">Confidence</Label>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: getConfidenceColor(mapState.selectedSite.confidence * 100),
                      color: getConfidenceColor(mapState.selectedSite.confidence * 100)
                    }}
                  >
                    {(mapState.selectedSite.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-400">Coordinates</Label>
                  <p className="text-sm font-mono text-white">{mapState.selectedSite.coordinates}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-400">Discovery Date</Label>
                  <p className="text-sm text-white">{new Date(mapState.selectedSite.discovery_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-400">Cultural Significance</Label>
                  <p className="text-sm text-white">{mapState.selectedSite.cultural_significance}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-400">Data Sources</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mapState.selectedSite.data_sources.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-white">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Sites:</span>
                <span className="font-medium text-white">{mapState.sites.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Filtered:</span>
                <span className="font-medium text-white">{filteredSites.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">High Confidence:</span>
                <span className="font-medium text-emerald-400">
                  {filteredSites.filter(s => s.confidence >= 0.8).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">LIDAR Enhanced:</span>
                <span className="font-medium text-purple-400">
                  {filteredSites.filter(s => s.data_sources.includes('lidar')).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Backend Status:</span>
                <span className={`font-medium ${backendOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {backendOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 