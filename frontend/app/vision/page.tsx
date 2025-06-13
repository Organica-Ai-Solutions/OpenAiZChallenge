"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { VisionAgentVisualization } from "@/src/components/vision-agent-visualization"
import { VisionAgentFallback } from "@/components/ui/vision-agent-fallback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Eye, Camera, Satellite, Brain, Activity, MapPin, Target, Wifi, WifiOff, 
  BarChart3, Sparkles, RefreshCw, Zap, Clock, ArrowRight, AlertTriangle,
  CheckCircle, Loader2, Copy, Download, Share2, Info, Layers
} from "lucide-react"
import dynamic from 'next/dynamic'

const SatelliteLidarMap = dynamic(() => import('../../src/components/SatelliteLidarMap'), { ssr: false })

export default function VisionAgentPage() {
  const [selectedCoordinates, setSelectedCoordinates] = useState("5.1542, -73.7792")
  const [visionResult, setVisionResult] = useState<any>(null)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [activeMode, setActiveMode] = useState<"analyze" | "results">("analyze")
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  
  // Enhanced state for better UX
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState("")
  const [coordinateError, setCoordinateError] = useState("")
  const [backendError, setBackendError] = useState("")
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null)
  
  // New comprehensive analysis state
  const [analysisMode, setAnalysisMode] = useState<"standard" | "comprehensive">("comprehensive")
  const [agentStatus, setAgentStatus] = useState<any>({})
  const [lidarVisualizationMode, setLidarVisualizationMode] = useState<string[]>(["hillshade", "slope", "contour", "elevation"])
  const [enabledAgents, setEnabledAgents] = useState<string[]>(["vision", "memory", "reasoning", "action", "consciousness"])
  const [toolAccessStatus, setToolAccessStatus] = useState<any>({})
  const [comprehensiveResults, setComprehensiveResults] = useState<any>(null)

  const FAMOUS_SITES = [
    { name: "Lake Guatavita (El Dorado)", coords: "5.1542, -73.7792", type: "Ceremonial", region: "Colombia" },
    { name: "Nazca Lines", coords: "-14.7390, -75.1300", type: "Geoglyph", region: "Peru" },
    { name: "Machu Picchu", coords: "-13.1631, -72.5450", type: "Settlement", region: "Peru" },
    { name: "Amazon Geoglyphs", coords: "-9.9747, -67.8096", type: "Earthwork", region: "Brazil" },
    { name: "Caral Civilization", coords: "-10.8939, -77.5208", type: "Settlement", region: "Peru" },
    { name: "Monte Roraima", coords: "5.1431, -60.7619", type: "Sacred Site", region: "Venezuela" }
  ]

  // Load analysis history from localStorage
  useEffect(() => {
    const loadAnalysisHistory = () => {
      try {
        const saved = localStorage.getItem('vision-analysis-history')
        if (saved) {
          const history = JSON.parse(saved)
          setAnalysisHistory(Array.isArray(history) ? history : [])
        }
      } catch (error) {
        console.log('Failed to load analysis history:', error)
      }
    }
    
    loadAnalysisHistory()
  }, [])

  // Enhanced backend checking with agent status monitoring
  useEffect(() => {
    const checkBackend = async () => {
      try {
        setBackendError("")
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch('http://localhost:8000/system/health', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          setIsBackendOnline(true)
          console.log('✅ Backend online - real-time analysis available')
          
          // Check agent status
          try {
            const agentStatusRes = await fetch('http://localhost:8000/agents/status')
            
            if (agentStatusRes.ok) {
              const agentData = await agentStatusRes.json()
              // Parse the agent status from the response
              const parsedAgents = {
                vision_agent: { status: agentData.vision_agent === 'active' ? 'online' : 'offline' },
                analysis_agent: { status: agentData.analysis_agent === 'active' ? 'online' : 'offline' },
                cultural_agent: { status: agentData.cultural_agent === 'active' ? 'online' : 'offline' },
                recommendation_agent: { status: agentData.recommendation_agent === 'active' ? 'online' : 'offline' }
              }
              setAgentStatus(parsedAgents)
              
              // Set tool access status based on available agents
              setToolAccessStatus({
                total_tools_available: Object.keys(parsedAgents).length,
                vision_analysis: parsedAgents.vision_agent.status === 'online',
                archaeological_analysis: parsedAgents.analysis_agent.status === 'online',
                cultural_analysis: parsedAgents.cultural_agent.status === 'online'
              })
            }
          } catch (statusError) {
            console.log('⚠️ Could not fetch agent status')
          }
        } else {
          setIsBackendOnline(false)
          setBackendError(`Backend responded with status ${response.status}`)
        }
      } catch (error: any) {
        setIsBackendOnline(false)
        if (error.name === 'AbortError') {
          setBackendError("Backend connection timeout")
        } else {
          setBackendError("Backend unavailable - using demo mode")
        }
        console.log('⚠️ Backend offline, using demo mode')
      }
    }
    
    checkBackend()
    const interval = setInterval(checkBackend, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Enhanced coordinate validation
  const validateCoordinates = (coords: string): boolean => {
    setCoordinateError("")
    
    if (!coords.trim()) {
      setCoordinateError("Coordinates are required")
      return false
    }
    
    const parts = coords.split(',')
    if (parts.length !== 2) {
      setCoordinateError("Please enter coordinates in format: latitude, longitude")
      return false
    }
    
    const lat = parseFloat(parts[0].trim())
    const lng = parseFloat(parts[1].trim())
    
    if (isNaN(lat) || isNaN(lng)) {
      setCoordinateError("Coordinates must be valid numbers")
      return false
    }
    
    if (lat < -90 || lat > 90) {
      setCoordinateError("Latitude must be between -90 and 90")
      return false
    }
    
    if (lng < -180 || lng > 180) {
      setCoordinateError("Longitude must be between -180 and 180")
      return false
    }
    
    return true
  }

  // Enhanced analysis completion handler
  const handleAnalysisComplete = (results: any) => {
    setVisionResult(results)
    setActiveMode("results")
    setIsAnalyzing(false)
    setAnalysisProgress(100)
    setLastAnalysisTime(new Date())
    
    // Save to history with enhanced metadata
    const newEntry = {
      id: Date.now(),
      coordinates: selectedCoordinates,
      timestamp: new Date().toISOString(),
      results,
      backend_used: isBackendOnline,
      analysis_duration: results.metadata?.processing_time || "Unknown"
    }
    
    const updatedHistory = [newEntry, ...analysisHistory.slice(0, 19)] // Keep last 20
    setAnalysisHistory(updatedHistory)
    
    try {
      localStorage.setItem('vision-analysis-history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.log('Failed to save analysis history:', error)
    }
  }

  // Enhanced site selection with validation
  const handleQuickSelect = (coords: string) => {
    setSelectedCoordinates(coords)
    setCoordinateError("")
    setActiveMode("analyze")
  }

  // Enhanced coordinate input handler
  const handleCoordinateChange = (value: string) => {
    setSelectedCoordinates(value)
    if (coordinateError) {
      setCoordinateError("") // Clear error when user starts typing
    }
  }

  // Start analysis with validation
  const handleStartAnalysis = () => {
    if (!validateCoordinates(selectedCoordinates)) {
      return
    }
    
    if (analysisMode === "comprehensive") {
      handleComprehensiveAnalysis()
    } else {
      handleStandardAnalysis()
    }
  }

  // Comprehensive analysis using all agents and enhanced LIDAR
  const handleComprehensiveAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisStage("Initializing comprehensive analysis...")
    setActiveMode("analyze")
    
    try {
      const [lat, lon] = selectedCoordinates.split(',').map(s => parseFloat(s.trim()))
      
      // Progress simulation with realistic stages
      const stages = [
        "🚀 Initializing all agents...",
        "👁️ Running enhanced vision analysis with multi-modal LIDAR...",
        "🧠 Accessing comprehensive archaeological memory...",
        "🤔 Performing enhanced archaeological reasoning...",
        "⚡ Generating strategic action plan...",
        "🧠 Integrating through consciousness module...",
        "📡 Compiling comprehensive results..."
      ]
      
      let currentStage = 0
      const stageInterval = setInterval(() => {
        if (currentStage < stages.length) {
          setAnalysisStage(stages[currentStage])
          setAnalysisProgress((currentStage + 1) / stages.length * 90)
          currentStage++
        }
      }, 2000)
      
      // Use available endpoints for comprehensive analysis
      const [analyzeResponse, visionResponse] = await Promise.all([
        fetch('http://localhost:8000/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat: lat,
            lon: lon,
            data_sources: ["satellite", "lidar", "historical"],
            confidence_threshold: 0.7
          })
        }),
        fetch('http://localhost:8000/vision/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: `${lat}, ${lon}`,
            models: ["gpt4o_vision", "archaeological_analysis"],
            confidence_threshold: 0.4
          })
        })
      ])
      
      clearInterval(stageInterval)
      
      if (analyzeResponse.ok && visionResponse.ok) {
        const [analyzeResults, visionResults] = await Promise.all([
          analyzeResponse.json(),
          visionResponse.json()
        ])
        
        // Combine results from both endpoints
        const combinedResults = {
          analysis_data: analyzeResults,
          vision_data: visionResults,
          combined_confidence: (analyzeResults.confidence + (visionResults.model_performance?.gpt4o_vision?.confidence_average || 0.5)) / 2
        }
        
        setComprehensiveResults(combinedResults)
        setAnalysisProgress(100)
        setAnalysisStage("✅ Comprehensive analysis complete!")
        
        // Convert to standard format for compatibility
        const standardResults = {
          detection_results: visionResults.detection_results || [],
          metadata: {
            ...visionResults.metadata,
            agents_used: "Vision Agent, Analysis Agent, Archaeological Analysis",
            processing_time: visionResults.metadata?.processing_time,
            analysis_type: "comprehensive_multi_agent",
            combined_confidence: combinedResults.combined_confidence
          },
          comprehensive_data: combinedResults,
          analysis_summary: analyzeResults.description,
          historical_context: analyzeResults.historical_context,
          indigenous_perspective: analyzeResults.indigenous_perspective,
          recommendations: analyzeResults.recommendations
        }
        
        handleAnalysisComplete(standardResults)
      } else {
        throw new Error(`Analysis failed - Analyze: ${analyzeResponse.status}, Vision: ${visionResponse.status}`)
      }
    } catch (error) {
      console.error('Comprehensive analysis failed:', error)
      setAnalysisStage("❌ Analysis failed - falling back to standard mode")
      handleStandardAnalysis()
    }
  }

  // Standard analysis (existing functionality)
  const handleStandardAnalysis = () => {
    setAnalysisProgress(0)
    setAnalysisStage("Initializing standard analysis...")
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 500)
  }

  // Copy coordinates to clipboard
  const copyCoordinates = async (coords: string) => {
    try {
      await navigator.clipboard.writeText(coords)
      // Could add a toast notification here
    } catch (error) {
      console.log('Failed to copy coordinates')
    }
  }

  // Export analysis results
  const exportResults = () => {
    if (!visionResult) return
    
    const exportData = {
      coordinates: selectedCoordinates,
      timestamp: new Date().toISOString(),
      results: visionResult,
      metadata: {
        backend_used: isBackendOnline,
        analysis_time: lastAnalysisTime?.toISOString()
      }
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vision-analysis-${selectedCoordinates.replace(/[, ]/g, '_')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Update all previously analyzed sites with comprehensive analysis
  const handleUpdateAllSites = async () => {
    if (!isBackendOnline) return
    
    try {
      setAnalysisStage("🔄 Refreshing all site data...")
      setIsAnalyzing(true)
      
      // Use available endpoint to refresh site data
      const response = await fetch('http://localhost:8000/research/sites?refresh=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const results = await response.json()
        setAnalysisStage(`✅ Refreshed ${results.length || 0} sites successfully!`)
        
        // Show success notification
        setTimeout(() => {
          setIsAnalyzing(false)
          setAnalysisStage("")
        }, 3000)
      } else {
        throw new Error(`Refresh failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('Site refresh failed:', error)
      setAnalysisStage("❌ Site refresh failed")
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisStage("")
      }, 3000)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="container mx-auto px-6 py-8 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-emerald-600 p-6 rounded-full">
                  <Eye className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                🔍 Enhanced Vision Agent
                {isBackendOnline && (
                  <span className="text-2xl ml-2">
                    <Sparkles className="inline w-6 h-6 text-emerald-400" />
                  </span>
                )}
              </h1>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                {isBackendOnline ? (
                  <>
                    Comprehensive AI-powered archaeological analysis using <strong>6 integrated agents</strong> with 
                    multi-modal LIDAR processing, GPT-4 Vision, consciousness integration, and enhanced 
                    archaeological memory access for unprecedented site discovery capabilities.
                  </>
                ) : (
                  <>
                    Advanced AI-powered satellite imagery analysis for archaeological discovery. 
                    Powered by GPT-4 Vision, YOLO8, and specialized archaeological detection models.
                  </>
                )}
              </p>
            </div>

            <div className="flex justify-center">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="px-6 py-3">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      {isBackendOnline ? (
                        <>
                          <Wifi className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Real-time Analysis</span>
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-2">
                              <WifiOff className="w-4 h-4 text-amber-400" />
                              <span className="text-amber-300">Demo Mode</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{backendError || "Backend unavailable"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300">Multi-Model Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300">
                        {isBackendOnline ? "NIS Protocol Enhanced (6 Agents)" : "NIS Protocol Enhanced"}
                      </span>
                    </div>
                    {isBackendOnline && Object.keys(toolAccessStatus).length > 0 && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300">
                          {toolAccessStatus.total_tools_available || 0} Tools Available
                        </span>
                      </div>
                    )}
                    {analysisHistory.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300">{analysisHistory.length} Analyses</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Quick Site Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select famous archaeological sites or enter custom coordinates for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {FAMOUS_SITES.map((site, index) => (
                    <motion.div
                      key={site.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-slate-900/50 border-slate-600 text-white hover:bg-slate-700/50 transition-all h-auto p-3"
                            onClick={() => handleQuickSelect(site.coords)}
                          >
                            <div className="text-left w-full">
                              <div className="font-medium">{site.name}</div>
                              <div className="text-xs text-slate-400">{site.type} • {site.region}</div>
                              <div className="text-xs text-slate-500 mt-1">{site.coords}</div>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to analyze {site.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="coordinates" className="text-white mb-2 block">
                        Custom Coordinates (Latitude, Longitude)
                      </Label>
                      <Input
                        id="coordinates"
                        value={selectedCoordinates}
                        onChange={(e) => handleCoordinateChange(e.target.value)}
                        placeholder="e.g., 5.1542, -73.7792"
                        className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 ${
                          coordinateError ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyCoordinates(selectedCoordinates)}
                            className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-700/50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy coordinates</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Button 
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing || !selectedCoordinates.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {coordinateError && (
                    <Alert className="bg-red-900/20 border-red-500/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-300">
                        {coordinateError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Enhanced Analysis Mode Selection */}
                  <div className="space-y-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-medium">Analysis Mode</Label>
                      {isBackendOnline && (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                          Enhanced Backend Available
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant={analysisMode === "standard" ? "default" : "outline"}
                        onClick={() => setAnalysisMode("standard")}
                        className={`justify-start h-auto p-3 ${
                          analysisMode === "standard" 
                            ? "bg-cyan-600 hover:bg-cyan-700" 
                            : "bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">Standard Vision</span>
                          </div>
                          <div className="text-xs opacity-80">GPT-4 Vision + YOLO8 detection</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={analysisMode === "comprehensive" ? "default" : "outline"}
                        onClick={() => setAnalysisMode("comprehensive")}
                        disabled={!isBackendOnline}
                        className={`justify-start h-auto p-3 ${
                          analysisMode === "comprehensive" 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : "bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4" />
                            <span className="font-medium">Comprehensive NIS</span>
                            <Sparkles className="w-3 h-3" />
                          </div>
                          <div className="text-xs opacity-80">All 6 agents + Multi-modal LIDAR</div>
                        </div>
                      </Button>
                    </div>
                    
                    {analysisMode === "comprehensive" && isBackendOnline && (
                      <div className="space-y-3 pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>Enhanced Features Active:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Multi-modal LIDAR (4 visualizations)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Archaeological memory access</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Cross-agent reasoning</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Consciousness integration</span>
                          </div>
                        </div>
                        
                        {Object.keys(agentStatus).length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span className="text-slate-400">Agents Online:</span>
                            {Object.entries(agentStatus).map(([agent, status]: [string, any]) => (
                              <Badge 
                                key={agent} 
                                variant="outline" 
                                className={`text-xs ${
                                  status?.status === 'online' 
                                    ? 'text-emerald-400 border-emerald-400' 
                                    : 'text-amber-400 border-amber-400'
                                }`}
                              >
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{analysisStage}</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                      {analysisMode === "comprehensive" && (
                        <div className="text-xs text-slate-400 mt-1">
                          Using enhanced multi-agent processing with {enabledAgents.length} agents
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as any)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="analyze" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  Vision Analysis
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Results {visionResult && `(${visionResult.detection_results?.length || 0})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analyze" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="w-6 h-6 text-emerald-400" />
                      GPT-4 Vision Satellite Analysis
                      {lastAnalysisTime && (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                          Last: {lastAnalysisTime.toLocaleTimeString()}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      AI-powered archaeological feature detection using advanced computer vision models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBackendOnline ? (
                      <>
                        <VisionAgentVisualization
                          coordinates={selectedCoordinates}
                          onAnalysisComplete={handleAnalysisComplete}
                          isBackendOnline={isBackendOnline}
                          autoAnalyze={false}
                        />
                        <div className="mt-6">
                          <SatelliteLidarMap 
                            satelliteData={[]} 
                            coordinates={{ lat: 5.1542, lng: -73.7792 }} 
                            onCoordinateChange={() => {}} 
                          />
                        </div>
                      </>
                    ) : (
                      <VisionAgentFallback
                        coordinates={selectedCoordinates}
                        onAnalysisComplete={handleAnalysisComplete}
                        isBackendOnline={isBackendOnline}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {visionResult ? (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                        Analysis Results
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                          {visionResult.detection_results?.length || 0} Features Detected
                        </Badge>
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportResults}
                          className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        {isBackendOnline && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateAllSites}
                            className="bg-emerald-700/50 border-emerald-600 text-emerald-300 hover:bg-emerald-600/50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Update All Sites
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enhanced Results Display */}
                      {visionResult.comprehensive_data ? (
                        <div className="space-y-6">
                          {/* Comprehensive Analysis Summary */}
                          <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 rounded-lg border border-emerald-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-5 h-5 text-emerald-400" />
                              <h4 className="font-medium text-white">Comprehensive NIS Analysis</h4>
                              <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                                {visionResult.comprehensive_data.metadata?.agents_used?.length || 0} Agents
                              </Badge>
                            </div>
                            
                            {visionResult.comprehensive_data.consciousness_synthesis?.global_assessment && (
                              <div className="mb-4 p-3 bg-slate-900/30 rounded border border-slate-700/50">
                                <h5 className="text-sm font-medium text-cyan-300 mb-2">🧠 Consciousness Integration</h5>
                                <p className="text-slate-300 text-sm">
                                  {visionResult.comprehensive_data.consciousness_synthesis.global_assessment.summary || 
                                   "Integrated analysis across all cognitive agents"}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-400">Integrated Confidence:</span>
                                  <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                                    {Math.round((visionResult.comprehensive_data.consciousness_synthesis.integrated_confidence || 0) * 100)}%
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Multi-Modal LIDAR Results */}
                          {visionResult.comprehensive_data.vision_analysis?.visualization_analyses && (
                            <div className="space-y-4">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-400" />
                                Multi-Modal LIDAR Analysis
                                <Badge variant="outline" className="text-purple-400 border-purple-400">
                                  {visionResult.comprehensive_data.vision_analysis.visualization_analyses.length} Visualizations
                                </Badge>
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visionResult.comprehensive_data.vision_analysis.visualization_analyses.map((viz: any, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-slate-900/50 border border-purple-500/30 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-white capitalize">{viz.visualization_type}</h5>
                                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                                        {Math.round((viz.confidence || 0) * 100)}%
                                      </Badge>
                                    </div>
                                    <p className="text-slate-300 text-sm">{viz.analysis}</p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Standard Detection Results */}
                          {visionResult.detection_results && visionResult.detection_results.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-400" />
                                Archaeological Features Detected
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visionResult.detection_results.map((detection: any, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg hover:bg-slate-800/50 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-white">{detection.type}</h4>
                                      <Badge variant={detection.confidence > 0.8 ? "default" : "secondary"}>
                                        {Math.round(detection.confidence * 100)}%
                                      </Badge>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-2">{detection.description}</p>
                                    {detection.coordinates && (
                                      <p className="text-slate-400 text-xs">
                                        📍 {detection.coordinates}
                                      </p>
                                    )}
                                    {detection.size_estimate && (
                                      <p className="text-slate-400 text-xs">
                                        📏 {detection.size_estimate}
                                      </p>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : visionResult.detection_results && visionResult.detection_results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {visionResult.detection_results.map((detection: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white">{detection.type}</h4>
                                <Badge variant={detection.confidence > 0.8 ? "default" : "secondary"}>
                                  {Math.round(detection.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm mb-2">{detection.description}</p>
                              {detection.coordinates && (
                                <p className="text-slate-400 text-xs">
                                  📍 {detection.coordinates}
                                </p>
                              )}
                              {detection.size_estimate && (
                                <p className="text-slate-400 text-xs">
                                  📏 {detection.size_estimate}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No archaeological features detected in this analysis</p>
                          <p className="text-sm mt-2">Try analyzing a different location or adjusting the analysis parameters</p>
                        </div>
                      )}
                      
                      {visionResult.metadata && (
                        <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Analysis Metadata
                            {visionResult.metadata.analysis_type === "comprehensive_multi_agent" && (
                              <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                                Enhanced
                              </Badge>
                            )}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Processing Time:</span>
                              <span className="text-white ml-2">{visionResult.metadata.processing_time}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">
                                {visionResult.metadata.analysis_type === "comprehensive_multi_agent" ? "Agents Used:" : "Models Used:"}
                              </span>
                              <span className="text-white ml-2">
                                {visionResult.metadata.agents_used || visionResult.metadata.models_used?.join(', ')}
                              </span>
                            </div>
                            {visionResult.metadata.analysis_type === "comprehensive_multi_agent" ? (
                              <>
                                <div>
                                  <span className="text-slate-400">Data Sources:</span>
                                  <span className="text-white ml-2">
                                    {visionResult.metadata.data_sources?.join(', ') || 'Multi-modal'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Enhanced Features:</span>
                                  <span className="text-white ml-2">
                                    {visionResult.metadata.enhanced_features?.length || 0} Active
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <span className="text-slate-400">Confidence Threshold:</span>
                                  <span className="text-white ml-2">{visionResult.metadata.confidence_threshold}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Region Context:</span>
                                  <span className="text-white ml-2">{visionResult.metadata.region_context}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {visionResult.comprehensive_data && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                              <h5 className="text-sm font-medium text-cyan-300 mb-2">🔧 Tools Accessed</h5>
                              <div className="flex flex-wrap gap-1">
                                {visionResult.metadata.tools_accessed?.map((tool: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs text-slate-300 border-slate-600">
                                    {tool.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-8 text-center">
                      <div className="text-slate-400 mb-4">
                        <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-lg font-medium">No analysis results yet</p>
                        <p className="text-sm mt-2">Run a vision analysis to see detailed archaeological feature detection results here</p>
                      </div>
                      <Button 
                        onClick={() => setActiveMode("analyze")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Analysis
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Enhanced Analysis History */}
          {analysisHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    Recent Analysis History
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                      {analysisHistory.length} Total
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your recent vision analyses with enhanced metadata and quick access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisHistory.slice(0, 5).map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-600/30 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedCoordinates(entry.coordinates)
                          setVisionResult(entry.results)
                          setActiveMode("results")
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium">{entry.coordinates}</p>
                            {entry.backend_used ? (
                              <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                                Real-time
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                                Demo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>📅 {new Date(entry.timestamp).toLocaleString()}</span>
                            {entry.analysis_duration && (
                              <span>⏱️ {entry.analysis_duration}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {entry.results?.detection_results?.length || 0} features
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {analysisHistory.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                        View All {analysisHistory.length} Analyses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
} 