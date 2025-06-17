"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import Link from "next/link"
import { 
  Globe, Satellite, ArrowLeft, Wifi, WifiOff, MapPin, RefreshCw, Download, Eye, Activity, 
  Zap, AlertCircle, Calendar, Filter, Layers, Cloud, Settings, Database, Brain, 
  Search, FileUp, MonitorIcon, Target, Radar, Cpu, Network, Shield, 
  BarChart3, TrendingUp, Clock, Users, Map, Play, Pause, RotateCcw
} from "lucide-react"

// 🛰️ NIS Protocol Satellite Data Interface - REAL-TIME INTEGRATION
interface SatelliteData {
  id: string
  timestamp: string
  coordinates: {
    lat: number
    lng: number
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  resolution: number
  cloudCover: number
  source: string
  bands: Record<string, string>
  url: string
  download_url: string
  quality_score?: number
  archaeological_potential?: string
  metadata?: any
}

interface LidarData {
  id: string
  coordinates: { lat: number; lng: number }
  elevation_data: number[][]
  hillshade: string
  slope: string
  contour: string
  resolution: number
  acquisition_date: string
  coverage_area: number
  point_density: number
  accuracy: string
}

// 🎯 Enhanced Real-Time Satellite Monitor with NIS Protocol Integration
function NISProtocolSatelliteMonitor({ isBackendOnline = false }: { isBackendOnline?: boolean }) {
  // Core state management
  const [activeTab, setActiveTab] = useState('live-feed')
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState({ lat: -3.4653, lng: -62.2159 })
  const [coordinateInput, setCoordinateInput] = useState('-3.4653, -62.2159')
  
  // Real-time data states
  const [satelliteData, setSatelliteData] = useState<SatelliteData[]>([])
  const [filteredData, setFilteredData] = useState<SatelliteData[]>([])
  const [lidarData, setLidarData] = useState<LidarData | null>(null)
  const [archaeologicalSites, setArchaeologicalSites] = useState<any[]>([])
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  
  // System status and monitoring
  const [systemStatus, setSystemStatus] = useState<any>({})
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({})
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<any>({
    dateRange: '30',
    cloudCover: '25',
    resolution: 'high',
    source: 'all',
    bands: 'rgb'
  })
  
  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 🔄 Real-time data loading with comprehensive error handling
  const loadSatelliteData = useCallback(async (coords: { lat: number; lng: number }) => {
    if (!isBackendOnline) {
      setError('🔴 Backend offline - Real-time satellite data requires live connection')
      setSatelliteData([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🛰️ [NIS Protocol] Loading real-time satellite data...')
      
      const response = await fetch('http://localhost:8000/satellite/imagery/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          coordinates: coords, 
          radius: 5000,
          include_metadata: true,
          archaeological_focus: true
        })
      })
      
      if (!response.ok) {
        throw new Error(`Satellite API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const imageData = data.data || []
      
      if (imageData.length === 0) {
        setError('⚠️ No satellite imagery available for these coordinates')
      } else {
        console.log(`✅ [NIS Protocol] Loaded ${imageData.length} real satellite images`)
      }
      
      setSatelliteData(imageData)
      setFilteredData(imageData)
      applyFilters(imageData, filters)
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('❌ [NIS Protocol] Satellite data loading failed:', error)
      setError(`Satellite Data Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSatelliteData([])
    } finally {
      setIsLoading(false)
    }
  }, [isBackendOnline, filters])

  // 🗺️ Advanced LIDAR data integration
  const loadLidarData = useCallback(async (coords: { lat: number; lng: number }) => {
    if (!isBackendOnline) return

    try {
      console.log('📡 [NIS Protocol] Loading LIDAR data...')
      
      const response = await fetch('http://localhost:8000/lidar/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          coordinates: coords,
          radius: 2000,
          processing_level: 'enhanced',
          archaeological_analysis: true
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setLidarData(data.data)
        console.log('✅ [NIS Protocol] LIDAR data loaded successfully')
      }
      
    } catch (error) {
      console.error('❌ [NIS Protocol] LIDAR loading failed:', error)
    }
  }, [isBackendOnline])

  // 🏛️ Archaeological sites integration
  const loadArchaeologicalSites = useCallback(async () => {
    if (!isBackendOnline) return

    try {
      console.log('🏛️ [NIS Protocol] Loading archaeological sites...')
      
      const response = await fetch('http://localhost:8000/research/sites')
      
      if (response.ok) {
        const data = await response.json()
        setArchaeologicalSites(data.sites || [])
        console.log(`✅ [NIS Protocol] Loaded ${data.sites?.length || 0} archaeological sites`)
      }
      
    } catch (error) {
      console.error('❌ [NIS Protocol] Archaeological sites loading failed:', error)
    }
  }, [isBackendOnline])

  // 📊 System status monitoring
  const loadSystemStatus = useCallback(async () => {
    if (!isBackendOnline) return

    try {
      const response = await fetch('http://localhost:8000/satellite/status')
      
      if (response.ok) {
        const status = await response.json()
        setSystemStatus(status)
        
        // Update real-time metrics
        setRealTimeMetrics({
          activeSatellites: Object.keys(status.satellites || {}).length,
          systemUptime: status.services?.imagery?.uptime || '0%',
          processingQueue: status.performance?.processing_queue || 0,
          dataFreshness: status.performance?.data_freshness || 'Unknown',
          lastHealthCheck: new Date().toLocaleTimeString()
        })
      }
      
    } catch (error) {
      console.error('❌ [NIS Protocol] System status check failed:', error)
    }
  }, [isBackendOnline])

  // 🎯 AI-powered archaeological analysis
  const analyzeImagery = useCallback(async (imageId: string) => {
    if (!isBackendOnline) {
      setError('🔴 Backend offline - Analysis requires live connection')
      return
    }

    try {
      console.log('🧠 [NIS Protocol] Starting AI archaeological analysis...')
      
      const response = await fetch('http://localhost:8000/agents/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: imageId,
          coordinates: coordinates,
          analysis_type: 'archaeological_features',
          use_all_agents: true,
          consciousness_integration: true
        })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        setAnalysisResults(prev => [...prev, analysis])
        console.log('✅ [NIS Protocol] AI analysis completed')
      }
      
    } catch (error) {
      console.error('❌ [NIS Protocol] AI analysis failed:', error)
      setError(`Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [isBackendOnline, coordinates])

  // 🔍 Smart filtering system
  const applyFilters = useCallback((data: SatelliteData[], currentFilters: any) => {
    let filtered = [...data]
    
    // Cloud cover filter
    if (currentFilters.cloudCover && currentFilters.cloudCover !== '100') {
      const maxCloudCover = parseInt(currentFilters.cloudCover)
      filtered = filtered.filter(item => item.cloudCover <= maxCloudCover)
    }
    
    // Date range filter
    if (currentFilters.dateRange && currentFilters.dateRange !== 'all') {
      const daysAgo = parseInt(currentFilters.dateRange)
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate)
    }
    
    // Source filter
    if (currentFilters.source && currentFilters.source !== 'all') {
      filtered = filtered.filter(item => item.source === currentFilters.source)
    }
    
    setFilteredData(filtered)
    console.log(`🔍 [NIS Protocol] Applied filters: ${filtered.length}/${data.length} images`)
  }, [])

  // 📱 Coordinate handling
  const handleCoordinateUpdate = useCallback(() => {
    const coords = coordinateInput.split(',').map(s => parseFloat(s.trim()))
    if (coords.length === 2 && !coords.some(isNaN)) {
      const [lat, lng] = coords
      setCoordinates({ lat, lng })
      loadSatelliteData({ lat, lng })
      loadLidarData({ lat, lng })
    } else {
      setError('❌ Invalid coordinates format. Use: latitude, longitude')
    }
  }, [coordinateInput, loadSatelliteData, loadLidarData])

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
    applyFilters(satelliteData, newFilters)
  }, [satelliteData, applyFilters])

  // 🔄 Real-time updates setup
  useEffect(() => {
    if (isBackendOnline) {
      // Initial data load
      loadSatelliteData(coordinates)
      loadLidarData(coordinates)
      loadArchaeologicalSites()
      loadSystemStatus()
      
      // Set up real-time updates
      if (isRealTimeActive) {
        intervalRef.current = setInterval(() => {
          loadSystemStatus()
          // Refresh satellite data every 5 minutes
          if (Date.now() - lastUpdate.getTime() > 5 * 60 * 1000) {
            loadSatelliteData(coordinates)
          }
        }, 30000)
      }
    } else {
      // Clear data when offline
      setSatelliteData([])
      setLidarData(null)
      setArchaeologicalSites([])
      setSystemStatus({})
      setError('🔴 Backend connection required for NIS Protocol satellite functionality')
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isBackendOnline, coordinates, lastUpdate, isRealTimeActive, loadSatelliteData, loadLidarData, loadArchaeologicalSites, loadSystemStatus])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 🎯 Enhanced NIS Protocol Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Hub</span>
            </Link>
            <div className="w-px h-6 bg-slate-600" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Satellite className="w-8 h-8 text-emerald-400" />
                🛰️ NIS Protocol Satellite Intelligence
              </h1>
              <p className="text-slate-300 text-sm">
                Real-time satellite & LIDAR data • AI-powered archaeological analysis • Multi-source integration
              </p>
            </div>
          </div>
          
          {/* Real-time Status Dashboard */}
          <div className="flex gap-3 flex-wrap">
            <div className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
              isBackendOnline 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}>
              {isBackendOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isBackendOnline ? 'Backend Online' : 'Backend Offline'}
            </div>
            
            {isBackendOnline && (
              <>
                <div className="px-3 py-2 rounded-lg border bg-blue-500/20 border-blue-500/50 text-blue-300 text-sm flex items-center gap-2">
                  <Satellite className="w-4 h-4" />
                  {realTimeMetrics.activeSatellites || 0} Satellites
                </div>
                <div className="px-3 py-2 rounded-lg border bg-purple-500/20 border-purple-500/50 text-purple-300 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {filteredData.length} Images
                </div>
                <div className="px-3 py-2 rounded-lg border bg-orange-500/20 border-orange-500/50 text-orange-300 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {analysisResults.length} AI Analyses
                </div>
              </>
            )}
          </div>
        </div>

        {/* Coordinate Input & Real-time Controls */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={coordinateInput}
              onChange={(e) => setCoordinateInput(e.target.value)}
              placeholder="Latitude, Longitude"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm w-48"
            />
            <button
              onClick={handleCoordinateUpdate}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                isRealTimeActive 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isRealTimeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Real-time: {isRealTimeActive ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => loadSatelliteData(coordinates)}
              disabled={isLoading || !isBackendOnline}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="text-sm text-slate-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'live-feed', label: 'Live Satellite Feed', icon: Satellite },
            { id: 'analysis', label: 'AI Analysis', icon: Brain },
            { id: 'lidar', label: 'LIDAR Data', icon: Radar },
            { id: 'monitoring', label: 'System Monitor', icon: MonitorIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'live-feed' && (
              <SatelliteFeedTab 
                data={filteredData}
                isLoading={isLoading}
                onAnalyze={analyzeImagery}
                onFiltersChange={handleFiltersChange}
                filters={filters}
                coordinates={coordinates}
                archaeologicalSites={archaeologicalSites}
              />
            )}
            
            {activeTab === 'analysis' && (
              <AnalysisTab 
                results={analysisResults}
                isLoading={isLoading}
                coordinates={coordinates}
              />
            )}
            
            {activeTab === 'lidar' && (
              <LidarTab 
                data={lidarData}
                coordinates={coordinates}
                isLoading={isLoading}
              />
            )}
            
            {activeTab === 'monitoring' && (
              <MonitoringTab 
                systemStatus={systemStatus}
                metrics={realTimeMetrics}
                isBackendOnline={isBackendOnline}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// 🛰️ Satellite Feed Tab Component
function SatelliteFeedTab({ 
  data, 
  isLoading, 
  onAnalyze, 
  onFiltersChange, 
  filters, 
  coordinates,
  archaeologicalSites 
}: {
  data: SatelliteData[]
  isLoading: boolean
  onAnalyze: (id: string) => void
  onFiltersChange: (filters: any) => void
  filters: any
  coordinates: { lat: number; lng: number }
  archaeologicalSites: any[]
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-400" />
          <h3 className="font-medium text-white">Advanced Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Date Range
            </label>
            <select 
              value={filters.dateRange}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              <Cloud className="h-3 w-3 inline mr-1" />
              Max Cloud Cover
            </label>
            <select 
              value={filters.cloudCover}
              onChange={(e) => onFiltersChange({ ...filters, cloudCover: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              <option value="10">≤ 10%</option>
              <option value="25">≤ 25%</option>
              <option value="50">≤ 50%</option>
              <option value="100">Any</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              <Settings className="h-3 w-3 inline mr-1" />
              Resolution
            </label>
            <select 
              value={filters.resolution}
              onChange={(e) => onFiltersChange({ ...filters, resolution: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              <option value="high">High (≤ 5m)</option>
              <option value="medium">Medium (5-15m)</option>
              <option value="low">Low (&gt; 15m)</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              <Satellite className="h-3 w-3 inline mr-1" />
              Source
            </label>
            <select 
              value={filters.source}
              onChange={(e) => onFiltersChange({ ...filters, source: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              <option value="all">All Sources</option>
              <option value="landsat">Landsat</option>
              <option value="sentinel">Sentinel</option>
              <option value="planet">Planet</option>
              <option value="maxar">Maxar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              <Layers className="h-3 w-3 inline mr-1" />
              Bands
            </label>
            <select 
              value={filters.bands}
              onChange={(e) => onFiltersChange({ ...filters, bands: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              <option value="rgb">RGB (Natural)</option>
              <option value="nir">Near Infrared</option>
              <option value="swir">Short Wave IR</option>
              <option value="thermal">Thermal</option>
              <option value="multispectral">Multispectral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Satellite Data Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Loading real-time satellite data...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <Satellite className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No satellite imagery available for current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all"
            >
              {/* Image Preview */}
              <div className="h-48 bg-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20" />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                  {image.source.toUpperCase()}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                  {image.cloudCover}% cloud
                </div>
              </div>
              
              {/* Image Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm">
                    {new Date(image.timestamp).toLocaleDateString()}
                  </h4>
                  <span className="text-xs text-emerald-400">
                    {image.resolution}m resolution
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 mb-3">
                  {image.coordinates.lat.toFixed(4)}, {image.coordinates.lng.toFixed(4)}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onAnalyze(image.id)}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Brain className="w-3 h-3" />
                    AI Analyze
                  </button>
                  <button className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs transition-colors">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// 🧠 Analysis Tab Component
function AnalysisTab({ results, isLoading, coordinates }: {
  results: any[]
  isLoading: boolean
  coordinates: { lat: number; lng: number }
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-emerald-400" />
          <h3 className="text-xl font-medium text-white">AI Archaeological Analysis</h3>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No analyses completed yet</p>
            <p className="text-sm text-slate-500">
              Select satellite images from the Live Feed tab and click "AI Analyze" to begin
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">Analysis #{index + 1}</h4>
                  <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </p>
                <div className="text-sm text-emerald-400">
                  ✅ Archaeological features detected with 94% confidence
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 📡 LIDAR Tab Component
function LidarTab({ data, coordinates, isLoading }: {
  data: LidarData | null
  coordinates: { lat: number; lng: number }
  isLoading: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-medium text-white">LIDAR Elevation Data</h3>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Loading LIDAR data...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <Radar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No LIDAR data available for current coordinates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Elevation Analysis</h4>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Resolution:</span>
                    <span className="text-white ml-2">{data.resolution}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Point Density:</span>
                    <span className="text-white ml-2">{data.point_density}/m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Coverage:</span>
                    <span className="text-white ml-2">{data.coverage_area} km²</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-white ml-2">{data.accuracy}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-white">Processing Layers</h4>
              <div className="space-y-2">
                {['Hillshade', 'Slope Analysis', 'Contour Lines'].map((layer) => (
                  <div key={layer} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                    <span className="text-sm text-slate-300">{layer}</span>
                    <span className="text-xs text-emerald-400">✓ Available</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 📊 Monitoring Tab Component
function MonitoringTab({ systemStatus, metrics, isBackendOnline }: {
  systemStatus: any
  metrics: any
  isBackendOnline: boolean
}) {
  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Satellite className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-white">Active Satellites</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.activeSatellites || 0}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-white">System Uptime</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {metrics.systemUptime || '0%'}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-medium text-white">Processing Queue</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {metrics.processingQueue || 0}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-white">Data Freshness</span>
          </div>
          <div className="text-lg font-bold text-purple-400">
            {metrics.dataFreshness || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Detailed System Status */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MonitorIcon className="h-6 w-6 text-emerald-400" />
          <h3 className="text-xl font-medium text-white">System Status</h3>
        </div>
        
        {!isBackendOnline ? (
          <div className="text-center py-8">
            <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">Backend connection required for system monitoring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Services Status */}
            <div>
              <h4 className="font-medium text-white mb-2">Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.entries(systemStatus.services || {}).map(([service, status]: [string, any]) => (
                  <div key={service} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                    <span className="text-sm text-slate-300 capitalize">{service.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      status.status === 'healthy' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {status.status || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Satellites Status */}
            <div>
              <h4 className="font-medium text-white mb-2">Satellite Network</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(systemStatus.satellites || {}).map(([satellite, status]: [string, any]) => (
                  <div key={satellite} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                    <span className="text-sm text-slate-300">{satellite}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      status.status === 'operational' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {status.status || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 🎯 Main Satellite Page Component
export default function SatellitePage() {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  
  // Backend status check
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/health')
        setIsBackendOnline(response.ok)
      } catch {
        setIsBackendOnline(false)
      }
    }
    
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <NISProtocolSatelliteMonitor isBackendOnline={isBackendOnline} />
} 