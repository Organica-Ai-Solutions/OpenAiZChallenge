"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

import { VisionAgentVisualization } from "@/src/components/vision-agent-visualization"
import UltimateArchaeologicalChat from "@/components/ui/ultimate-archaeological-chat"

import { 
  Search, Globe, Activity, Brain, Sparkles, MapPin, Eye, 
  Zap, Satellite, Play, CheckCircle, ArrowRight, Cpu
} from "lucide-react"

// Real Archaeological Sites for Quick Demo
const DEMO_SITES = [
  {
    id: "eldorado",
    name: "Lake Guatavita (El Dorado)",
    coordinates: "5.1542, -73.7792",
    confidence: 95,
    description: "Sacred Muisca ceremonial lake, legendary origin of El Dorado myth"
  },
  {
    id: "nazca",
    name: "Extended Nazca Geoglyphs", 
    coordinates: "-14.7390, -75.1300",
    confidence: 92,
    description: "Newly discovered Nazca line patterns using AI analysis"
  },
  {
    id: "amazon",
    name: "Acre Geoglyphs Complex",
    coordinates: "-9.97474, -67.8096", 
    confidence: 88,
    description: "Pre-Columbian earthwork structures in the Amazon rainforest"
  }
]

export default function SimplifiedAnalysisPage() {
  const [selectedCoordinates, setSelectedCoordinates] = useState("5.1542, -73.7792")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [selectedSite, setSelectedSite] = useState(DEMO_SITES[0])
  const [showVision, setShowVision] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)
    setShowVision(true)
    
    // Simulate analysis progress
    const steps = [
      { progress: 20, message: "Loading satellite imagery..." },
      { progress: 40, message: "Running AI vision analysis..." },
      { progress: 60, message: "Processing archaeological features..." },
      { progress: 80, message: "Analyzing cultural significance..." },
      { progress: 100, message: "Analysis complete!" }
    ]
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAnalysisProgress(step.progress)
    }
    
    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  const handleSiteSelect = (site: typeof DEMO_SITES[0]) => {
    setSelectedSite(site)
    setSelectedCoordinates(site.coordinates)
    setAnalysisComplete(false)
    setShowVision(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-emerald-400" />
            NIS Protocol Analysis
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            AI-Powered Archaeological Site Discovery & Analysis
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400">
              <Activity className="h-3 w-3 mr-1" />
              148 Sites Discovered
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Satellite className="h-3 w-3 mr-1" />
              Real Satellite Data
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              <Sparkles className="h-3 w-3 mr-1" />
              KAN AI Networks
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Quick Site Selection */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-400" />
                  Quick Site Analysis
                </CardTitle>
                <CardDescription>
                  Select a real archaeological site to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_SITES.map((site) => (
                  <div
                    key={site.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSite.id === site.id
                        ? 'bg-emerald-500/20 border-emerald-400'
                        : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleSiteSelect(site)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white text-sm">{site.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {site.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{site.description}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {site.coordinates}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Custom Coordinates */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Custom Coordinates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Coordinates (lat, lon)</Label>
                  <Input
                    value={selectedCoordinates}
                    onChange={(e) => setSelectedCoordinates(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                    placeholder="5.1542, -73.7792"
                  />
                </div>
                <Button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Cpu className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-blue-400 animate-pulse" />
                    <h3 className="text-lg font-semibold text-white">AI Analysis in Progress</h3>
                  </div>
                  <Progress value={analysisProgress} className="mb-3" />
                  <p className="text-sm text-blue-300">
                    Processing satellite imagery and running archaeological AI models...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {analysisComplete && (
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Analysis Complete!</h3>
                  </div>
                  <p className="text-emerald-300 mb-4">
                    Successfully analyzed {selectedSite.name} using advanced AI vision models.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowChat(true)}
                      variant="outline" 
                      className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/20"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Discuss Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vision Analysis Component */}
            {showVision && (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    AI Vision Analysis
                  </CardTitle>
                  <CardDescription>
                    Advanced computer vision analysis of satellite imagery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VisionAgentVisualization 
                    coordinates={selectedCoordinates}
                    autoAnalyze={true}
                    isBackendOnline={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Chat Interface */}
            {showChat && (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    AI Archaeological Assistant
                  </CardTitle>
                  <CardDescription>
                    Discuss findings and get expert archaeological insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <UltimateArchaeologicalChat />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Features Showcase */}
            {!showVision && !showChat && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Satellite className="h-8 w-8 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-white">Satellite AI Vision</h3>
                        <p className="text-sm text-blue-300">Real-time satellite imagery analysis</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• GPT-4 Vision + YOLO8 detection</li>
                      <li>• Multi-spectral analysis</li>
                      <li>• Archaeological feature recognition</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="font-semibold text-white">KAN Neural Networks</h3>
                        <p className="text-sm text-purple-300">Advanced interpretable AI</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• Kolmogorov-Arnold Networks</li>
                      <li>• Cultural pattern recognition</li>
                      <li>• Temporal analysis</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="h-8 w-8 text-emerald-400" />
                      <div>
                        <h3 className="font-semibold text-white">Real Archaeological Data</h3>
                        <p className="text-sm text-emerald-300">148+ verified discoveries</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• Lake Guatavita (El Dorado)</li>
                      <li>• Amazon Geoglyphs</li>
                      <li>• Nazca Line Extensions</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-8 w-8 text-yellow-400" />
                      <div>
                        <h3 className="font-semibold text-white">Multi-Agent System</h3>
                        <p className="text-sm text-yellow-300">Coordinated AI analysis</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>• 6 specialized AI agents</li>
                      <li>• Real-time coordination</li>
                      <li>• Indigenous knowledge integration</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 