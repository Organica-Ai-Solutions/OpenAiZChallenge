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
import { Eye, Camera, Satellite, Brain, Activity, MapPin, Target, Wifi, WifiOff, BarChart3, Sparkles, RefreshCw, Zap, Clock, ArrowRight } from "lucide-react"

export default function VisionAgentPage() {
  const [selectedCoordinates, setSelectedCoordinates] = useState("5.1542, -73.7792")
  const [visionResult, setVisionResult] = useState<any>(null)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [activeMode, setActiveMode] = useState<"analyze" | "results">("analyze")
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])

  const FAMOUS_SITES = [
    { name: "Lake Guatavita (El Dorado)", coords: "5.1542, -73.7792", type: "Ceremonial" },
    { name: "Nazca Lines", coords: "-14.7390, -75.1300", type: "Geoglyph" },
    { name: "Machu Picchu", coords: "-13.1631, -72.5450", type: "Settlement" },
    { name: "Amazon Geoglyphs", coords: "-9.9747, -67.8096", type: "Earthwork" }
  ]

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        setIsBackendOnline(response.ok)
      } catch {
        setIsBackendOnline(false)
      }
    }
    
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleAnalysisComplete = (results: any) => {
    setVisionResult(results)
    setActiveMode("results")
    
    const newEntry = {
      id: Date.now(),
      coordinates: selectedCoordinates,
      timestamp: new Date().toISOString(),
      results
    }
    setAnalysisHistory(prev => [newEntry, ...prev.slice(0, 9)])
  }

  const handleQuickSelect = (coords: string) => {
    setSelectedCoordinates(coords)
    setActiveMode("analyze")
  }

  return (
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
              🔍 Vision Agent
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered satellite imagery analysis for archaeological discovery. 
              Powered by GPT-4 Vision, YOLO8, and specialized archaeological detection models.
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
                      <>
                        <WifiOff className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300">Demo Mode</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300">Multi-Model Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">NIS Protocol Enhanced</span>
                  </div>
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
                Select famous archaeological sites or enter custom coordinates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {FAMOUS_SITES.map((site, index) => (
                  <motion.div
                    key={site.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-slate-900/50 border-slate-600 text-white hover:bg-slate-700/50 transition-all h-auto p-3"
                      onClick={() => handleQuickSelect(site.coords)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{site.name}</div>
                        <div className="text-xs text-slate-400">{site.type} • {site.coords}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="coordinates" className="text-white mb-2 block">
                    Custom Coordinates (Latitude, Longitude)
                  </Label>
                  <Input
                    id="coordinates"
                    value={selectedCoordinates}
                    onChange={(e) => setSelectedCoordinates(e.target.value)}
                    placeholder="e.g., 5.1542, -73.7792"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button 
                  onClick={() => setActiveMode("analyze")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
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
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-6 h-6 text-emerald-400" />
                    GPT-4 Vision Satellite Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-powered archaeological feature detection using advanced computer vision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isBackendOnline ? (
                    <VisionAgentVisualization
                      coordinates={selectedCoordinates}
                      onAnalysisComplete={handleAnalysisComplete}
                      isBackendOnline={isBackendOnline}
                      autoAnalyze={false}
                    />
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
                        {visionResult.detection_results?.length || 0} Features
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {visionResult.detection_results && visionResult.detection_results.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visionResult.detection_results.map((detection: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">{detection.type}</h4>
                              <Badge variant="secondary">
                                {Math.round(detection.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm">{detection.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-400 mb-4">
                      <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No analysis results yet</p>
                      <p className="text-sm">Run an analysis to see results here</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Analysis History */}
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
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your last {analysisHistory.length} vision analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-600/30 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCoordinates(entry.coordinates)
                        setVisionResult(entry.results)
                        setActiveMode("results")
                      }}
                    >
                      <div>
                        <p className="text-white font-medium">{entry.coordinates}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {entry.results?.detection_results?.length || 0} features
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
} 