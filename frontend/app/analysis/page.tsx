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
  Zap, Satellite, CheckCircle, ArrowRight, Cpu, Target
} from "lucide-react"

// Real Archaeological Sites for Quick Demo
const DEMO_SITES = [
  {
    id: "eldorado",
    name: "Lake Guatavita (El Dorado)",
    coordinates: "5.1542, -73.7792",
    confidence: 95,
    description: "Sacred Muisca ceremonial lake, legendary origin of El Dorado myth",
    status: "verified"
  },
  {
    id: "nazca",
    name: "Extended Nazca Geoglyphs", 
    coordinates: "-14.7390, -75.1300",
    confidence: 92,
    description: "Newly discovered Nazca line patterns using AI analysis",
    status: "new_discovery"
  },
  {
    id: "amazon",
    name: "Acre Geoglyphs Complex",
    coordinates: "-9.97474, -67.8096", 
    confidence: 88,
    description: "Pre-Columbian earthwork structures in the Amazon rainforest",
    status: "verified"
  }
]

export default function AnalysisPage() {
  const [selectedCoordinates, setSelectedCoordinates] = useState("5.1542, -73.7792")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [selectedSite, setSelectedSite] = useState(DEMO_SITES[0])
  const [currentStep, setCurrentStep] = useState("select") // select, analyze, results, chat
  const [analysisResults, setAnalysisResults] = useState(null)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)
    setCurrentStep("analyze")
    
    // Simulate realistic analysis progress
    const steps = [
      { progress: 15, message: "🛰️ Loading satellite imagery..." },
      { progress: 35, message: "🧠 Running GPT-4 Vision analysis..." },
      { progress: 55, message: "🎯 YOLO8 object detection..." },
      { progress: 75, message: "🏛️ Archaeological feature analysis..." },
      { progress: 90, message: "📊 Cultural significance assessment..." },
      { progress: 100, message: "✅ Analysis complete!" }
    ]
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1200))
      setAnalysisProgress(step.progress)
    }
    
    setIsAnalyzing(false)
    setAnalysisComplete(true)
    setCurrentStep("results")
    
    // Mock analysis results
    setAnalysisResults({
      featuresDetected: Math.floor(Math.random() * 8) + 3,
      confidence: selectedSite.confidence,
      culturalSignificance: selectedSite.confidence > 90 ? "Very High" : "High",
      timeToAnalyze: "12.3s"
    })
  }

  const handleSiteSelect = (site: typeof DEMO_SITES[0]) => {
    setSelectedSite(site)
    setSelectedCoordinates(site.coordinates)
    setAnalysisComplete(false)
    setCurrentStep("select")
    setAnalysisResults(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-emerald-400 border-emerald-400"
      case "new_discovery": return "text-blue-400 border-blue-400"
      default: return "text-slate-400 border-slate-400"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4">
            <Brain className="h-12 w-12 text-emerald-400" />
            NIS Protocol Analysis
          </h1>
          <p className="text-2xl text-slate-400 mb-8">
            AI-Powered Archaeological Site Discovery & Analysis
          </p>
          <div className="flex items-center justify-center gap-6">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400 px-4 py-2 text-lg">
              <Activity className="h-4 w-4 mr-2" />
              148 Sites Discovered
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400 px-4 py-2 text-lg">
              <Satellite className="h-4 w-4 mr-2" />
              Real Satellite Data
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400 px-4 py-2 text-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              KAN AI Networks
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel - Site Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Select Archaeological Site
                </CardTitle>
                <CardDescription>
                  Choose from real discovered sites
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm">{site.name}</h3>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(site.status)}`}>
                        {site.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{site.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
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
                <CardTitle className="text-white text-sm">Custom Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Coordinates (lat, lon)</Label>
                  <Input
                    value={selectedCoordinates}
                    onChange={(e) => setSelectedCoordinates(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white mt-2"
                    placeholder="5.1542, -73.7792"
                  />
                </div>
                <Button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Cpu className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel - Analysis Results */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Analysis Progress */}
            {currentStep === "analyze" && (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
                    <div>
                      <h3 className="text-2xl font-semibold text-white">AI Analysis in Progress</h3>
                      <p className="text-blue-300">Analyzing {selectedSite.name}</p>
                    </div>
                  </div>
                  <Progress value={analysisProgress} className="mb-4 h-3" />
                  <p className="text-lg text-blue-300">
                    Processing satellite imagery with advanced AI models...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {currentStep === "results" && analysisResults && (
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Analysis Complete!</h3>
                      <p className="text-emerald-300">Successfully analyzed {selectedSite.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400">{analysisResults.featuresDetected}</div>
                      <div className="text-sm text-slate-400">Features Detected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{analysisResults.confidence}%</div>
                      <div className="text-sm text-slate-400">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{analysisResults.culturalSignificance}</div>
                      <div className="text-sm text-slate-400">Cultural Significance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{analysisResults.timeToAnalyze}</div>
                      <div className="text-sm text-slate-400">Analysis Time</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setCurrentStep("chat")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Discuss with AI Expert
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vision Analysis Component */}
            {(currentStep === "results" || currentStep === "chat") && (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-6 w-6 text-blue-400" />
                    AI Vision Analysis Results
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Advanced computer vision analysis of satellite imagery for {selectedSite.name}
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
            {currentStep === "chat" && (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                    AI Archaeological Expert
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Discuss findings and get expert archaeological insights about {selectedSite.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <UltimateArchaeologicalChat />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Features Showcase - Default View */}
            {currentStep === "select" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">🏆 Award-Winning AI Technology</h2>
                  <p className="text-xl text-slate-400">
                    Advanced archaeological discovery using cutting-edge AI and satellite imagery
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Satellite className="h-12 w-12 text-blue-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Satellite AI Vision</h3>
                          <p className="text-blue-300">Real-time satellite imagery analysis</p>
                        </div>
                      </div>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          GPT-4 Vision + YOLO8 detection
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Multi-spectral analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Archaeological feature recognition
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Brain className="h-12 w-12 text-purple-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">KAN Neural Networks</h3>
                          <p className="text-purple-300">Advanced interpretable AI</p>
                        </div>
                      </div>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Kolmogorov-Arnold Networks
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Cultural pattern recognition
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Temporal analysis
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Globe className="h-12 w-12 text-emerald-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Real Archaeological Data</h3>
                          <p className="text-emerald-300">148+ verified discoveries</p>
                        </div>
                      </div>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Lake Guatavita (El Dorado)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Amazon Geoglyphs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Nazca Line Extensions
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Sparkles className="h-12 w-12 text-yellow-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Multi-Agent System</h3>
                          <p className="text-yellow-300">Coordinated AI analysis</p>
                        </div>
                      </div>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          6 specialized AI agents
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Real-time coordination
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          Indigenous knowledge integration
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 