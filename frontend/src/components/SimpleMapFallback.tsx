"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { 
  MapPin, 
  Satellite, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Database,
  Zap
} from "lucide-react"
import { config, makeBackendRequest, isBackendAvailable } from "../lib/config"

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

interface SimpleMapFallbackProps {
  onSiteSelect?: (site: ArchaeologicalSite) => void
  onCoordinateAnalyze?: (coordinates: string) => void
}

export default function SimpleMapFallback({ 
  onSiteSelect, 
  onCoordinateAnalyze 
}: SimpleMapFallbackProps) {
  const [sites, setSites] = useState<ArchaeologicalSite[]>([])
  const [backendOnline, setBackendOnline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  // Check backend status using secure configuration
  const checkBackend = async () => {
    try {
      console.log('🔍 Checking backend connectivity...')
      const isOnline = await isBackendAvailable()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        console.log('✅ Backend is online - will use real data')
      } else {
        console.log('❌ Backend is offline')
        
        if (config.dataSources.useRealDataOnly) {
          setError('Backend required for real data mode. Please start the backend service.')
          return
        }
      }
    } catch (err) {
      console.error('Backend check failed:', err)
      setBackendOnline(false)
      
      if (config.dataSources.useRealDataOnly) {
        setError('Failed to connect to backend. Real data mode requires backend connection.')
      }
    }
  }

  // Load sites using real backend data
  const loadSites = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🏛️ Loading archaeological sites from backend...')
      
      const response = await makeBackendRequest(
        `${config.dataSources.endpoints.sites}?max_sites=50&min_confidence=0.5`,
        { method: 'GET' }
      )

      if (response.success) {
        setSites(response.data)
        setLastUpdate(new Date().toISOString())
        console.log(`✅ Loaded ${response.data.length} real archaeological sites from backend`)
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('❌ Failed to load real site data:', err)
      
      if (config.dataSources.useRealDataOnly) {
        setError('Failed to load real site data. Please check backend connection.')
        setSites([])
      } else {
        setError('Backend unavailable. Contact system administrator.')
        setSites([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Trigger analysis using real backend
  const triggerRealAnalysis = async (coordinates: string) => {
    try {
      console.log('🎯 Triggering real backend analysis for:', coordinates)
      
      // Parse coordinates
      const coords = coordinates.split(',').map(c => parseFloat(c.trim()))
      if (coords.length !== 2 || coords.some(isNaN)) {
        throw new Error('Invalid coordinates format')
      }
      
      const [lat, lon] = coords
      
      const response = await makeBackendRequest(
        config.dataSources.endpoints.analyze,
        {
          method: 'POST',
          body: JSON.stringify({ 
            lat, 
            lon,
            analysis_type: 'comprehensive',
            data_sources: ['satellite', 'lidar', 'historical', 'indigenous'],
            real_data_only: true
          })
        }
      )

      if (response.success) {
        console.log('✅ Real analysis triggered successfully')
        if (onCoordinateAnalyze) {
          onCoordinateAnalyze(coordinates)
        }
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('❌ Real analysis failed:', err)
      setError(`Analysis failed: ${(err as Error).message}`)
    }
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
  }, [])

  // Reload when backend comes online
  useEffect(() => {
    if (backendOnline) {
      loadSites()
    }
  }, [backendOnline])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-emerald-500'
    if (confidence >= 0.8) return 'bg-blue-500'
    if (confidence >= 0.7) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'settlement': return '🏘️'
      case 'ceremonial': return '🏛️'
      case 'agricultural': return '🌾'
      case 'trade': return '🛣️'
      case 'defensive': return '🏰'
      default: return '📍'
    }
  }

  return (
    <div className="h-full bg-slate-50 rounded-lg border overflow-hidden">
      {/* Header with Real Data Status */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Archaeological Sites Map</h3>
            {config.dataSources.useRealDataOnly && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Database className="h-3 w-3 mr-1" />
                Real Data Only
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              {backendOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600">Backend Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">Backend Offline</span>
                </>
              )}
            </div>
          <Button
            variant="outline"
              size="sm"
              onClick={loadSites}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </Button>
          </div>
            </div>
        
        {lastUpdate && (
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-red-700 border-red-300"
            onClick={checkBackend}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Real Data Status Banner */}
      {config.dataSources.useRealDataOnly && backendOnline && (
        <div className="p-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Real Data Mode Active - All data sourced from live backend
            </span>
          </div>
        </div>
      )}

      {/* Map Visualization */}
      <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 h-full">
            {Array(64).fill(0).map((_, i) => (
              <div key={i} className="border border-green-300"></div>
            ))}
          </div>
        </div>

        {/* Real Sites as dots on the map */}
        <div className="absolute inset-0">
          {sites.map((site, index) => {
            const coords = site.coordinates.split(', ').map(Number)
            if (coords.length !== 2) return null
            
            // Convert coordinates to percentage position (simplified)
            const [lat, lng] = coords
            const x = ((lng + 180) / 360) * 100
            const y = ((90 - lat) / 180) * 100
            
            return (
              <div
                key={site.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                style={{ 
                  left: `${Math.max(5, Math.min(95, x))}%`, 
                  top: `${Math.max(5, Math.min(95, y))}%` 
                }}
                onClick={async () => {
                  console.log('🎯 Site selected for real analysis:', site.name)
                  if (onSiteSelect) onSiteSelect(site)
                  await triggerRealAnalysis(site.coordinates)
                }}
              >
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getConfidenceColor(site.confidence)} animate-pulse`}>
                  <div className="sr-only">{site.name}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Map overlay with real data stats */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
          <div className="text-xs text-gray-600">
            {config.dataSources.useRealDataOnly ? 'Real Data' : 'Archaeological'} Sites Map
          </div>
          <div className="text-xs text-gray-500">
            {sites.length} sites {backendOnline ? 'from backend' : 'cached'}
          </div>
          {backendOnline && (
            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3" />
              Live backend connection
            </div>
          )}
        </div>
        </div>

      {/* Sites List with Real Data */}
      <div className="h-full overflow-y-auto bg-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">
              {config.dataSources.useRealDataOnly ? 'Real' : 'Discovered'} Archaeological Sites
            </h4>
            {sites.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {sites.length} sites loaded
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading real archaeological data...
              </div>
            ) : error && sites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p>No data available</p>
                <p className="text-xs">Check backend connection</p>
              </div>
            ) : (
              sites.map(site => (
                <Card 
                  key={site.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-l-4"
                  style={{
                    borderLeftColor: site.confidence >= 0.9 ? '#10B981' :
                                   site.confidence >= 0.8 ? '#3B82F6' :
                                   site.confidence >= 0.7 ? '#F59E0B' : '#EF4444'
                  }}
                  onClick={async () => {
                    console.log('🎯 Triggering real backend analysis for:', site.name)
                    if (onSiteSelect) onSiteSelect(site)
                    await triggerRealAnalysis(site.coordinates)
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(site.type)}</span>
                        <h5 className="font-medium text-sm">{site.name}</h5>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {(site.confidence * 100).toFixed(0)}%
                        </Badge>
                        {backendOnline && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Real
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Coordinates:</span>
                        <code className="bg-gray-100 px-1 rounded">{site.coordinates}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Period:</span>
                        <span>{site.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{site.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{site.size_hectares || 'Unknown'} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sources:</span>
                        <span>{site.data_sources.join(', ')}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {site.cultural_significance}
                    </p>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={async (e) => {
                          e.stopPropagation()
                          await triggerRealAnalysis(site.coordinates)
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Analyze with Backend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
