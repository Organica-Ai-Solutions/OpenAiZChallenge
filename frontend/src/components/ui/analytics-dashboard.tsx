"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Slider } from "../../../components/ui/slider"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Layers,
  Zap,
  CheckCircle,
  Clock,
  Database,
  Globe,
  AlertCircle,
  Users
} from "lucide-react"

// Enhanced backend data interfaces
interface RealAnalyticsData {
  statistics: StatisticsData | null
  diagnostics: DiagnosticsData | null
  sites: SiteData[]
  agents: AgentData[]
  systemHealth: HealthData | null
  regions: RegionData[]
  dataSources: DataSourceData[]
  satelliteStatus: SatelliteStatusData | null
  satelliteAlerts: SatelliteAlertData[]
}

interface StatisticsData {
  total_sites_discovered: number
  sites_by_type: Record<string, number>
  analysis_metrics: {
    total_analyses: number
    successful_analyses: number
    success_rate: number
    avg_confidence: number
    high_confidence_discoveries: number
  }
  recent_activity: {
    last_24h_analyses: number
    last_7d_discoveries: number
    active_researchers: number
    ongoing_projects: number
  }
  model_performance: Record<string, {
    accuracy: number
    total_analyses?: number
    total_detections?: number
    processing_time_avg: number
    specialization: string
  }>
  geographic_coverage: {
    regions_analyzed: number
    total_area_km2: number
    density_sites_per_km2: number
    countries: string[]
    indigenous_territories: number
  }
  data_sources: Record<string, number>
  cultural_impact: {
    communities_engaged: number
    indigenous_partnerships: number
    knowledge_sharing_sessions: number
    cultural_protocols_followed: string
  }
  timestamp: string
  data_freshness: string
  system_uptime: string
}

interface DiagnosticsData {
  system_info: {
    version: string
    uptime: string
    environment: string
    last_restart: string
  }
  services: Record<string, {
    status: string
    response_time?: string
    requests_24h?: number
    analyses_24h?: number
    avg_confidence?: number
    detections_24h?: number
    success_rate?: number
    active_connections?: number
    active_agents?: number
    processing_queue?: number
  }>
  data_sources: Record<string, {
    status: string
    last_update?: string
    coverage?: string
    documents?: number
    digitized?: string
    communities?: number
    interviews?: number
  }>
  performance_metrics: {
    avg_analysis_time: string
    discovery_success_rate: number
    user_satisfaction: number
    system_reliability: number
  }
  storage: {
    database_size: string
    cache_usage: string
    available_space: string
    backup_status: string
  }
  timestamp: string
}

interface SiteData {
  site_id: string
  name: string
  coordinates: string
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
}

interface AgentData {
  id: string
  name: string
  type: string
  status: string
  performance: {
    accuracy: number
    processing_time: string
    success_rate?: number
  }
  specialization: string
}

interface HealthData {
  status: string
  services: Record<string, string>
  data_sources: Record<string, string>
  uptime: number
}

interface RegionData {
  id: string
  name: string
  bounds: number[][]
  description: string
  cultural_groups: string[]
  site_count: number
  recent_discoveries: number
  priority_level: string
}

interface DataSourceData {
  id: string
  name: string
  description: string
  availability: string
  processing_time: string
  accuracy_rate: number
  data_types: string[]
  resolution: string
  coverage: string
  update_frequency: string
  status: string
}

interface SatelliteStatusData {
  system_status: string
  active_satellites: number
  data_quality: string
  last_update: string
  coverage_percentage: number
}

interface SatelliteAlertData {
  id: string
  type: string
  severity: string
  location: string
  description: string
  timestamp: string
  status: string
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

// Chart data transformers
const transformSitesByType = (sites_by_type: Record<string, number>) => {
  return Object.entries(sites_by_type).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    percentage: Math.round((count / Object.values(sites_by_type).reduce((a, b) => a + b, 0)) * 100)
  }))
}

const transformModelPerformance = (model_performance: Record<string, any>) => {
  return Object.entries(model_performance).map(([model, data]) => ({
    model: model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    accuracy: data.accuracy,
    analyses: data.total_analyses || data.total_detections || 0,
    speed: parseFloat(data.processing_time_avg.toString()),
    specialization: data.specialization
  }))
}

const transformDataSources = (data_sources: Record<string, number>) => {
  return Object.entries(data_sources).map(([source, count]) => ({
    source: source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: Math.round((count / Object.values(data_sources).reduce((a, b) => a + b, 0)) * 100)
  }))
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<RealAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('bar')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isBackendOnline, setIsBackendOnline] = useState(false)

  // Enhanced real data loading from backend with additional endpoints
  const loadRealData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test backend connectivity
      const healthResponse = await fetch('http://localhost:8000/system/health')
      setIsBackendOnline(healthResponse.ok)

      if (!healthResponse.ok) {
        throw new Error('Backend is offline')
      }

      // Parallel fetch all real data sources including new analytics endpoints
      const [
        statisticsRes, 
        diagnosticsRes, 
        sitesRes, 
        agentsRes, 
        healthRes,
        regionsRes,
        dataSourcesRes,
        satelliteStatusRes,
        satelliteAlertsRes
      ] = await Promise.all([
        fetch('http://localhost:8000/statistics'),
        fetch('http://localhost:8000/system/diagnostics'),
        fetch('http://localhost:8000/research/sites?max_sites=50'),
        fetch('http://localhost:8000/agents/agents'),
        fetch('http://localhost:8000/system/health'),
        fetch('http://localhost:8000/research/regions'),
        fetch('http://localhost:8000/system/data-sources'),
        fetch('http://localhost:8000/satellite/status'),
        fetch('http://localhost:8000/satellite/alerts')
      ])

      const [
        statistics, 
        diagnostics, 
        sites, 
        agents, 
        systemHealth,
        regions,
        dataSources,
        satelliteStatus,
        satelliteAlerts
      ] = await Promise.all([
        statisticsRes.ok ? statisticsRes.json() : null,
        diagnosticsRes.ok ? diagnosticsRes.json() : null,
        sitesRes.ok ? sitesRes.json() : [],
        agentsRes.ok ? agentsRes.json() : [],
        healthRes.ok ? healthRes.json() : null,
        regionsRes.ok ? regionsRes.json() : null,
        dataSourcesRes.ok ? dataSourcesRes.json() : null,
        satelliteStatusRes.ok ? satelliteStatusRes.json() : null,
        satelliteAlertsRes.ok ? satelliteAlertsRes.json() : null
      ])

      setData({
        statistics,
        diagnostics,
        sites,
        agents,
        systemHealth,
        regions: regions?.data || [],
        dataSources: dataSources?.data || [],
        satelliteStatus,
        satelliteAlerts: satelliteAlerts?.data || []
      })

      setLastRefresh(new Date())
      console.log('✅ Enhanced analytics data loaded successfully:', {
        statistics: !!statistics,
        diagnostics: !!diagnostics,
        sites: sites?.length || 0,
        agents: agents?.length || 0,
        regions: regions?.data?.length || 0,
        dataSources: dataSources?.data?.length || 0,
        satelliteAlerts: satelliteAlerts?.data?.length || 0
      })

    } catch (error) {
      console.error('❌ Failed to load analytics data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      setIsBackendOnline(false)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced export functionality with multiple formats
  const handleExport = async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    if (!data) return

    try {
      const exportData = {
        exported_at: new Date().toISOString(),
        system_info: {
          backend_online: isBackendOnline,
          last_refresh: lastRefresh.toISOString(),
          data_freshness: data.statistics?.data_freshness || 'unknown'
        },
        statistics: data.statistics,
        diagnostics: data.diagnostics,
        sites_summary: {
          total_sites: data.sites.length,
          filtered_sites: filteredData?.sites.length || 0,
          sites_by_confidence: data.sites.reduce((acc, site) => {
            const range = site.confidence >= 0.9 ? '90-100%' : 
                         site.confidence >= 0.8 ? '80-90%' : 
                         site.confidence >= 0.7 ? '70-80%' : '60-70%'
            acc[range] = (acc[range] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          sites_by_region: data.regions?.reduce((acc, region) => {
            acc[region.name] = region.site_count
            return acc
          }, {} as Record<string, number>) || {}
        },
        agents_summary: {
          total_agents: data.agents.length,
          average_accuracy: data.agents.length > 0 ? 
            data.agents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / data.agents.length : 0,
          agents_by_status: data.agents.reduce((acc, agent) => {
            acc[agent.status] = (acc[agent.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        regional_analysis: {
          total_regions: data.regions?.length || 0,
          regions_by_priority: data.regions?.reduce((acc, region) => {
            acc[region.priority_level] = (acc[region.priority_level] || 0) + 1
            return acc
          }, {} as Record<string, number>) || {},
          cultural_groups_total: data.regions?.reduce((sum, region) => sum + region.cultural_groups.length, 0) || 0
        },
        data_sources_analysis: {
          total_sources: data.dataSources?.length || 0,
          active_sources: data.dataSources?.filter(source => source.status === 'active').length || 0,
          average_accuracy: data.dataSources?.length > 0 ? 
            data.dataSources.reduce((sum, source) => sum + source.accuracy_rate, 0) / data.dataSources.length : 0
        },
        satellite_monitoring: {
          system_status: data.satelliteStatus?.system_status || 'unknown',
          active_satellites: data.satelliteStatus?.active_satellites || 0,
          total_alerts: data.satelliteAlerts?.length || 0,
          alerts_by_severity: data.satelliteAlerts?.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1
            return acc
          }, {} as Record<string, number>) || {}
        }
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nis-analytics-comprehensive-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Create CSV export for key metrics
        const csvData = [
          ['Metric', 'Value', 'Category'],
          ['Total Sites Discovered', data.statistics?.total_sites_discovered || 0, 'Sites'],
          ['Success Rate', `${data.statistics?.analysis_metrics.success_rate || 0}%`, 'Performance'],
          ['Average Confidence', `${((data.statistics?.analysis_metrics.avg_confidence || 0) * 100).toFixed(1)}%`, 'Performance'],
          ['Active Agents', data.agents.length, 'Agents'],
          ['Active Regions', data.regions?.length || 0, 'Geographic'],
          ['Active Data Sources', data.dataSources?.filter(s => s.status === 'active').length || 0, 'Data Sources'],
          ['Satellite Alerts', data.satelliteAlerts?.length || 0, 'Monitoring']
        ]
        
        const csvContent = csvData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nis-analytics-summary-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      console.log(`📊 Analytics data exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('❌ Export failed:', error)
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    loadRealData()
  }, [timeRange])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadRealData, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Filtered data based on user selections
  const filteredData = useMemo(() => {
    if (!data) return null

    let filteredSites = data.sites

    if (selectedRegion !== 'all') {
      filteredSites = filteredSites.filter(site => 
        site.cultural_significance.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        site.name.toLowerCase().includes(selectedRegion.toLowerCase())
      )
    }

    filteredSites = filteredSites.filter(site => site.confidence * 100 >= confidenceThreshold[0])

    return {
      ...data,
      sites: filteredSites
    }
  }, [data, selectedRegion, confidenceThreshold])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full h-96 flex items-center justify-center bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
          <div className="flex items-center space-x-3 text-white">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
            <div>
              <p className="font-medium text-lg">Loading Real Analytics Data...</p>
              <p className="text-sm text-white/60">Connecting to NIS Protocol backend</p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (error || !isBackendOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full h-96 flex items-center justify-center bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
          <div className="text-center text-white">
            <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-400" />
            <h3 className="text-xl font-semibold mb-4">Backend Connection Failed</h3>
            <p className="text-white/60 mb-6 max-w-md">
              {error || 'Cannot connect to NIS Protocol backend at localhost:8000'}
            </p>
            <Button 
              onClick={loadRealData} 
              variant="outline" 
              className="border-white/[0.2] text-white hover:bg-white/[0.1] backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!data || !filteredData) {
    return (
      <Card className="w-full h-96 flex items-center justify-center bg-slate-800 border-slate-700">
        <div className="text-center text-white">
          <Database className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <p className="text-slate-400">No analytics data available</p>
        </div>
      </Card>
    )
  }

  const stats = data.statistics
  const diagnostics = data.diagnostics

  return (
    <div className="space-y-6">
      {/* Backend Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-emerald-100 font-medium">NIS Protocol Backend Online</p>
              <p className="text-emerald-300 text-sm">
                Real archaeological data • Last refresh: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              {stats?.system_uptime || 'Active'}
            </Badge>
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              {stats?.data_freshness || 'Real-time'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span>Real Archaeological Analytics</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Live data from NIS Protocol • {stats?.total_sites_discovered || 0} sites discovered • {filteredData.sites.length} sites shown
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm text-slate-300">Auto Refresh</Label>
              </div>
              <Button size="sm" onClick={loadRealData} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('json')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Region Filter</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="amazon">Amazon Basin</SelectItem>
                  <SelectItem value="andes">Andes Mountains</SelectItem>
                  <SelectItem value="nazca">Nazca Region</SelectItem>
                  <SelectItem value="coast">Coastal Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Min Confidence: {confidenceThreshold[0]}%</Label>
              <Slider
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                max={100}
                min={50}
                step={5}
                className="w-full [&_[role=slider]]:bg-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Chart Type</Label>
              <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'area') => setChartType(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Discoveries</p>
                <p className="text-2xl font-bold text-white">{stats?.total_sites_discovered || 0}</p>
              </div>
              <Target className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats?.recent_activity.last_7d_discoveries || 0} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">{stats?.analysis_metrics.success_rate.toFixed(1) || 0}%</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-400 mt-2">
              <span>{stats?.analysis_metrics.total_analyses || 0} total analyses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-white">{((stats?.analysis_metrics.avg_confidence || 0) * 100).toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-yellow-400 mt-2">
              <span>{diagnostics?.performance_metrics.avg_analysis_time || '3.2s'} avg time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Regions</p>
                <p className="text-2xl font-bold text-white">{stats?.geographic_coverage.regions_analyzed || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-purple-400 mt-2">
              <span>{stats?.geographic_coverage.countries.length || 0} countries</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <Tabs defaultValue="site_types" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-slate-800 border-slate-700">
          <TabsTrigger value="site_types" className="data-[state=active]:bg-emerald-600">Site Types</TabsTrigger>
          <TabsTrigger value="model_performance" className="data-[state=active]:bg-emerald-600">AI Models</TabsTrigger>
          <TabsTrigger value="data_sources" className="data-[state=active]:bg-emerald-600">Data Sources</TabsTrigger>
          <TabsTrigger value="geographic" className="data-[state=active]:bg-emerald-600">Geographic</TabsTrigger>
          <TabsTrigger value="system_health" className="data-[state=active]:bg-emerald-600">System Health</TabsTrigger>
          <TabsTrigger value="regional_analysis" className="data-[state=active]:bg-emerald-600">Regional</TabsTrigger>
          <TabsTrigger value="satellite_monitoring" className="data-[state=active]:bg-emerald-600">Satellite</TabsTrigger>
        </TabsList>

        <TabsContent value="site_types" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <PieChartIcon className="h-5 w-5 text-emerald-400" />
                <span>Archaeological Site Types Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={transformSitesByType(stats?.sites_by_type || {})}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {transformSitesByType(stats?.sites_by_type || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model_performance" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Activity className="h-5 w-5 text-emerald-400" />
                <span>AI Model Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={transformModelPerformance(stats?.model_performance || {})}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="model" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#10B981" name="Accuracy %" />
                  <Bar dataKey="analyses" fill="#3B82F6" name="Total Analyses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data_sources" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="h-5 w-5 text-emerald-400" />
                <span>Data Sources Utilization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={transformDataSources(stats?.data_sources || {})}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="source" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>Geographic Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Area Analyzed</span>
                    <span className="text-white font-semibold">{stats?.geographic_coverage.total_area_km2.toLocaleString() || 0} km²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Site Density</span>
                    <span className="text-white font-semibold">{stats?.geographic_coverage.density_sites_per_km2 || 0} sites/km²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Indigenous Territories</span>
                    <span className="text-white font-semibold">{stats?.geographic_coverage.indigenous_territories || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Countries:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(stats?.geographic_coverage.countries || []).map((country, index) => (
                        <Badge key={index} variant="outline" className="border-emerald-500/50 text-emerald-400">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>Cultural Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Communities Engaged</span>
                    <span className="text-white font-semibold">{stats?.cultural_impact.communities_engaged || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Indigenous Partnerships</span>
                    <span className="text-white font-semibold">{stats?.cultural_impact.indigenous_partnerships || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Knowledge Sessions</span>
                    <span className="text-white font-semibold">{stats?.cultural_impact.knowledge_sharing_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cultural Protocol Compliance</span>
                    <span className="text-emerald-400 font-semibold">{stats?.cultural_impact.cultural_protocols_followed || '100%'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system_health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <span>Service Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnostics?.services && Object.entries(diagnostics.services).map(([service, data]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{service.replace('_', ' ')}</span>
                      <Badge 
                        variant={data.status === 'healthy' ? 'default' : 'destructive'}
                        className={data.status === 'healthy' ? 'bg-emerald-600' : 'bg-red-600'}
                      >
                        {data.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Discovery Success Rate</span>
                    <span className="text-emerald-400 font-semibold">
                      {((diagnostics?.performance_metrics.discovery_success_rate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">User Satisfaction</span>
                    <span className="text-blue-400 font-semibold">
                      {((diagnostics?.performance_metrics.user_satisfaction || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">System Reliability</span>
                    <span className="text-purple-400 font-semibold">
                      {((diagnostics?.performance_metrics.system_reliability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Database Size</span>
                    <span className="text-yellow-400 font-semibold">{diagnostics?.storage.database_size || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional_analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>Regional Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData?.regions?.map(region => ({
                    name: region.name.replace(' ', '\n'),
                    sites: region.site_count,
                    discoveries: region.recent_discoveries,
                    priority: region.priority_level === 'very_high' ? 4 : 
                             region.priority_level === 'high' ? 3 : 
                             region.priority_level === 'medium' ? 2 : 1
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar dataKey="sites" fill="#10B981" name="Total Sites" />
                    <Bar dataKey="discoveries" fill="#3B82F6" name="Recent Discoveries" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>Cultural Groups by Region</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {filteredData?.regions?.map((region, index) => (
                    <div key={region.id} className="border-b border-slate-700 pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-medium">{region.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${
                            region.priority_level === 'very_high' ? 'border-red-500 text-red-400' :
                            region.priority_level === 'high' ? 'border-orange-500 text-orange-400' :
                            'border-yellow-500 text-yellow-400'
                          }`}
                        >
                          {region.priority_level.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {region.cultural_groups.map((group, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            {group}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{region.description}</p>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satellite_monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <span>Satellite System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">System Status</span>
                    <Badge 
                      variant={filteredData?.satelliteStatus?.system_status === 'operational' ? 'default' : 'destructive'}
                      className={filteredData?.satelliteStatus?.system_status === 'operational' ? 'bg-emerald-600' : 'bg-red-600'}
                    >
                      {filteredData?.satelliteStatus?.system_status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Active Satellites</span>
                    <span className="text-white font-semibold">{filteredData?.satelliteStatus?.active_satellites || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Data Quality</span>
                    <span className="text-emerald-400 font-semibold">{filteredData?.satelliteStatus?.data_quality || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Coverage</span>
                    <span className="text-blue-400 font-semibold">{filteredData?.satelliteStatus?.coverage_percentage || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span>Active Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredData?.satelliteAlerts?.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="border border-slate-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge 
                          variant="outline"
                          className={`${
                            alert.severity === 'high' ? 'border-red-500 text-red-400' :
                            alert.severity === 'medium' ? 'border-yellow-500 text-yellow-400' :
                            'border-blue-500 text-blue-400'
                          }`}
                        >
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">{alert.type}</span>
                      </div>
                      <p className="text-sm text-white mb-1">{alert.description}</p>
                      <p className="text-xs text-slate-400">{alert.location}</p>
                    </div>
                  )) || []}
                  {(!filteredData?.satelliteAlerts || filteredData.satelliteAlerts.length === 0) && (
                    <p className="text-slate-400 text-center py-4">No active alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <span>Data Source Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={filteredData?.dataSources?.map(source => ({
                    name: source.name.split(' ')[0],
                    accuracy: source.accuracy_rate,
                    status: source.status === 'active' ? 100 : 0
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="accuracy" fill="#10B981" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Layers className="h-5 w-5 text-emerald-400" />
                <span>Data Source Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 text-slate-300">Data Source</th>
                      <th className="text-left py-2 text-slate-300">Status</th>
                      <th className="text-left py-2 text-slate-300">Accuracy</th>
                      <th className="text-left py-2 text-slate-300">Processing Time</th>
                      <th className="text-left py-2 text-slate-300">Coverage</th>
                      <th className="text-left py-2 text-slate-300">Update Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData?.dataSources?.map((source, index) => (
                      <tr key={source.id} className="border-b border-slate-700/50">
                        <td className="py-3 text-white font-medium">{source.name}</td>
                        <td className="py-3">
                          <Badge 
                            variant={source.status === 'active' ? 'default' : 'destructive'}
                            className={source.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'}
                          >
                            {source.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-emerald-400">{source.accuracy_rate}%</td>
                        <td className="py-3 text-slate-300">{source.processing_time}</td>
                        <td className="py-3 text-slate-300">{source.coverage}</td>
                        <td className="py-3 text-slate-300">{source.update_frequency}</td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 