"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"


// Google Maps callback function
declare global {
  interface Window {
    google: any
    currentMarkers: any[]
    currentInfoWindow: any
    selectSiteFromMap: (siteId: string) => void
    initGoogleMaps: () => void
  }
}
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
import UltimateArchaeologicalChat from "../../components/ui/ultimate-archaeological-chat"

// Google Maps marker types
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}


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

  // Planning state
  const [planningMode, setPlanningMode] = useState(false)
  const [researchPlan, setResearchPlan] = useState<{
    expedition_name: string
    objectives: string[]
    planned_sites: ArchaeologicalSite[]
    route_optimization: boolean
    timeline_days: number
    budget_estimate: number
    team_size: number
    equipment_needed: string[]
    risk_assessment: string
    nisProtocolActive: boolean
  }>({
    expedition_name: '',
    objectives: [],
    planned_sites: [],
    route_optimization: true,
    timeline_days: 7,
    budget_estimate: 50000,
    team_size: 5,
    equipment_needed: [],
    risk_assessment: '',
    nisProtocolActive: true
  })

  const [routeVisualization, setRouteVisualization] = useState<{
    waypoints: Array<{site: ArchaeologicalSite, order: number, travel_time: number}>
    total_distance_km: number
    total_time_hours: number
    optimization_score: number
    cultural_correlation_score: number
  } | null>(null)

  const [siteCorrelations, setSiteCorrelations] = useState<Array<{
    site1: string
    site2: string
    correlation_type: 'cultural' | 'temporal' | 'spatial' | 'trade_route' | 'defensive'
    confidence: number
    description: string
  }>>([])

  // Check NIS Protocol backend status
  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/system/health')
      setBackendOnline(response.ok)
      if (response.ok) {
        console.log('✅ NIS Protocol backend online on port 8002')
      }
    } catch {
      setBackendOnline(false)
      console.log('❌ NIS Protocol backend offline')
    }
  }, [])

  // Generate optimal research route (moved up to fix dependency issue)
  const generateOptimalRoute = useCallback(async () => {
    if (researchPlan.planned_sites.length < 2) return
    
    console.log('🗺️ Generating optimal research route...')
    
    try {
      // Calculate distances and travel times between all sites
      const sites = researchPlan.planned_sites
      const distanceMatrix: number[][] = []
      
      for (let i = 0; i < sites.length; i++) {
        distanceMatrix[i] = []
        for (let j = 0; j < sites.length; j++) {
          const [lat1, lng1] = sites[i].coordinates.split(',').map(c => parseFloat(c.trim()))
          const [lat2, lng2] = sites[j].coordinates.split(',').map(c => parseFloat(c.trim()))
          
          // Haversine distance calculation
          const R = 6371 // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180
          const dLng = (lng2 - lng1) * Math.PI / 180
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          distanceMatrix[i][j] = R * c
        }
      }
      
      // Simple greedy optimization (start from first site, always go to nearest unvisited)
      const visited = new Array(sites.length).fill(false)
      const route: number[] = [0]
      visited[0] = true
      let totalDistance = 0
      
      for (let i = 1; i < sites.length; i++) {
        let minDistance = Infinity
        let nextSite = -1
        
        for (let j = 0; j < sites.length; j++) {
          if (!visited[j] && distanceMatrix[route[route.length - 1]][j] < minDistance) {
            minDistance = distanceMatrix[route[route.length - 1]][j]
            nextSite = j
          }
        }
        
        if (nextSite !== -1) {
          route.push(nextSite)
          visited[nextSite] = true
          totalDistance += minDistance
        }
      }
      
      // Generate route visualization data
      const waypoints = route.map((siteIndex, order) => ({
        site: sites[siteIndex],
        order: order + 1,
        travel_time: order === 0 ? 0 : distanceMatrix[route[order - 1]][siteIndex] / 60 // Assume 60 km/h average
      }))
      
      // Calculate cultural correlation score
      const culturalScore = calculateCulturalCorrelation(sites)
      
      setRouteVisualization({
        waypoints,
        total_distance_km: Math.round(totalDistance),
        total_time_hours: Math.round(totalDistance / 60 * 10) / 10,
        optimization_score: 0.85, // Simplified score
        cultural_correlation_score: culturalScore
      })
      
      console.log('✅ Route optimization complete:', waypoints.length, 'waypoints')
      
    } catch (error) {
      console.error('❌ Route generation failed:', error)
    }
  }, [researchPlan.planned_sites])

  // Calculate cultural correlation between sites
  const calculateCulturalCorrelation = useCallback((sites: ArchaeologicalSite[]): number => {
    if (sites.length < 2) return 0
    
    let totalCorrelation = 0
    let comparisons = 0
    
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        const site1 = sites[i]
        const site2 = sites[j]
        
        // Calculate correlation based on type, period, and cultural significance
        let correlation = 0
        
        // Type similarity
        if (site1.type === site2.type) correlation += 0.3
        
        // Period similarity (simplified)
        if (site1.period === site2.period) correlation += 0.4
        
        // Cultural significance keywords overlap
        const keywords1 = site1.cultural_significance.toLowerCase().split(' ')
        const keywords2 = site2.cultural_significance.toLowerCase().split(' ')
        const overlap = keywords1.filter(k => keywords2.includes(k)).length
        correlation += Math.min(overlap / keywords1.length, 0.3)
        
        totalCorrelation += correlation
        comparisons++
      }
    }
    
    return comparisons > 0 ? totalCorrelation / comparisons : 0
  }, [])

  // Enhanced site selection for planning (moved up to fix dependency issue)
  const handleSiteSelection = useCallback((site: ArchaeologicalSite, addToPlan: boolean = false) => {
    setSelectedSite(site)
    
    if (addToPlan && planningMode) {
      setResearchPlan(prev => ({
        ...prev,
        planned_sites: prev.planned_sites.some(s => s.id === site.id) 
          ? prev.planned_sites.filter(s => s.id !== site.id)
          : [...prev.planned_sites, site]
      }))
      
      // Auto-generate route when sites are added (temporarily disabled to fix dependencies)
      // if (researchPlan.planned_sites.length > 0) {
      //   generateOptimalRoute()
      // }
    }
    
    // Focus map on site
    if (googleMapRef.current) {
      const [lat, lng] = site.coordinates.split(',').map(c => parseFloat(c.trim()))
      googleMapRef.current.setCenter({ lat, lng })
      googleMapRef.current.setZoom(12)
    }
  }, [planningMode, researchPlan.planned_sites])

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
      
      // Plot all discoveries as markers
      plotAllDiscoveries()
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error)
      setMapError('Failed to initialize map')
    }
  }, [mapCenter, mapZoom, googleMapsLoaded])

  // Plot all archaeological discoveries on the map
  const plotAllDiscoveries = useCallback(() => {
    if (!googleMapRef.current || !window.google || sites.length === 0) {
      console.log('🗺️ Map or sites not ready for plotting')
      return
    }

    console.log('🗺️ Plotting', sites.length, 'archaeological discoveries...')

    // Clear existing markers
    if (window.currentMarkers) {
      window.currentMarkers.forEach((marker: any) => marker.setMap(null))
    }
    window.currentMarkers = []

    sites.forEach((site, index) => {
      try {
        const [lat, lng] = site.coordinates.split(',').map(c => parseFloat(c.trim()))
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`⚠️ Invalid coordinates for site ${site.name}: ${site.coordinates}`)
          return
        }

        // Determine marker color based on site type and confidence
        const getMarkerColor = () => {
          if (site.confidence >= 0.85) return '#10B981' // Green for high confidence
          if (site.confidence >= 0.70) return '#F59E0B' // Yellow for medium confidence
          return '#EF4444' // Red for lower confidence
        }

        // Determine marker icon based on site type
        const getMarkerIcon = () => {
          const color = getMarkerColor()
          const symbols = {
            'settlement': '🏘️',
            'ceremonial': '⛩️',
            'burial': '⚱️',
            'agricultural': '🌾',
            'trade': '🏪',
            'defensive': '🏰'
          }
          
          return {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: site.confidence >= 0.85 ? 12 : 
                   site.confidence >= 0.70 ? 10 : 8
          }
        }

        // Create marker
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: site.name,
          icon: getMarkerIcon(),
          animation: window.google.maps.Animation.DROP
        })

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 300px; color: #1f2937;">
              <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
                ${site.name}
              </h3>
              <div style="margin-bottom: 8px;">
                <span style="background: ${getMarkerColor()}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                  ${(site.confidence * 100).toFixed(1)}% confidence
                </span>
                <span style="background: #6B7280; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 4px;">
                  ${site.type}
                </span>
              </div>
              <p style="margin: 8px 0; font-size: 14px; color: #374151;">
                <strong>Period:</strong> ${site.period}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #374151;">
                <strong>Significance:</strong> ${site.cultural_significance}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #374151;">
                <strong>Coordinates:</strong> ${site.coordinates}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #374151;">
                <strong>Data Sources:</strong> ${site.data_sources.join(', ')}
              </p>
              ${site.size_hectares ? `
                <p style="margin: 8px 0; font-size: 14px; color: #374151;">
                  <strong>Size:</strong> ${site.size_hectares} hectares
                </p>
              ` : ''}
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                <button onclick="window.selectSiteFromMap('${site.id}')" 
                        style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                  Select Site
                </button>
              </div>
            </div>
          `
        })

        // Add click listener
        marker.addListener('click', () => {
          // Close other info windows
          if (window.currentInfoWindow) {
            window.currentInfoWindow.close()
          }
          
          infoWindow.open(googleMapRef.current, marker)
          window.currentInfoWindow = infoWindow
          
          // Update selected site
          handleSiteSelection(site)
        })

        // Store marker reference
        window.currentMarkers.push(marker)

        console.log(`📍 Plotted ${site.name} at ${lat}, ${lng} (${(site.confidence * 100).toFixed(1)}% confidence)`)
      } catch (error) {
        console.error(`❌ Failed to plot marker for ${site.name}:`, error)
      }
    })

    console.log(`✅ Successfully plotted ${window.currentMarkers.length} discovery markers`)

    // Add site selection function to window
    window.selectSiteFromMap = (siteId: string) => {
      const site = sites.find(s => s.id === siteId)
      if (site) {
        handleSiteSelection(site, true)
      }
    }

  }, [sites, handleSiteSelection])

  // Set up Google Maps callback
  useEffect(() => {
    window.initGoogleMaps = () => {
      console.log('🗺️ Google Maps API loaded via callback')
      setGoogleMapsLoaded(true)
    }
    
    // Cleanup
    return () => {
      delete window.initGoogleMaps
    }
  }, [])

  // Plot markers when sites change and map is ready
  useEffect(() => {
    if (sites.length > 0 && googleMapRef.current && googleMapsLoaded) {
      console.log('🗺️ Sites loaded, plotting', sites.length, 'markers...')
      plotAllDiscoveries()
    }
  }, [sites, googleMapsLoaded, plotAllDiscoveries])

  // Load archaeological sites from NIS Protocol backend
  const loadSites = useCallback(async () => {
    setLoading(true)
    try {
      if (backendOnline) {
        const response = await fetch('http://localhost:8000/research/sites?max_sites=148')
        if (response.ok) {
          const data = await response.json()
          setSites(data)
          console.log('✅ NIS Protocol: Loaded', data.length, 'archaeological sites from 148 total discoveries')
          
          // Plot markers after sites are loaded
          setTimeout(() => {
            if (googleMapRef.current && window.google) {
              plotAllDiscoveries()
            }
          }, 1000)
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

  // Plot markers when sites change
  useEffect(() => {
    if (sites.length > 0 && googleMapRef.current) {
      console.log('🗺️ Sites loaded, plotting markers...')
      plotAllDiscoveries()
    }
  }, [sites, plotAllDiscoveries])

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
        console.log('📍 Google Maps not available - continuing with static interface')
        // Don't set an error, just continue with the interface
        setMapError(null)
      }
    }, 5000) // Reduced timeout

    return () => clearTimeout(timer)
  }, [googleMapsLoaded])

  // Check if Google Maps is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && !googleMapsLoaded) {
      console.log('🗺️ Google Maps already loaded, setting state...')
      setGoogleMapsLoaded(true)
    }
  }, [googleMapsLoaded])

  // NIS Protocol chat integration for planning
  const handleChatPlanningSelect = useCallback((coordinates: string, metadata?: any) => {
    console.log('🧠 NIS Protocol planning integration:', coordinates, metadata)
    
    if (metadata?.planning_action === 'add_to_expedition') {
      // Find site by coordinates and add to plan
      const site = sites.find(s => s.coordinates === coordinates)
      if (site) {
        handleSiteSelection(site, true)
      }
    } else if (metadata?.planning_action === 'optimize_route') {
      generateOptimalRoute()
    } else if (metadata?.planning_action === 'cultural_analysis') {
      generateSiteCorrelations()
    }
  }, [sites, handleSiteSelection, generateOptimalRoute])

  // Generate site correlations for planning
  const generateSiteCorrelations = useCallback(async () => {
    console.log('🔗 Generating site correlations...')
    
    const correlations: Array<{
      site1: string
      site2: string
      correlation_type: 'cultural' | 'temporal' | 'spatial' | 'trade_route' | 'defensive'
      confidence: number
      description: string
    }> = []
    
    // Simple correlation analysis based on available data
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        const site1 = sites[i]
        const site2 = sites[j]
        
        // Calculate distance
        const [lat1, lng1] = site1.coordinates.split(',').map(c => parseFloat(c.trim()))
        const [lat2, lng2] = site2.coordinates.split(',').map(c => parseFloat(c.trim()))
        const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2))
        
        // Cultural correlation
        if (site1.type === site2.type && site1.period === site2.period) {
          correlations.push({
            site1: site1.name,
            site2: site2.name,
            correlation_type: 'cultural',
            confidence: 0.85,
            description: `Both sites are ${site1.type} from ${site1.period} period`
          })
        }
        
        // Spatial correlation (nearby sites)
        if (distance < 0.5) { // Within ~50km
          correlations.push({
            site1: site1.name,
            site2: site2.name,
            correlation_type: 'spatial',
            confidence: 0.78,
            description: `Sites are geographically proximate (${Math.round(distance * 100)}km apart)`
          })
        }
        
        // Trade route correlation (different types, same period)
        if (site1.type !== site2.type && site1.period === site2.period && distance < 2.0) {
          correlations.push({
            site1: site1.name,
            site2: site2.name,
            correlation_type: 'trade_route',
            confidence: 0.72,
            description: `Different site types from same period suggest trade connections`
          })
        }
      }
    }
    
    setSiteCorrelations(correlations)
    console.log('✅ Generated', correlations.length, 'site correlations')
  }, [sites])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-emerald-900/5 to-blue-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

                    {/* Google Maps loaded globally in layout.tsx */}

      <div className="relative z-10 pt-20">
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
                    <TabsTrigger value="sites" className="text-slate-300 data-[state=active]:text-white">
                      Sites
                    </TabsTrigger>
                    <TabsTrigger value="planning" className="text-slate-300 data-[state=active]:text-white">
                      Planning
                    </TabsTrigger>
                    <TabsTrigger value="correlations" className="text-slate-300 data-[state=active]:text-white">
                      Correlations
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-slate-300 data-[state=active]:text-white">
                      AI Assistant
                    </TabsTrigger>
                  </TabsList>

                  {/* Sites Tab */}
                  <TabsContent value="sites" className="space-y-4 mt-4">
                    {/* Enhanced search and filters */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search" className="text-slate-300">Search Sites</Label>
                        <Input
                          id="search"
                          placeholder="Search by name or significance..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Type Filter</Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="settlement">Settlement</SelectItem>
                              <SelectItem value="ceremonial">Ceremonial</SelectItem>
                              <SelectItem value="agricultural">Agricultural</SelectItem>
                              <SelectItem value="defensive">Defensive</SelectItem>
                              <SelectItem value="burial">Burial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300">Min Confidence: {confidenceFilter}%</Label>
                          <Slider
                            value={[confidenceFilter]}
                            onValueChange={(value) => setConfidenceFilter(value[0])}
                            max={100}
                            min={0}
                            step={5}
                            className="bg-slate-800"
                          />
                        </div>
                      </div>
                      
                      {planningMode && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                              <span className="text-emerald-300 font-medium">Planning Mode Active</span>
                            </div>
                            <Badge variant="outline" className="text-emerald-300 border-emerald-300">
                              {researchPlan.planned_sites.length} sites selected
                            </Badge>
                          </div>
                          <p className="text-emerald-200 text-sm mt-2">
                            Click sites to add/remove from research expedition plan
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sites list with planning integration */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {loading ? (
                        <div className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                          <p className="text-slate-400 mt-2">Loading archaeological sites...</p>
                        </div>
                      ) : (
                        sites
                          .filter(site => site.confidence * 100 >= confidenceFilter)
                          .filter(site => typeFilter === 'all' || site.type === typeFilter)
                          .filter(site => !searchQuery || site.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((site) => (
                            <Card 
                              key={site.id} 
                              className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:bg-slate-800/70 ${
                                selectedSite?.id === site.id ? 'ring-2 ring-emerald-500' : ''
                              } ${
                                planningMode && researchPlan.planned_sites.some(s => s.id === site.id) 
                                  ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
                              }`}
                              onClick={() => handleSiteSelection(site, planningMode)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-white">{site.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={site.confidence > 0.8 ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {Math.round(site.confidence * 100)}%
                                    </Badge>
                                    {planningMode && researchPlan.planned_sites.some(s => s.id === site.id) && (
                                      <Badge variant="outline" className="text-blue-300 border-blue-300 text-xs">
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  <p className="text-slate-300">
                                    <span className="text-slate-400">Type:</span> {site.type}
                                  </p>
                                  <p className="text-slate-300">
                                    <span className="text-slate-400">Period:</span> {site.period}
                                  </p>
                                  <p className="text-slate-300">
                                    <span className="text-slate-400">Location:</span> {site.coordinates}
                                  </p>
                                  {site.size_hectares && (
                                    <p className="text-slate-300">
                                      <span className="text-slate-400">Size:</span> {site.size_hectares} hectares
                                    </p>
                                  )}
                                </div>
                                
                                <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                                  {site.cultural_significance}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Enhanced Planning Tab */}
                  <TabsContent value="planning" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Research Expedition Planning</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setPlanningMode(!planningMode)}
                          variant={planningMode ? "default" : "outline"}
                          size="sm"
                        >
                          {planningMode ? 'Exit Planning' : 'Start Planning'}
                        </Button>
                        <Button
                          onClick={generateOptimalRoute}
                          disabled={researchPlan.planned_sites.length < 2}
                          size="sm"
                        >
                          Optimize Route
                        </Button>
                      </div>
                    </div>
                    
                    {/* Planning Configuration */}
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Expedition Name</Label>
                            <Input
                              value={researchPlan.expedition_name}
                              onChange={(e) => setResearchPlan(prev => ({ ...prev, expedition_name: e.target.value }))}
                              placeholder="Enter expedition name..."
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-slate-300">Timeline (days)</Label>
                            <Input
                              type="number"
                              value={researchPlan.timeline_days}
                              onChange={(e) => setResearchPlan(prev => ({ ...prev, timeline_days: parseInt(e.target.value) || 7 }))}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-slate-300">Team Size</Label>
                            <Input
                              type="number"
                              value={researchPlan.team_size}
                              onChange={(e) => setResearchPlan(prev => ({ ...prev, team_size: parseInt(e.target.value) || 5 }))}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-slate-300">Budget Estimate ($)</Label>
                            <Input
                              type="number"
                              value={researchPlan.budget_estimate}
                              onChange={(e) => setResearchPlan(prev => ({ ...prev, budget_estimate: parseInt(e.target.value) || 50000 }))}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                        
                        {/* NIS Protocol Enhancement Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <Brain className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-white font-medium">NIS Protocol Enhancement</p>
                              <p className="text-slate-400 text-sm">Biologically-inspired planning optimization</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setResearchPlan(prev => ({ ...prev, nisProtocolActive: !prev.nisProtocolActive }))}
                            variant={researchPlan.nisProtocolActive ? "default" : "outline"}
                            size="sm"
                          >
                            {researchPlan.nisProtocolActive ? 'Active' : 'Inactive'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Selected Sites for Planning */}
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-white mb-3">
                          Selected Sites ({researchPlan.planned_sites.length})
                        </h4>
                        
                        {researchPlan.planned_sites.length === 0 ? (
                          <p className="text-slate-400 text-sm">
                            No sites selected. Enable planning mode and click sites to add them to your expedition.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {researchPlan.planned_sites.map((site, index) => (
                              <div key={site.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                  <div>
                                    <p className="text-white font-medium text-sm">{site.name}</p>
                                    <p className="text-slate-400 text-xs">{site.type} • {site.period}</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => setResearchPlan(prev => ({
                                    ...prev,
                                    planned_sites: prev.planned_sites.filter(s => s.id !== site.id)
                                  }))}
                                  variant="outline"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Route Visualization */}
                    {routeVisualization && (
                      <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-white mb-3">Optimized Research Route</h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Total Distance</p>
                              <p className="text-white font-semibold">{routeVisualization.total_distance_km} km</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Travel Time</p>
                              <p className="text-white font-semibold">{routeVisualization.total_time_hours}h</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Route Score</p>
                              <p className="text-white font-semibold">{Math.round(routeVisualization.optimization_score * 100)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Cultural Score</p>
                              <p className="text-white font-semibold">{Math.round(routeVisualization.cultural_correlation_score * 100)}%</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="font-medium text-slate-300 mb-2">Route Waypoints</h5>
                            {routeVisualization.waypoints.map((waypoint, index) => (
                              <div key={`waypoint-${waypoint.order}-${index}`} className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                                <Badge variant="outline">{waypoint.order}</Badge>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">{waypoint.site.name}</p>
                                  <p className="text-slate-400 text-xs">{waypoint.site.coordinates}</p>
                                </div>
                                {waypoint.travel_time > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{Math.round(waypoint.travel_time * 10) / 10}h
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Site Correlations Tab */}
                  <TabsContent value="correlations" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Site Correlations & Pattern Analysis</h3>
                      <Button onClick={generateSiteCorrelations} size="sm">
                        Analyze Correlations
                      </Button>
                    </div>
                    
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardContent className="p-4">
                        {siteCorrelations.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-slate-400">No correlations generated yet.</p>
                            <p className="text-slate-500 text-sm mt-1">
                              Click "Analyze Correlations" to discover patterns between archaeological sites
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white mb-3">
                              Discovered Correlations ({siteCorrelations.length})
                            </h4>
                            {siteCorrelations.map((correlation, index) => (
                              <div key={`correlation-${correlation.site1}-${correlation.site2}-${index}`} className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={
                                        correlation.correlation_type === 'cultural' ? 'default' :
                                        correlation.correlation_type === 'temporal' ? 'secondary' :
                                        correlation.correlation_type === 'spatial' ? 'outline' :
                                        'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {correlation.correlation_type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(correlation.confidence * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-white font-medium text-sm">
                                    {correlation.site1} ↔ {correlation.site2}
                                  </p>
                                  <p className="text-slate-300 text-xs">
                                    {correlation.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Enhanced Chat Tab */}
                  <TabsContent value="chat" className="mt-4">
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-white">🧠 NIS Protocol Planning Assistant</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-emerald-300 text-sm">Enhanced Planning Mode</span>
                          </div>
                        </div>
                        
                        <div className="h-[500px]">
                          <UltimateArchaeologicalChat onCoordinateSelect={handleChatPlanningSelect} />
                        </div>
                        
                        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <h5 className="font-medium text-purple-300 mb-2">Enhanced Planning Commands</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-200">
                            {[
                              "plan expedition to ceremonial sites",
                              "optimize route for selected sites", 
                              "analyze cultural correlations",
                              "suggest sites near [coordinates]",
                              "estimate expedition timeline",
                              "find defensive sites in andes"
                            ].map((command, index) => (
                              <p key={`planning-command-${index}`}>• "{command}"</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  <UltimateArchaeologicalChat />
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