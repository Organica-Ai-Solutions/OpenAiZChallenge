// Unified Map Viewer - Consolidates all map functionality
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  MapPin, 
  Layers, 
  Satellite, 
  Eye, 
  Search, 
  Settings, 
  Download,
  Filter,
  Zap,
  Globe,
  Target,
  RefreshCw,
  Compass,
  RotateCcw
} from 'lucide-react'
import { discoveryService } from '../lib/discovery-service'
import { satelliteService } from '../lib/satellite'
import { useBreakpoint, getMapDimensions, archaeologicalMapConfig } from '../lib/responsive'

// Dynamically import map libraries to avoid SSR issues
const PigeonMap = dynamic(() => import('pigeon-maps').then(mod => mod.Map), { ssr: false })
const Marker = dynamic(() => import('pigeon-maps').then(mod => mod.Marker), { ssr: false })
const Overlay = dynamic(() => import('pigeon-maps').then(mod => mod.Overlay), { ssr: false })

// Map provider configurations
const MAP_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap',
    attribution: '© OpenStreetMap contributors',
    url: (x: number, y: number, z: number) => 
      `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  },
  satellite: {
    name: 'Satellite',
    attribution: '© Google',
    url: (x: number, y: number, z: number) => 
      `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`
  },
  terrain: {
    name: 'Terrain',
    attribution: '© Google',
    url: (x: number, y: number, z: number) => 
      `https://mt1.google.com/vt/lyrs=p&x=${x}&y=${y}&z=${z}`
  },
  hybrid: {
    name: 'Hybrid',
    attribution: '© Google',
    url: (x: number, y: number, z: number) => 
      `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`
  }
}

// Archaeological site interface
interface ArchaeologicalSite {
  id: string
  name: string
  coordinates: [number, number]
  confidence: number
  type: 'settlement' | 'ceremonial' | 'burial' | 'agricultural' | 'trade' | 'defensive'
  period: string
  cultural_significance: string
  data_sources: string[]
  size_hectares?: number
}

// Map layer interface
interface MapLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  type: 'sites' | 'analysis' | 'overlay' | 'heatmap'
  data?: any[]
}

// Props interface
interface UnifiedMapViewerProps {
  onCoordinateSelect?: (coordinates: string) => void
  onSiteSelect?: (site: ArchaeologicalSite) => void
  initialCenter?: [number, number]
  initialZoom?: number
  showControls?: boolean
  showLayers?: boolean
  mode?: 'discovery' | 'analysis' | 'exploration'
  className?: string
}

// Main component
export default function UnifiedMapViewer({
  onCoordinateSelect,
  onSiteSelect,
  initialCenter = [-12.0464, -77.0428], // Lima, Peru
  initialZoom = 6,
  showControls = true,
  showLayers = true,
  mode = 'exploration',
  className = ''
}: UnifiedMapViewerProps) {
  // State management
  const [center, setCenter] = useState<[number, number]>(initialCenter)
  const [zoom, setZoom] = useState(initialZoom)
  const [mapProvider, setMapProvider] = useState<keyof typeof MAP_PROVIDERS>('osm')
  const [sites, setSites] = useState<ArchaeologicalSite[]>([])
  const [selectedSite, setSelectedSite] = useState<ArchaeologicalSite | null>(null)
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'sites', name: 'Archaeological Sites', visible: true, opacity: 100, type: 'sites' },
    { id: 'analysis', name: 'Analysis Results', visible: false, opacity: 80, type: 'analysis' },
    { id: 'heatmap', name: 'Confidence Heatmap', visible: false, opacity: 60, type: 'heatmap' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    minConfidence: 70,
    siteTypes: [] as string[],
    periods: [] as string[],
    dataSources: [] as string[]
  })
  
  // Responsive design
  const breakpoint = useBreakpoint()
  const mapDimensions = getMapDimensions()
  const markerSize = archaeologicalMapConfig.getSiteMarkerSize()
  
  // Refs
  const mapRef = useRef<any>(null)

  // Load initial sites
  useEffect(() => {
    loadArchaeologicalSites()
  }, [center, zoom])

  // Load archaeological sites from discovery service
  const loadArchaeologicalSites = async () => {
    setIsLoading(true)
    try {
      const discoveredSites = await discoveryService.discoverSites({
        minConfidence: filters.minConfidence / 100,
        maxResults: 50,
        region: getRegionFromCoordinates(center)
      })

      const formattedSites: ArchaeologicalSite[] = discoveredSites.map(site => ({
        id: site.id,
        name: site.name,
        coordinates: site.coordinates.split(',').map(c => parseFloat(c.trim())) as [number, number],
        confidence: site.confidence,
        type: site.type,
        period: site.period,
        cultural_significance: site.cultural_significance,
        data_sources: site.data_sources,
        size_hectares: site.size_hectares
      }))

      setSites(formattedSites)
    } catch (error) {
      console.error('Failed to load archaeological sites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle map click for coordinate selection
  const handleMapClick = useCallback(({ event, latLng }: any) => {
    if (mode === 'analysis' && onCoordinateSelect) {
      const coordinates = `${latLng[0].toFixed(6)}, ${latLng[1].toFixed(6)}`
      onCoordinateSelect(coordinates)
      console.log('🗺️ Coordinates selected:', coordinates)
    }
  }, [mode, onCoordinateSelect])

  // Handle site marker click
  const handleSiteClick = useCallback((site: ArchaeologicalSite) => {
    setSelectedSite(site)
    if (onSiteSelect) {
      onSiteSelect(site)
    }
    console.log('🏛️ Site selected:', site.name)
  }, [onSiteSelect])

  // Render site markers
  const renderSiteMarkers = () => {
    if (!layers.find(l => l.id === 'sites')?.visible) return null

    return sites
      .filter(site => site.confidence >= filters.minConfidence / 100)
      .map(site => (
        <Marker
          key={site.id}
          anchor={site.coordinates}
          onClick={() => handleSiteClick(site)}
        >
          <div 
            className={`
              relative w-${markerSize} h-${markerSize} cursor-pointer transition-all duration-200
              ${selectedSite?.id === site.id ? 'scale-125' : 'hover:scale-110'}
            `}
          >
            {/* Confidence ring */}
            <div 
              className="absolute inset-0 rounded-full border-2 animate-pulse"
              style={{
                borderColor: getConfidenceColor(site.confidence),
                backgroundColor: `${getConfidenceColor(site.confidence)}20`
              }}
            />
            
            {/* Site type icon */}
            <div 
              className="absolute inset-1 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: getSiteTypeColor(site.type) }}
            >
              {getSiteTypeIcon(site.type)}
            </div>

            {/* Confidence badge */}
            <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-1 py-0.5 rounded">
              {Math.round(site.confidence * 100)}%
            </div>
          </div>
        </Marker>
      ))
  }

  // Render info popup for selected site
  const renderSiteInfo = () => {
    if (!selectedSite) return null

    return (
      <Overlay 
        anchor={selectedSite.coordinates}
        offset={[120, 240]}
      >
        <Card className="w-80 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedSite.name}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedSite(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <Label className="text-muted-foreground">Confidence</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{Math.round(selectedSite.confidence * 100)}%</Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <Badge variant="outline">{selectedSite.type}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Period</Label>
                <span className="text-sm">{selectedSite.period}</span>
              </div>
              <div>
                <Label className="text-muted-foreground">Size</Label>
                <span className="text-sm">{selectedSite.size_hectares?.toFixed(1)} ha</span>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Cultural Significance</Label>
              <p className="text-sm mt-1">{selectedSite.cultural_significance}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Data Sources</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSite.data_sources.map(source => (
                  <Badge key={source} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onCoordinateSelect?.(selectedSite.coordinates.join(', '))}
              >
                <Target className="w-4 h-4 mr-1" />
                Analyze
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-1" />
                Vision
              </Button>
            </div>
          </CardContent>
        </Card>
      </Overlay>
    )
  }

  // Helper functions
  const getRegionFromCoordinates = ([lat, lon]: [number, number]): string => {
    if (lat > -5 && lat < 12 && lon > -82 && lon < -66) return 'northern_south_america'
    if (lat > -25 && lat < -5 && lon > -82 && lon < -34) return 'central_south_america'
    return 'south_america'
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#10b981' // green
    if (confidence >= 0.8) return '#f59e0b' // yellow
    if (confidence >= 0.7) return '#ef4444' // red
    return '#6b7280' // gray
  }

  const getSiteTypeColor = (type: string): string => {
    const colors = {
      settlement: '#3b82f6',
      ceremonial: '#8b5cf6',
      burial: '#ef4444',
      agricultural: '#10b981',
      trade: '#f59e0b',
      defensive: '#6b7280'
    }
    return colors[type as keyof typeof colors] || '#6b7280'
  }

  const getSiteTypeIcon = (type: string): string => {
    const icons = {
      settlement: '🏘️',
      ceremonial: '🏛️',
      burial: '⚱️',
      agricultural: '🌾',
      trade: '🏪',
      defensive: '🏰'
    }
    return icons[type as keyof typeof icons] || '📍'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            {/* Map Provider Selector */}
            <Select value={mapProvider} onValueChange={(value: keyof typeof MAP_PROVIDERS) => setMapProvider(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MAP_PROVIDERS).map(([key, provider]) => (
                  <SelectItem key={key} value={key}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search coordinates or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadArchaeologicalSites}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Badge variant="secondary">
              {sites.length} sites
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Layers Panel */}
        {showLayers && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {layers.map(layer => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{layer.name}</Label>
                      <Switch
                        checked={layer.visible}
                        onCheckedChange={(checked) => {
                          setLayers(prev => prev.map(l => 
                            l.id === layer.id ? { ...l, visible: checked } : l
                          ))
                        }}
                      />
                    </div>
                    {layer.visible && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Opacity: {layer.opacity}%
                        </Label>
                        <Slider
                          value={[layer.opacity]}
                          onValueChange={([value]) => {
                            setLayers(prev => prev.map(l => 
                              l.id === layer.id ? { ...l, opacity: value } : l
                            ))
                          }}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Filters */}
                <div className="border-t pt-4 space-y-3">
                  <Label className="text-sm font-medium">Filters</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Min Confidence: {filters.minConfidence}%
                    </Label>
                    <Slider
                      value={[filters.minConfidence]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, minConfidence: value }))}
                      min={50}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Container */}
        <div className={showLayers ? "lg:col-span-3" : "lg:col-span-4"}>
          <Card>
            <CardContent className="p-0">
              <div 
                style={{ 
                  width: mapDimensions.width, 
                  height: mapDimensions.height,
                  minHeight: '400px'
                }}
                className="rounded-lg overflow-hidden relative"
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading archaeological data...
                    </div>
                  </div>
                )}
                
                <PigeonMap
                  center={center}
                  zoom={zoom}
                  provider={MAP_PROVIDERS[mapProvider].url}
                  attribution={MAP_PROVIDERS[mapProvider].attribution}
                  onClick={handleMapClick}
                  onBoundsChanged={({ center: newCenter, zoom: newZoom }) => {
                    setCenter(newCenter)
                    setZoom(newZoom)
                  }}
                  ref={mapRef}
                >
                  {renderSiteMarkers()}
                  {renderSiteInfo()}
                </PigeonMap>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Export component and types
export type { ArchaeologicalSite, MapLayer, UnifiedMapViewerProps } 