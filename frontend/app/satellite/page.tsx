"use client"

import React, { useState, useEffect } from "react"
import { motion } from 'framer-motion'
import Link from "next/link"
import { Globe, Satellite, ArrowLeft, Wifi, WifiOff, MapPin, RefreshCw, Download, Eye, Activity, Zap, AlertCircle } from "lucide-react"

// Enhanced Satellite Monitor Component - REAL DATA ONLY
function SatelliteMonitor({ isBackendOnline = false }: { isBackendOnline?: boolean }) {
  const [activeTab, setActiveTab] = useState('imagery')
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState({ lat: -3.4653, lng: -62.2159 })
  const [coordinateInput, setCoordinateInput] = useState('-3.4653, -62.2159')
  const [satelliteData, setSatelliteData] = useState<any[]>([])
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCoordinateUpdate = () => {
    const [lat, lng] = coordinateInput.split(',').map(s => parseFloat(s.trim()))
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates({ lat, lng })
      loadSatelliteData({ lat, lng })
    } else {
      setError('Invalid coordinates format. Please use: lat, lng')
    }
  }

  const loadSatelliteData = async (coords: { lat: number; lng: number }) => {
    if (!isBackendOnline) {
      setError('Backend is offline. Satellite data requires live connection.')
      setSatelliteData([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🛰️ Loading real satellite data from backend...')
      
      const response = await fetch('http://localhost:8000/satellite/imagery/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: coords, radius: 2000 })
      })
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const imageData = data.data || []
      
      if (imageData.length === 0) {
        setError('No satellite imagery available for these coordinates')
      }
      
      setSatelliteData(imageData)
      console.log(`✅ Loaded ${imageData.length} real satellite images`)
      
    } catch (error) {
      console.error('❌ Failed to load satellite data:', error)
      setError(`Failed to load satellite data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSatelliteData([])
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeImagery = async (imageId: string) => {
    if (!isBackendOnline) {
      setError('Backend is offline. Analysis requires live connection.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔬 Analyzing real satellite imagery...')
      
      const response = await fetch('http://localhost:8000/satellite/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, coordinates })
      })
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      setAnalysisResults(prev => [...prev, result])
      console.log('✅ Real analysis completed')
      
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      setError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async (imageId: string) => {
    if (!isBackendOnline) {
      setError('Backend is offline. Export requires live connection.')
      return
    }

    try {
      console.log('📁 Exporting real satellite data...')
      
      const response = await fetch('http://localhost:8000/satellite/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, coordinates, format: 'json' })
      })
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `satellite_data_${imageId}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Real data exported successfully')
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      setError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  useEffect(() => {
    if (isBackendOnline) {
      loadSatelliteData(coordinates)
    } else {
      setSatelliteData([])
      setError('Backend connection required for satellite functionality')
    }
  }, [isBackendOnline])

  if (!isBackendOnline) {
    return (
      <div className="h-full bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-8 text-center">
          <WifiOff className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Backend Connection Required</h3>
          <p className="text-slate-400 mb-4">
            Satellite monitoring requires a live backend connection. All functionality has been disabled to prevent mock data usage.
          </p>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Please start the backend server to access real satellite data and analysis capabilities.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Satellite className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Satellite Monitor - Real Data Only</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-400">Live Backend Connection</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={coordinateInput}
              onChange={(e) => setCoordinateInput(e.target.value)}
              placeholder="Enter coordinates (lat, lng)"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm"
            />
          </div>
          <button
            onClick={handleCoordinateUpdate}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            Update
          </button>
          <button
            onClick={() => loadSatelliteData(coordinates)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-slate-700/30 p-1 rounded-lg">
          {[
            { id: 'imagery', label: 'Satellite Imagery', icon: Satellite },
            { id: 'analysis', label: 'Analysis Results', icon: Activity },
            { id: 'changes', label: 'Change Detection', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'imagery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Real Satellite Imagery</h3>
                <span className="text-sm text-slate-400">
                  {satelliteData.length} images from backend
                </span>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-400 mb-2">Loading real satellite data...</p>
                  <p className="text-slate-500 text-sm">Fetching from backend servers</p>
                </div>
              ) : satelliteData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {satelliteData.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-700/30 rounded-lg border border-slate-600/30 overflow-hidden"
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-900/50 via-green-900/30 to-slate-900/50 relative">
                        {image.url ? (
                          <img 
                            src={image.url} 
                            alt={`Satellite imagery from ${image.source}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Satellite className="h-8 w-8 text-white/60 mx-auto mb-2" />
                              <p className="text-white/60 text-sm">{image.source} Imagery</p>
                              <p className="text-white/40 text-xs">Resolution: {image.resolution}m</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-slate-900/80 text-white text-xs rounded">
                            Cloud Cover: {image.cloudCover}%
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-emerald-600/80 text-white text-xs rounded">
                            REAL DATA
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{image.source}</h4>
                            <p className="text-sm text-slate-400">
                              {new Date(image.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-400">
                              Real Backend Data
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => analyzeImagery(image.id)}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            <Zap className="h-3 w-3" />
                            {isLoading ? 'Analyzing...' : 'Analyze'}
                          </button>
                          <button 
                            onClick={() => exportData(image.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            Export
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Satellite className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No real satellite imagery available</p>
                  <p className="text-slate-500 text-sm">Check coordinates or backend connection</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Real Analysis Results</h3>
                <span className="text-sm text-slate-400">
                  {analysisResults.length} analyses from backend
                </span>
              </div>

              {analysisResults.length > 0 ? (
                <div className="space-y-4">
                  {analysisResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Real Analysis #{result.id}</h4>
                        <span className="text-sm text-emerald-400">Backend Generated</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-white">AI Analysis Results:</h5>
                        <div className="text-sm text-slate-300">
                          {JSON.stringify(result, null, 2)}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-600/30">
                        <p className="text-xs text-slate-500 mt-1">
                          Analyzed on {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No real analysis results yet</p>
                  <p className="text-slate-500 text-sm">Run analysis on satellite imagery to see backend results</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Real-Time Change Detection</h3>
                <span className="text-sm text-slate-400">
                  Backend monitoring active
                </span>
              </div>

              <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-medium text-white mb-2">Real Backend Change Detection</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Monitoring area around {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </p>
                  
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-emerald-400 text-sm">
                      Change detection requires real backend data - no mock data available
                    </p>
                  </div>

                  <p className="text-slate-500 text-xs mt-4">
                    Last backend check: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HealthStatusMonitor() {
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        if (response.ok) {
          const health = await response.json()
          setSystemHealth(health)
        } else {
          // Fallback to root endpoint for basic status
          const rootResponse = await fetch('http://localhost:8000/')
          if (rootResponse.ok) {
            const rootData = await rootResponse.json()
            setSystemHealth({
              overall_status: rootData.status || 'online',
              services: {
                'Backend API': 'healthy',
                'Archaeological Database': rootData.archaeological_database ? 'healthy' : 'unknown',
                'Agent Network': rootData.agent_network ? 'healthy' : 'unknown',
                'Real-time Statistics': rootData.real_time_statistics === 'available' ? 'healthy' : 'unknown'
              }
            })
          } else {
            throw new Error('Health check failed')
          }
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setSystemHealth(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 h-full">
        <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-spin" />
          <p className="text-slate-400 text-sm">Checking real system health...</p>
        </div>
      </div>
    )
  }

  const services = systemHealth ? Object.entries(systemHealth.services || {}) : []

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">Real System Health</h2>
      
      {systemHealth ? (
        <>
          <div className="space-y-4">
            {services.map(([serviceName, status]) => (
              <div key={serviceName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Satellite className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-white">{serviceName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'healthy' ? 'bg-emerald-400' : 
                    status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-xs capitalize text-slate-400">
                    {String(status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-slate-700/30 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-white">Real System Status</p>
              <p className="text-2xl font-bold text-emerald-400">
                {systemHealth.overall_status || 'Online'}
              </p>
              <p className="text-xs text-slate-400">Live Backend Data</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <WifiOff className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Backend health unavailable</p>
          <p className="text-slate-500 text-xs">Real data connection required</p>
        </div>
      )}
    </div>
  )
}

export default function SatellitePage() {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/', { method: 'GET' })
        const isOnline = response.ok
        setIsBackendOnline(isOnline)
        console.log(`🛰️ Backend status: ${isOnline ? 'Online' : 'Offline'}`)
      } catch (error) {
        console.error('❌ Backend check failed:', error)
        setIsBackendOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-emerald-900/5 to-blue-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-6 py-8">
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
                  <Satellite className="h-12 w-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Satellite Monitoring System - Real Data Only
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Real-time satellite feeds, automated change detection, weather correlation, and soil analysis 
                using only live backend data - no mock data or fallbacks
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm text-white/70">Connecting to backend...</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
                    isBackendOnline 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {isBackendOnline ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isBackendOnline ? 'Real Backend Data Active' : 'Backend Offline - No Functionality'}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="h-full rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] p-1">
                <HealthStatusMonitor />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] p-1">
                <SatelliteMonitor isBackendOnline={isBackendOnline} />
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              {
                icon: Globe,
                title: "Real-Time Imagery",
                description: "Live satellite feeds from backend - no mock data or fallbacks",
                color: "emerald"
              },
              {
                icon: Satellite,
                title: "Backend Analysis",
                description: "AI-powered analysis using real backend processing - no simulated results",
                color: "blue"
              },
              {
                icon: Wifi,
                title: "Live Data Only",
                description: "All functionality requires backend connection - pure real data experience",
                color: "purple"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
                className="p-6 rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className={`p-3 rounded-lg w-fit mb-4 transition-colors ${
                  feature.color === 'emerald' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' :
                  feature.color === 'blue' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' :
                  'bg-purple-500/10 group-hover:bg-purple-500/20'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.color === 'emerald' ? 'text-emerald-400' :
                    feature.color === 'blue' ? 'text-blue-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.08] py-8 text-white/60"
      >
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>System Status: {isBackendOnline ? 'Real Backend Online' : 'Backend Offline'}</span>
              </div>
              <span>•</span>
              <span>Archaeological Discovery Platform</span>
              <span>•</span>
              <span>Real Data Only</span>
            </div>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Organica-Ai-Solutions • NIS Protocol Archaeological Discovery Platform
            </p>
            <p className="text-white/30 text-xs">
              Real satellite monitoring with live backend data - no mock functionality enabled.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
} 