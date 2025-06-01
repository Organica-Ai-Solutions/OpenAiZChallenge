"use client"

import { useState, useEffect, useMemo } from "react"
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
  Zap
} from "lucide-react"

interface AnalyticsData {
  discoveries: DiscoveryData[]
  analysisStats: AnalysisStats
  temporalData: TemporalData[]
  regionData: RegionData[]
  confidenceDistribution: ConfidenceData[]
  modelPerformance: ModelPerformanceData[]
}

interface DiscoveryData {
  id: string
  coordinates: string
  lat: number
  lon: number
  confidence: number
  type: string
  date: string
  region: string
  models_used: string[]
  processing_time: number
  significance: 'Low' | 'Medium' | 'High'
}

interface AnalysisStats {
  total_analyses: number
  successful_discoveries: number
  avg_confidence: number
  avg_processing_time: number
  regions_analyzed: number
  models_deployed: number
}

interface TemporalData {
  date: string
  discoveries: number
  analyses: number
  avg_confidence: number
}

interface RegionData {
  region: string
  discoveries: number
  avg_confidence: number
  success_rate: number
}

interface ConfidenceData {
  range: string
  count: number
  percentage: number
}

interface ModelPerformanceData {
  model: string
  accuracy: number
  speed: number
  discoveries: number
  avg_confidence: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')

  // Mock data generation for demo
  const generateMockData = (): AnalyticsData => {
    const discoveries: DiscoveryData[] = Array.from({ length: 25 }, (_, i) => ({
      id: `discovery_${i}`,
      coordinates: `${(-5 + Math.random() * 10).toFixed(4)}, ${(-65 + Math.random() * 10).toFixed(4)}`,
      lat: -5 + Math.random() * 10,
      lon: -65 + Math.random() * 10,
      confidence: 60 + Math.random() * 40,
      type: ['settlement', 'ceremonial', 'agricultural', 'pathway'][Math.floor(Math.random() * 4)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      region: ['Amazon Basin', 'Andes Mountains', 'Cerrado', 'Atlantic Forest'][Math.floor(Math.random() * 4)],
      models_used: ['YOLO8', 'Waldo', 'GPT-4V'].slice(0, Math.floor(Math.random() * 3) + 1),
      processing_time: 1 + Math.random() * 5,
      significance: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High'
    }))

    const analysisStats: AnalysisStats = {
      total_analyses: 156,
      successful_discoveries: discoveries.length,
      avg_confidence: discoveries.reduce((sum, d) => sum + d.confidence, 0) / discoveries.length,
      avg_processing_time: discoveries.reduce((sum, d) => sum + d.processing_time, 0) / discoveries.length,
      regions_analyzed: 4,
      models_deployed: 6
    }

    const temporalData: TemporalData[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split('T')[0],
        discoveries: Math.floor(Math.random() * 5),
        analyses: Math.floor(Math.random() * 10) + 2,
        avg_confidence: 70 + Math.random() * 20
      }
    })

    const regionData: RegionData[] = [
      { region: 'Amazon Basin', discoveries: 12, avg_confidence: 78.5, success_rate: 82.3 },
      { region: 'Andes Mountains', discoveries: 8, avg_confidence: 84.2, success_rate: 76.1 },
      { region: 'Cerrado', discoveries: 3, avg_confidence: 71.8, success_rate: 68.9 },
      { region: 'Atlantic Forest', discoveries: 2, avg_confidence: 79.1, success_rate: 71.4 }
    ]

    const confidenceDistribution: ConfidenceData[] = [
      { range: '60-70%', count: 5, percentage: 20 },
      { range: '70-80%', count: 8, percentage: 32 },
      { range: '80-90%', count: 10, percentage: 40 },
      { range: '90-100%', count: 2, percentage: 8 }
    ]

    const modelPerformance: ModelPerformanceData[] = [
      { model: 'YOLO8', accuracy: 87.3, speed: 2.1, discoveries: 18, avg_confidence: 79.2 },
      { model: 'Waldo', accuracy: 82.1, speed: 3.4, discoveries: 15, avg_confidence: 75.8 },
      { model: 'GPT-4V', accuracy: 91.7, speed: 5.2, discoveries: 12, avg_confidence: 88.1 },
      { model: 'ResNet-50', accuracy: 78.9, speed: 1.8, discoveries: 9, avg_confidence: 72.3 },
      { model: 'BERT', accuracy: 85.4, speed: 2.9, discoveries: 6, avg_confidence: 81.7 }
    ]

    return {
      discoveries,
      analysisStats,
      temporalData,
      regionData,
      confidenceDistribution,
      modelPerformance
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Try to fetch real data first
      const response = await fetch('http://localhost:8000/analytics/dashboard', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const realData = await response.json()
        setData(realData)
      } else {
        throw new Error('Backend unavailable')
      }
    } catch (error) {
      console.log('Using mock data for analytics dashboard')
      setData(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [timeRange, selectedRegion])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const filteredData = useMemo(() => {
    if (!data) return null

    let filtered = data.discoveries
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(d => d.region === selectedRegion)
    }
    
    filtered = filtered.filter(d => d.confidence >= confidenceThreshold[0])

    return {
      ...data,
      discoveries: filtered
    }
  }, [data, selectedRegion, confidenceThreshold])

  const stats = useMemo(() => {
    if (!filteredData) return null

    const totalDiscoveries = filteredData.discoveries.length
    const highConfidence = filteredData.discoveries.filter(d => d.confidence >= 80).length
    const recentDiscoveries = filteredData.discoveries.filter(d => {
      const discoveryDate = new Date(d.date)
      const daysDiff = (Date.now() - discoveryDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length

    return {
      totalDiscoveries,
      highConfidence,
      recentDiscoveries,
      successRate: totalDiscoveries > 0 ? (highConfidence / totalDiscoveries * 100).toFixed(1) : '0'
    }
  }, [filteredData])

  if (loading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </Card>
    )
  }

  if (!data || !filteredData || !stats) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics Dashboard</span>
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of archaeological discoveries and system performance
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
              <Button size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Amazon Basin">Amazon Basin</SelectItem>
                  <SelectItem value="Andes Mountains">Andes Mountains</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                  <SelectItem value="Atlantic Forest">Atlantic Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Min Confidence: {confidenceThreshold[0]}%</Label>
              <Slider
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Chart Type</Label>
              <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'area') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Discoveries</p>
                <p className="text-2xl font-bold">{stats.totalDiscoveries}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats.recentDiscoveries} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold">{stats.highConfidence}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <span>{stats.successRate}% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{data.analysisStats.avg_confidence.toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <span>{data.analysisStats.avg_processing_time.toFixed(1)}s avg time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regions Analyzed</p>
                <p className="text-2xl font-bold">{data.analysisStats.regions_analyzed}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <span>{data.analysisStats.models_deployed} models deployed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="temporal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="temporal">Temporal Trends</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Distribution</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="scatter">Discovery Scatter</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChartIcon className="h-5 w-5" />
                <span>Discovery Trends Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'line' && (
                  <LineChart data={data.temporalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="discoveries" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="analyses" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                )}
                {chartType === 'bar' && (
                  <BarChart data={data.temporalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="discoveries" fill="#8884d8" />
                    <Bar dataKey="analyses" fill="#82ca9d" />
                  </BarChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={data.temporalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="discoveries" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="analyses" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Regional Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="discoveries" fill="#8884d8" />
                  <Bar dataKey="avg_confidence" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5" />
                <span>Confidence Score Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.confidenceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percentage }) => `${range}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.confidenceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>AI Model Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.modelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#8884d8" />
                  <Bar dataKey="discoveries" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <span>Discovery Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={filteredData.discoveries}>
                  <CartesianGrid />
                  <XAxis dataKey="lat" name="Latitude" />
                  <YAxis dataKey="lon" name="Longitude" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="confidence" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 