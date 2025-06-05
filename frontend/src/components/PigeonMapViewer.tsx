"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { MapPin, Satellite, Database, Globe, Navigation, AlertCircle, Settings, CheckCircle, Wifi, Eye, RefreshCw, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SiteData } from "@/types/site-data"

interface PigeonMapViewerProps {
  sites: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  className?: string
  initialCoordinates?: [number, number]
  initialZoom?: number
  onCoordinateSelect?: (coords: string) => void
}

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""

// Fallback Interactive Map Component
function FallbackArchaeologicalMap({ 
  sites, 
  center, 
  onSiteClick, 
  onMapClick,
  selectedSite 
}: {
  sites: any[]
  center: [number, number]
  onSiteClick: (site: any) => void
  onMapClick: (coords: string) => void
  selectedSite?: any
}) {
  const [hoveredSite, setHoveredSite] = useState<any>(null)
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null)

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    const lat = center[0] + (0.5 - y) * 0.4
    const lng = center[1] + (x - 0.5) * 0.4
    
    const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    setClickedCoords([lat, lng])
    onMapClick(coords)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#10B981'
    if (confidence >= 0.8) return '#3B82F6'
    if (confidence >= 0.7) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 rounded-lg overflow-hidden border border-slate-700">
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
        {/* Coordinate Display */}
        <div className="absolute top-3 left-3 text-xs text-white/90 font-mono bg-black/50 px-3 py-2 rounded-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <Globe className="h-3 w-3" />
            <span>{center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
          </div>
        </div>
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="h-6 w-6 text-red-400/70" />
        </div>

        {/* Clicked Coordinates Marker */}
        {clickedCoords && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${50 + ((clickedCoords[1] - center[1]) / 0.4) * 100}%`, 
              top: `${50 - ((clickedCoords[0] - center[0]) / 0.4) * 100}%` 
            }}
          >
            <div className="w-4 h-4 border-2 border-yellow-400 bg-yellow-400/30 rounded-full animate-pulse" />
          </div>
        )}

        {/* Archaeological Site Markers */}
        {sites.map((site, index) => {
          if (!site.coordinates) return null
          
          const [lat, lng] = site.coordinates.split(', ').map(Number)
          if (isNaN(lat) || isNaN(lng)) return null
          
          const x = 50 + ((lng - center[1]) / 0.4) * 100
          const y = 50 - ((lat - center[0]) / 0.4) * 100
          
          if (x < 0 || x > 100 || y < 0 || y > 100) return null
          
          const isSelected = selectedSite && selectedSite.coordinates === site.coordinates
          const isHovered = hoveredSite && hoveredSite.coordinates === site.coordinates
          
          return (
            <div
              key={`archaeological_site_${site.coordinates}_${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={(e) => {
                e.stopPropagation()
                onSiteClick(site)
              }}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              <div 
                className={`w-4 h-4 rounded-full border-2 border-white shadow-xl transition-all duration-200 ${
                  isSelected ? 'scale-150 ring-4 ring-yellow-400/50' : 
                  isHovered ? 'scale-125 ring-2 ring-white/50' : 'scale-100'
                }`}
                style={{ 
                  backgroundColor: site.confidence ? getConfidenceColor(site.confidence) : '#3B82F6' 
                }}
              />
              
              {/* Site Info Tooltip */}
              {(isHovered || isSelected) && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-20 border border-slate-600 shadow-xl">
                  <div className="font-semibold text-white">{site.name}</div>
                  <div className="text-slate-300 font-mono text-xs">{site.coordinates}</div>
                  {site.confidence && (
                    <div className="text-xs mt-1 flex items-center space-x-1">
                      <span className="text-slate-400">Confidence:</span>
                      <span style={{ color: getConfidenceColor(site.confidence) }}>
                        {Math.round(site.confidence * 100)}%
                      </span>
                    </div>
                  )}
                  {site.type === 'backend' && (
                    <Badge variant="outline" className="text-xs mt-1 border-emerald-500/50 text-emerald-400">
                      <CheckCircle className="h-2 w-2 mr-1" />
                      Live Data
                    </Badge>
                  )}
                  {site.description && (
                    <div className="text-xs text-slate-400 mt-1 max-w-48">
                      {site.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Scale and Info */}
        <div className="absolute bottom-3 left-3 text-xs text-white/90 bg-black/50 px-3 py-2 rounded-lg border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-8 h-0.5 bg-white/80" />
              <span>~40km</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{sites.length} sites</span>
            </div>
          </div>
        </div>

        {/* Map Mode Indicator */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 px-3 py-2 bg-black/50 text-white text-xs rounded-lg border border-white/20">
          <Navigation className="h-3 w-3 text-emerald-400" />
          <span>Interactive Archaeological Grid</span>
        </div>
      </div>
    </div>
  )
}

export default function PigeonMapViewer({
  sites,
  onSiteSelect,
  selectedSite,
  className,
  initialCoordinates = [-3.4653, -62.2159],
  initialZoom = 5,
  onCoordinateSelect,
}: PigeonMapViewerProps) {
  const [center, setCenter] = useState<[number, number]>(initialCoordinates)
  const [backendSites, setBackendSites] = useState<any[]>([])
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking")
  const [mapError, setMapError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Archaeological site data
  const predefinedSites = [
    { name: "Central Amazon Research Zone", coords: "-3.4653, -62.2159", type: "demo", description: "Primary rainforest research area", confidence: 0.85 },
    { name: "Xingu River Complex (Kuhikugu)", coords: "-12.2551, -53.2134", type: "demo", description: "Ancient settlements complex", confidence: 0.92 },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452", type: "demo", description: "Geometric earthworks in western Amazon", confidence: 0.88 },
    { name: "Llanos de Moxos", coords: "-14.0000, -65.5000", type: "demo", description: "Pre-Columbian hydraulic culture", confidence: 0.91 },
    { name: "Nazca Lines Complex", coords: "-14.7390, -75.1300", type: "demo", description: "Famous geoglyphs in southern Peru", confidence: 0.95 },
    { name: "Caral Ancient City", coords: "-10.8933, -77.5200", type: "demo", description: "Oldest city in the Americas", confidence: 0.93 },
  ]

  // Combine all archaeological sites
  const allArchaeologicalSites = [
    ...backendSites.map(site => ({
      name: site.name || `Archaeological Site ${site.site_id || site.id}`,
      coordinates: site.coordinates || `${site.latitude || site.lat}, ${site.longitude || site.lon}`,
      type: "backend",
      confidence: site.confidence,
      description: site.description || site.cultural_significance
    })),
    ...predefinedSites.map(site => ({
      name: site.name,
      coordinates: site.coords,
      type: site.type,
      confidence: site.confidence,
      description: site.description
    }))
  ]

  // Load real archaeological data from backend
  const loadArchaeologicalData = useCallback(async () => {
    setLoading(true)
    try {
      // Test backend connectivity
      const healthCheck = await fetch('http://localhost:8000/system/health')
      if (healthCheck.ok) {
        setBackendStatus("online")
        
        // Load archaeological sites
        const sitesResponse = await fetch('http://localhost:8000/research/sites?max_sites=25')
        if (sitesResponse.ok) {
          const archaeologicalSites = await sitesResponse.json()
          setBackendSites(archaeologicalSites)
          console.log('✅ Loaded', archaeologicalSites.length, 'real archaeological sites')
        }
      } else {
        setBackendStatus("offline")
        console.log('⚠️ Backend offline - using demo archaeological data')
      }
    } catch (error) {
      console.error('❌ Failed to load archaeological data:', error)
      setBackendStatus("offline")
    } finally {
      setLoading(false)
    }
  }, [])

  const navigateToLocation = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()))
    setCenter([lat, lng])
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  // Initialize and load data
  useEffect(() => {
    // Check for Google Maps billing issues
    const checkGoogleMapsErrors = () => {
      const originalConsoleError = console.error
      console.error = (...args) => {
        const message = args.join(' ').toLowerCase()
        if (message.includes('billingnotenabledmaperror') || 
            message.includes('billing not enabled') ||
            message.includes('quota') ||
            message.includes('api key')) {
          setMapError("Google Maps billing not enabled - using archaeological grid view")
        }
        originalConsoleError.apply(console, args)
      }

      // Global auth failure handler
      window.gm_authFailure = () => {
        setMapError("Google Maps authentication failed - using archaeological grid view")
      }
    }

    checkGoogleMapsErrors()
    loadArchaeologicalData()

    // Auto-refresh archaeological data every 30 seconds if backend is online
    const refreshInterval = setInterval(() => {
      if (backendStatus === "online") {
        loadArchaeologicalData()
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [loadArchaeologicalData, backendStatus])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Status and Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Backend Status */}
          <Badge variant="outline" className={`${
            backendStatus === "online" ? 'border-emerald-500/60 text-emerald-400 bg-emerald-900/20' : 
            backendStatus === "checking" ? 'border-blue-500/60 text-blue-400 bg-blue-900/20' :
            'border-red-500/60 text-red-400 bg-red-900/20'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              backendStatus === "online" ? 'bg-emerald-400' : 
              backendStatus === "checking" ? 'bg-blue-400 animate-pulse' :
              'bg-red-400'
            }`} />
            {backendStatus === "checking" ? "Connecting to NIS Protocol..." : 
             backendStatus === "online" ? "NIS Backend Online" : "NIS Backend Offline"}
          </Badge>
          
          {/* Site Counter */}
          <Badge variant="outline" className="border-blue-500/60 text-blue-400 bg-blue-900/20">
            <MapPin className="h-3 w-3 mr-1" />
            {allArchaeologicalSites.length} archaeological sites
          </Badge>

          {/* Live Data Indicator */}
          {backendSites.length > 0 && (
            <Badge variant="outline" className="border-emerald-500/60 text-emerald-400 bg-emerald-900/20">
              <Wifi className="h-3 w-3 mr-1" />
              {backendSites.length} live sites
            </Badge>
          )}
        </div>

        {/* Map Mode and Refresh */}
        <div className="flex items-center space-x-2">
          {mapError && (
            <Badge variant="outline" className="border-yellow-500/60 text-yellow-400 bg-yellow-900/20 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Grid Mode Active
            </Badge>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadArchaeologicalData}
            disabled={loading}
            className="text-xs border-slate-600 hover:border-slate-500 bg-slate-800/50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Map Display */}
      <div className="w-full h-full">
        <FallbackArchaeologicalMap
          sites={allArchaeologicalSites}
          center={center}
          selectedSite={selectedSite}
          onSiteClick={(site) => {
            if (onSiteSelect) {
              onSiteSelect(site as SiteData)
            }
            navigateToLocation(site.coordinates)
          }}
          onMapClick={navigateToLocation}
        />
      </div>

      {/* Site Navigation Panel */}
      {allArchaeologicalSites.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <Card className="bg-slate-900/95 backdrop-blur-sm border-slate-700 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span>Archaeological Site Navigation</span>
                </h4>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                    {backendSites.length} live
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {predefinedSites.length} reference
                  </Badge>
                </div>
              </div>
              
              <Select onValueChange={navigateToLocation}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select archaeological site to explore..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                  {allArchaeologicalSites.map((site, index) => (
                    <SelectItem 
                      key={`nav_${site.coordinates}_${index}`}
                      value={site.coordinates}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-blue-400" />
                          <span className="font-medium">{site.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {site.type === 'backend' && (
                            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                              Live
                            </Badge>
                          )}
                          {site.confidence && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-blue-500/50 text-blue-400"
                            >
                              {Math.round(site.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSite && (
                <div className="mt-3 p-3 bg-slate-800/60 rounded-lg border border-slate-600">
                  <div className="text-sm text-white font-medium">{selectedSite.name || 'Selected Site'}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {selectedSite.coordinates}
                  </div>
                  {selectedSite.description && (
                    <div className="text-xs text-slate-300 mt-2">{selectedSite.description}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex items-center space-x-3 text-white bg-slate-800/90 px-6 py-4 rounded-lg border border-slate-600">
            <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
            <span className="text-sm font-medium">Loading archaeological sites...</span>
          </div>
        </div>
      )}
    </div>
  )
}
