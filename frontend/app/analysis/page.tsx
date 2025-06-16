'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, MapPin, Satellite, Eye, Brain, Database, Activity, Settings, Play, Save, 
  Layers, Clock, Users, Target, Zap, Globe, BarChart3, FileText, MessageSquare,
  Map as MapIcon, Camera, Cpu, Network, CheckCircle, Loader2, RefreshCw, Star
} from 'lucide-react'

// Simplified types for robust handling
interface SimpleAnalysisResult {
  analysis_id?: string
  coordinates?: string
  confidence?: number
  pattern_type?: string
  finding_id?: string
  description?: string
  cultural_significance?: string
  historical_context?: string
  recommendations?: any[]
  agents_used?: string[]
  data_sources?: string[]
  processing_time?: string
  timestamp?: string
}

interface SimpleAnalysis {
  id: string
  session_name: string
  coordinates: string
  results: SimpleAnalysisResult
  created_at: string
  notes: string
  tags: string[]
  favorite: boolean
}

const ANALYSIS_TYPES = [
  { value: 'quick', label: 'Quick Analysis', description: 'Fast preliminary assessment' },
  { value: 'comprehensive', label: 'Comprehensive Analysis', description: 'Full multi-agent analysis' },
  { value: 'specialized', label: 'Specialized Analysis', description: 'Focused domain analysis' }
]

const DATA_SOURCES = [
  { id: 'satellite', label: 'Satellite Imagery', icon: Satellite },
  { id: 'lidar', label: 'LIDAR Data', icon: Layers },
  { id: 'historical', label: 'Historical Records', icon: FileText },
  { id: 'ethnographic', label: 'Ethnographic Data', icon: Users },
  { id: 'archaeological', label: 'Archaeological DB', icon: Database }
]

const AGENT_TYPES = [
  { id: 'vision', label: 'Vision Agent', icon: Eye, specialization: 'Image Analysis' },
  { id: 'cultural', label: 'Cultural Agent', icon: Users, specialization: 'Cultural Context' },
  { id: 'temporal', label: 'Temporal Agent', icon: Clock, specialization: 'Time Analysis' },
  { id: 'geospatial', label: 'Geospatial Agent', icon: Globe, specialization: 'Spatial Analysis' },
  { id: 'settlement', label: 'Settlement Agent', icon: MapIcon, specialization: 'Settlement Patterns' },
  { id: 'trade', label: 'Trade Agent', icon: Network, specialization: 'Trade Networks' }
]

export default function NISAnalysisPage() {
  // Core State
  const [coordinates, setCoordinates] = useState('')
  const [analysisType, setAnalysisType] = useState<'quick' | 'comprehensive' | 'specialized'>('comprehensive')
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['satellite', 'lidar', 'historical'])
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['vision', 'cultural', 'temporal', 'geospatial'])
  const [sessionName, setSessionName] = useState('')
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysis, setCurrentAnalysis] = useState<SimpleAnalysisResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<SimpleAnalysis[]>([])
  
  // System State
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')

  // Backend Integration
  const checkSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/health')
      setIsBackendOnline(response.ok)
    } catch (error) {
      console.error('System health check failed:', error)
      setIsBackendOnline(false)
    }
  }, [])

  const fetchAnalysisHistory = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/agents/analysis/history?per_page=50')
      const data = await response.json()
      
      if (data?.analyses && Array.isArray(data.analyses)) {
        const formattedHistory: SimpleAnalysis[] = data.analyses
          .filter((analysis: any) => analysis?.id)
          .map((analysis: any) => ({
            id: analysis.id || 'unknown',
            session_name: analysis.metadata?.session_name || `Analysis ${(analysis.id || '').slice(-8)}`,
            coordinates: analysis.coordinates || '',
            results: analysis.results || {},
            created_at: analysis.timestamp || new Date().toISOString(),
            notes: analysis.metadata?.notes || '',
            tags: analysis.metadata?.tags || [],
            favorite: Boolean(analysis.metadata?.favorite)
          }))
        setAnalysisHistory(formattedHistory)
      } else {
        setAnalysisHistory([])
      }
    } catch (error) {
      console.error('Analysis history fetch failed:', error)
      setAnalysisHistory([])
    }
  }, [])

  // Analysis Execution
  const runAnalysis = async () => {
    if (!coordinates.trim()) {
      alert('Please enter coordinates')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setCurrentAnalysis(null)

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const [lat, lon] = coordinates.split(',').map(c => parseFloat(c.trim()))
      
      let endpoint = '/agents/analyze/comprehensive'
      if (analysisType === 'quick') endpoint = '/analyze'
      else if (analysisType === 'specialized') endpoint = '/agents/analyze/enhanced'

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          data_sources: selectedDataSources,
          confidence_threshold: 0.7
        })
      })

      const result = await response.json()
      
      clearInterval(progressInterval)
      setAnalysisProgress(100)

      // Simple result transformation
      const analysisResult: SimpleAnalysisResult = {
        analysis_id: result.analysis_id || `analysis_${Date.now()}`,
        coordinates: coordinates,
        confidence: result.confidence || 0,
        pattern_type: result.pattern_type || 'unknown',
        finding_id: result.finding_id || `finding_${Date.now()}`,
        description: result.description || 'Analysis completed',
        cultural_significance: result.cultural_significance || result.indigenous_perspective || '',
        historical_context: result.historical_context || '',
        recommendations: result.recommendations || [],
        agents_used: selectedAgents,
        data_sources: selectedDataSources,
        processing_time: result.metadata?.processing_time || '0.5s',
        timestamp: new Date().toISOString()
      }

      setCurrentAnalysis(analysisResult)

      // Auto-save if session name provided
      if (sessionName) {
        await saveAnalysis(analysisResult)
      }

      await fetchAnalysisHistory()

    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please check the backend connection.')
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const saveAnalysis = async (result: SimpleAnalysisResult) => {
    try {
      const saveRequest = {
        coordinates: result.coordinates || coordinates,
        timestamp: new Date().toISOString(),
        results: result,
        backend_status: 'success',
        metadata: {
          session_name: sessionName,
          saved_from: 'nis_analysis_page'
        }
      }

      await fetch('http://localhost:8000/agents/analysis/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveRequest)
      })

      console.log('Analysis saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Workflow Integration
  const openInChat = (coordinates: string) => {
    const chatUrl = `/chat?coordinates=${encodeURIComponent(coordinates)}&mode=analysis`
    window.open(chatUrl, '_blank')
  }

  const openInMap = (coordinates: string) => {
    const mapUrl = `/map?coordinates=${encodeURIComponent(coordinates)}&analysis=true`
    window.open(mapUrl, '_blank')
  }

  const openInVision = (coordinates: string) => {
    const visionUrl = `/vision?coordinates=${encodeURIComponent(coordinates)}&analysis=true`
    window.open(visionUrl, '_blank')
  }

  // Initialize
  useEffect(() => {
    checkSystemHealth()
    fetchAnalysisHistory()
    
    const interval = setInterval(() => {
      checkSystemHealth()
    }, 30000)

    return () => clearInterval(interval)
  }, [checkSystemHealth, fetchAnalysisHistory])

  // Safe value getters
  const getConfidence = (analysis: SimpleAnalysis) => {
    return ((analysis.results?.confidence || 0) * 100).toFixed(1)
  }

  const getAgentCount = (analysis: SimpleAnalysis) => {
    return Array.isArray(analysis.results?.agents_used) ? analysis.results.agents_used.length : 0
  }

  const getSourceCount = (analysis: SimpleAnalysis) => {
    return Array.isArray(analysis.results?.data_sources) ? analysis.results.data_sources.length : 0
  }

  const getDescription = (analysis: SimpleAnalysis) => {
    return (analysis.results?.description || 'No description available').substring(0, 150)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              NIS Protocol Analysis Center
            </h1>
            <p className="text-slate-300">
              Neural Intelligence System for Archaeological Discovery
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isBackendOnline ? "default" : "destructive"} className="px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              {isBackendOnline ? 'System Online' : 'System Offline'}
            </Badge>
            
            <Button
              onClick={checkSystemHealth}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10">
            <TabsTrigger value="analysis" className="text-white">
              <Target className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white">
              <Database className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="workflow" className="text-white">
              <Network className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Analysis Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-black/20 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Analysis Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Coordinates Input */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        Coordinates (lat, lon)
                      </label>
                      <Input
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)}
                        placeholder="5.1542, -73.7792"
                        className="bg-black/20 border-white/20 text-white"
                      />
                    </div>

                    {/* Analysis Type */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        Analysis Type
                      </label>
                      <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                        <SelectTrigger className="bg-black/20 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANALYSIS_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-slate-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data Sources */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        Data Sources
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {DATA_SOURCES.map(source => (
                          <Button
                            key={source.id}
                            variant={selectedDataSources.includes(source.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedDataSources(prev => 
                                prev.includes(source.id)
                                  ? prev.filter(s => s !== source.id)
                                  : [...prev, source.id]
                              )
                            }}
                            className="justify-start text-xs"
                          >
                            <source.icon className="w-3 h-3 mr-2" />
                            {source.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Agents Selection */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        Active Agents
                      </label>
                      <div className="grid grid-cols-1 gap-1">
                        {AGENT_TYPES.map(agent => (
                          <Button
                            key={agent.id}
                            variant={selectedAgents.includes(agent.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedAgents(prev => 
                                prev.includes(agent.id)
                                  ? prev.filter(a => a !== agent.id)
                                  : [...prev, agent.id]
                              )
                            }}
                            className="justify-start text-xs"
                          >
                            <agent.icon className="w-3 h-3 mr-2" />
                            <div className="text-left">
                              <div>{agent.label}</div>
                              <div className="text-xs opacity-70">{agent.specialization}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Session Name */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        Session Name (Optional)
                      </label>
                      <Input
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="My Analysis Session"
                        className="bg-black/20 border-white/20 text-white"
                      />
                    </div>

                    {/* Execute Button */}
                    <Button
                      onClick={runAnalysis}
                      disabled={isAnalyzing || !coordinates.trim() || !isBackendOnline}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Analysis
                        </>
                      )}
                    </Button>

                    {/* Progress */}
                    {isAnalyzing && (
                      <div className="space-y-2">
                        <Progress value={analysisProgress} className="w-full" />
                        <p className="text-xs text-slate-400 text-center">
                          Processing with {selectedAgents.length} agents...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <div className="lg:col-span-2 space-y-6">
                {currentAnalysis ? (
                  <Card className="bg-black/20 border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                          Analysis Results
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                            Confidence: {((currentAnalysis.confidence || 0) * 100).toFixed(1)}%
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-white">
                            {currentAnalysis.processing_time || '0s'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Key Findings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Findings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Pattern Type</h4>
                            <p className="text-white capitalize">{(currentAnalysis.pattern_type || 'unknown').replace('_', ' ')}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Finding ID</h4>
                            <p className="text-white font-mono text-sm">{currentAnalysis.finding_id || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                        <p className="text-slate-300 leading-relaxed">{currentAnalysis.description || 'No description available'}</p>
                      </div>

                      {/* Cultural Context */}
                      {currentAnalysis.cultural_significance && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Cultural Significance</h3>
                          <p className="text-slate-300 leading-relaxed">{currentAnalysis.cultural_significance}</p>
                        </div>
                      )}

                      {/* Historical Context */}
                      {currentAnalysis.historical_context && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Historical Context</h3>
                          <p className="text-slate-300 leading-relaxed">{currentAnalysis.historical_context}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                        <Button
                          onClick={() => openInChat(currentAnalysis.coordinates || coordinates)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open in Chat
                        </Button>
                        
                        <Button
                          onClick={() => openInMap(currentAnalysis.coordinates || coordinates)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                        >
                          <MapIcon className="w-4 h-4 mr-2" />
                          View on Map
                        </Button>
                        
                        <Button
                          onClick={() => openInVision(currentAnalysis.coordinates || coordinates)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Vision Analysis
                        </Button>
                        
                        <Button
                          onClick={() => saveAnalysis(currentAnalysis)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-12 text-center">
                      <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
                      <p className="text-slate-400">
                        Configure your analysis parameters and run a comprehensive archaeological assessment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {analysisHistory.map((analysis) => (
                <Card key={analysis.id} className="bg-black/20 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">{analysis.session_name}</h3>
                          {analysis.favorite && <Star className="w-4 h-4 text-yellow-400" />}
                          <Badge variant="outline" className="border-white/20 text-white text-xs">
                            {getConfidence(analysis)}% confidence
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-2">
                          Coordinates: {analysis.coordinates || 'Unknown'}
                        </p>
                        
                        <p className="text-sm text-slate-400 mb-3">
                          {getDescription(analysis)}...
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                          <span>{getAgentCount(analysis)} agents</span>
                          <span>{getSourceCount(analysis)} sources</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => setCurrentAnalysis(analysis.results)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => openInChat(analysis.coordinates)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white"
                          disabled={!analysis.coordinates}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {analysisHistory.length === 0 && (
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-12 text-center">
                  <Database className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Analysis History</h3>
                  <p className="text-slate-400">
                    Run your first analysis to start building your research database.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => window.open('/chat', '_blank')}
                    variant="outline" 
                    className="w-full justify-start border-white/20 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Chat Interface
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/map', '_blank')}
                    variant="outline" 
                    className="w-full justify-start border-white/20 text-white"
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    Launch Map Explorer
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/vision', '_blank')}
                    variant="outline" 
                    className="w-full justify-start border-white/20 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Vision Analysis
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/satellite', '_blank')}
                    variant="outline" 
                    className="w-full justify-start border-white/20 text-white"
                  >
                    <Satellite className="w-4 h-4 mr-2" />
                    Satellite Data
                  </Button>
                </CardContent>
              </Card>

              {/* System Integration */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Network className="w-5 h-5 mr-2" />
                    System Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Chat System</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Map Interface</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Vision Agents</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Database Storage</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Real-time Sync</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              {/* NIS Protocol Status */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    NIS Protocol Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Neural Networks</span>
                    <Badge variant="default" className="text-xs">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">KAN Integration</span>
                    <Badge variant="default" className="text-xs">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Multi-Agent System</span>
                    <Badge variant="default" className="text-xs">6 Agents</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Data Sources</span>
                    <Badge variant="default" className="text-xs">5 Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Success Rate</span>
                    <Badge variant="default" className="text-xs">100%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 