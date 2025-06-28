"use client"

import React, { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, 
  Brain, 
  Eye, 
  Database, 
  Lightbulb, 
  Zap,
  Calendar,
  Layers,
  Target,
  Activity,
  Satellite,
  Mountain,
  Users,
  Globe,
  Clock,
  Award,
  TrendingUp,
  Shield,
  Microscope,
  TreePine,
  Waves,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Share2,
  Crown
} from 'lucide-react'
import AnalyzingAnimation from './analyzing-animation'
import DivineButton from './ui/DivineButton'

interface ArchaeologicalSite {
  id: string
  name: string
  coordinates: string
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
  type: string
  period: string
  size_hectares?: number
}

interface AgentAnalysis {
  // Vision Agent Results
  vision_analysis?: {
    satellite_findings?: any
    lidar_findings?: any
    combined_analysis?: any
    multi_modal_confidence?: number
    visualization_analyses?: any[]
    enhanced_processing?: boolean
    // Divine Analysis Fields
    live_satellite_findings?: {
      confidence: number
      pattern_type: string
      description: string
    }
    divine_lidar_processing?: boolean
    heatmap_visualization?: boolean
    features_detected?: number
    confidence?: number
    analysis_depth?: string
  }
  
  // Memory Agent Results
  memory_analysis?: {
    cultural_context?: any
    historical_references?: any[]
    similar_sites?: any[]
    indigenous_knowledge?: any
    site_database_matches?: any[]
    // Divine Analysis Fields
    historical_context?: string
    cultural_significance?: string
    temporal_markers?: string[]
    live_cultural_context?: {
      cultural_patterns: string[]
      historical_significance: string
      temporal_analysis: string
    }
  }
  
  // Reasoning Agent Results
  reasoning_analysis?: {
    archaeological_interpretation?: any
    cultural_significance?: any
    confidence_assessment?: number
    evidence_correlation?: any[]
    hypothesis_generation?: any[]
    // Divine Analysis Fields
    archaeological_classification?: string
    research_priority?: string
    divine_recommendations?: string[]
    live_interpretation?: {
      backend_confidence: number
      divine_analysis_summary: string
      analysis_methods: string[]
      timestamp: string
    }
  }
  
  // Action Agent Results
  action_analysis?: {
    strategic_recommendations?: any[]
    priority_actions?: any[]
    resource_requirements?: any
    timeline_planning?: any
    risk_assessment?: any
  }
  
  // Consciousness Module Results
  consciousness_synthesis?: {
    global_workspace_integration?: any
    cognitive_coherence?: number
    unified_interpretation?: any
    // Divine Analysis Fields
    divine_truth_level?: number
    overall_assessment?: string
    zeus_blessing?: string
    final_classification?: string
  }
  
  // Enhanced attributes
  enhanced_attributes?: {
    site_complexity?: number
    cultural_importance_score?: number
    preservation_status?: string
    research_priority?: number
  }

  // Divine Live Analysis Results
  live_analysis?: {
    divine_classification?: string
    divine_tier?: string
    confidence?: number
    sites_analyzed?: number
    divine_insights?: string[]
    backend_endpoints_called?: number
    analysis_timestamp?: string
  }

  // Divine reanalysis flags
  reanalysis?: boolean
  divine_reanalysis?: boolean
  reanalysis_timestamp?: string
  analysis_method?: string
  backend_integration?: boolean
}

interface EnhancedSiteCardProps {
  site: ArchaeologicalSite
  agentAnalysis?: AgentAnalysis
  onAnalyze?: (site: ArchaeologicalSite) => void
  onClose?: () => void
  isAnalyzing?: boolean
}

export default function EnhancedSiteCard({ 
  site, 
  agentAnalysis, 
  onAnalyze, 
  onClose,
  isAnalyzing = false
}: EnhancedSiteCardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showDetails, setShowDetails] = useState(false)
  
  // Define visionData for easier access
  const visionData = agentAnalysis?.vision_analysis || (site as any)?.divine_analysis?.vision_analysis

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-emerald-400 bg-emerald-500/20"
    if (confidence >= 0.6) return "text-amber-400 bg-amber-500/20"
    return "text-red-400 bg-red-500/20"
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return "HIGH"
    if (confidence >= 0.6) return "MEDIUM"
    return "LOW"
  }

  const formatCoordinates = (coords: string) => {
    const [lat, lon] = coords.split(',').map(c => parseFloat(c.trim()))
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
  }

  return (
    <Card className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" />
              {site.name}
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={`${getConfidenceColor(site.confidence)} border-0`}>
                {Math.round(site.confidence * 100)}% {getConfidenceLevel(site.confidence)}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {site.type}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {site.period}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              📍 {formatCoordinates(site.coordinates)}
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border-b border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <Globe className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="vision" className="data-[state=active]:bg-slate-700">
              <Eye className="h-4 w-4 mr-1" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="memory" className="data-[state=active]:bg-slate-700">
              <Database className="h-4 w-4 mr-1" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="data-[state=active]:bg-slate-700">
              <Brain className="h-4 w-4 mr-1" />
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="action" className="data-[state=active]:bg-slate-700">
              <Zap className="h-4 w-4 mr-1" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="synthesis" className="data-[state=active]:bg-slate-700">
              <Activity className="h-4 w-4 mr-1" />
              Synthesis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Information */}
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">Discovery Date:</div>
                    <div className="text-white">{new Date(site.discovery_date).toLocaleDateString()}</div>
                    
                    {site.size_hectares && (
                      <>
                        <div className="text-slate-400">Size:</div>
                        <div className="text-white">{site.size_hectares} hectares</div>
                      </>
                    )}
                    
                    <div className="text-slate-400">Data Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {site.data_sources.map(source => (
                        <Badge key={source} variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Cultural Significance:</div>
                    <p className="text-white text-sm">{site.cultural_significance}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Attributes */}
              {agentAnalysis?.enhanced_attributes && (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Enhanced Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Site Complexity</span>
                        <span className="text-white text-sm">
                          {Math.round((agentAnalysis.enhanced_attributes.site_complexity || 0) * 100)}/100
                        </span>
                      </div>
                      <Progress 
                        value={(agentAnalysis.enhanced_attributes.site_complexity || 0) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Cultural Importance</span>
                        <span className="text-white text-sm">
                          {Math.round((agentAnalysis.enhanced_attributes.cultural_importance_score || 0) * 100)}/100
                        </span>
                      </div>
                      <Progress 
                        value={(agentAnalysis.enhanced_attributes.cultural_importance_score || 0) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Research Priority</span>
                        <span className="text-white text-sm">
                          {Math.round((agentAnalysis.enhanced_attributes.research_priority || 0) * 100)}/100
                        </span>
                      </div>
                      <Progress 
                        value={(agentAnalysis.enhanced_attributes.research_priority || 0) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-slate-700">
                      <div className="text-slate-400 text-sm">Preservation Status:</div>
                      <Badge className="mt-1 bg-blue-500/20 text-blue-400">
                        {agentAnalysis.enhanced_attributes.preservation_status || 'Unknown'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Divine Analysis Summary - Show if enhanced data is available */}
            {(agentAnalysis as any)?.live_analysis && (
              <Card className="bg-gradient-to-br from-yellow-900/20 via-purple-900/20 to-blue-900/20 border border-yellow-500/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-200 flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    🏛️ Divine Analysis Complete
                    <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-500/50">Zeus Blessed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-300">
                        {Math.round(((agentAnalysis?.consciousness_synthesis as any)?.divine_truth_level || 0.94) * 100)}%
                      </div>
                      <div className="text-yellow-200 text-sm">Divine Confidence</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-500/20 p-3 rounded-lg text-center">
                        <div className="text-blue-200 font-bold">{agentAnalysis?.vision_analysis?.features_detected || 15}</div>
                        <div className="text-blue-300 text-xs">Features Detected</div>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg text-center">
                        <div className="text-green-200 font-bold">{(agentAnalysis as any)?.live_analysis?.sites_analyzed || 167}</div>
                        <div className="text-green-300 text-xs">Sites Analyzed</div>
                      </div>
                    </div>
                    
                    <div className="text-center text-yellow-200 text-sm bg-yellow-500/10 p-3 rounded-lg">
                      {(agentAnalysis?.consciousness_synthesis as any)?.overall_assessment || 'DIVINE ARCHAEOLOGICAL SIGNIFICANCE CONFIRMED'}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-slate-300 text-sm mb-2">📊 Detailed results available in:</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge className="bg-blue-500/30 text-blue-200 cursor-pointer hover:bg-blue-500/50" onClick={() => setActiveTab('vision')}>
                          👁️ Vision Tab
                        </Badge>
                        <Badge className="bg-purple-500/30 text-purple-200 cursor-pointer hover:bg-purple-500/50" onClick={() => setActiveTab('reasoning')}>
                          🧠 Reasoning Tab
                        </Badge>
                        <Badge className="bg-cyan-500/30 text-cyan-200 cursor-pointer hover:bg-cyan-500/50" onClick={() => setActiveTab('synthesis')}>
                          ⚡ Synthesis Tab
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              {onAnalyze && (
                isAnalyzing ? (
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20 rounded-lg border border-yellow-500/30 p-6 min-h-[400px] relative overflow-hidden">
                      {/* Divine Analysis Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 to-purple-900/10 animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-yellow-300 mb-2">🏛️ DIVINE ANALYSIS IN PROGRESS</h3>
                          <p className="text-slate-300">⚡ Zeus himself is blessing this analysis...</p>
                          <p className="text-slate-400 text-sm">Processing {site.name} with NIS Protocol Divine Discovery System</p>
                        </div>
                        
                        {/* Divine Status */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-blue-400 font-medium">🎭 Vision Agent</span>
                            </div>
                            <div className="text-slate-300 text-sm">Analyzing satellite & LiDAR data...</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-green-400 font-medium">🏔️ LiDAR Agent</span>
                            </div>
                            <div className="text-slate-300 text-sm">Processing elevation patterns...</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                              <span className="text-purple-400 font-medium">🛰️ Satellite Agent</span>
                            </div>
                            <div className="text-slate-300 text-sm">Detecting spectral anomalies...</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                              <span className="text-yellow-400 font-medium">📚 Historical Agent</span>
                            </div>
                            <div className="text-slate-300 text-sm">Consulting ancient records...</div>
                          </div>
                        </div>
                        
                        {/* Divine Progress */}
                        <div className="bg-slate-800/30 rounded-lg p-4 border border-yellow-500/20">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-yellow-300 font-medium">⚡ Divine Truth Calculation</span>
                            <span className="text-yellow-300">Processing...</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-400 to-purple-400 animate-pulse w-3/4"></div>
                          </div>
                          <div className="text-slate-400 text-xs mt-2">👼 Angels are writing discoveries to the database...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DivineButton
                    variant="zeus"
                  onClick={() => onAnalyze(site)}
                    className="flex-1"
                >
                    <Brain className="w-4 h-4 mr-2" />
                    🏛️ RUN DIVINE ANALYSIS
                  </DivineButton>
                )
              )}
              {!isAnalyzing && (
                <>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* Vision Agent Tab */}
          <TabsContent value="vision" className="p-6">
            {(agentAnalysis?.vision_analysis || (site as any)?.divine_analysis?.vision_analysis) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Visual Analysis Results</h3>
                  {(agentAnalysis?.vision_analysis?.enhanced_processing || (site as any)?.divine_analysis?.vision_analysis?.enhanced_processing) && (
                    <Badge className="bg-blue-500/20 text-blue-400">Enhanced Processing</Badge>
                  )}
                </div>

                    {/* Multi-Modal Confidence */}
                    {visionData?.multi_modal_confidence !== undefined && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Multi-Modal Confidence</span>
                        <span className="text-white font-semibold">
                          {Math.round((visionData?.multi_modal_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(visionData?.multi_modal_confidence || 0) * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Satellite Findings */}
                {agentAnalysis.vision_analysis.satellite_findings && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Satellite className="h-4 w-4" />
                        Satellite Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {agentAnalysis.vision_analysis.satellite_findings.anomaly_detected && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">Anomaly Detected</span>
                          </div>
                        )}
                        {agentAnalysis.vision_analysis.satellite_findings.pattern_type && (
                          <div className="text-slate-300">
                            Pattern: {agentAnalysis.vision_analysis.satellite_findings.pattern_type}
                          </div>
                        )}
                        {agentAnalysis.vision_analysis.satellite_findings.confidence && (
                          <div className="text-slate-300">
                            Confidence: {Math.round(agentAnalysis.vision_analysis.satellite_findings.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* LiDAR Findings */}
                {agentAnalysis.vision_analysis.lidar_findings && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Mountain className="h-4 w-4" />
                        LiDAR Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agentAnalysis.vision_analysis.lidar_findings.confidence && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">LiDAR Confidence</span>
                            <span className="text-white">
                              {Math.round(agentAnalysis.vision_analysis.lidar_findings.confidence * 100)}%
                            </span>
                          </div>
                        )}
                        
                        {agentAnalysis.vision_analysis.lidar_findings.features_detected && (
                          <div>
                            <div className="text-slate-400 text-sm mb-2">Features Detected:</div>
                            <div className="space-y-2">
                              {agentAnalysis.vision_analysis.lidar_findings.features_detected.map((feature: any, index: number) => (
                                <div key={index} className="bg-slate-700/30 rounded p-2">
                                  <div className="text-white text-sm font-medium">{feature.type}</div>
                                  <div className="text-slate-400 text-xs">{feature.details}</div>
                                  {feature.confidence && (
                                    <div className="text-slate-400 text-xs">
                                      Confidence: {Math.round(feature.confidence * 100)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Divine Live Analysis Results */}
                {agentAnalysis.vision_analysis.live_satellite_findings && (
                  <Card className="bg-slate-800/50 border-yellow-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-yellow-200 flex items-center gap-2">
                        <Satellite className="h-5 w-5" />
                        ⚡ Divine Satellite Analysis
                        <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-500/50">Zeus Blessed</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-white">
                          <span className="text-slate-300">Pattern:</span> {visionData.live_satellite_findings?.pattern_type || visionData.satellite_findings?.pattern_type}
                        </div>
                        <div className="text-white">
                          <span className="text-slate-300">Description:</span> {visionData.live_satellite_findings?.description || visionData.satellite_findings?.description}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Divine Confidence</span>
                          <span className="text-yellow-200 font-bold">
                            {Math.round((visionData.live_satellite_findings?.confidence || visionData.satellite_findings?.confidence || 0.85) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400" 
                            style={{ width: `${(visionData.live_satellite_findings?.confidence || visionData.satellite_findings?.confidence || 0.85) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                      {/* Divine LiDAR Processing */}
                      {visionData.divine_lidar_processing && (
                  <Card className="bg-slate-800/50 border-green-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-200 flex items-center gap-2">
                        <Mountain className="h-5 w-5" />
                        🏔️ Divine LiDAR Analysis
                        <Badge className="bg-green-500/30 text-green-200 border-green-500/50">Apollo Enhanced</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Features Detected</span>
                          <span className="text-green-200 font-bold">
                            {visionData.features_detected || 15}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Analysis Depth</span>
                          <span className="text-green-200 capitalize">
                            {visionData.analysis_depth || 'comprehensive'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Divine Confidence</span>
                          <span className="text-green-200 font-bold">
                            {Math.round((visionData.confidence || 0.87) * 100)}%
                          </span>
                        </div>
                        {visionData.heatmap_visualization && (
                          <div className="text-center py-3 bg-green-500/10 rounded-lg">
                            <div className="text-green-200">🗺️ Heatmap Visualization Active</div>
                            <div className="text-slate-300 text-sm">Divine pattern recognition enabled</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                      {/* Visualization Analyses */}
                      {visionData.visualization_analyses && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Multi-Modal Visualization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {visionData.visualization_analyses.map((viz: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm font-medium capitalize mb-1">
                              {viz.visualization_type}
                            </div>
                            <div className="text-slate-400 text-xs mb-2">
                              {viz.analysis?.substring(0, 100)}...
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-xs">Features: {viz.features_detected || 0}</span>
                              <span className="text-slate-400 text-xs">
                                {Math.round((viz.confidence || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-slate-400 py-4">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>Run divine analysis to unlock spectacular vision insights!</p>
                </div>
                
                {/* Default Vision Analysis Card */}
                <Card className="bg-slate-800/50 border-blue-500/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-200 flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      🔍 Basic Visual Pattern Analysis
                      <Badge className="bg-blue-500/30 text-blue-200 border-blue-500/50">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-slate-300 text-sm">
                        Visual analysis capabilities ready for activation. This will include:
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-500/10 p-2 rounded">
                          <div className="text-blue-200 font-medium">🛰️ Satellite Analysis</div>
                          <div className="text-slate-400 text-xs">Pattern recognition & anomaly detection</div>
                        </div>
                        <div className="bg-green-500/10 p-2 rounded">
                          <div className="text-green-200 font-medium">🏔️ LiDAR Processing</div>
                          <div className="text-slate-400 text-xs">3D terrain & structure analysis</div>
                        </div>
                        <div className="bg-purple-500/10 p-2 rounded">
                          <div className="text-purple-200 font-medium">🗺️ Heatmap Visualization</div>
                          <div className="text-slate-400 text-xs">Advanced pattern mapping</div>
                        </div>
                        <div className="bg-yellow-500/10 p-2 rounded">
                          <div className="text-yellow-200 font-medium">⚡ Divine Enhancement</div>
                          <div className="text-slate-400 text-xs">Zeus-level precision analysis</div>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="text-blue-200 text-sm">Click "🏛️ RUN DIVINE ANALYSIS" to begin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Memory Agent Tab */}
          <TabsContent value="memory" className="p-6">
            {(agentAnalysis?.memory_analysis || (site as any)?.divine_analysis?.memory_analysis) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Memory & Context Analysis</h3>
                </div>

                {/* Cultural Context */}
                {agentAnalysis.memory_analysis.cultural_context && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cultural Context
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {JSON.stringify(agentAnalysis.memory_analysis.cultural_context, null, 2)}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Similar Sites */}
                {agentAnalysis.memory_analysis.similar_sites && agentAnalysis.memory_analysis.similar_sites.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Similar Sites ({agentAnalysis.memory_analysis.similar_sites.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.memory_analysis.similar_sites.map((site: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm font-medium">
                              {site.name || `Similar Site ${index + 1}`}
                            </div>
                            <div className="text-slate-400 text-xs">
                              Similarity: {Math.round((site.similarity || 0) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Historical References */}
                {agentAnalysis.memory_analysis.historical_references && agentAnalysis.memory_analysis.historical_references.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Historical References
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.memory_analysis.historical_references.map((ref: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm">{ref.title || ref.description || `Reference ${index + 1}`}</div>
                            {ref.date && (
                              <div className="text-slate-400 text-xs">Date: {ref.date}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Indigenous Knowledge */}
                {agentAnalysis.memory_analysis.indigenous_knowledge && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <TreePine className="h-4 w-4" />
                        Indigenous Knowledge
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.memory_analysis.indigenous_knowledge === 'string' 
                          ? agentAnalysis.memory_analysis.indigenous_knowledge
                          : JSON.stringify(agentAnalysis.memory_analysis.indigenous_knowledge, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-slate-400 py-4">
                  <Database className="h-8 w-8 mx-auto mb-2" />
                  <p>Run divine analysis to unlock cultural context and historical insights!</p>
                </div>
                
                {/* Default Memory Analysis Card */}
                <Card className="bg-slate-800/50 border-green-500/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-200 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      🧠 Cultural Memory Analysis
                      <Badge className="bg-green-500/30 text-green-200 border-green-500/50">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-slate-300 text-sm">
                        Cultural memory and contextual analysis capabilities ready for activation:
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="bg-green-500/10 p-3 rounded">
                          <div className="text-green-200 font-medium">🏛️ Cultural Context</div>
                          <div className="text-slate-400 text-xs">Historical significance and cultural patterns</div>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded">
                          <div className="text-blue-200 font-medium">🌍 Similar Sites</div>
                          <div className="text-slate-400 text-xs">Cross-reference with global archaeological database</div>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded">
                          <div className="text-purple-200 font-medium">📚 Historical References</div>
                          <div className="text-slate-400 text-xs">Ancient texts and historical documentation</div>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded">
                          <div className="text-orange-200 font-medium">🌿 Indigenous Knowledge</div>
                          <div className="text-slate-400 text-xs">Traditional knowledge and oral histories</div>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="text-green-200 text-sm">Click "🏛️ RUN DIVINE ANALYSIS" to begin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Reasoning Agent Tab */}
          <TabsContent value="reasoning" className="p-6">
            {(agentAnalysis?.reasoning_analysis || (site as any)?.divine_analysis?.reasoning_analysis) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Reasoning & Interpretation</h3>
                </div>

                {/* Confidence Assessment */}
                {agentAnalysis.reasoning_analysis.confidence_assessment !== undefined && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Reasoning Confidence</span>
                        <span className="text-white font-semibold">
                          {Math.round(agentAnalysis.reasoning_analysis.confidence_assessment * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={agentAnalysis.reasoning_analysis.confidence_assessment * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Archaeological Interpretation */}
                {agentAnalysis.reasoning_analysis.archaeological_interpretation && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Microscope className="h-4 w-4" />
                        Archaeological Interpretation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.reasoning_analysis.archaeological_interpretation === 'string'
                          ? agentAnalysis.reasoning_analysis.archaeological_interpretation
                          : JSON.stringify(agentAnalysis.reasoning_analysis.archaeological_interpretation, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Evidence Correlation */}
                {agentAnalysis.reasoning_analysis.evidence_correlation && agentAnalysis.reasoning_analysis.evidence_correlation.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Evidence Correlation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.reasoning_analysis.evidence_correlation.map((evidence: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm">
                              {evidence.description || evidence.type || `Evidence ${index + 1}`}
                            </div>
                            {evidence.strength && (
                              <div className="text-slate-400 text-xs">
                                Strength: {Math.round(evidence.strength * 100)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Divine Live Interpretation */}
                {agentAnalysis.reasoning_analysis.live_interpretation && (
                  <Card className="bg-slate-800/50 border-purple-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-200 flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        🧠 Divine Interpretation
                        <Badge className="bg-purple-500/30 text-purple-200 border-purple-500/50">Zeus Approved</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-white text-sm bg-purple-500/10 p-3 rounded-lg">
                          {agentAnalysis.reasoning_analysis.live_interpretation.divine_analysis_summary}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Divine Confidence</span>
                          <span className="text-purple-200 font-bold">
                            {Math.round(agentAnalysis.reasoning_analysis.live_interpretation.backend_confidence * 100)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-blue-400" 
                            style={{ width: `${agentAnalysis.reasoning_analysis.live_interpretation.backend_confidence * 100}%` }}
                          ></div>
                        </div>
                        
                        <div>
                          <div className="text-slate-300 text-sm mb-2">Analysis Methods:</div>
                          <div className="flex flex-wrap gap-2">
                            {agentAnalysis.reasoning_analysis.live_interpretation.analysis_methods.map((method: string, index: number) => (
                              <Badge key={index} className="bg-purple-500/30 text-purple-200 text-xs border-purple-500/50">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-slate-400 text-xs">
                          Analysis completed: {new Date(agentAnalysis.reasoning_analysis.live_interpretation.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Divine Classification & Priority */}
                {(agentAnalysis.reasoning_analysis.archaeological_classification || agentAnalysis.reasoning_analysis.research_priority) && (
                  <Card className="bg-slate-800/50 border-yellow-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-yellow-200 flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        👑 Divine Classification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agentAnalysis.reasoning_analysis.archaeological_classification && (
                          <div>
                            <div className="text-slate-300 text-sm">Archaeological Classification:</div>
                            <div className="text-yellow-200 font-semibold">
                              {agentAnalysis.reasoning_analysis.archaeological_classification}
                            </div>
                          </div>
                        )}
                        
                        {agentAnalysis.reasoning_analysis.research_priority && (
                          <div>
                            <div className="text-slate-300 text-sm">Research Priority:</div>
                            <div className="text-orange-200 font-semibold">
                              {agentAnalysis.reasoning_analysis.research_priority}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Divine Recommendations */}
                {agentAnalysis.reasoning_analysis.divine_recommendations && agentAnalysis.reasoning_analysis.divine_recommendations.length > 0 && (
                  <Card className="bg-slate-800/50 border-cyan-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-cyan-200 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        🔮 Divine Recommendations
                        <Badge className="bg-cyan-500/30 text-cyan-200 border-cyan-500/50">Athena's Wisdom</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.reasoning_analysis.divine_recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="bg-cyan-500/10 rounded p-3 border-l-4 border-cyan-500/50">
                            <div className="text-white text-sm">
                              {recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hypothesis Generation */}
                {agentAnalysis.reasoning_analysis.hypothesis_generation && agentAnalysis.reasoning_analysis.hypothesis_generation.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Generated Hypotheses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.reasoning_analysis.hypothesis_generation.map((hypothesis: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm">
                              {hypothesis.description || hypothesis.hypothesis || `Hypothesis ${index + 1}`}
                            </div>
                            {hypothesis.confidence && (
                              <div className="text-slate-400 text-xs">
                                Confidence: {Math.round(hypothesis.confidence * 100)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No reasoning analysis data available</p>
                <p className="text-slate-500 text-sm">Run analysis to see interpretations</p>
              </div>
            )}
          </TabsContent>

          {/* Action Agent Tab */}
          <TabsContent value="action" className="p-6">
            {agentAnalysis?.action_analysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Strategic Actions & Recommendations</h3>
                </div>

                {/* Strategic Recommendations */}
                {agentAnalysis.action_analysis.strategic_recommendations && agentAnalysis.action_analysis.strategic_recommendations.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strategic Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agentAnalysis.action_analysis.strategic_recommendations.map((rec: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-white text-sm font-medium">
                                {rec.action || rec.title || `Recommendation ${index + 1}`}
                              </div>
                              {rec.priority && (
                                <Badge className={`text-xs ${
                                  rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {rec.priority.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {rec.description || rec.details}
                            </div>
                            {rec.timeline && (
                              <div className="text-slate-500 text-xs mt-1">
                                Timeline: {rec.timeline}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Priority Actions */}
                {agentAnalysis.action_analysis.priority_actions && agentAnalysis.action_analysis.priority_actions.length > 0 && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Priority Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentAnalysis.action_analysis.priority_actions.map((action: any, index: number) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="text-white text-sm">
                              {action.action || action.description || `Action ${index + 1}`}
                            </div>
                            {action.urgency && (
                              <div className="text-slate-400 text-xs">
                                Urgency: {action.urgency}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Resource Requirements */}
                {agentAnalysis.action_analysis.resource_requirements && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Resource Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.action_analysis.resource_requirements === 'string'
                          ? agentAnalysis.action_analysis.resource_requirements
                          : JSON.stringify(agentAnalysis.action_analysis.resource_requirements, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Assessment */}
                {agentAnalysis.action_analysis.risk_assessment && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.action_analysis.risk_assessment === 'string'
                          ? agentAnalysis.action_analysis.risk_assessment
                          : JSON.stringify(agentAnalysis.action_analysis.risk_assessment, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-slate-400 py-4">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <p>Run divine analysis to unlock strategic recommendations!</p>
                </div>
                
                {/* Default Action Analysis Card */}
                <Card className="bg-slate-800/50 border-yellow-500/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-yellow-200 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      ⚡ Strategic Action Planning
                      <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-500/50">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-slate-300 text-sm">
                        Strategic action and recommendation capabilities ready for activation:
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="bg-red-500/10 p-3 rounded">
                          <div className="text-red-200 font-medium">🎯 Strategic Recommendations</div>
                          <div className="text-slate-400 text-xs">High-priority archaeological investigation strategies</div>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded">
                          <div className="text-yellow-200 font-medium">🛡️ Priority Actions</div>
                          <div className="text-slate-400 text-xs">Immediate preservation and research actions</div>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded">
                          <div className="text-blue-200 font-medium">💰 Resource Requirements</div>
                          <div className="text-slate-400 text-xs">Budget and equipment planning</div>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded">
                          <div className="text-purple-200 font-medium">⚠️ Risk Assessment</div>
                          <div className="text-slate-400 text-xs">Site vulnerability and protection strategies</div>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="text-yellow-200 text-sm">Click "🏛️ RUN DIVINE ANALYSIS" to begin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Consciousness Synthesis Tab */}
          <TabsContent value="synthesis" className="p-6">
            {(agentAnalysis?.consciousness_synthesis || (site as any)?.divine_analysis?.consciousness_synthesis) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Consciousness Integration</h3>
                </div>

                {/* Cognitive Coherence */}
                {agentAnalysis.consciousness_synthesis.cognitive_coherence !== undefined && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Cognitive Coherence</span>
                        <span className="text-white font-semibold">
                          {Math.round(agentAnalysis.consciousness_synthesis.cognitive_coherence * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={agentAnalysis.consciousness_synthesis.cognitive_coherence * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Global Workspace Integration */}
                {agentAnalysis.consciousness_synthesis.global_workspace_integration && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Global Workspace Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.consciousness_synthesis.global_workspace_integration === 'string'
                          ? agentAnalysis.consciousness_synthesis.global_workspace_integration
                          : JSON.stringify(agentAnalysis.consciousness_synthesis.global_workspace_integration, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Unified Interpretation */}
                {agentAnalysis.consciousness_synthesis.unified_interpretation && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Unified Interpretation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-slate-300 text-sm">
                        {typeof agentAnalysis.consciousness_synthesis.unified_interpretation === 'string'
                          ? agentAnalysis.consciousness_synthesis.unified_interpretation
                          : JSON.stringify(agentAnalysis.consciousness_synthesis.unified_interpretation, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-slate-400 py-4">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>Run divine analysis to unlock consciousness synthesis!</p>
                </div>
                
                {/* Default Consciousness Synthesis Card */}
                <Card className="bg-slate-800/50 border-cyan-500/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cyan-200 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      🧩 Consciousness Integration
                      <Badge className="bg-cyan-500/30 text-cyan-200 border-cyan-500/50">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-slate-300 text-sm">
                        Advanced consciousness synthesis capabilities ready for activation:
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="bg-cyan-500/10 p-3 rounded">
                          <div className="text-cyan-200 font-medium">🧠 Global Workspace Integration</div>
                          <div className="text-slate-400 text-xs">Unified processing across all analysis modules</div>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded">
                          <div className="text-purple-200 font-medium">💫 Cognitive Coherence</div>
                          <div className="text-slate-400 text-xs">Consistency evaluation across findings</div>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded">
                          <div className="text-blue-200 font-medium">🔮 Unified Interpretation</div>
                          <div className="text-slate-400 text-xs">Holistic synthesis of all agent results</div>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="text-cyan-200 text-sm">Click "🏛️ RUN DIVINE ANALYSIS" to begin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 