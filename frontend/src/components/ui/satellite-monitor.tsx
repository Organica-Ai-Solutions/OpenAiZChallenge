"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Progress } from "../../../components/ui/progress"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Slider } from "../../../components/ui/slider"
import { Input } from "../../../components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts"
import {
  Satellite,
  AlertTriangle,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Activity,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Layers,
  Image,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Search,
  Settings,
  Play,
  Pause,
  Target,
  Save,
  Share2,
  Maximize,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Info
} from "lucide-react"
import {
  satelliteService,
  SatelliteImagery,
  ChangeDetection,
  WeatherData,
  SoilData,
  SatelliteAlert
} from "../../lib/satellite"
import { alertEngine } from "../../lib/alert-engine"
import { config, makeBackendRequest } from "../../lib/config"

interface MonitorState {
  activeImagery: SatelliteImagery[]
  changeDetections: ChangeDetection[]
  weatherData: WeatherData[]
  soilData: SoilData | null
  alerts: SatelliteAlert[]
  isLoading: boolean
  lastUpdate: Date | null
  analysisResults: any[]
  exportQueue: any[]
}

interface SatelliteMonitorProps {
  isBackendOnline?: boolean
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export function SatelliteMonitor({ isBackendOnline = false }: SatelliteMonitorProps) {
  const [state, setState] = useState<MonitorState>({
    activeImagery: [],
    changeDetections: [],
    weatherData: [],
    soilData: null,
    alerts: [],
    isLoading: false,
    lastUpdate: null,
    analysisResults: [],
    exportQueue: []
  })

  const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: -3.4653, lng: -62.2159 })
  const [coordinateInput, setCoordinateInput] = useState('-3.4653, -62.2159')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all')
  const [changeDetectionEnabled, setChangeDetectionEnabled] = useState(true)
  const [weatherUpdateInterval, setWeatherUpdateInterval] = useState(30) // minutes
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('imagery')

  // Real data loading function with backend integration
  const loadSatelliteData = useCallback(async () => {
    if (!isBackendOnline) {
      console.log('🔄 Backend offline, skipping data load')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      console.log('🛰️ Loading real satellite data from backend...')

      // Real backend requests - no fallbacks to mock data
      const [imageryResponse, changesResponse, weatherResponse, soilResponse] = await Promise.all([
        makeBackendRequest('/satellite/imagery/latest', {
          method: 'POST',
          body: JSON.stringify({ coordinates: selectedCoordinates, radius: 2000 })
        }),
        makeBackendRequest('/satellite/change-detection', {
          method: 'POST',
          body: JSON.stringify({ 
            coordinates: selectedCoordinates,
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date().toISOString()
          })
        }),
        makeBackendRequest('/satellite/weather', {
          method: 'POST',
          body: JSON.stringify({ coordinates: selectedCoordinates, days: 30 })
        }),
        makeBackendRequest('/satellite/soil', {
          method: 'POST',
          body: JSON.stringify({ coordinates: selectedCoordinates })
        })
      ])

      // Process real data
      const imagery = imageryResponse.success && Array.isArray(imageryResponse.data) ? imageryResponse.data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        coordinates: {
          ...item.coordinates,
          bounds: item.coordinates.bounds || {
            north: selectedCoordinates.lat + 0.01,
            south: selectedCoordinates.lat - 0.01,
            east: selectedCoordinates.lng + 0.01,
            west: selectedCoordinates.lng - 0.01
          }
        }
      })) : []

      const changes = changesResponse.success && Array.isArray(changesResponse.data) ? changesResponse.data.map((item: any) => ({
        ...item,
        detectedAt: new Date(item.detectedAt),
        beforeImage: { ...item.beforeImage, timestamp: new Date(item.beforeImage.timestamp) },
        afterImage: { ...item.afterImage, timestamp: new Date(item.afterImage.timestamp) }
      })) : []

      const weather = weatherResponse.success && Array.isArray(weatherResponse.data) ? weatherResponse.data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) : []

      const soil = soilResponse.success ? {
        ...soilResponse.data,
        timestamp: new Date(soilResponse.data.timestamp)
      } : null

      setState(prev => ({
        ...prev,
        activeImagery: imagery,
        changeDetections: changes,
        weatherData: weather,
        soilData: soil,
        isLoading: false,
        lastUpdate: new Date()
      }))

      console.log(`✅ Loaded: ${imagery.length} images, ${changes.length} changes, ${weather.length} weather points`)

      // Update alert engine with real data
      if (isBackendOnline) {
        alertEngine.updateData({
          imagery,
          changes,
          weather,
          soil: soil ? [soil] : []
        })
      }

    } catch (error) {
      console.error('❌ Failed to load satellite data:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [selectedCoordinates, isBackendOnline])

  // Real-time data refresh
  useEffect(() => {
    if (isBackendOnline) {
      loadSatelliteData()
    }
  }, [loadSatelliteData, isBackendOnline])

  useEffect(() => {
    if (!autoRefresh || !isBackendOnline) return

    const interval = setInterval(loadSatelliteData, weatherUpdateInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, weatherUpdateInterval, loadSatelliteData, isBackendOnline])

  // Coordinate input handler
  const handleCoordinateChange = (value: string) => {
    setCoordinateInput(value)
    const coords = value.split(',').map(s => parseFloat(s.trim()))
    if (coords.length === 2 && !coords.some(isNaN)) {
      setSelectedCoordinates({ lat: coords[0], lng: coords[1] })
    }
  }

  // Enhanced button handlers with real backend integration
  const handleAnalyzeImagery = async (image: SatelliteImagery) => {
    if (!isBackendOnline) {
      window.alert('❌ Backend offline. Real-time analysis unavailable.')
      return
    }

    try {
      setIsAnalyzing(true)
      console.log('🔬 Starting real imagery analysis...')
      
      const analysisResponse = await makeBackendRequest('/satellite/analyze-imagery', {
        method: 'POST',
        body: JSON.stringify({ 
          image_id: image.id, 
          coordinates: image.coordinates,
          analysis_type: 'archaeological'
        })
      })
      
      if (analysisResponse.success) {
        const analysis = analysisResponse.data
        setState(prev => ({
          ...prev,
          analysisResults: [analysis, ...prev.analysisResults.slice(0, 9)]
        }))
        
        console.log('✅ Analysis completed:', analysis)
        window.alert(`🎯 Analysis complete!\n\nFeatures detected: ${analysis.features_detected?.length || 0}\nConfidence: ${(analysis.confidence * 100).toFixed(1)}%\nRecommendations: ${analysis.recommendations?.join(', ') || 'Review findings manually'}`)
      } else {
        throw new Error(analysisResponse.error || 'Analysis failed')
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error)
      window.alert('❌ Failed to analyze imagery. Please check connection and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewChangeDetails = async (change: ChangeDetection) => {
    if (!isBackendOnline) {
      window.alert('❌ Backend offline. Change details unavailable.')
      return
    }

    try {
      console.log('👁️ Loading change details...')
      
      const detailsResponse = await makeBackendRequest(`/satellite/change-details/${change.id}`, {
        method: 'GET'
      })
      
      if (detailsResponse.success) {
        const details = detailsResponse.data
        
        const detailsText = `🔍 Change Analysis Details

📊 Analysis:
• Change Probability: ${(details.detailed_analysis?.change_probability * 100)?.toFixed(1) || 'N/A'}%
• Affected Area: ${details.detailed_analysis?.affected_area_km2?.toFixed(3) || 'N/A'} km²
• Change Direction: ${details.detailed_analysis?.change_direction || 'Unknown'}
• Archaeological Relevance: ${details.archaeological_relevance || 'Unknown'}

🎯 Recommendations:
${details.recommendations?.map((r: string) => `• ${r}`).join('\n') || '• No specific recommendations'}

📅 Detected: ${change.detectedAt.toLocaleString()}
📍 Location: ${change.area.lat.toFixed(6)}, ${change.area.lng.toFixed(6)}`

        window.alert(detailsText)
      } else {
        throw new Error(detailsResponse.error || 'Failed to load details')
      }
      
    } catch (error) {
      console.error('❌ Change details error:', error)
      window.alert('❌ Failed to load change details. Please try again.')
    }
  }

  const handleReviewAlert = async (alertItem: SatelliteAlert) => {
    if (!isBackendOnline) {
      window.alert('❌ Backend offline. Alert review unavailable.')
      return
    }

    try {
      console.log('📋 Reviewing alert...')
      
      const reviewResponse = await makeBackendRequest(`/satellite/review-alert/${alertItem.id}`, {
        method: 'POST',
        body: JSON.stringify({ coordinates: alertItem.coordinates })
      })
      
      if (reviewResponse.success) {
        const review = reviewResponse.data
        
        const reviewText = `🚨 Alert Review: ${alertItem.title}

📊 Status: ${review.review_status || 'Pending'}
🎯 Trigger: ${review.detailed_information?.trigger_conditions || 'Automated detection'}
📈 Confidence Factors: ${review.detailed_information?.confidence_factors?.join(', ') || 'Standard analysis'}

🔄 Next Steps:
${review.next_steps?.map((step: string) => `• ${step}`).join('\n') || '• Continue monitoring'}

⚠️ Severity: ${alertItem.severity.toUpperCase()}
📍 Location: ${alertItem.coordinates.lat.toFixed(6)}, ${alertItem.coordinates.lng.toFixed(6)}
⏰ Detected: ${alertItem.timestamp.toLocaleString()}`

        window.alert(reviewText)
      } else {
        throw new Error(reviewResponse.error || 'Review failed')
      }
      
    } catch (error) {
      console.error('❌ Alert review error:', error)
      window.alert('❌ Failed to review alert. Please try again.')
    }
  }

  const handleExportData = async (dataType: string) => {
    if (!isBackendOnline) {
      window.alert('❌ Backend offline. Data export unavailable.')
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      console.log('📁 Starting data export...')
      
      const exportResponse = await makeBackendRequest('/satellite/export-data', {
        method: 'POST',
        body: JSON.stringify({ 
          data_type: dataType, 
          format: 'json',
          coordinates: selectedCoordinates,
          include_metadata: true
        })
      })
      
      if (exportResponse.success) {
        const exportResult = exportResponse.data
        
        setState(prev => ({
          ...prev,
          exportQueue: [exportResult, ...prev.exportQueue.slice(0, 4)]
        }))
        
        const exportText = `📥 Data Export Ready

📦 Type: ${exportResult.data_type}
📄 Format: ${exportResult.format}
📏 Size: ${exportResult.file_size}
✅ Status: ${exportResult.status}
🔗 Download: ${exportResult.download_url || 'Processing...'}

Export queued successfully. ${exportResult.download_url ? 'Opening download link...' : 'You will be notified when ready.'}`

        window.alert(exportText)
        
        // Open download if available
        if (exportResult.download_url) {
          window.open(exportResult.download_url, '_blank')
        }
      } else {
        throw new Error(exportResponse.error || 'Export failed')
      }
      
    } catch (error) {
      console.error('❌ Export error:', error)
      window.alert('❌ Failed to export data. Please try again.')
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Real-time alert subscription
  useEffect(() => {
    if (!isBackendOnline) return

    const unsubscribeAlerts = satelliteService.subscribeToAlerts((alert) => {
      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts.slice(0, 49)]
      }))
      console.log('🔔 New alert received:', alert.title)
    })

    const unsubscribeChanges = satelliteService.subscribeToChangeDetection((change) => {
      if (changeDetectionEnabled) {
        setState(prev => ({
          ...prev,
          changeDetections: [change, ...prev.changeDetections.slice(0, 19)]
        }))
        console.log('🔄 New change detected:', change.changeType)
      }
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeChanges()
    }
  }, [changeDetectionEnabled, isBackendOnline])

  // Filter and computed data
  const filteredAlerts = state.alerts.filter(alert => 
    alertSeverityFilter === 'all' || alert.severity === alertSeverityFilter
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'vegetation': return <Droplets className="h-4 w-4 text-green-400" />
      case 'construction': return <Activity className="h-4 w-4 text-orange-400" />
      case 'erosion': return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'archaeological': return <MapPin className="h-4 w-4 text-purple-400" />
      default: return <Eye className="h-4 w-4 text-gray-400" />
    }
  }

  const weatherTrend = state.weatherData.slice(0, 7).reverse().map(w => ({
    date: w.timestamp.toLocaleDateString(),
    temperature: w.temperature,
    humidity: w.humidity,
    precipitation: w.precipitation
  }))

  const soilComposition = state.soilData && state.soilData.composition ? [
    { name: 'Sand', value: state.soilData.composition.sand },
    { name: 'Silt', value: state.soilData.composition.silt },
    { name: 'Clay', value: state.soilData.composition.clay },
    { name: 'Organic', value: state.soilData.composition.organicMatter }
  ] : []

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Satellite className="h-5 w-5 text-emerald-400" />
                  <span>Satellite Monitoring System</span>
                  <div className={`ml-2 w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </CardTitle>
                <CardDescription className="text-white/60">
                  {isBackendOnline ? 'Real-time satellite feeds, change detection, and environmental analysis' : 'Backend offline - Limited functionality'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    disabled={!isBackendOnline}
                  />
                  <Label htmlFor="auto-refresh" className="text-sm text-white/70">Auto Update</Label>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={loadSatelliteData} 
                        disabled={state.isLoading || !isBackendOnline}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load latest satellite data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExportData('all')} 
                        disabled={state.isLoading || !isBackendOnline}
                        className="border-white/[0.2] hover:bg-white/[0.05] text-white/70"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export all satellite data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Coordinates</Label>
                <Input
                  value={coordinateInput}
                  onChange={(e) => handleCoordinateChange(e.target.value)}
                  placeholder="lat, lng"
                  className="bg-white/[0.03] border-white/[0.1] text-white font-mono text-sm"
                  disabled={!isBackendOnline}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Update Interval</Label>
                <Select 
                  value={weatherUpdateInterval.toString()} 
                  onValueChange={(value) => setWeatherUpdateInterval(parseInt(value))}
                  disabled={!isBackendOnline}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Alert Filter</Label>
                <Select value={alertSeverityFilter} onValueChange={setAlertSeverityFilter}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Last Update</Label>
                <div className="text-sm text-white/60 font-mono py-2">
                  {state.lastUpdate ? state.lastUpdate.toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Active Images",
            value: state.activeImagery.length,
            icon: Image,
            color: "blue",
            subtitle: state.activeImagery[0]?.timestamp.toLocaleDateString() || "No data"
          },
          {
            title: "Changes Detected", 
            value: state.changeDetections.length,
            icon: Activity,
            color: "orange",
            subtitle: `High confidence: ${state.changeDetections.filter(c => c.confidence > 80).length}`
          },
          {
            title: "Active Alerts",
            value: filteredAlerts.length,
            icon: AlertTriangle,
            color: "red",
            subtitle: `Critical: ${filteredAlerts.filter(a => a.severity === 'critical').length}`
          },
          {
            title: "Current Temp",
            value: state.weatherData[0]?.temperature.toFixed(1) || '--',
            unit: "°C",
            icon: Thermometer,
            color: "green",
            subtitle: `Humidity: ${state.weatherData[0]?.humidity.toFixed(0) || '--'}%`
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/60">{metric.title}</p>
                    <p className="text-2xl font-bold text-white">
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                  <metric.icon className={`h-8 w-8 text-${metric.color}-400`} />
                </div>
                <div className="flex items-center space-x-1 text-xs text-white/50 mt-2">
                  <Clock className="h-3 w-3" />
                  <span>{metric.subtitle}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Tabs with enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/[0.05] border border-white/[0.1]">
            <TabsTrigger value="imagery" className="data-[state=active]:bg-white/[0.1] text-white/70 data-[state=active]:text-white">
              Satellite Imagery
            </TabsTrigger>
            <TabsTrigger value="changes" className="data-[state=active]:bg-white/[0.1] text-white/70 data-[state=active]:text-white">
              Change Detection
            </TabsTrigger>
            <TabsTrigger value="weather" className="data-[state=active]:bg-white/[0.1] text-white/70 data-[state=active]:text-white">
              Weather Analysis
            </TabsTrigger>
            <TabsTrigger value="soil" className="data-[state=active]:bg-white/[0.1] text-white/70 data-[state=active]:text-white">
              Soil Composition
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-white/[0.1] text-white/70 data-[state=active]:text-white">
              Alert Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="imagery" className="space-y-4 mt-6">
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Layers className="h-5 w-5 text-emerald-400" />
                  <span>Recent Satellite Imagery</span>
                  {!isBackendOnline && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Offline
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isBackendOnline ? (
                  <div className="text-center py-12">
                    <WifiOff className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">Backend Offline</h3>
                    <p className="text-sm text-white/40 max-w-md mx-auto">
                      Connect to backend to access real-time satellite imagery and analysis.
                    </p>
                  </div>
                ) : state.activeImagery.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">No Imagery Available</h3>
                    <p className="text-sm text-white/40 max-w-md mx-auto">
                      No satellite imagery found for the current coordinates. Try a different location or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.activeImagery.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                      >
                        <Card className="bg-white/[0.03] border-white/[0.1] hover:border-white/[0.2] transition-all duration-300 group">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg mb-3 flex items-center justify-center border border-white/[0.05]">
                              {image.url ? (
                                <img 
                                  src={image.url} 
                                  alt={`Satellite imagery ${image.id}`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <Image className="h-8 w-8 text-white/30" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="border-white/[0.2] text-white/70">
                                  {image.source}
                                </Badge>
                                <span className="text-xs text-white/50">
                                  {image.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm text-white/60">
                                <div>Resolution: {image.resolution.toFixed(1)}m</div>
                                <div>Cloud Cover: {image.cloudCover.toFixed(0)}%</div>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30" 
                                onClick={() => handleAnalyzeImagery(image)}
                                disabled={isAnalyzing || !isBackendOnline}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="space-y-4 mt-6">
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-orange-400" />
                  <span>Change Detection Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isBackendOnline ? (
                  <div className="text-center py-12">
                    <WifiOff className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">Backend Offline</h3>
                    <p className="text-sm text-white/40">Change detection requires backend connection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.changeDetections.map((change, index) => (
                      <motion.div
                        key={change.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      >
                        <Card className="p-4 bg-white/[0.03] border-white/[0.1] hover:border-white/[0.2] transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getChangeTypeIcon(change.changeType)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium capitalize text-white">{change.changeType} Change</h4>
                                  <Badge className={`${change.confidence > 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                    {change.confidence.toFixed(1)}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-white/60">
                                  {change.area.lat.toFixed(4)}, {change.area.lng.toFixed(4)} • {change.area.radius}m radius
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                                  <span>Score: {change.changeScore.toFixed(1)}</span>
                                  <span>Area: {(change.features.area_changed / 1000).toFixed(1)}k m²</span>
                                  <span>Detected: {change.detectedAt.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewChangeDetails(change)}
                              className="border-white/[0.2] hover:bg-white/[0.05] text-white/70"
                              disabled={!isBackendOnline}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4 mt-6">
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  <span>Weather Trends (7 days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isBackendOnline ? (
                  <div className="text-center py-12">
                    <WifiOff className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">Backend Offline</h3>
                    <p className="text-sm text-white/40">Weather analysis requires backend connection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/[0.03] border-white/[0.1] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <LineChart className="h-5 w-5 text-emerald-400" />
                          <span>Temperature Trends</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={weatherTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°C)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.03] border-white/[0.1] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Droplets className="h-5 w-5 text-emerald-400" />
                          <span>Humidity Trends</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={weatherTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity (%)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soil" className="space-y-4 mt-6">
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <PieChart className="h-5 w-5 text-emerald-400" />
                  <span>Soil Composition</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isBackendOnline ? (
                  <div className="text-center py-12">
                    <WifiOff className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">Backend Offline</h3>
                    <p className="text-sm text-white/40">Soil composition analysis requires backend connection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/[0.03] border-white/[0.1] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <PieChart className="h-5 w-5 text-emerald-400" />
                          <span>Soil Composition</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={soilComposition}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {soilComposition.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.03] border-white/[0.1] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Info className="h-5 w-5 text-emerald-400" />
                          <span>Soil Properties</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {state.soilData && state.soilData.nutrients && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">pH Level</div>
                                <div className="font-medium">{state.soilData.nutrients.ph.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Moisture</div>
                                <div className="font-medium">{state.soilData.moisture.toFixed(1)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Temperature</div>
                                <div className="font-medium">{state.soilData.temperature.toFixed(1)}°C</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Drainage</div>
                                <div className="font-medium capitalize">{state.soilData.drainage}</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Nutrients (mg/kg)</h4>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <div className="text-gray-500">Nitrogen</div>
                                  <div className="font-medium">{state.soilData.nutrients.nitrogen.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Phosphorus</div>
                                  <div className="font-medium">{state.soilData.nutrients.phosphorus.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Potassium</div>
                                  <div className="font-medium">{state.soilData.nutrients.potassium.toFixed(0)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 mt-6">
            <Card className="bg-white/[0.02] border-white/[0.1] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <AlertTriangle className="h-5 w-5 text-emerald-400" />
                  <span>Active Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isBackendOnline ? (
                  <div className="text-center py-12">
                    <WifiOff className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white/60 mb-2">Backend Offline</h3>
                    <p className="text-sm text-white/40">Alert center requires backend connection.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAlerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No alerts for selected criteria</p>
                      </div>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <Card key={alert.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <h4 className="font-medium">{alert.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{alert.coordinates.lat.toFixed(4)}, {alert.coordinates.lng.toFixed(4)}</span>
                                <span>Confidence: {alert.confidence.toFixed(1)}%</span>
                                <span>{alert.timestamp.toLocaleString()}</span>
                              </div>
                            </div>
                            {alert.actionRequired && (
                              <Button size="sm" variant="outline" onClick={() => handleReviewAlert(alert)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 