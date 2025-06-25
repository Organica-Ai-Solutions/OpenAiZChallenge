"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MapPin, MessageSquare, Eye, Target, 
  ArrowRight, Navigation, CheckCircle, AlertCircle,
  Map as MapIcon, Camera, Globe
} from "lucide-react"
import { useUnifiedSystem } from "../../src/contexts/UnifiedSystemContext"

interface MockAnalysis {
  id: string
  session_name: string
  coordinates: string
  confidence: number
  pattern_type: string
  description: string
  cultural_significance: string
  created_at: string
}

export function EnhancedAnalysisNavigation() {
  const { actions, state } = useUnifiedSystem()
  const [testCoordinates, setTestCoordinates] = useState("5.1542, -73.7792")
  const [navigationLog, setNavigationLog] = useState<string[]>([])

  // Mock analysis data for demonstration
  const mockAnalyses: MockAnalysis[] = [
    {
      id: "analysis_001",
      session_name: "Amazon Basin Archaeological Survey",
      coordinates: "5.1542, -73.7792",
      confidence: 0.87,
      pattern_type: "settlement_cluster",
      description: "Potential indigenous settlement with circular arrangement of elevated structures",
      cultural_significance: "Significant ceremonial site with possible pre-Columbian origins",
      created_at: "2024-06-24T10:30:00Z"
    },
    {
      id: "analysis_002", 
      session_name: "Upper Xingu River Analysis",
      coordinates: "-3.4653, -62.2159",
      confidence: 0.73,
      pattern_type: "trade_route",
      description: "Linear features suggesting ancient trade pathway connections",
      cultural_significance: "Important trade network node connecting river systems",
      created_at: "2024-06-24T09:15:00Z"
    },
    {
      id: "analysis_003",
      session_name: "Tapajós Cultural Complex",
      coordinates: "-2.4079, -54.8069", 
      confidence: 0.91,
      pattern_type: "ceremonial_complex",
      description: "Large-scale geometric earthworks with astronomical alignments",
      cultural_significance: "Major ceremonial complex with sophisticated engineering",
      created_at: "2024-06-24T08:45:00Z"
    }
  ]

  const addToLog = (message: string) => {
    setNavigationLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  const navigateToAnalysisInChat = (analysis: MockAnalysis) => {
    const [lat, lon] = analysis.coordinates.split(',').map(c => parseFloat(c.trim()))
    
    // Create archaeological site object
    const site = {
      id: analysis.id,
      name: analysis.session_name,
      coordinates: analysis.coordinates,
      confidence: analysis.confidence,
      type: analysis.pattern_type,
      description: analysis.description,
      cultural_significance: analysis.cultural_significance,
      discovery_date: analysis.created_at,
      data_sources: ['analysis', 'satellite', 'historical']
    }
    
    addToLog(`🗨️ Navigating to Chat with "${analysis.session_name}" at ${analysis.coordinates}`)
    actions.navigateToSite(site, 'chat')
  }

  const navigateToAnalysisInMap = (analysis: MockAnalysis) => {
    const [lat, lon] = analysis.coordinates.split(',').map(c => parseFloat(c.trim()))
    
    // Create archaeological site object
    const site = {
      id: analysis.id,
      name: analysis.session_name,
      coordinates: analysis.coordinates,
      confidence: analysis.confidence,
      type: analysis.pattern_type,
      description: analysis.description,
      cultural_significance: analysis.cultural_significance,
      discovery_date: analysis.created_at,
      data_sources: ['analysis', 'satellite', 'historical']
    }
    
    addToLog(`🗺️ Navigating to Map with "${analysis.session_name}" at ${analysis.coordinates}`)
    actions.navigateToSite(site, 'map')
  }

  const navigateToAnalysisInVision = (analysis: MockAnalysis) => {
    const [lat, lon] = analysis.coordinates.split(',').map(c => parseFloat(c.trim()))
    
    // Create archaeological site object
    const site = {
      id: analysis.id,
      name: analysis.session_name,
      coordinates: analysis.coordinates,
      confidence: analysis.confidence,
      type: analysis.pattern_type,
      description: analysis.description,
      cultural_significance: analysis.cultural_significance,
      discovery_date: analysis.created_at,
      data_sources: ['analysis', 'satellite', 'historical']
    }
    
    addToLog(`🧠 Navigating to Vision with "${analysis.session_name}" at ${analysis.coordinates}`)
    actions.navigateToSite(site, 'vision')
  }

  const testDirectCoordinateNavigation = () => {
    if (!testCoordinates.trim()) return
    const [lat, lon] = testCoordinates.split(',').map(c => parseFloat(c.trim()))
    
    if (isNaN(lat) || isNaN(lon)) {
      addToLog(`❌ Invalid coordinates: ${testCoordinates}`)
      return
    }
    
    addToLog(`🎯 Testing direct coordinate navigation to ${testCoordinates}`)
    actions.selectCoordinates(lat, lon, 'analysis_navigation_test')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Navigation Demo */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            Enhanced Analysis Navigation
            <Badge variant="outline" className="text-emerald-400 border-emerald-400">
              Fixed Navigation
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Navigation Fixed!</span>
            </div>
            <p className="text-sm text-emerald-300">
              Analysis history buttons now properly navigate to specific site locations with full context.
            </p>
          </div>

          {/* Test Coordinate Navigation */}
          <div className="space-y-3">
            <Label className="text-sm text-slate-300">Test Direct Coordinate Navigation</Label>
            <div className="flex gap-2">
              <Input
                value={testCoordinates}
                onChange={(e) => setTestCoordinates(e.target.value)}
                placeholder="lat, lng"
                className="bg-slate-700 border-slate-600"
              />
              <Button 
                onClick={testDirectCoordinateNavigation}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600"
              >
                <Target className="w-4 h-4 mr-1" />
                Test
              </Button>
            </div>
          </div>

          {/* Current System State */}
          <div className="p-3 bg-slate-900/50 rounded border border-slate-600">
            <h5 className="text-sm font-medium mb-2 text-slate-300">Current System State</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Coordinates:</span>
                <span className="text-cyan-300">
                  {state.selectedCoordinates 
                    ? `${state.selectedCoordinates.lat}, ${state.selectedCoordinates.lon}`
                    : 'None'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Sites:</span>
                <span className="text-cyan-300">{state.selectedSites?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active View:</span>
                <span className="text-cyan-300">{state.activeView || 'analysis'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Analysis Results with Enhanced Navigation */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Analysis History Demo
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              Enhanced Navigation
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnalyses.map((analysis) => (
            <div key={analysis.id} className="p-3 bg-slate-900/50 rounded border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white text-sm">{analysis.session_name}</h4>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                  {Math.round(analysis.confidence * 100)}%
                </Badge>
              </div>
              
              <div className="text-xs text-slate-400 mb-2">
                📍 {analysis.coordinates} • {analysis.pattern_type}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => navigateToAnalysisInChat(analysis)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Chat
                </Button>
                <Button
                  onClick={() => navigateToAnalysisInMap(analysis)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <MapIcon className="w-3 h-3 mr-1" />
                  Map
                </Button>
                <Button
                  onClick={() => navigateToAnalysisInVision(analysis)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Vision
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Log */}
      <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-cyan-400" />
            Navigation Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/40 rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
            {navigationLog.length === 0 ? (
              <div className="text-slate-500 text-center py-4">
                Click any navigation button above to see activity...
              </div>
            ) : (
              <div className="space-y-1">
                {navigationLog.map((log, index) => (
                  <div key={index} className="text-slate-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Real-time navigation tracking</span>
            <Button
              onClick={() => setNavigationLog([])}
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 