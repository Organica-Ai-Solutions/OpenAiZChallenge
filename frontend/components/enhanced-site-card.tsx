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
  Share2
} from 'lucide-react'

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
  }
  
  // Memory Agent Results
  memory_analysis?: {
    cultural_context?: any
    historical_references?: any[]
    similar_sites?: any[]
    indigenous_knowledge?: any
    site_database_matches?: any[]
  }
  
  // Reasoning Agent Results
  reasoning_analysis?: {
    archaeological_interpretation?: any
    cultural_significance?: any
    confidence_assessment?: number
    evidence_correlation?: any[]
    hypothesis_generation?: any[]
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
  }
  
  // Enhanced attributes
  enhanced_attributes?: {
    site_complexity?: number
    cultural_importance_score?: number
    preservation_status?: string
    research_priority?: number
  }
}

interface EnhancedSiteCardProps {
  site: ArchaeologicalSite
  agentAnalysis?: AgentAnalysis
  onAnalyze?: (site: ArchaeologicalSite) => void
  onClose?: () => void
}

export default function EnhancedSiteCard({ 
  site, 
  agentAnalysis, 
  onAnalyze, 
  onClose 
}: EnhancedSiteCardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showDetails, setShowDetails] = useState(false)

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

            {/* Analysis Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              {onAnalyze && (
                <Button 
                  onClick={() => onAnalyze(site)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Run Full Analysis
                </Button>
              )}
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </TabsContent>

          {/* Vision Agent Tab */}
          <TabsContent value="vision" className="p-6">
            {agentAnalysis?.vision_analysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Visual Analysis Results</h3>
                  {agentAnalysis.vision_analysis.enhanced_processing && (
                    <Badge className="bg-blue-500/20 text-blue-400">Enhanced Processing</Badge>
                  )}
                </div>

                {/* Multi-Modal Confidence */}
                {agentAnalysis.vision_analysis.multi_modal_confidence !== undefined && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Multi-Modal Confidence</span>
                        <span className="text-white font-semibold">
                          {Math.round(agentAnalysis.vision_analysis.multi_modal_confidence * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={agentAnalysis.vision_analysis.multi_modal_confidence * 100} 
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

                {/* Visualization Analyses */}
                {agentAnalysis.vision_analysis.visualization_analyses && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Multi-Modal Visualization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agentAnalysis.vision_analysis.visualization_analyses.map((viz: any, index: number) => (
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
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No vision analysis data available</p>
                <p className="text-slate-500 text-sm">Run analysis to see visual findings</p>
              </div>
            )}
          </TabsContent>

          {/* Memory Agent Tab */}
          <TabsContent value="memory" className="p-6">
            {agentAnalysis?.memory_analysis ? (
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
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No memory analysis data available</p>
                <p className="text-slate-500 text-sm">Run analysis to see contextual information</p>
              </div>
            )}
          </TabsContent>

          {/* Reasoning Agent Tab */}
          <TabsContent value="reasoning" className="p-6">
            {agentAnalysis?.reasoning_analysis ? (
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
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No action analysis data available</p>
                <p className="text-slate-500 text-sm">Run analysis to see recommendations</p>
              </div>
            )}
          </TabsContent>

          {/* Consciousness Synthesis Tab */}
          <TabsContent value="synthesis" className="p-6">
            {agentAnalysis?.consciousness_synthesis ? (
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
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No consciousness synthesis data available</p>
                <p className="text-slate-500 text-sm">Run analysis to see integrated results</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 