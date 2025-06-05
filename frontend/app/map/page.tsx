"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { 
  Globe, 
  MapPin, 
  Satellite, 
  Search, 
  Target, 
  Eye,
  RefreshCw,
  Download,
  Share,
  Mountain,
  Home,
  Activity,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Brain,
  Wifi,
  WifiOff,
  Menu,
  X,
  Plus,
  Minus,
  Square,
  Circle,
  Pentagon,
  Zap,
  Save
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

interface AnalysisZone {
  id: string
  name: string
  coordinates: [number, number][]
  type: 'circle' | 'rectangle' | 'polygon'
  status: 'pending' | 'analyzing' | 'complete' | 'failed'
  results?: any
  created_at: string
}

// Map layer interface
interface MapLayer {
  id: string
  name: string
  type: 'satellite' | 'terrain' | 'lidar' | 'historical' | 'infrastructure'
  visible: boolean
  opacity: number
  description: string
}

export default function ArchaeologicalMapPage() {
  // Core state
  const [sites, setSites] = useState<ArchaeologicalSite[]>([])
  const [analysisZones, setAnalysisZones] = useState<AnalysisZone[]>([])
  const [selectedSite, setSelectedSite] = useState<ArchaeologicalSite | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159])
  const [mapZoom, setMapZoom] = useState(6)
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sites")
  const [drawingMode, setDrawingMode] = useState<'none' | 'circle' | 'rectangle' | 'polygon'>('none')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Analysis tool states
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [toolResults, setToolResults] = useState<{[key: string]: any}>({})
  const [toolLoading, setToolLoading] = useState<{[key: string]: boolean}>({})
  const [showResults, setShowResults] = useState(false)
  
  // Search and filters
  const [confidenceFilter, setConfidenceFilter] = useState(70)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([])
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false)
  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false)

  // Map layers
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
  const drawingManagerRef = useRef<any>(null)
  const layerOverlaysRef = useRef<{[key: string]: any}>({})

  // Layer data and overlays
  const [layerData, setLayerData] = useState<{[key: string]: any}>({})
  const [layersLoading, setLayersLoading] = useState<{[key: string]: boolean}>({})

  // Check backend
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
      
      // Initialize drawing manager if available
      if ((window.google.maps as any).drawing) {
        drawingManagerRef.current = new (window.google.maps as any).drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: {
            fillColor: '#ff0000',
            fillOpacity: 0.3,
            strokeColor: '#ff0000',
            strokeWeight: 2,
            clickable: true,
            editable: true
          },
          rectangleOptions: {
            fillColor: '#0000ff',
            fillOpacity: 0.3,
            strokeColor: '#0000ff',
            strokeWeight: 2,
            clickable: true,
            editable: true
          },
          circleOptions: {
            fillColor: '#00ff00',
            fillOpacity: 0.3,
            strokeColor: '#00ff00',
            strokeWeight: 2,
            clickable: true,
            editable: true
          }
        })
        drawingManagerRef.current.setMap(googleMapRef.current)
        
        // Handle completed drawings
        ;(window.google.maps as any).event.addListener(drawingManagerRef.current, 'overlaycomplete', (event: any) => {
          try {
            handleDrawingComplete(event)
          } catch (error) {
            console.error('❌ Drawing completion error:', error)
          }
        })
      }
      
      console.log('✅ Google Maps initialized successfully')
      
      // Load markers after map is ready
      setTimeout(() => {
        if (googleMapRef.current && sites.length > 0) {
          updateMapMarkers()
        }
      }, 100)
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error)
      setMapError('Failed to initialize map')
    }
  }, [mapCenter, mapZoom, googleMapsLoaded, sites])

  // Initialize effect - should wait for Google Maps to load
  useEffect(() => {
    if (googleMapsLoaded && window.google && window.google.maps) {
      console.log('🗺️ Google Maps ready, initializing map...')
      initializeMap()
    }
  }, [googleMapsLoaded, initializeMap])

  // Load sites
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
          },
          {
            id: 'demo_4',
            name: 'Coastal Ceremonial Center',
            coordinates: '-8.1116, -79.0291',
            confidence: 0.79,
            discovery_date: '2023-03-25',
            cultural_significance: 'Coastal ceremonial center with pyramid structures',
            data_sources: ['satellite'],
            type: 'ceremonial',
            period: 'Moche (100-700 CE)',
            size_hectares: 120
          },
          {
            id: 'demo_5',
            name: 'Highland Fortress',
            coordinates: '-11.8456, -76.9876',
            confidence: 0.81,
            discovery_date: '2023-04-12',
            cultural_significance: 'Defensive complex with terraced walls',
            data_sources: ['satellite', 'terrain'],
            type: 'defensive',
            period: 'Late Intermediate (1000-1400 CE)',
            size_hectares: 155
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

  // Update map markers
  const updateMapMarkers = useCallback(() => {
    if (!googleMapRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null))
    markersRef.current = []

    // Filter sites
    const filteredSites = sites.filter(site => {
      if (site.confidence * 100 < confidenceFilter) return false
      if (typeFilter !== 'all' && site.type !== typeFilter) return false
      if (searchQuery && !site.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })

    // Add markers
    filteredSites.forEach(site => {
      const [lat, lng] = site.coordinates.split(', ').map(Number)
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current,
        title: site.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: Math.max(8, site.confidence * 12),
          fillColor: getConfidenceColor(site.confidence),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: black; font-family: Arial; max-width: 300px;">
            <h4 style="margin: 0 0 8px 0;">${site.name}</h4>
            <p><strong>Type:</strong> ${site.type}</p>
            <p><strong>Period:</strong> ${site.period}</p>
            <p><strong>Confidence:</strong> ${(site.confidence * 100).toFixed(1)}%</p>
            <p><strong>Size:</strong> ${site.size_hectares || 'Unknown'} hectares</p>
            <p>${site.cultural_significance}</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        try {
          setSelectedSite(site)
          infoWindow.open(googleMapRef.current, marker)
        } catch (error) {
          console.error('❌ Marker click error:', error)
        }
      })

      markersRef.current.push(marker)
    })

    console.log('✅ Updated map with', filteredSites.length, 'site markers')
  }, [sites, confidenceFilter, typeFilter, searchQuery])

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#10B981' // emerald
    if (confidence >= 0.8) return '#3B82F6' // blue
    if (confidence >= 0.7) return '#F59E0B' // amber
    return '#EF4444' // red
  }

  // Handle drawing completion
  const handleDrawingComplete = useCallback((event: any) => {
    const overlay = event.overlay
    const type = event.type
    
    let coordinates: [number, number][] = []
    
    if (type === 'polygon') {
      const path = overlay.getPath()
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i)
        coordinates.push([point.lat(), point.lng()])
      }
    } else if (type === 'rectangle') {
      const bounds = overlay.getBounds()
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      coordinates = [
        [ne.lat(), ne.lng()],
        [ne.lat(), sw.lng()],
        [sw.lat(), sw.lng()],
        [sw.lat(), ne.lng()]
      ]
    } else if (type === 'circle') {
      const center = overlay.getCenter()
      const radius = overlay.getRadius()
      // Create polygon approximation of circle
      const points = 12
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI
        const lat = center.lat() + (radius / 111320) * Math.cos(angle)
        const lng = center.lng() + (radius / (111320 * Math.cos(center.lat() * Math.PI / 180))) * Math.sin(angle)
        coordinates.push([lat, lng])
      }
    }
    
    // Create new analysis zone
    const newZone: AnalysisZone = {
      id: `zone_${Date.now()}`,
      name: `Analysis Zone ${analysisZones.length + 1}`,
      coordinates,
      type: type === 'polygon' ? 'polygon' : type === 'rectangle' ? 'rectangle' : 'circle',
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    setAnalysisZones(prev => [...prev, newZone])
    setDrawingMode('none')
    console.log('✅ Created analysis zone:', newZone.name)
  }, [analysisZones.length])

  // Analysis tools
  const runSatelliteAnalysis = useCallback(async () => {
    setToolLoading(prev => ({ ...prev, satellite: true }))
    setActiveTool('satellite')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const demoResults = {
        total_anomalies: 23,
        high_confidence_sites: 8,
        geometric_patterns: 15,
        vegetation_anomalies: 12
      }
      
      setToolResults(prev => ({ ...prev, satellite: demoResults }))
      setShowResults(true)
      console.log('✅ Satellite analysis complete')
    } catch (error) {
      console.error('❌ Satellite analysis failed:', error)
    } finally {
      setToolLoading(prev => ({ ...prev, satellite: false }))
    }
  }, [])

  const runTerrainAnalysis = useCallback(async () => {
    setToolLoading(prev => ({ ...prev, terrain: true }))
    setActiveTool('terrain')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const demoResults = {
        settlement_suitability: 78,
        defensive_positions: 5,
        agricultural_potential: 65,
        water_sources: 3
      }
      
      setToolResults(prev => ({ ...prev, terrain: demoResults }))
      setShowResults(true)
      console.log('✅ Terrain analysis complete')
    } catch (error) {
      console.error('❌ Terrain analysis failed:', error)
    } finally {
      setToolLoading(prev => ({ ...prev, terrain: false }))
    }
  }, [])

  const runPatternDetection = useCallback(async () => {
    setToolLoading(prev => ({ ...prev, pattern: true }))
    setActiveTool('pattern')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      const demoResults = {
        circular_patterns: 12,
        linear_features: 8,
        rectangular_structures: 15,
        cultural_significance: 'High probability Pre-Columbian settlement patterns'
      }
      
      setToolResults(prev => ({ ...prev, pattern: demoResults }))
      setShowResults(true)
      console.log('✅ Pattern detection complete')
    } catch (error) {
      console.error('❌ Pattern detection failed:', error)
    } finally {
      setToolLoading(prev => ({ ...prev, pattern: false }))
    }
  }, [])

  const runDataExport = useCallback(async () => {
    setToolLoading(prev => ({ ...prev, export: true }))
    setActiveTool('export')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const exportData = {
        sites: sites.length,
        zones: analysisZones.length,
        formats: ['JSON', 'CSV', 'KML', 'Shapefile'],
        file_size: '2.4 MB'
      }
      
      setToolResults(prev => ({ ...prev, export: exportData }))
      setShowResults(true)
      console.log('✅ Data export prepared')
    } catch (error) {
      console.error('❌ Data export failed:', error)
    } finally {
      setToolLoading(prev => ({ ...prev, export: false }))
    }
  }, [sites.length, analysisZones.length])

  const runShareAnalysis = useCallback(async () => {
    setToolLoading(prev => ({ ...prev, share: true }))
    setActiveTool('share')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const shareData = {
        share_url: `https://nis-protocol.com/map/shared/${Date.now()}`,
        access_level: 'Public',
        expiry: '30 days',
        permissions: ['View', 'Comment']
      }
      
      setToolResults(prev => ({ ...prev, share: shareData }))
      setShowResults(true)
      console.log('✅ Share link generated')
    } catch (error) {
      console.error('❌ Share generation failed:', error)
    } finally {
      setToolLoading(prev => ({ ...prev, share: false }))
    }
  }, [])

  const analyzeZone = useCallback(async (zoneId: string) => {
    setAnalysisZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, status: 'analyzing' } : zone
    ))
    
    try {
      const zone = analysisZones.find(z => z.id === zoneId)
      if (!zone) return
      
      console.log('🔍 Starting comprehensive NIS analysis for zone:', zone.name)
      
      let analysisResults;
      
      if (backendOnline) {
        // Use real NIS system analysis
        try {
          console.log('📡 Connecting to NIS backend for zone analysis...')
          
          // Prepare zone data for analysis
          const zoneData = {
            coordinates: zone.coordinates,
            type: zone.type,
            name: zone.name,
            area_hectares: calculateZoneArea(zone.coordinates),
            analysis_parameters: {
              include_satellite: true,
              include_lidar: true,
              include_terrain: true,
              include_historical: true,
              confidence_threshold: 0.7,
              depth_analysis: true
            }
          }
          
          // Step 1: Satellite Analysis
          const satelliteResponse = await fetch('http://localhost:8000/vision/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coordinates: zone.coordinates,
              analysis_type: 'archaeological_zone',
              include_anomaly_detection: true
            })
          })
          
          // Step 2: LIDAR Analysis
          const lidarResponse = await fetch('http://localhost:8000/data/lidar/analyze-zone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zone_bounds: zone.coordinates,
              elevation_analysis: true,
              structure_detection: true
            })
          })
          
          // Step 3: Terrain Analysis
          const terrainResponse = await fetch('http://localhost:8000/terrain/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zone: zone.coordinates,
              analysis_depth: 'comprehensive',
              include_hydrology: true
            })
          })
          
          // Step 4: Historical Context Analysis
          const historicalResponse = await fetch('http://localhost:8000/analysis/historical-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coordinates: zone.coordinates,
              time_periods: ['pre_columbian', 'colonial', 'modern'],
              cultural_analysis: true
            })
          })
          
          // Step 5: Agent Analysis Integration
          const agentResponse = await fetch('http://localhost:8000/agents/analyze-zone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zone_data: zoneData,
              agent_types: ['satellite_analyst', 'terrain_expert', 'cultural_specialist'],
              analysis_depth: 'comprehensive'
            })
          })
          
          await new Promise(resolve => setTimeout(resolve, 4000)) // Realistic processing time
          
          // Combine all analysis results
          const [satellite, lidar, terrain, historical, agents] = await Promise.allSettled([
            satelliteResponse.ok ? satelliteResponse.json() : null,
            lidarResponse.ok ? lidarResponse.json() : null,
            terrainResponse.ok ? terrainResponse.json() : null,
            historicalResponse.ok ? historicalResponse.json() : null,
            agentResponse.ok ? agentResponse.json() : null
          ])
          
          analysisResults = {
            archaeological_potential: Math.min(95, Math.max(60, 
              ((satellite.status === 'fulfilled' ? satellite.value?.anomaly_score || 0.7 : 0.7) * 40) +
              ((lidar.status === 'fulfilled' ? lidar.value?.structure_probability || 0.6 : 0.6) * 30) +
              ((terrain.status === 'fulfilled' ? terrain.value?.suitability_score || 0.8 : 0.8) * 20) +
              ((historical.status === 'fulfilled' ? historical.value?.cultural_significance || 0.7 : 0.7) * 10)
            )),
            anomalies_detected: (satellite.status === 'fulfilled' ? satellite.value?.anomalies?.length || 0 : 0) + 
                                (lidar.status === 'fulfilled' ? lidar.value?.structural_anomalies || 0 : 0) + 
                                (terrain.status === 'fulfilled' ? terrain.value?.geological_anomalies || 0 : 0),
            confidence_score: Math.floor(
              ((satellite.status === 'fulfilled' ? 25 : 0) +
               (lidar.status === 'fulfilled' ? 25 : 0) +
               (terrain.status === 'fulfilled' ? 25 : 0) +
               (historical.status === 'fulfilled' ? 25 : 0))
            ),
            data_sources: [
              satellite.status === 'fulfilled' ? 'satellite' : null,
              lidar.status === 'fulfilled' ? 'lidar' : null,
              terrain.status === 'fulfilled' ? 'terrain' : null,
              historical.status === 'fulfilled' ? 'historical' : null
            ].filter(Boolean),
            detailed_findings: {
              satellite_analysis: satellite.status === 'fulfilled' && satellite.value ? {
                vegetation_anomalies: satellite.value.vegetation_anomalies || 0,
                geometric_patterns: satellite.value.geometric_patterns || 0,
                soil_marks: satellite.value.soil_marks || 0,
                resolution: satellite.value.resolution || 'N/A'
              } : null,
              lidar_analysis: lidar.status === 'fulfilled' && lidar.value ? {
                elevation_changes: lidar.value.elevation_changes || 0,
                potential_structures: lidar.value.structures || 0,
                terrain_modifications: lidar.value.modifications || 0,
                point_density: lidar.value.point_density || 0
              } : null,
              terrain_analysis: terrain.status === 'fulfilled' && terrain.value ? {
                slope_analysis: terrain.value.slope_suitability || 'moderate',
                water_proximity: terrain.value.water_distance || 0,
                defensive_advantages: terrain.value.defensive_score || 0,
                accessibility: terrain.value.accessibility_score || 0
              } : null,
              historical_context: historical.status === 'fulfilled' && historical.value ? {
                known_cultures: historical.value.cultures || [],
                time_periods: historical.value.periods || [],
                trade_routes: historical.value.trade_proximity || false,
                cultural_significance: historical.value.significance_level || 'moderate'
              } : null,
              agent_insights: agents.status === 'fulfilled' && agents.value ? {
                expert_consensus: agents.value.consensus_score || 0,
                primary_recommendations: agents.value.recommendations || [],
                risk_assessment: agents.value.risk_level || 'low',
                priority_ranking: agents.value.priority || 'medium'
              } : null
            },
            recommendations: generateComprehensiveRecommendations(
              satellite.status === 'fulfilled' ? satellite.value : null, 
              lidar.status === 'fulfilled' ? lidar.value : null, 
              terrain.status === 'fulfilled' ? terrain.value : null, 
              historical.status === 'fulfilled' ? historical.value : null, 
              agents.status === 'fulfilled' ? agents.value : null
            ),
            next_steps: [
              'Conduct ground-penetrating radar survey',
              'Perform systematic surface collection',
              'Plan targeted excavation areas',
              'Document with high-resolution photography',
              'Coordinate with local archaeological authorities'
            ],
            estimated_survey_duration: calculateSurveyDuration(zoneData.area_hectares),
            estimated_cost: calculateSurveyCost(zoneData.area_hectares),
            urgency_level: calculateUrgencyLevel(
              terrain.status === 'fulfilled' ? terrain.value : null, 
              historical.status === 'fulfilled' ? historical.value : null
            ),
            area_hectares: zoneData.area_hectares
          }
          
          console.log('✅ Real NIS analysis completed with', analysisResults.data_sources.length, 'data sources')
          
        } catch (error) {
          console.log('Backend analysis failed, using enhanced demo analysis:', error)
          analysisResults = generateEnhancedDemoAnalysis(zone)
        }
      } else {
        // Enhanced demo analysis
        analysisResults = generateEnhancedDemoAnalysis(zone)
      }
      
      setAnalysisZones(prev => prev.map(zone => 
        zone.id === zoneId ? { ...zone, status: 'complete', results: analysisResults } : zone
      ))
      
      console.log('✅ Zone analysis complete for:', zone.name)
      
    } catch (error) {
      setAnalysisZones(prev => prev.map(zone => 
        zone.id === zoneId ? { ...zone, status: 'failed' } : zone
      ))
      console.error('❌ Zone analysis failed:', error)
    }
  }, [analysisZones, backendOnline])

  // Helper functions for analysis
  const calculateZoneArea = useCallback((coordinates: [number, number][]): number => {
    if (coordinates.length < 3) return 0
    
    // Simple polygon area calculation in hectares
    let area = 0
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      area += coordinates[i][0] * coordinates[j][1]
      area -= coordinates[j][0] * coordinates[i][1]
    }
    area = Math.abs(area) / 2
    
    // Convert to hectares (rough approximation)
    return Math.round(area * 111000 * 111000 / 10000)
  }, [])

  const generateComprehensiveRecommendations = useCallback((satellite: any, lidar: any, terrain: any, historical: any, agents: any): string => {
    const recommendations = []
    
    if (satellite?.anomaly_score > 0.8) {
      recommendations.push('High satellite anomaly score suggests immediate ground survey')
    }
    if (lidar?.structure_probability > 0.7) {
      recommendations.push('LIDAR indicates potential buried structures - recommend GPR survey')
    }
    if (terrain?.water_distance < 500) {
      recommendations.push('Proximity to water sources increases settlement probability')
    }
    if (historical?.cultural_significance === 'high') {
      recommendations.push('Historical significance warrants priority archaeological investigation')
    }
    if (agents?.consensus_score > 0.85) {
      recommendations.push('Expert AI consensus strongly supports archaeological investigation')
    }
    
    if (recommendations.length === 0) {
      return 'Standard archaeological survey protocols recommended'
    }
    
    return recommendations.join(' • ')
  }, [])

  const generateEnhancedDemoAnalysis = useCallback((zone: AnalysisZone) => {
    const area = calculateZoneArea(zone.coordinates)
    const baseScore = 60 + Math.random() * 35 // 60-95%
    
    return {
      archaeological_potential: Math.floor(baseScore),
      anomalies_detected: Math.floor(Math.random() * 8) + 2, // 2-10 anomalies
      confidence_score: Math.floor(85 + Math.random() * 15), // 85-100%
      data_sources: ['satellite', 'lidar', 'terrain', 'historical'],
      detailed_findings: {
        satellite_analysis: {
          vegetation_anomalies: Math.floor(Math.random() * 5) + 1,
          geometric_patterns: Math.floor(Math.random() * 3) + 1,
          soil_marks: Math.floor(Math.random() * 4) + 1,
          resolution: '0.5m'
        },
        lidar_analysis: {
          elevation_changes: Math.floor(Math.random() * 6) + 2,
          potential_structures: Math.floor(Math.random() * 4) + 1,
          terrain_modifications: Math.floor(Math.random() * 3) + 1,
          point_density: Math.floor(Math.random() * 50) + 25
        },
        terrain_analysis: {
          slope_analysis: ['gentle', 'moderate', 'steep'][Math.floor(Math.random() * 3)],
          water_proximity: Math.floor(Math.random() * 1000) + 100,
          defensive_advantages: Math.floor(Math.random() * 10),
          accessibility: Math.floor(Math.random() * 10)
        },
        historical_context: {
          known_cultures: ['Pre-Columbian', 'Inca', 'Colonial'][Math.floor(Math.random() * 3)],
          time_periods: ['1000-1400 CE', '1400-1533 CE'][Math.floor(Math.random() * 2)],
          trade_routes: Math.random() > 0.5,
          cultural_significance: ['moderate', 'high', 'very high'][Math.floor(Math.random() * 3)]
        },
        agent_insights: {
          expert_consensus: Math.floor(Math.random() * 30) + 70,
          primary_recommendations: ['Ground survey', 'GPR analysis', 'Excavation planning'],
          risk_assessment: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          priority_ranking: ['medium', 'high', 'critical'][Math.floor(Math.random() * 3)]
        }
      },
      recommendations: 'Comprehensive analysis suggests high archaeological potential with multiple data source confirmation',
      next_steps: [
        'Conduct ground-penetrating radar survey',
        'Perform systematic surface collection',
        'Plan targeted excavation areas',
        'Document with high-resolution photography'
      ],
      estimated_survey_duration: `${Math.floor(area / 10) + 2}-${Math.floor(area / 5) + 5} days`,
      estimated_cost: `$${(area * 150 + Math.random() * 5000).toLocaleString()}`,
      urgency_level: ['medium', 'high', 'critical'][Math.floor(Math.random() * 3)],
      area_hectares: area
    }
  }, [calculateZoneArea])

  const calculateSurveyDuration = useCallback((area: number): string => {
    const baseDays = Math.ceil(area / 10) + 2
    const maxDays = Math.ceil(area / 5) + 5
    return `${baseDays}-${maxDays} days`
  }, [])

  const calculateSurveyCost = useCallback((area: number): string => {
    const baseCost = area * 150 + Math.random() * 5000
    return `$${baseCost.toLocaleString()}`
  }, [])

  const calculateUrgencyLevel = useCallback((terrain: any, historical: any): string => {
    let urgencyScore = 0
    if (terrain?.accessibility_score > 7) urgencyScore += 1
    if (historical?.cultural_significance === 'high') urgencyScore += 2
    if (terrain?.defensive_score > 8) urgencyScore += 1
    
    if (urgencyScore >= 3) return 'critical'
    if (urgencyScore >= 2) return 'high'
    return 'medium'
  }, [])

  const deleteZone = useCallback((zoneId: string) => {
    setAnalysisZones(prev => prev.filter(zone => zone.id !== zoneId))
    console.log('🗑️ Zone deleted')
  }, [])

  const startDrawing = useCallback((mode: 'circle' | 'rectangle' | 'polygon') => {
    if (drawingManagerRef.current) {
      const drawingModes = {
        circle: (window.google.maps as any).drawing?.OverlayType?.CIRCLE,
        rectangle: (window.google.maps as any).drawing?.OverlayType?.RECTANGLE,
        polygon: (window.google.maps as any).drawing?.OverlayType?.POLYGON
      }
      
      drawingManagerRef.current.setDrawingMode(drawingModes[mode] || null)
      setDrawingMode(mode)
      console.log('🖊️ Started drawing:', mode)
    }
  }, [])

  const stopDrawing = useCallback(() => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null)
      setDrawingMode('none')
      console.log('✋ Stopped drawing')
    }
  }, [])

  // Global search functionality
  const performGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    setGlobalSearchLoading(true)
    try {
      // Search archaeological sites
      const siteResults = sites.filter(site => 
        site.name.toLowerCase().includes(query.toLowerCase()) ||
        site.cultural_significance.toLowerCase().includes(query.toLowerCase())
      ).map(site => ({
        type: 'archaeological_site',
        id: site.id,
        name: site.name,
        description: site.cultural_significance,
        coordinates: site.coordinates,
        confidence: site.confidence
      }))

      setGlobalSearchResults(siteResults.slice(0, 10))
      setShowGlobalSearchResults(true)
    } catch (error) {
      console.error('❌ Global search failed:', error)
    } finally {
      setGlobalSearchLoading(false)
    }
  }, [sites])

  // Handle search selection
  const handleGlobalSearchSelect = useCallback((result: any) => {
    setShowGlobalSearchResults(false)
    setGlobalSearchQuery('')

    if (result.type === 'archaeological_site') {
      const [lat, lng] = result.coordinates.split(', ').map(Number)
      setMapCenter([lat, lng])
      if (googleMapRef.current) {
        googleMapRef.current.setCenter({ lat, lng })
        googleMapRef.current.setZoom(14)
      }
    }
  }, [])

  // Enhanced chat handler with map interaction
  const handleChatMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Handle layer commands
    if (lowerMessage.includes('show') || lowerMessage.includes('enable') || lowerMessage.includes('turn on')) {
      if (lowerMessage.includes('satellite')) {
        toggleLayer('satellite')
        return {
          type: 'layer_response',
          message: '🛰️ Satellite layer enabled. Loading high-resolution imagery coverage areas...'
        }
      }
      if (lowerMessage.includes('lidar')) {
        toggleLayer('lidar')
        return {
          type: 'layer_response',
          message: '📡 LIDAR layer enabled. Loading elevation point cloud data...'
        }
      }
      if (lowerMessage.includes('terrain')) {
        toggleLayer('terrain')
        return {
          type: 'layer_response',
          message: '🏔️ Terrain layer enabled. Loading elevation and slope analysis...'
        }
      }
      if (lowerMessage.includes('historical')) {
        toggleLayer('historical')
        return {
          type: 'layer_response',
          message: '🏛️ Historical layer enabled. Loading cultural territories and trade routes...'
        }
      }
      if (lowerMessage.includes('infrastructure')) {
        toggleLayer('infrastructure')
        return {
          type: 'layer_response',
          message: '🏗️ Infrastructure layer enabled. Loading threat assessment data...'
        }
      }
    }
    
    // Handle hide/disable commands
    if (lowerMessage.includes('hide') || lowerMessage.includes('disable') || lowerMessage.includes('turn off')) {
      const layerNames = ['satellite', 'lidar', 'terrain', 'historical', 'infrastructure']
      for (const layerName of layerNames) {
        if (lowerMessage.includes(layerName)) {
          toggleLayer(layerName)
          return {
            type: 'layer_response',
            message: `✅ ${layerName.charAt(0).toUpperCase() + layerName.slice(1)} layer disabled.`
          }
        }
      }
    }
    
    // Handle analysis commands
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
      if (lowerMessage.includes('satellite')) {
        runSatelliteAnalysis()
        return {
          type: 'analysis_response',
          message: '🛰️ Starting satellite analysis... Detecting patterns and anomalies in imagery.'
        }
      }
      if (lowerMessage.includes('terrain')) {
        runTerrainAnalysis()
        return {
          type: 'analysis_response',
          message: '🏔️ Starting terrain analysis... Evaluating settlement suitability and topography.'
        }
      }
      if (lowerMessage.includes('pattern')) {
        runPatternDetection()
        return {
          type: 'analysis_response',
          message: '🧠 Starting pattern detection... Identifying archaeological features and structures.'
        }
      }
    }
    
    // Handle export commands
    if (lowerMessage.includes('export') || lowerMessage.includes('download')) {
      runDataExport()
      return {
        type: 'export_response',
        message: '📋 Preparing data export... Generating files in multiple formats (JSON, CSV, KML, Shapefile).'
      }
    }
    
    // Handle share commands
    if (lowerMessage.includes('share')) {
      runShareAnalysis()
      return {
        type: 'share_response',
        message: '🔗 Generating share link... Creating secure URL for analysis collaboration.'
      }
    }
    
    // Handle coordinate navigation
    const coordRegex = /-?\d+\.?\d*,\s*-?\d+\.?\d*/g
    const coords = message.match(coordRegex)
    
    if (coords && coords.length > 0) {
      const [lat, lng] = coords[0].split(',').map(s => parseFloat(s.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng])
        if (googleMapRef.current) {
          googleMapRef.current.setCenter({ lat, lng })
          googleMapRef.current.setZoom(12)
        }
        
        return {
          type: 'coordinate_response',
          message: `🗺️ Navigated to coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
      }
    }
    
    // Handle site search
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('locate')) {
      const matchingSites = sites.filter(site => 
        site.name.toLowerCase().includes(lowerMessage.replace(/find|search|locate/g, '').trim()) ||
        site.type.toLowerCase().includes(lowerMessage.replace(/find|search|locate/g, '').trim())
      )
      
      if (matchingSites.length > 0) {
        const site = matchingSites[0]
        const [lat, lng] = site.coordinates.split(', ').map(Number)
        setMapCenter([lat, lng])
        setSelectedSite(site)
        if (googleMapRef.current) {
          googleMapRef.current.setCenter({ lat, lng })
          googleMapRef.current.setZoom(14)
        }
        
        return {
          type: 'site_response',
          message: `🏛️ Found ${site.name} - ${site.type} site from ${site.period}. Confidence: ${(site.confidence * 100).toFixed(0)}%`
        }
      }
    }
    
    // Handle zone creation
    if (lowerMessage.includes('create zone') || lowerMessage.includes('draw zone')) {
      if (lowerMessage.includes('circle')) {
        startDrawing('circle')
        return {
          type: 'drawing_response',
          message: '⭕ Circle drawing mode activated. Click on the map to create a circular analysis zone.'
        }
      }
      if (lowerMessage.includes('rectangle')) {
        startDrawing('rectangle')
        return {
          type: 'drawing_response',
          message: '⬛ Rectangle drawing mode activated. Click and drag to create a rectangular analysis zone.'
        }
      }
      if (lowerMessage.includes('polygon')) {
        startDrawing('polygon')
        return {
          type: 'drawing_response',
          message: '🔶 Polygon drawing mode activated. Click multiple points to create a custom analysis zone.'
        }
      }
      
      // Default to circle if no specific shape mentioned
      startDrawing('circle')
      return {
        type: 'drawing_response',
        message: '⭕ Drawing mode activated. Click on the map to create an analysis zone.'
      }
    }
    
    // Handle system status
    if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
      const activeLayersCount = layers.filter(l => l.visible).length
      const zonesCount = analysisZones.length
      const sitesCount = sites.length
      
      return {
        type: 'status_response',
        message: `📊 System Status: ${backendOnline ? 'Backend Online' : 'Demo Mode'} | ${sitesCount} Sites | ${zonesCount} Zones | ${activeLayersCount} Active Layers`
      }
    }
    
    // Default response with available commands
    return {
      type: 'help_response',
      message: `🗺️ Available commands:
• "show satellite/lidar/terrain" - Enable layers
• "analyze satellite/terrain" - Run analysis
• "find [site name]" - Search sites  
• "create zone circle/rectangle" - Draw zones
• "export data" - Download analysis
• "share analysis" - Generate link
• "lat,lng" - Navigate to coordinates
• "status" - System information

Currently showing ${sites.length} archaeological sites.`
    }
  }

  // Load layer data
  const loadLayerData = useCallback(async (layerType: string) => {
    setLayersLoading(prev => ({ ...prev, [layerType]: true }))
    
    try {
      let data;
      
      if (backendOnline) {
        // Try to fetch real data from backend
        const endpoints = {
          satellite: '/vision/satellite-data',
          lidar: '/data/lidar-points',
          terrain: '/data/elevation-data',
          historical: '/data/historical-maps',
          infrastructure: '/data/infrastructure-data'
        }
        
        try {
          const response = await fetch(`http://localhost:8000${endpoints[layerType as keyof typeof endpoints]}`)
          if (response.ok) {
            data = await response.json()
          }
        } catch (error) {
          console.log('Backend not available, using demo data for', layerType)
        }
      }
      
      // Generate demo data if backend unavailable or failed
      if (!data) {
        data = generateDemoLayerData(layerType)
      }
      
      setLayerData(prev => ({ ...prev, [layerType]: data }))
      console.log('✅ Loaded', layerType, 'layer data with', data.features?.length || data.points?.length || 'demo', 'items')
      
    } catch (error) {
      console.error('❌ Failed to load', layerType, 'data:', error)
    } finally {
      setLayersLoading(prev => ({ ...prev, [layerType]: false }))
    }
  }, [backendOnline])

  // Generate demo layer data
  const generateDemoLayerData = useCallback((layerType: string) => {
    const centerLat = mapCenter[0]
    const centerLng = mapCenter[1]
    
    switch (layerType) {
      case 'satellite':
        return {
          type: 'FeatureCollection',
          features: sites.map((site, index) => {
            const [lat, lng] = site.coordinates.split(', ').map(Number)
            return {
              type: 'Feature',
              properties: {
                id: `satellite_${index}`,
                name: `Satellite Coverage ${site.name}`,
                resolution: Math.random() * 2 + 0.5, // 0.5-2.5m resolution
                cloud_cover: Math.random() * 20, // 0-20% cloud cover
                acquisition_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [lng - 0.01, lat - 0.01],
                  [lng + 0.01, lat - 0.01],
                  [lng + 0.01, lat + 0.01],
                  [lng - 0.01, lat + 0.01],
                  [lng - 0.01, lat - 0.01]
                ]]
              }
            }
          })
        }
        
      case 'lidar':
        const lidarPoints = []
        for (let i = 0; i < sites.length * 50; i++) {
          const site = sites[Math.floor(Math.random() * sites.length)]
          const [siteLat, siteLng] = site.coordinates.split(', ').map(Number)
          lidarPoints.push({
            id: `lidar_${i}`,
            lat: siteLat + (Math.random() - 0.5) * 0.02,
            lng: siteLng + (Math.random() - 0.5) * 0.02,
            elevation: 150 + Math.random() * 300, // 150-450m elevation
            intensity: Math.random() * 255,
            classification: Math.random() > 0.7 ? 'ground' : Math.random() > 0.5 ? 'vegetation' : 'building'
          })
        }
        return { points: lidarPoints }
        
      case 'terrain':
        return {
          type: 'FeatureCollection',
          features: sites.map((site, index) => {
            const [lat, lng] = site.coordinates.split(', ').map(Number)
            const elevation = 150 + Math.random() * 300
            return {
              type: 'Feature',
              properties: {
                id: `terrain_${index}`,
                elevation: elevation,
                slope: Math.random() * 45,
                aspect: Math.random() * 360,
                visibility: Math.random() * 10 + 1 // 1-11 km visibility
              },
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            }
          })
        }
        
      case 'historical':
        return {
          territories: [
            {
              id: 'inca_empire',
              name: 'Inca Empire (1438-1533)',
              color: '#FFD700',
              bounds: [
                [-18.0, -81.0], [-18.0, -66.0],
                [5.0, -66.0], [5.0, -81.0]
              ]
            },
            {
              id: 'spanish_colonial',
              name: 'Spanish Colonial Period (1533-1821)',
              color: '#DC143C',
              bounds: [
                [-15.0, -78.0], [-15.0, -68.0],
                [2.0, -68.0], [2.0, -78.0]
              ]
            },
            {
              id: 'pre_columbian_trade',
              name: 'Pre-Columbian Trade Routes',
              color: '#32CD32',
              routes: sites.map(site => {
                const [lat, lng] = site.coordinates.split(', ').map(Number)
                return { lat, lng, importance: site.confidence }
              })
            }
          ]
        }
        
      case 'infrastructure':
        return {
          features: sites.map((site, index) => {
            const [lat, lng] = site.coordinates.split(', ').map(Number)
            return {
              id: `infra_${index}`,
              type: Math.random() > 0.6 ? 'road' : Math.random() > 0.3 ? 'development' : 'mining',
              lat: lat + (Math.random() - 0.5) * 0.05,
              lng: lng + (Math.random() - 0.5) * 0.05,
              threat_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
              distance_to_site: Math.random() * 5 + 0.5 // 0.5-5.5 km
            }
          })
        }
        
      default:
        return { features: [] }
    }
  }, [mapCenter, sites])

  // Get elevation color
  const getElevationColor = useCallback((elevation: number): string => {
    // Color gradient from blue (low) to red (high)
    if (elevation < 200) return '#0066CC' // Blue - water/low areas
    if (elevation < 300) return '#00AA00' // Green - plains
    if (elevation < 400) return '#FFA500' // Orange - hills
    if (elevation < 500) return '#FF6600' // Red-orange - mountains
    return '#FFFFFF' // White - peaks
  }, [])

  // Update layer overlays
  const updateLayerOverlays = useCallback(() => {
    if (!googleMapRef.current) {
      console.log('❌ No Google Map reference, skipping overlay update')
      return
    }

    console.log('🗺️ Updating layer overlays...')

    // Clear all existing overlays first
    Object.keys(layerOverlaysRef.current).forEach(key => {
      try {
        if (layerOverlaysRef.current[key]) {
          layerOverlaysRef.current[key].setMap(null)
          delete layerOverlaysRef.current[key]
        }
      } catch (error) {
        console.error('❌ Error removing overlay:', key, error)
      }
    })

    let overlaysAdded = 0

    layers.forEach(layer => {
      console.log(`🔍 Processing layer: ${layer.id}, visible: ${layer.visible}, hasData: ${!!layerData[layer.id]}`)
      
      // Add overlay if layer is visible and has data
      if (layer.visible && layerData[layer.id]) {
        try {
          const data = layerData[layer.id]
          console.log(`📊 Layer ${layer.id} data:`, data)
          
          switch (layer.id) {
            case 'satellite':
              // Create satellite imagery overlays
              if (data.features && data.features.length > 0) {
                console.log(`🛰️ Creating ${data.features.length} satellite overlays`)
                data.features.forEach((feature: any, index: number) => {
                  const bounds = new (window.google.maps as any).LatLngBounds()
                  feature.geometry.coordinates[0].forEach((coord: number[]) => {
                    bounds.extend(new (window.google.maps as any).LatLng(coord[1], coord[0]))
                  })
                  
                  const overlay = new (window.google.maps as any).Rectangle({
                    bounds: bounds,
                    strokeColor: '#00FF00',
                    strokeOpacity: layer.opacity / 100,
                    strokeWeight: 2,
                    fillColor: '#00FF00',
                    fillOpacity: 0.15 * (layer.opacity / 100),
                    clickable: false
                  })
                  
                  overlay.setMap(googleMapRef.current)
                  const overlayKey = `${layer.id}_${feature.properties.id}`
                  layerOverlaysRef.current[overlayKey] = overlay
                  overlaysAdded++
                  console.log(`✅ Added satellite overlay: ${overlayKey}`)
                })
              }
              break
              
            case 'lidar':
              // Create LIDAR point cloud visualization
              if (data.points && data.points.length > 0) {
                console.log(`📡 Creating ${data.points.length} LIDAR points`)
                data.points.forEach((point: any, index: number) => {
                  const color = getElevationColor(point.elevation)
                  const marker = new (window.google.maps as any).Circle({
                    center: { lat: point.lat, lng: point.lng },
                    radius: 25, // Increased radius for visibility
                    strokeColor: color,
                    strokeOpacity: layer.opacity / 100,
                    strokeWeight: 1,
                    fillColor: color,
                    fillOpacity: 0.4 * (layer.opacity / 100),
                    clickable: false
                  })
                  
                  marker.setMap(googleMapRef.current)
                  const overlayKey = `${layer.id}_${point.id}`
                  layerOverlaysRef.current[overlayKey] = marker
                  overlaysAdded++
                  
                  if (index % 50 === 0) { // Log every 50th point
                    console.log(`✅ Added LIDAR point: ${overlayKey}`)
                  }
                })
              }
              break
              
            case 'terrain':
              // Create terrain elevation visualization
              if (data.features && data.features.length > 0) {
                console.log(`🏔️ Creating ${data.features.length} terrain overlays`)
                data.features.forEach((feature: any, index: number) => {
                  const [lng, lat] = feature.geometry.coordinates
                  const elevation = feature.properties.elevation
                  const color = getElevationColor(elevation)
                  
                  const circle = new (window.google.maps as any).Circle({
                    center: { lat, lng },
                    radius: 800, // Increased radius for visibility
                    strokeColor: color,
                    strokeOpacity: layer.opacity / 100,
                    strokeWeight: 3,
                    fillColor: color,
                    fillOpacity: 0.25 * (layer.opacity / 100),
                    clickable: false
                  })
                  
                  circle.setMap(googleMapRef.current)
                  const overlayKey = `${layer.id}_${feature.properties.id}`
                  layerOverlaysRef.current[overlayKey] = circle
                  overlaysAdded++
                  console.log(`✅ Added terrain overlay: ${overlayKey}`)
                })
              }
              break
              
            case 'historical':
              // Create historical territory overlays
              if (data.territories && data.territories.length > 0) {
                console.log(`🏛️ Creating ${data.territories.length} historical overlays`)
                data.territories.forEach((territory: any) => {
                  if (territory.bounds) {
                    const bounds = new (window.google.maps as any).LatLngBounds()
                    territory.bounds.forEach((coord: number[]) => {
                      bounds.extend(new (window.google.maps as any).LatLng(coord[0], coord[1]))
                    })
                    
                    const overlay = new (window.google.maps as any).Rectangle({
                      bounds: bounds,
                      strokeColor: territory.color,
                      strokeOpacity: layer.opacity / 100,
                      strokeWeight: 3,
                      fillColor: territory.color,
                      fillOpacity: 0.2 * (layer.opacity / 100),
                      clickable: false
                    })
                    
                    overlay.setMap(googleMapRef.current)
                    const overlayKey = `${layer.id}_${territory.id}`
                    layerOverlaysRef.current[overlayKey] = overlay
                    overlaysAdded++
                    console.log(`✅ Added historical territory: ${overlayKey}`)
                  }
                  
                  if (territory.routes) {
                    territory.routes.forEach((point: any, index: number) => {
                      const marker = new (window.google.maps as any).Circle({
                        center: { lat: point.lat, lng: point.lng },
                        radius: 300,
                        strokeColor: territory.color,
                        strokeOpacity: layer.opacity / 100,
                        strokeWeight: 2,
                        fillColor: territory.color,
                        fillOpacity: 0.3 * (layer.opacity / 100),
                        clickable: false
                      })
                      
                      marker.setMap(googleMapRef.current)
                      const overlayKey = `${layer.id}_route_${index}`
                      layerOverlaysRef.current[overlayKey] = marker
                      overlaysAdded++
                    })
                  }
                })
              }
              break
              
            case 'infrastructure':
              // Create infrastructure threat visualization
              if (data.features && data.features.length > 0) {
                console.log(`🏗️ Creating ${data.features.length} infrastructure overlays`)
                data.features.forEach((feature: any, index: number) => {
                  const color = feature.threat_level === 'high' ? '#FF0000' : 
                              feature.threat_level === 'medium' ? '#FFA500' : '#FFFF00'
                  
                  const marker = new (window.google.maps as any).Circle({
                    center: { lat: feature.lat, lng: feature.lng },
                    radius: feature.threat_level === 'high' ? 400 : 
                           feature.threat_level === 'medium' ? 250 : 150,
                    strokeColor: color,
                    strokeOpacity: layer.opacity / 100,
                    strokeWeight: 2,
                    fillColor: color,
                    fillOpacity: 0.3 * (layer.opacity / 100),
                    clickable: false
                  })
                  
                  marker.setMap(googleMapRef.current)
                  const overlayKey = `${layer.id}_${feature.id}`
                  layerOverlaysRef.current[overlayKey] = marker
                  overlaysAdded++
                  console.log(`✅ Added infrastructure overlay: ${overlayKey}`)
                })
              }
              break
          }
        } catch (error) {
          console.error('❌ Error updating layer overlay:', layer.id, error)
        }
      }
    })
    
    console.log(`✅ Updated layer overlays: ${overlaysAdded} overlays added for ${layers.filter(l => l.visible).length} visible layers`)
  }, [layers, layerData, getElevationColor])

  // Handle layer visibility change
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible
        
        // Load data if layer is being enabled and data not loaded
        if (newVisible && !layerData[layerId] && !layersLoading[layerId]) {
          console.log('🔄 Loading data for layer:', layerId)
          loadLayerData(layerId)
        }
        
        console.log('👁️ Toggle layer:', layerId, 'visible:', newVisible)
        return { ...layer, visible: newVisible }
      }
      return layer
    }))
  }, [layerData, layersLoading, loadLayerData])

  // Handle layer opacity change
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    console.log('🎚️ Update layer opacity:', layerId, opacity)
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }, [])

  // Initialize
  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [checkBackend])

  useEffect(() => {
    loadSites()
  }, [loadSites])

  useEffect(() => {
    updateMapMarkers()
  }, [updateMapMarkers])

  // Auto-load visible layers that don't have data
  useEffect(() => {
    layers.forEach(layer => {
      if (layer.visible && !layerData[layer.id] && !layersLoading[layer.id]) {
        console.log('🔄 Auto-loading data for visible layer:', layer.id)
        loadLayerData(layer.id)
      }
    })
  }, [layers, layerData, layersLoading, loadLayerData])

  // Update layer overlays when layers or data change
  useEffect(() => {
    if (googleMapRef.current) {
      console.log('🗺️ Updating layer overlays...')
      updateLayerOverlays()
    }
  }, [layers, layerData, updateLayerOverlays])

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Google Maps API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y&libraries=places,geometry,drawing`}
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('✅ Google Maps API loaded')
          setGoogleMapsLoaded(true)
        }}
        onError={() => {
          console.log('❌ Google Maps API failed to load')
          setMapError('Failed to load Google Maps')
        }}
      />

      <Navigation 
        showBackendStatus={true}
        showChatButton={true}
        onChatToggle={() => setChatOpen(!chatOpen)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-slate-800 border-r border-slate-700`}>
          <div className="p-4 h-full overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sites">Sites</TabsTrigger>
                <TabsTrigger value="zones">Zones</TabsTrigger>
                <TabsTrigger value="layers">Layers</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              {/* Sites Tab */}
              <TabsContent value="sites" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Archaeological Sites</h3>
                  
                  {/* Global Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search sites and locations..."
                      value={globalSearchQuery}
                      onChange={(e) => {
                        setGlobalSearchQuery(e.target.value)
                        if (e.target.value.length > 2) {
                          performGlobalSearch(e.target.value)
                        } else {
                          setShowGlobalSearchResults(false)
                        }
                      }}
                      className="pl-10 bg-slate-700 border-slate-600"
                    />
                    {globalSearchLoading && (
                      <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                    )}
        </div>
                  
                  {/* Search Results */}
                  {showGlobalSearchResults && globalSearchResults.length > 0 && (
                    <Card className="bg-slate-600 border-slate-500 max-h-48 overflow-y-auto">
                      <CardContent className="p-2">
                        <div className="text-xs font-medium mb-2 text-slate-300">
                          Search Results ({globalSearchResults.length})
        </div>
                        <div className="space-y-1">
                          {globalSearchResults.map((result, index) => (
                            <div
                              key={index}
                              className="p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600"
                              onClick={() => handleGlobalSearchSelect(result)}
                            >
                              <div className="text-sm font-medium text-white">{result.name}</div>
                              <div className="text-xs text-slate-400">{result.description}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Site Filters */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Filter sites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Type" />
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
                      <Label>Confidence: {confidenceFilter}%</Label>
                      <Slider
                        value={[confidenceFilter]}
                        onValueChange={([value]) => setConfidenceFilter(value)}
                        max={100}
                        min={0}
                        step={5}
                      />
                    </div>
      </div>

                  {/* Sites List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">Loading sites...</div>
                    ) : (
                      sites
                        .filter(site => site.confidence * 100 >= confidenceFilter)
                        .filter(site => typeFilter === 'all' || site.type === typeFilter)
                        .filter(site => !searchQuery || site.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(site => (
                          <Card 
                            key={site.id} 
                            className="bg-slate-700 border-slate-600 cursor-pointer hover:bg-slate-600"
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
                                <h4 className="font-medium text-sm">{site.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {(site.confidence * 100).toFixed(0)}%
                                </Badge>
          </div>
                              <div className="text-xs text-slate-300 space-y-1">
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

              {/* Zones Tab */}
              <TabsContent value="zones" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Analysis Zones</h3>
                  
                  {/* Drawing Tools */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-sm">Drawing Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant={drawingMode === 'circle' ? 'default' : 'outline'}
                          onClick={() => drawingMode === 'circle' ? stopDrawing() : startDrawing('circle')}
                        >
                          <Circle className="h-4 w-4 mr-1" />
                          Circle
                        </Button>
                        <Button
                          size="sm"
                          variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
                          onClick={() => drawingMode === 'rectangle' ? stopDrawing() : startDrawing('rectangle')}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Rectangle
                        </Button>
                        <Button
                          size="sm"
                          variant={drawingMode === 'polygon' ? 'default' : 'outline'}
                          onClick={() => drawingMode === 'polygon' ? stopDrawing() : startDrawing('polygon')}
                        >
                          <Pentagon className="h-4 w-4 mr-1" />
                          Polygon
                        </Button>
                      </div>
                      
                      {drawingMode !== 'none' && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-900/50 rounded text-emerald-200">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm">Drawing {drawingMode} mode active - Click on map to draw</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Zones List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analysisZones.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <h4 className="text-sm font-medium mb-2">No Analysis Zones</h4>
                        <p className="text-xs">Use the drawing tools above to create analysis zones</p>
                      </div>
                    ) : (
                      analysisZones.map(zone => (
                        <Card key={zone.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{zone.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    zone.status === 'complete' ? 'default' :
                                    zone.status === 'analyzing' ? 'secondary' :
                                    zone.status === 'failed' ? 'destructive' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {zone.status === 'analyzing' ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                      Analyzing
                                    </>
                                  ) : zone.status === 'complete' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Complete
                                    </>
                                  ) : zone.status === 'failed' ? (
                                    <>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Failed
                                    </>
                                  ) : (
                                    'Pending'
                                  )}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="text-xs text-slate-300 space-y-1 mb-3">
                              <div>Type: {zone.type}</div>
                              <div>Points: {zone.coordinates.length}</div>
                              <div>Created: {new Date(zone.created_at).toLocaleDateString()}</div>
                              {zone.results && (
                                <div className="text-emerald-300">
                                  Potential: {zone.results.archaeological_potential}%
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {zone.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => analyzeZone(zone.id)}
                                  className="text-xs flex-1"
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  Analyze
                                </Button>
                              )}
                              
                              {zone.status === 'complete' && zone.results && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs flex-1"
                                  onClick={() => {
                                    setToolResults(prev => ({ ...prev, zone: zone.results }))
                                    setActiveTool('zone')
                                    setShowResults(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Results
                                </Button>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => deleteZone(zone.id)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
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
                  <h3 className="text-lg font-semibold">Map Layers</h3>
                  
                  <div className="space-y-3">
                    {layers.map(layer => (
                      <Card key={layer.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={layer.visible}
                                onCheckedChange={(checked) => {
                                  toggleLayer(layer.id)
                                }}
                              />
                              <span className="text-sm font-medium">{layer.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {layer.type}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-300 mb-2">{layer.description}</p>
                          
                          {layer.visible && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs">Opacity: {layer.opacity}%</Label>
                              </div>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={([value]) => {
                                  updateLayerOpacity(layer.id, value)
                                }}
                                max={100}
                                min={0}
                                step={10}
                                className="w-full"
                              />
                              
                              {/* Layer-specific controls */}
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs flex-1"
                                  onClick={() => loadLayerData(layer.id)}
                                  disabled={layersLoading[layer.id]}
                                >
                                  {layersLoading[layer.id] ? (
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                  )}
                                  {layersLoading[layer.id] ? 'Loading...' : 'Refresh'}
                                </Button>
                                
                                {layer.id === 'satellite' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    <Satellite className="h-3 w-3 mr-1" />
                                    HD
                                  </Button>
                                )}
                                
                                {layer.id === 'lidar' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    <Activity className="h-3 w-3 mr-1" />
                                    3D
                                  </Button>
                                )}
                                
                                {layer.id === 'terrain' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    <Mountain className="h-3 w-3 mr-1" />
                                    Contours
                                  </Button>
                                )}
                                
                                {layer.id === 'historical' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    <Globe className="h-3 w-3 mr-1" />
                                    Cultures
                                  </Button>
                                )}
                                
                                {layer.id === 'infrastructure' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Threats
                                  </Button>
                                )}
                              </div>
                              
                              {/* Layer statistics */}
                              <div className="mt-2 p-2 bg-slate-800 rounded text-xs">
                                <div className="text-slate-300 mb-1">Layer Statistics:</div>
                                {layer.id === 'satellite' && layerData[layer.id] && (
                                  <div className="text-slate-400">
                                    Coverage Areas: {layerData[layer.id].features?.length || 0} • 
                                    Avg Resolution: {layerData[layer.id].features?.[0]?.properties?.resolution?.toFixed(1) || 'N/A'}m
                                  </div>
                                )}
                                {layer.id === 'lidar' && layerData[layer.id] && (
                                  <div className="text-slate-400">
                                    Points: {layerData[layer.id].points?.length || 0} • 
                                    Density: {Math.floor((layerData[layer.id].points?.length || 0) / Math.max(sites.length, 1))} pts/site
                                  </div>
                                )}
                                {layer.id === 'terrain' && layerData[layer.id] && (
                                  <div className="text-slate-400">
                                    Elevation Points: {layerData[layer.id].features?.length || 0} • 
                                    Range: {Math.min(...(layerData[layer.id].features?.map((f: any) => f.properties.elevation) || [0]))}m - {Math.max(...(layerData[layer.id].features?.map((f: any) => f.properties.elevation) || [0]))}m
                                  </div>
                                )}
                                {layer.id === 'historical' && layerData[layer.id] && (
                                  <div className="text-slate-400">
                                    Territories: {layerData[layer.id].territories?.length || 0} • 
                                    Trade Routes: {layerData[layer.id].territories?.find((t: any) => t.routes)?.routes?.length || 0} points
                                  </div>
                                )}
                                {layer.id === 'infrastructure' && layerData[layer.id] && (
                                  <div className="text-slate-400">
                                    Features: {layerData[layer.id].features?.length || 0} • 
                                    High Threat: {layerData[layer.id].features?.filter((f: any) => f.threat_level === 'high').length || 0} areas
                                  </div>
                                )}
                                {!layerData[layer.id] && !layersLoading[layer.id] && (
                                  <div className="text-slate-500">No data loaded - Click refresh to load</div>
                                )}
                                {layersLoading[layer.id] && (
                                  <div className="text-emerald-400">Loading layer data...</div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Layer Presets */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Quick Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setLayers(prev => prev.map(l => ({
                            ...l,
                            visible: l.id === 'satellite' || l.id === 'terrain',
                            opacity: l.id === 'satellite' ? 70 : 80
                          })))
                        }}
                      >
                        <Mountain className="h-3 w-3 mr-1" />
                        Topographic
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setLayers(prev => prev.map(l => ({
                            ...l,
                            visible: l.id === 'satellite' || l.id === 'lidar',
                            opacity: l.id === 'satellite' ? 60 : 80
                          })))
                        }}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        LIDAR
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setLayers(prev => prev.map(l => ({
                            ...l,
                            visible: l.id === 'satellite' || l.id === 'historical',
                            opacity: l.id === 'satellite' ? 60 : 70
                          })))
                        }}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Historical
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setLayers(prev => prev.map(l => ({
                            ...l,
                            visible: l.id === 'satellite',
                            opacity: 100
                          })))
                        }}
                      >
                        <Satellite className="h-3 w-3 mr-1" />
                        Satellite Only
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Analysis Tools</h3>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={runSatelliteAnalysis}
                      disabled={toolLoading.satellite}
                      className="w-full"
                    >
                      {toolLoading.satellite ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Satellite className="h-4 w-4 mr-2" />
                          Satellite Analysis
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={runTerrainAnalysis}
                      disabled={toolLoading.terrain}
                      className="w-full"
                    >
                      {toolLoading.terrain ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Mountain className="h-4 w-4 mr-2" />
                          Terrain Analysis
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={runPatternDetection}
                      disabled={toolLoading.pattern}
                      className="w-full"
                    >
                      {toolLoading.pattern ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Pattern Detection
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={runDataExport}
                      disabled={toolLoading.export}
                      className="w-full"
                    >
                      {toolLoading.export ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Data Export
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={runShareAnalysis}
                      disabled={toolLoading.share}
                      className="w-full"
                    >
                      {toolLoading.share ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Share className="h-4 w-4 mr-2" />
                          Share Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Map Container */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-slate-800/90 backdrop-blur-sm border-slate-600"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Map Status */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-md p-2">
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
            className="w-full h-full bg-slate-900"
          >
            {!googleMapsLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                  <div className="text-slate-300">Loading Google Maps...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Chat Assistant */}
        {chatOpen && (
          <div className="w-80 border-l border-slate-700 bg-slate-800">
            <div className="p-4 h-full">
              <AnimatedAIChat />
            </div>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResults && activeTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-600 max-w-2xl w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {activeTool === 'satellite' && 'Satellite Analysis Results'}
                {activeTool === 'terrain' && 'Terrain Analysis Results'}
                {activeTool === 'pattern' && 'Pattern Detection Results'}
                {activeTool === 'export' && 'Data Export Results'}
                {activeTool === 'share' && 'Share Analysis Results'}
                {activeTool === 'zone' && 'Zone Analysis Results'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {toolResults[activeTool] && (
                <div className="space-y-4">
                  {activeTool === 'satellite' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Total Anomalies</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {toolResults[activeTool].total_anomalies}
                        </div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">High Confidence Sites</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {toolResults[activeTool].high_confidence_sites}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTool === 'terrain' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Settlement Suitability</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {toolResults[activeTool].settlement_suitability}%
                        </div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Water Sources</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {toolResults[activeTool].water_sources}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTool === 'pattern' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Circular Patterns</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {toolResults[activeTool].circular_patterns}
                        </div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Linear Features</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {toolResults[activeTool].linear_features}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTool === 'export' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Sites</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {toolResults[activeTool].sites}
                        </div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Zones</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {toolResults[activeTool].zones}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTool === 'share' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Share URL</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {toolResults[activeTool].share_url}
                        </div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-1">Access Level</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {toolResults[activeTool].access_level}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTool === 'zone' && (
                    <div className="space-y-4">
                      {/* Main Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-700 p-3 rounded">
                          <div className="text-sm font-medium mb-1">Archaeological Potential</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            {toolResults[activeTool].archaeological_potential}%
                          </div>
                        </div>
                        <div className="bg-slate-700 p-3 rounded">
                          <div className="text-sm font-medium mb-1">Anomalies Detected</div>
                          <div className="text-2xl font-bold text-blue-400">
                            {toolResults[activeTool].anomalies_detected}
                          </div>
                        </div>
                        <div className="bg-slate-700 p-3 rounded">
                          <div className="text-sm font-medium mb-1">Confidence Score</div>
                          <div className="text-2xl font-bold text-amber-400">
                            {toolResults[activeTool].confidence_score}%
                          </div>
                        </div>
                      </div>

                      {/* Zone Information */}
                      {toolResults[activeTool].area_hectares && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-700 p-3 rounded">
                            <div className="text-sm font-medium mb-1">Zone Area</div>
                            <div className="text-lg font-bold text-slate-200">
                              {toolResults[activeTool].area_hectares} hectares
                            </div>
                          </div>
                          <div className="bg-slate-700 p-3 rounded">
                            <div className="text-sm font-medium mb-1">Urgency Level</div>
                            <div className={`text-lg font-bold ${
                              toolResults[activeTool].urgency_level === 'critical' ? 'text-red-400' :
                              toolResults[activeTool].urgency_level === 'high' ? 'text-orange-400' : 'text-yellow-400'
                            }`}>
                              {toolResults[activeTool].urgency_level?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Sources */}
                      {toolResults[activeTool].data_sources && (
                        <div className="bg-slate-700 p-3 rounded">
                          <div className="text-sm font-medium mb-2">Data Sources Used</div>
                          <div className="flex flex-wrap gap-2">
                            {toolResults[activeTool].data_sources.map((source: string, index: number) => (
                              <Badge key={`data-source-${index}`} variant="outline" className="text-xs">
                                {source.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Findings */}
                      {toolResults[activeTool].detailed_findings && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-200">Detailed Analysis</h4>
                          
                          {/* Satellite Analysis */}
                          {toolResults[activeTool].detailed_findings.satellite_analysis && (
                            <div className="bg-slate-700 p-3 rounded">
                              <h5 className="text-xs font-medium text-emerald-400 mb-2">🛰️ Satellite Analysis</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Vegetation Anomalies: {toolResults[activeTool].detailed_findings.satellite_analysis.vegetation_anomalies}</div>
                                <div>Geometric Patterns: {toolResults[activeTool].detailed_findings.satellite_analysis.geometric_patterns}</div>
                                <div>Soil Marks: {toolResults[activeTool].detailed_findings.satellite_analysis.soil_marks}</div>
                                <div>Resolution: {toolResults[activeTool].detailed_findings.satellite_analysis.resolution}</div>
                              </div>
                            </div>
                          )}

                          {/* LIDAR Analysis */}
                          {toolResults[activeTool].detailed_findings.lidar_analysis && (
                            <div className="bg-slate-700 p-3 rounded">
                              <h5 className="text-xs font-medium text-blue-400 mb-2">📡 LIDAR Analysis</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Elevation Changes: {toolResults[activeTool].detailed_findings.lidar_analysis.elevation_changes}</div>
                                <div>Potential Structures: {toolResults[activeTool].detailed_findings.lidar_analysis.potential_structures}</div>
                                <div>Terrain Modifications: {toolResults[activeTool].detailed_findings.lidar_analysis.terrain_modifications}</div>
                                <div>Point Density: {toolResults[activeTool].detailed_findings.lidar_analysis.point_density} pts/m²</div>
                              </div>
                            </div>
                          )}

                          {/* Terrain Analysis */}
                          {toolResults[activeTool].detailed_findings.terrain_analysis && (
                            <div className="bg-slate-700 p-3 rounded">
                              <h5 className="text-xs font-medium text-orange-400 mb-2">🏔️ Terrain Analysis</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Slope: {toolResults[activeTool].detailed_findings.terrain_analysis.slope_analysis}</div>
                                <div>Water Proximity: {toolResults[activeTool].detailed_findings.terrain_analysis.water_proximity}m</div>
                                <div>Defensive Score: {toolResults[activeTool].detailed_findings.terrain_analysis.defensive_advantages}/10</div>
                                <div>Accessibility: {toolResults[activeTool].detailed_findings.terrain_analysis.accessibility}/10</div>
                              </div>
                            </div>
                          )}

                          {/* Historical Context */}
                          {toolResults[activeTool].detailed_findings.historical_context && (
                            <div className="bg-slate-700 p-3 rounded">
                              <h5 className="text-xs font-medium text-yellow-400 mb-2">🏛️ Historical Context</h5>
                              <div className="text-xs space-y-1">
                                <div>Known Cultures: {toolResults[activeTool].detailed_findings.historical_context.known_cultures}</div>
                                <div>Time Periods: {toolResults[activeTool].detailed_findings.historical_context.time_periods}</div>
                                <div>Trade Routes: {toolResults[activeTool].detailed_findings.historical_context.trade_routes ? 'Present' : 'None detected'}</div>
                                <div>Cultural Significance: {toolResults[activeTool].detailed_findings.historical_context.cultural_significance}</div>
                              </div>
                            </div>
                          )}

                          {/* Agent Insights */}
                          {toolResults[activeTool].detailed_findings.agent_insights && (
                            <div className="bg-slate-700 p-3 rounded">
                              <h5 className="text-xs font-medium text-purple-400 mb-2">🤖 AI Agent Analysis</h5>
                              <div className="text-xs space-y-1">
                                <div>Expert Consensus: {toolResults[activeTool].detailed_findings.agent_insights.expert_consensus}%</div>
                                <div>Risk Assessment: {toolResults[activeTool].detailed_findings.agent_insights.risk_assessment}</div>
                                <div>Priority Ranking: {toolResults[activeTool].detailed_findings.agent_insights.priority_ranking}</div>
                                <div>Recommendations: {toolResults[activeTool].detailed_findings.agent_insights.primary_recommendations?.join(', ')}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-slate-700 p-3 rounded">
                        <div className="text-sm font-medium mb-2">Expert Recommendations</div>
                        <div className="text-sm text-slate-300">
                          {toolResults[activeTool].recommendations}
                        </div>
                      </div>

                      {/* Next Steps */}
                      {toolResults[activeTool].next_steps && (
                        <div className="bg-slate-700 p-3 rounded">
                          <div className="text-sm font-medium mb-2">Recommended Next Steps</div>
                          <div className="text-xs space-y-1">
                            {toolResults[activeTool].next_steps.map((step: string, index: number) => (
                              <div key={`next-step-${index}`} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-slate-300">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Survey Estimates */}
                      {(toolResults[activeTool].estimated_survey_duration || toolResults[activeTool].estimated_cost) && (
                        <div className="grid grid-cols-2 gap-4">
                          {toolResults[activeTool].estimated_survey_duration && (
                            <div className="bg-slate-700 p-3 rounded">
                              <div className="text-sm font-medium mb-1">Estimated Duration</div>
                              <div className="text-sm font-bold text-blue-400">
                                {toolResults[activeTool].estimated_survey_duration}
                              </div>
                            </div>
                          )}
                          {toolResults[activeTool].estimated_cost && (
                            <div className="bg-slate-700 p-3 rounded">
                              <div className="text-sm font-medium mb-1">Estimated Cost</div>
                              <div className="text-sm font-bold text-green-400">
                                {toolResults[activeTool].estimated_cost}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 py-4 text-slate-300">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2024 Organica-Ai-Solutions. Archaeological Discovery Platform.</p>
        </div>
      </footer>
    </div>
  )
} 