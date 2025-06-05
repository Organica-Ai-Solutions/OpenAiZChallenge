"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { motion } from 'framer-motion'
import { 
  Globe, 
  MapPin, 
  Satellite, 
  Search, 
  Brain,
  Wifi,
  WifiOff,
  Menu,
  X,
  RefreshCw,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { AnimatedAIChat } from "../../components/ui/animated-ai-chat"
import Navigation from "../../components/shared/Navigation"

// Interfaces
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
}

export default function ArchaeologicalMapPage() {
  // Core state
  const [sites, setSites] = useState<ArchaeologicalSite[]>([])
  const [selectedSite, setSelectedSite] = useState<ArchaeologicalSite | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159])
  const [mapZoom, setMapZoom] = useState(6)
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sites")
  const [backendOnline, setBackendOnline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Search and filters
  const [confidenceFilter, setConfidenceFilter] = useState(70)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Refs
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)

  // Check backend status
  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/system/health')
      setBackendOnline(response.ok)
    } catch {
      setBackendOnline(false)
    }
  }, [])

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !googleMapsLoaded) {
      console.log('🗺️ Waiting for Google Maps to load...')
      return
    }

    try {
      console.log('🗺️ Initializing Google Maps...')
      const mapOptions = {
        center: { lat: mapCenter[0], lng: mapCenter[1] },
        zoom: mapZoom,
        mapTypeId: window.google.maps.MapTypeId?.SATELLITE || 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        rotateControl: false,
        gestureHandling: 'greedy'
      }

      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
      console.log('✅ Google Maps initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error)
      setMapError('Failed to initialize map')
    }
  }, [mapCenter, mapZoom, googleMapsLoaded])

  // Load archaeological sites
  const loadSites = useCallback(async () => {
    setLoading(true)
    try {
      if (backendOnline) {
        const response = await fetch('http://localhost:8000/research/sites?max_sites=50')
        if (response.ok) {
          const data = await response.json()
          setSites(data)
          console.log('✅ Loaded', data.length, 'archaeological sites')
        }
      } else {
        // Demo data
        const demoSites: ArchaeologicalSite[] = [
          {
            id: 'demo_1',
            name: 'Nazca Lines Complex',
            coordinates: '-14.739, -75.13',
            confidence: 0.92,
            discovery_date: '2023-01-15',
            cultural_significance: 'Ancient ceremonial geoglyphs with astronomical alignments',
            data_sources: ['satellite', 'lidar'],
            type: 'ceremonial',
            period: 'Nazca (100-700 CE)',
            size_hectares: 450
          },
          {
            id: 'demo_2',
            name: 'Amazon Settlement Platform',
            coordinates: '-3.4653, -62.2159',
            confidence: 0.87,
            discovery_date: '2023-02-20',
            cultural_significance: 'Pre-Columbian riverine settlement with raised platforms',
            data_sources: ['satellite', 'lidar'],
            type: 'settlement',
            period: 'Late Pre-Columbian (1000-1500 CE)',
            size_hectares: 85
          },
          {
            id: 'demo_3',
            name: 'Andean Terracing System',
            coordinates: '-13.1631, -72.545',
            confidence: 0.84,
            discovery_date: '2023-03-10',
            cultural_significance: 'Agricultural terracing with water management',
            data_sources: ['satellite', 'terrain'],
            type: 'agricultural',
            period: 'Inca (1400-1533 CE)',
            size_hectares: 230
          }
        ]
        setSites(demoSites)
        console.log('✅ Loaded demo archaeological sites')
      }
    } catch (error) {
      console.error('❌ Failed to load sites:', error)
    } finally {
      setLoading(false)
    }
  }, [backendOnline])

  // Initialize effects
  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [checkBackend])

  useEffect(() => {
    loadSites()
  }, [loadSites])

  useEffect(() => {
    if (googleMapsLoaded && window.google && window.google.maps) {
      console.log('🗺️ Google Maps ready, initializing map...')
      initializeMap()
    }
  }, [googleMapsLoaded, initializeMap])

  // Fallback mechanism for Google Maps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!googleMapsLoaded && window.google && window.google.maps) {
        console.log('🔄 Force loading Google Maps after timeout...')
        setGoogleMapsLoaded(true)
      } else if (!googleMapsLoaded && !window.google) {
        console.error('❌ Google Maps failed to load - check network connection')
        setMapError('Google Maps failed to load. Please check your internet connection.')
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [googleMapsLoaded])

  // Check if Google Maps is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && !googleMapsLoaded) {
      console.log('🗺️ Google Maps already loaded, setting state...')
      setGoogleMapsLoaded(true)
    }
  }, [googleMapsLoaded])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-emerald-900/5 to-blue-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Google Maps API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y&libraries=places,geometry,drawing`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Google Maps API loaded successfully')
          setGoogleMapsLoaded(true)
        }}
        onError={(error) => {
          console.error('❌ Google Maps API failed to load:', error)
          setMapError('Failed to load Google Maps API. Please check your internet connection.')
        }}
      />

      <Navigation 
        showBackendStatus={true}
        showChatButton={true}
        onChatToggle={() => setChatOpen(!chatOpen)}
      />

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Link 
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                  <Globe className="h-12 w-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Archaeological Map Explorer
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Interactive mapping platform with archaeological site visualization, satellite analysis, 
                and AI-powered discovery tools for indigenous archaeological research
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mt-6"
              >
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
                  backendOnline 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {backendOnline ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {backendOnline ? 'Real Data Connected' : 'Demo Mode'}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-white/70">{sites.length} Sites</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Map Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex h-[calc(100vh-400px)] gap-6"
          >
            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]`}
            >
              <div className="p-4 h-full overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 bg-white/[0.05] border border-white/[0.1]">
                    <TabsTrigger value="sites" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Sites</TabsTrigger>
                    <TabsTrigger value="layers" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Layers</TabsTrigger>
                    <TabsTrigger value="tools" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">Tools</TabsTrigger>
                  </TabsList>

                  {/* Sites Tab */}
                  <TabsContent value="sites" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Archaeological Sites</h3>
                      
                      {/* Site Filters */}
                      <div className="space-y-3">
                        <Input
                          placeholder="Search sites..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white/[0.05] border-white/[0.1] text-white placeholder-white/50"
                        />
                        
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white">
                            <SelectValue placeholder="Site Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="settlement">Settlement</SelectItem>
                            <SelectItem value="ceremonial">Ceremonial</SelectItem>
                            <SelectItem value="agricultural">Agricultural</SelectItem>
                            <SelectItem value="defensive">Defensive</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Confidence: {confidenceFilter}%</Label>
                          <Slider
                            value={[confidenceFilter]}
                            onValueChange={([value]) => setConfidenceFilter(value)}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Sites List */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="text-center py-4 text-white/70">Loading sites...</div>
                        ) : (
                          sites
                            .filter(site => site.confidence * 100 >= confidenceFilter)
                            .filter(site => typeFilter === 'all' || site.type === typeFilter)
                            .filter(site => !searchQuery || site.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(site => (
                              <Card 
                                key={site.id} 
                                className="bg-white/[0.05] backdrop-blur-sm border-white/[0.1] cursor-pointer hover:bg-white/[0.1] transition-all duration-300"
                                onClick={() => {
                                  setSelectedSite(site)
                                  const [lat, lng] = site.coordinates.split(', ').map(Number)
                                  setMapCenter([lat, lng])
                                  if (googleMapRef.current) {
                                    googleMapRef.current.setCenter({ lat, lng })
                                    googleMapRef.current.setZoom(14)
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm text-white">{site.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {(site.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-white/70 space-y-1">
                                    <div>Type: {site.type}</div>
                                    <div>Period: {site.period}</div>
                                    <div>Size: {site.size_hectares || 'Unknown'} ha</div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Layers Tab */}
                  <TabsContent value="layers" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Map Layers</h3>
                      <div className="text-center text-white/50 py-8">
                        <Satellite className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Layer controls coming soon</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tools Tab */}
                  <TabsContent value="tools" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Analysis Tools</h3>
                      <div className="text-center text-white/50 py-8">
                        <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Analysis tools coming soon</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>

            {/* Main Map Container */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex-1 relative rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] overflow-hidden"
            >
              {/* Map Controls */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="bg-white/[0.1] backdrop-blur-sm border-white/[0.2] text-white hover:bg-white/[0.2] transition-all"
                >
                  {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>

              {/* Map Status */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/[0.1] backdrop-blur-sm border border-white/[0.2] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs">
                    {backendOnline ? (
                      <>
                        <Wifi className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Live Data</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400">Demo Mode</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {sites.length} sites
                  </div>
                </div>
              </div>

              {/* Main Map */}
              <div 
                ref={mapRef} 
                className="w-full h-full bg-slate-900 rounded-2xl"
              >
                {!googleMapsLoaded && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                      <div className="text-slate-300">Loading Google Maps...</div>
                      {mapError && (
                        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded">
                          <div className="text-red-300 text-sm">
                            {mapError}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => {
                              setMapError(null)
                              window.location.reload()
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-slate-400">
                        This may take a few seconds for first load...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Chat Assistant */}
            {chatOpen && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="w-80 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]"
              >
                <div className="p-4 h-full">
                  <AnimatedAIChat />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="relative bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.08] py-8 text-white/60 mt-8"
          >
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm">© 2024 Organica-Ai-Solutions. Archaeological Discovery Platform.</p>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  )
} 