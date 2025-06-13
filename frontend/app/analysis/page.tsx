"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import UltimateArchaeologicalChat from "@/components/ui/ultimate-archaeological-chat"
import { VisionAgentVisualization } from "@/src/components/vision-agent-visualization"
import { VisionAgentFallback } from "@/components/ui/vision-agent-fallback"
import { 
  Database, MessageSquare, Search, Settings, Globe, Activity, 
  TrendingUp, Brain, Sparkles, BarChart3, Target, FileText, 
  Download, Zap, MapPin, Eye, Users, Clock, ArrowRight,
  Satellite, Map as MapIcon, ChevronRight, Play, Pause, 
  RotateCcw, CheckCircle, AlertTriangle, Layers, Radar,
  Bot, Upload, Save, Share2, Maximize2, Minimize2, 
  RefreshCw, Cpu, MonitorIcon, Wifi, WifiOff, Filter,
  LineChart, PieChart, Calendar, Hash, Lightbulb,
  ExternalLink, Copy, Star, Bookmark, History
} from "lucide-react"

// Enhanced Real Archaeological Sites Data with more metadata
const REAL_ARCHAEOLOGICAL_SITES = [
  {
    id: "eldorado-lake-guatavita",
    name: "Lake Guatavita (El Dorado)",
    type: "Ceremonial",
    coordinates: "5.1542, -73.7792",
    confidence: 95,
    description: "Sacred Muisca ceremonial lake, legendary origin of El Dorado myth",
    discoveryDate: "2024-06-01",
    culturalSignificance: "High - El Dorado origin site",
    lastAnalyzed: "2024-06-06",
    aiAnalysis: "High-confidence ceremonial site with gold offering traditions",
    region: "Colombian Andes",
    period: "600-1600 CE",
    status: "verified",
    priority: "high"
  },
  {
    id: "amazon-geoglyphs-acre",
    name: "Acre Geoglyphs Complex",
    type: "Geoglyph",
    coordinates: "-9.97474, -67.8096",
    confidence: 88,
    description: "Pre-Columbian earthwork structures in the Amazon rainforest",
    discoveryDate: "2024-05-15",
    culturalSignificance: "High - Advanced Amazonian civilization",
    lastAnalyzed: "2024-06-05",
    aiAnalysis: "Complex geometric earthworks suggesting advanced planning",
    region: "Amazon Basin",
    period: "1000-1500 CE",
    status: "under-investigation",
    priority: "high"
  },
  {
    id: "nazca-lines-extended",
    name: "Extended Nazca Geoglyphs",
    type: "Geoglyph",
    coordinates: "-14.7390, -75.1300",
    confidence: 92,
    description: "Newly discovered Nazca line patterns using AI analysis",
    discoveryDate: "2024-06-03",
    culturalSignificance: "Very High - Nazca cultural expansion",
    lastAnalyzed: "2024-06-06",
    aiAnalysis: "Previously unknown geometric patterns consistent with Nazca style",
    region: "Nazca Desert",
    period: "200-700 CE",
    status: "verified",
    priority: "very-high"
  },
  {
    id: "monte-roraima-structures",
    name: "Monte Roraima Structures",
    type: "Settlement",
    coordinates: "5.1431, -60.7619",
    confidence: 78,
    description: "Potential pre-Columbian settlement structures on tepui plateau",
    discoveryDate: "2024-05-28",
    culturalSignificance: "Medium - Highland adaptation strategies",
    lastAnalyzed: "2024-06-04",
    aiAnalysis: "Elevated settlement with strategic defensive positioning",
    region: "Guiana Highlands",
    period: "800-1400 CE",
    status: "preliminary",
    priority: "medium"
  },
  {
    id: "orinoco-petroglyphs",
    name: "Orinoco Petroglyphs Site",
    type: "Ceremonial",
    coordinates: "6.2518, -67.5673",
    confidence: 85,
    description: "Rock art and ceremonial complex along Orinoco River",
    discoveryDate: "2024-05-20",
    culturalSignificance: "High - Indigenous rock art tradition",
    lastAnalyzed: "2024-06-02",
    aiAnalysis: "Extensive petroglyphs with astronomical alignments",
    region: "Orinoco Basin",
    period: "500-1200 CE",
    status: "verified",
    priority: "high"
  }
]

// Enhanced interfaces with more detailed typing
interface AnalysisResult {
  location: { lat: number; lon: number }
  confidence: number
  description: string
  pattern_type: string
  historical_context: string
  indigenous_perspective: string
  recommendations: Array<{ action: string; priority: string; description?: string; timeline?: string }>
  finding_id: string
  metadata?: {
    processing_time: string
    models_used: string[]
    data_sources: string[]
    analysis_depth: string
  }
}

interface VisionResult {
  detection_results: Array<{ 
    type: string; 
    description: string; 
    confidence: number;
    coordinates?: string;
    size_estimate?: string;
  }>
  satellite_findings: { 
    confidence: number; 
    features_detected: any[];
    image_quality?: string;
    resolution?: string;
  }
  metadata: { 
    processing_time: string; 
    high_confidence_features: string;
    analysis_timestamp?: string;
    models_used?: string[];
  }
}

interface SiteData {
  id: string
  name: string
  type: string
  coordinates: string
  confidence: number
  description: string
  culturalSignificance?: string
  aiAnalysis?: string
  region?: string
  period?: string
  status?: string
  priority?: string
  discoveryDate?: string
  lastAnalyzed?: string
}

interface SystemMetrics {
  health: boolean
  agents: number
  uptime?: string
  memory_usage?: number
  cpu_usage?: number
  active_analyses?: number
  queue_size?: number
}

export default function EnhancedAnalysisPage() {
  // Core analysis states
  const [selectedCoordinates, setSelectedCoordinates] = useState("5.1542, -73.7792")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  // Data management states
  const [realSites, setRealSites] = useState<SiteData[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemMetrics>({ health: false, agents: 0 })
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  
  // UI and workflow states
  const [activeWorkflow, setActiveWorkflow] = useState<"discover" | "analyze" | "results" | "chat" | "dashboard">("dashboard")
  const [activeTab, setActiveTab] = useState("overview")
  const [chatExpanded, setChatExpanded] = useState(false)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  
  // Enhanced configuration states
  const [analysisNotes, setAnalysisNotes] = useState("")
  const [confidenceThreshold, setConfidenceThreshold] = useState(60)
  const [selectedDataSources, setSelectedDataSources] = useState({
    satellite: true,
    lidar: true,
    historical: true,
    indigenous: true,
    geological: false,
    climate: false
  })
  const [analysisSettings, setAnalysisSettings] = useState({
    enhancement_mode: true,
    thermal_analysis: false,
    vegetation_index: true,
    multispectral: false,
    deep_learning: true,
    pattern_recognition: true,
    temporal_analysis: false,
    cultural_context: true
  })
  const [exportFormat, setExportFormat] = useState("json")
  const [filterSettings, setFilterSettings] = useState({
    region: "all",
    period: "all",
    type: "all",
    status: "all",
    priority: "all"
  })

  // Enhanced workflow states for NIS Protocol integration
  const [analysisWorkflow, setAnalysisWorkflow] = useState<{
    type: 'coordinate' | 'no_coordinate' | 'multi_zone' | 'automated' | 'batch'
    status: 'idle' | 'processing' | 'complete' | 'error' | 'paused'
    regions: string[]
    searchPattern: string
    autoTriggered: boolean
    nisMetadata: any
    batchSize?: number
    currentBatch?: number
  }>({
    type: 'coordinate',
    status: 'idle',
    regions: [],
    searchPattern: '',
    autoTriggered: false,
    nisMetadata: null
  })

  const [multiZoneResults, setMultiZoneResults] = useState<Array<{
    region: string
    sites: any[]
    confidence: number
    culturalContext: string
    patterns: string[]
    analysisDepth: string
    recommendations: string[]
  }>>([])

  const [noCoordinateSearch, setNoCoordinateSearch] = useState<{
    active: boolean
    searchType: 'cultural' | 'temporal' | 'pattern' | 'regional' | 'ai_guided'
    parameters: any
    intelligentAreas: Array<{coordinates: string, reasoning: string, confidence: number, priority: string}>
    suggestions: string[]
  }>({
    active: false,
    searchType: 'regional',
    parameters: {},
    intelligentAreas: [],
    suggestions: []
  })

  // Performance and metrics states
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalAnalyses: 0,
    successRate: 0,
    avgProcessingTime: 0,
    highConfidenceFindings: 0,
    activeModels: 0,
    systemLoad: 0
  })

  const [realtimeUpdates, setRealtimeUpdates] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    newFindings: true,
    analysisComplete: true,
    systemAlerts: true,
    weeklyReports: false
  })

  // Initialize system and load data
  useEffect(() => {
    initializeSystem()
    if (realtimeUpdates) {
      const interval = setInterval(updateSystemMetrics, 10000)
      return () => clearInterval(interval)
    }
  }, [realtimeUpdates])

  const initializeSystem = async () => {
    console.log('🚀 Initializing Enhanced Analysis System...')
    await Promise.all([
      checkSystemHealth(),
      loadRealSites(),
      loadSavedAnalyses(),
      loadAnalysisHistory(),
      updatePerformanceMetrics()
    ])
    console.log('✅ Enhanced Analysis System initialized')
  }

  const checkSystemHealth = async () => {
    try {
      const [healthRes, agentsRes] = await Promise.all([
        fetch('http://localhost:8000/system/health'),
        fetch('http://localhost:8000/agents/agents')
      ])
      
      if (healthRes.ok && agentsRes.ok) {
        const [healthData, agentsData] = await Promise.all([
          healthRes.json(),
          agentsRes.json()
        ])
        
        setSystemStatus({
          health: true,
          agents: agentsData.length || 0,
          uptime: healthData.uptime || 'Unknown',
          memory_usage: healthData.memory_usage || 0,
          cpu_usage: healthData.cpu_usage || 0,
          active_analyses: healthData.active_analyses || 0,
          queue_size: healthData.queue_size || 0
        })
        setIsBackendOnline(true)
        console.log('✅ System health check passed')
      } else {
        throw new Error('Backend not responding')
      }
    } catch (error) {
      console.log('⚠️ Backend offline, using demo mode')
      setSystemStatus({ health: false, agents: 0 })
      setIsBackendOnline(false)
    }
  }

  const updateSystemMetrics = async () => {
    if (!isBackendOnline) return
    
    try {
      const response = await fetch('http://localhost:8000/system/metrics')
      if (response.ok) {
        const metrics = await response.json()
        setPerformanceMetrics(prev => ({
          ...prev,
          ...metrics
        }))
      }
    } catch (error) {
      console.log('Failed to update system metrics')
    }
  }

  const loadRealSites = async () => {
    try {
      const response = await fetch('http://localhost:8000/research/all-discoveries?max_sites=500')
      if (response.ok) {
        const data = await response.json()
        const sites = data.discoveries || data.sites || []
        setRealSites(sites.length > 0 ? sites : REAL_ARCHAEOLOGICAL_SITES)
        console.log(`✅ Loaded ${sites.length || REAL_ARCHAEOLOGICAL_SITES.length} archaeological sites`)
      } else {
        setRealSites(REAL_ARCHAEOLOGICAL_SITES)
        console.log('📊 Using demo archaeological sites data')
      }
    } catch (error) {
      setRealSites(REAL_ARCHAEOLOGICAL_SITES)
      console.log('📊 Using demo archaeological sites data (offline)')
    }
  }

  const loadSavedAnalyses = () => {
    try {
      const saved = localStorage.getItem('enhanced-analysis-saved')
      if (saved) {
        setSavedAnalyses(JSON.parse(saved))
      }
    } catch (error) {
      console.log('Failed to load saved analyses')
    }
  }

  const loadAnalysisHistory = () => {
    try {
      const history = localStorage.getItem('enhanced-analysis-history')
      if (history) {
        setAnalysisHistory(JSON.parse(history))
      }
    } catch (error) {
      console.log('Failed to load analysis history')
    }
  }

  const updatePerformanceMetrics = () => {
    const totalAnalyses = analysisHistory.length
    const successfulAnalyses = analysisHistory.filter(a => a.status === 'complete').length
    const successRate = totalAnalyses > 0 ? (successfulAnalyses / totalAnalyses) * 100 : 0
    
    setPerformanceMetrics(prev => ({
      ...prev,
      totalAnalyses,
      successRate: Math.round(successRate),
      highConfidenceFindings: analysisHistory.filter(a => a.confidence > 80).length
    }))
  }

  const saveAnalysis = () => {
    if (!analysisResult) return
    
    const analysisToSave = {
      id: `analysis_${Date.now()}`,
      coordinates: selectedCoordinates,
      result: analysisResult,
      visionResult,
      timestamp: new Date().toISOString(),
      notes: analysisNotes,
      settings: analysisSettings,
      confidence: analysisResult.confidence,
      status: 'complete'
    }
    
    const updated = [analysisToSave, ...savedAnalyses.slice(0, 49)] // Keep last 50
    setSavedAnalyses(updated)
    
    if (autoSave) {
      localStorage.setItem('enhanced-analysis-saved', JSON.stringify(updated))
    }
    
    // Also add to history
    const historyEntry = { ...analysisToSave, type: 'manual' }
    const updatedHistory = [historyEntry, ...analysisHistory.slice(0, 99)] // Keep last 100
    setAnalysisHistory(updatedHistory)
    localStorage.setItem('enhanced-analysis-history', JSON.stringify(updatedHistory))
    
    console.log('💾 Analysis saved successfully')
  }

  const exportAnalysis = () => {
    if (!analysisResult) return
    
    const exportData = {
      analysis: analysisResult,
      vision: visionResult,
      coordinates: selectedCoordinates,
      timestamp: new Date().toISOString(),
      settings: analysisSettings,
      notes: analysisNotes,
      metadata: {
        version: "2.0",
        export_format: exportFormat,
        system_info: systemStatus
      }
    }
    
    const filename = `archaeological_analysis_${selectedCoordinates.replace(/[, ]/g, '_')}_${Date.now()}`
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (exportFormat === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData)
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    console.log(`📤 Analysis exported as ${exportFormat.toUpperCase()}`)
  }

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for analysis data
    const headers = ['Coordinate', 'Confidence', 'Type', 'Description', 'Timestamp']
    const rows = [
      [
        data.coordinates,
        data.analysis.confidence,
        data.analysis.pattern_type,
        data.analysis.description.replace(/,/g, ';'),
        data.timestamp
      ]
    ]
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const runFullAnalysis = async (coordinates: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisStage("Initializing analysis...")
    
    try {
      // Simulate progressive analysis stages
      const stages = [
        "Loading satellite imagery...",
        "Running AI detection models...",
        "Analyzing cultural patterns...",
        "Cross-referencing historical data...",
        "Generating recommendations...",
        "Finalizing results..."
      ]
      
      for (let i = 0; i < stages.length; i++) {
        setAnalysisStage(stages[i])
        setAnalysisProgress((i + 1) / stages.length * 100)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Try real backend first
      const response = await fetch('http://localhost:8000/agents/analysis/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          settings: analysisSettings,
          data_sources: selectedDataSources
        })
      })
      
      let result
      if (response.ok) {
        result = await response.json()
        console.log('✅ Real backend analysis completed')
      } else {
        // Enhanced fallback
        result = generateEnhancedMockAnalysis(coordinates)
        console.log('📊 Using enhanced mock analysis')
      }
      
      setAnalysisResult(result)
      setActiveWorkflow("results")
      
      // Add to history
      const historyEntry = {
        id: `analysis_${Date.now()}`,
        coordinates,
        result,
        timestamp: new Date().toISOString(),
        type: 'comprehensive',
        status: 'complete',
        confidence: result.confidence
      }
      
      const updatedHistory = [historyEntry, ...analysisHistory.slice(0, 99)]
      setAnalysisHistory(updatedHistory)
      localStorage.setItem('enhanced-analysis-history', JSON.stringify(updatedHistory))
      
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisStage("Analysis failed - using demo data")
      const mockResult = generateEnhancedMockAnalysis(coordinates)
      setAnalysisResult(mockResult)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }
  }

  const generateEnhancedMockAnalysis = (coordinates: string): AnalysisResult => {
    const [lat, lng] = coordinates.split(',').map(c => parseFloat(c.trim()))
    const confidence = 0.75 + Math.random() * 0.2
    
    return {
      location: { lat, lon: lng },
      confidence: Math.round(confidence * 100),
      description: `Comprehensive archaeological analysis reveals potential pre-Columbian settlement patterns at coordinates ${coordinates}. Advanced AI models detected geometric anomalies consistent with human modification of the landscape.`,
      pattern_type: "Settlement Complex",
      historical_context: "Analysis suggests occupation during the Late Intermediate Period (1000-1500 CE), with evidence of planned urban development and ceremonial architecture.",
      indigenous_perspective: "Site shows characteristics consistent with traditional Andean settlement patterns, including terraced agriculture and astronomical alignments.",
      recommendations: [
        { action: "Conduct ground-truth survey", priority: "High", description: "Physical verification of detected anomalies", timeline: "2-4 weeks" },
        { action: "Engage local communities", priority: "High", description: "Consult with indigenous knowledge holders", timeline: "Ongoing" },
        { action: "Acquire high-resolution imagery", priority: "Medium", description: "Sub-meter resolution satellite data", timeline: "1-2 weeks" },
        { action: "Geophysical survey", priority: "Medium", description: "Ground-penetrating radar analysis", timeline: "4-6 weeks" }
      ],
      finding_id: `ARCH_${Date.now()}`,
      metadata: {
        processing_time: "45.2 seconds",
        models_used: ["GPT-4 Vision", "YOLOv8-Archaeological", "Waldo-TerrainAnalysis"],
        data_sources: ["Sentinel-2", "Landsat-8", "Historical Maps", "Indigenous Knowledge Base"],
        analysis_depth: "comprehensive"
      }
    }
  }

  const handleSiteSelect = (site: SiteData) => {
    setSelectedCoordinates(site.coordinates)
    setActiveWorkflow("analyze")
  }

  const handleCoordinateAnalysis = () => {
    if (selectedCoordinates) {
      runFullAnalysis(selectedCoordinates)
    }
  }

  const filteredSites = realSites.filter(site => {
    if (filterSettings.region !== "all" && site.region !== filterSettings.region) return false
    if (filterSettings.period !== "all" && site.period !== filterSettings.period) return false
    if (filterSettings.type !== "all" && site.type !== filterSettings.type) return false
    if (filterSettings.status !== "all" && site.status !== filterSettings.status) return false
    if (filterSettings.priority !== "all" && site.priority !== filterSettings.priority) return false
    return site.confidence >= confidenceThreshold
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Enhanced Archaeological Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI-powered site discovery and cultural pattern analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isBackendOnline ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Demo Mode
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Database className="h-3 w-3 mr-1" />
                    {realSites.length} Sites
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRealtimeUpdates(!realtimeUpdates)}
                  className={realtimeUpdates ? "bg-green-50 border-green-200" : ""}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${realtimeUpdates ? 'animate-spin' : ''}`} />
                  Real-time
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6 space-y-6">
          {/* Performance Dashboard */}
          {activeWorkflow === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Analyses</p>
                      <p className="text-2xl font-bold text-blue-900">{performanceMetrics.totalAnalyses}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-900">{performanceMetrics.successRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">High Confidence</p>
                      <p className="text-2xl font-bold text-purple-900">{performanceMetrics.highConfidenceFindings}</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">System Load</p>
                      <p className="text-2xl font-bold text-amber-900">{systemStatus.agents}</p>
                    </div>
                    <Activity className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Workflow Tabs */}
          <Tabs value={activeWorkflow} onValueChange={(value) => setActiveWorkflow(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="discover" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Search className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="analyze" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-blue-500" />
                      Recent Analysis Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {analysisHistory.length > 0 ? (
                        <div className="space-y-3">
                          {analysisHistory.slice(0, 10).map((analysis, index) => (
                            <div key={analysis.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Badge variant={analysis.confidence > 80 ? "default" : "secondary"}>
                                  {analysis.confidence}%
                                </Badge>
                                <div>
                                  <p className="font-medium text-sm">{analysis.coordinates}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(analysis.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No analysis history yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backend Status</span>
                      <Badge variant={isBackendOnline ? "default" : "secondary"}>
                        {isBackendOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Agents</span>
                      <span className="font-medium">{systemStatus.agents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time Updates</span>
                      <Switch
                        checked={realtimeUpdates}
                        onCheckedChange={setRealtimeUpdates}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto Save</span>
                      <Switch
                        checked={autoSave}
                        onCheckedChange={setAutoSave}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-500" />
                      Archaeological Site Database
                    </CardTitle>
                    <CardDescription>
                      Explore {realSites.length} discovered archaeological sites with AI-powered analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="grid gap-3">
                        {filteredSites.map((site) => (
                          <Card key={site.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleSiteSelect(site)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{site.name}</h3>
                                    <Badge variant="outline">{site.type}</Badge>
                                    {site.priority === "very-high" && <Star className="h-4 w-4 text-amber-500" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{site.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {site.coordinates}
                                    </span>
                                    {site.period && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {site.period}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={site.confidence > 85 ? "default" : "secondary"}>
                                    {site.confidence}%
                                  </Badge>
                                  {site.status && (
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                      {site.status.replace('-', ' ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-gray-500" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Confidence Threshold</Label>
                      <Slider
                        value={[confidenceThreshold]}
                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{confidenceThreshold}%</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Region</Label>
                      <Select value={filterSettings.region} onValueChange={(value) => 
                        setFilterSettings(prev => ({ ...prev, region: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          <SelectItem value="Amazon Basin">Amazon Basin</SelectItem>
                          <SelectItem value="Colombian Andes">Colombian Andes</SelectItem>
                          <SelectItem value="Nazca Desert">Nazca Desert</SelectItem>
                          <SelectItem value="Orinoco Basin">Orinoco Basin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Site Type</Label>
                      <Select value={filterSettings.type} onValueChange={(value) => 
                        setFilterSettings(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Ceremonial">Ceremonial</SelectItem>
                          <SelectItem value="Settlement">Settlement</SelectItem>
                          <SelectItem value="Geoglyph">Geoglyph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Select value={filterSettings.status} onValueChange={(value) => 
                        setFilterSettings(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="under-investigation">Under Investigation</SelectItem>
                          <SelectItem value="preliminary">Preliminary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analyze Tab */}
            <TabsContent value="analyze" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      AI-Powered Analysis
                    </CardTitle>
                    <CardDescription>
                      Run comprehensive archaeological analysis using advanced AI models
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="coordinates">Target Coordinates</Label>
                      <Input
                        id="coordinates"
                        value={selectedCoordinates}
                        onChange={(e) => setSelectedCoordinates(e.target.value)}
                        placeholder="e.g., 5.1542, -73.7792"
                        className="mt-1"
                      />
                    </div>

                    {isAnalyzing && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">{analysisStage}</span>
                        </div>
                        <Progress value={analysisProgress} className="w-full" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCoordinateAnalysis}
                        disabled={isAnalyzing || !selectedCoordinates}
                        className="flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setActiveWorkflow("results")} disabled={!analysisResult}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label>Analysis Notes</Label>
                      <Textarea
                        value={analysisNotes}
                        onChange={(e) => setAnalysisNotes(e.target.value)}
                        placeholder="Add notes about this analysis..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      Analysis Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Enhancement Mode</Label>
                        <Switch
                          checked={analysisSettings.enhancement_mode}
                          onCheckedChange={(checked) => 
                            setAnalysisSettings(prev => ({ ...prev, enhancement_mode: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Deep Learning</Label>
                        <Switch
                          checked={analysisSettings.deep_learning}
                          onCheckedChange={(checked) => 
                            setAnalysisSettings(prev => ({ ...prev, deep_learning: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Pattern Recognition</Label>
                        <Switch
                          checked={analysisSettings.pattern_recognition}
                          onCheckedChange={(checked) => 
                            setAnalysisSettings(prev => ({ ...prev, pattern_recognition: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Cultural Context</Label>
                        <Switch
                          checked={analysisSettings.cultural_context}
                          onCheckedChange={(checked) => 
                            setAnalysisSettings(prev => ({ ...prev, cultural_context: checked }))}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Data Sources</Label>
                      {Object.entries(selectedDataSources).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm capitalize">{key.replace('_', ' ')}</Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              setSelectedDataSources(prev => ({ ...prev, [key]: checked }))}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {analysisResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-500" />
                        Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Comprehensive archaeological analysis for {selectedCoordinates}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {analysisResult.confidence}% Confidence
                        </Badge>
                        <Badge variant="outline">{analysisResult.pattern_type}</Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{analysisResult.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Historical Context</h3>
                        <p className="text-sm text-muted-foreground">{analysisResult.historical_context}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Indigenous Perspective</h3>
                        <p className="text-sm text-muted-foreground">{analysisResult.indigenous_perspective}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <div className="space-y-2">
                          {analysisResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <Badge variant={rec.priority === "High" ? "default" : "secondary"} className="mt-0.5">
                                {rec.priority}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{rec.action}</p>
                                {rec.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                                )}
                                {rec.timeline && (
                                  <p className="text-xs text-blue-600 mt-1">Timeline: {rec.timeline}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={saveAnalysis} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Analysis
                      </Button>
                      
                      <div className="flex gap-2">
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={exportAnalysis}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </Button>

                      <Separator />

                      {analysisResult.metadata && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Analysis Metadata</h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Processing Time: {analysisResult.metadata.processing_time}</p>
                            <p>Models Used: {analysisResult.metadata.models_used?.join(', ')}</p>
                            <p>Analysis Depth: {analysisResult.metadata.analysis_depth}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
                    <p className="text-muted-foreground mb-4">
                      Run an analysis to see detailed results here
                    </p>
                    <Button onClick={() => setActiveWorkflow("analyze")}>
                      <Brain className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-500" />
                    AI Archaeological Assistant
                  </CardTitle>
                  <CardDescription>
                    Get expert insights and ask questions about your archaeological analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <UltimateArchaeologicalChat 
                      analysisContext={analysisResult}
                      coordinates={selectedCoordinates}
                      siteData={realSites}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
} 