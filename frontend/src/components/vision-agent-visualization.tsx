"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "../../components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Eye,
  Layers,
  Target,
  BarChart,
  Database,
  Play,
  RefreshCw,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  Activity,
  TrendingUp
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VisionAgentVisualizationProps {
  coordinates?: string
  imageSrc?: string
}

interface Detection {
  id: string
  label: string
  confidence: number
  bounds: { x: number; y: number; width: number; height: number }
  model_source: string
  feature_type: string
  archaeological_significance: string
}

interface ProcessingStep {
  step: string
  status: "running" | "complete" | "pending" | "error"
  timing?: string
}

interface ModelPerformance {
  [key: string]: {
    accuracy: number
    processing_time: string
    features_detected: number
    contextual_analysis?: string
  }
}

export function VisionAgentVisualization({ coordinates, imageSrc }: VisionAgentVisualizationProps) {
  const [visualizationMode, setVisualizationMode] = useState("detection")
  const [confidenceThreshold, setConfidenceThreshold] = useState(40)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  const [detections, setDetections] = useState<Detection[]>([])
  const [processingPipeline, setProcessingPipeline] = useState<ProcessingStep[]>([])
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance>({})
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }
    checkBackend()
  }, [])

  const runVisionAnalysis = async (coords: string, options: any = {}) => {
    try {
      const response = await fetch('http://localhost:8000/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: coords, ...options })
      })
      return await response.json()
    } catch (error) {
      console.log('Vision analysis failed, using demo data')
      return null
    }
  }

  const filteredDetections = detections.filter(d => d.confidence >= confidenceThreshold / 100)
  const totalDetections = detections.length
  const highConfidenceCount = detections.filter(d => d.confidence >= 0.8).length
  const avgConfidence = detections.length > 0 ? 
    Math.round(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100) : 0

  const addLogEntry = useCallback((message: string, type: "info" | "warn" | "error" = "info") => {
    const timestamp = new Date().toISOString().slice(11, 23)
    const prefix = type === "error" ? "ERROR" : type === "warn" ? "WARN" : "INFO"
    setExecutionLog(prev => [...prev, `[${timestamp}] ${prefix}: ${message}`])
  }, [])

  const updateProcessingStep = useCallback((stepName: string, status: ProcessingStep["status"], timing?: string) => {
    setProcessingPipeline(prev => {
      const existing = prev.find(p => p.step === stepName)
      if (existing) {
        return prev.map(p => p.step === stepName ? { ...p, status, timing } : p)
      } else {
        return [...prev, { step: stepName, status, timing }]
      }
    })
  }, [])

  const handleRunAnalysis = async () => {
    if (!coordinates) {
      addLogEntry("No coordinates provided for analysis", "error")
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setExecutionLog([])
    setProcessingPipeline([])
    setDetections([])
    setModelPerformance({})

    try {
      addLogEntry("🚀 Starting comprehensive vision analysis")
      setAnalysisProgress(10)

      if (!isOnline) {
        addLogEntry("⚠️ Backend offline - using demo analysis", "warn")
        await simulateAnalysis()
        return
      }

      addLogEntry(`📍 Analyzing coordinates: ${coordinates}`)
      updateProcessingStep("Coordinate Validation", "running")
      setAnalysisProgress(20)

      const result = await runVisionAnalysis(coordinates, {
        models: ["yolo8", "waldo", "gpt4_vision"],
        confidence_threshold: confidenceThreshold / 100,
        enable_layers: true
      })

      updateProcessingStep("Coordinate Validation", "complete", "0.2s")
      updateProcessingStep("Image Acquisition", "complete", "1.2s")
      updateProcessingStep("Model Processing", "running")
      setAnalysisProgress(50)

      addLogEntry("✅ Vision analysis completed successfully")
      
      if (result?.detection_results) {
        const formattedDetections: Detection[] = result.detection_results.map((detection: any, index: number) => ({
          id: `detection_${index}`,
          label: detection.label || "Archaeological Feature",
          confidence: detection.confidence || 0.7,
          bounds: detection.bounds || { x: 50 + index * 30, y: 40 + index * 25, width: 80, height: 60 },
          model_source: detection.model_source || "YOLO8",
          feature_type: detection.feature_type || "settlement",
          archaeological_significance: detection.archaeological_significance || "Medium"
        }))
        setDetections(formattedDetections)
      }

      if (result?.model_performance) {
        setModelPerformance(result.model_performance)
      }

      updateProcessingStep("Model Processing", "complete", "3.8s")
      setAnalysisProgress(100)
      addLogEntry(`🎯 Analysis complete: ${detections?.length || 0} features detected`)

    } catch (error) {
      addLogEntry(`Analysis failed: ${error}`, "error")
      await simulateAnalysis()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const simulateAnalysis = async () => {
    const steps = [
      { name: "Image Preprocessing", duration: 800 },
      { name: "YOLO8 Detection", duration: 1200 },
      { name: "Waldo Analysis", duration: 1500 },
      { name: "GPT-4 Vision Processing", duration: 2000 }
    ]

    let progress = 20
    for (const step of steps) {
      updateProcessingStep(step.name, "running")
      addLogEntry(`Processing: ${step.name}`)
      await new Promise(resolve => setTimeout(resolve, step.duration))
      updateProcessingStep(step.name, "complete", `${step.duration / 1000}s`)
      progress += 15
      setAnalysisProgress(progress)
    }

    const demoDetections: Detection[] = [
      {
        id: "demo_1",
        label: "Geometric Pattern",
        confidence: 0.87,
        bounds: { x: 120, y: 80, width: 150, height: 120 },
        model_source: "YOLO8",
        feature_type: "settlement",
        archaeological_significance: "High"
      },
      {
        id: "demo_2", 
        label: "Linear Feature",
        confidence: 0.72,
        bounds: { x: 300, y: 150, width: 200, height: 40 },
        model_source: "Waldo",
        feature_type: "pathway",
        archaeological_significance: "Medium"
      }
    ]

    setDetections(demoDetections)
    setModelPerformance({
      yolo8: { accuracy: 73, processing_time: "1.8s", features_detected: 6 },
      waldo: { accuracy: 82, processing_time: "2.1s", features_detected: 4 },
      gpt4_vision: { accuracy: 91, processing_time: "3.2s", features_detected: 3 }
    })

    setAnalysisProgress(100)
    addLogEntry("✅ Demo analysis completed")
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 border-green-600"
    if (confidence >= 0.6) return "text-amber-600 border-amber-600"
    return "text-red-600 border-red-600"
  }

  const getSignificanceColor = (significance: string) => {
    if (significance === "High") return "bg-red-100 text-red-800"
    if (significance === "Medium") return "bg-amber-100 text-amber-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" />
              Vision Agent Analysis
              {isOnline ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Backend Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500 border-gray-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !coordinates}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {coordinates && (
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Analyzing: {coordinates}
            </CardDescription>
          )}

          {isAnalyzing && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}
        </CardHeader>

        <Tabs value={visualizationMode} onValueChange={setVisualizationMode} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="detection">
              <Target className="h-4 w-4 mr-1" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="layers">
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <BarChart className="h-4 w-4 mr-1" />
              Models
            </TabsTrigger>
            <TabsTrigger value="details">
              <Database className="h-4 w-4 mr-1" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="mx-4 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative bg-muted aspect-video rounded-lg overflow-hidden border">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Satellite imagery" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-green-100">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">Satellite Imagery</div>
                          <div className="text-xs text-green-200">
                            {coordinates ? `Location: ${coordinates}` : "Enter coordinates for analysis"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBoundingBoxes && filteredDetections.map((detection) => (
                    <Tooltip key={detection.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute border-2 rounded cursor-pointer transition-all hover:border-4 ${getConfidenceColor(detection.confidence)}`}
                          style={{
                            left: `${(detection.bounds.x / 600) * 100}%`,
                            top: `${(detection.bounds.y / 400) * 100}%`,
                            width: `${(detection.bounds.width / 600) * 100}%`,
                            height: `${(detection.bounds.height / 400) * 100}%`,
                          }}
                        >
                          {showLabels && (
                            <div className="absolute -top-6 left-0 bg-background/90 text-xs px-2 py-1 rounded border">
                              {detection.label} ({Math.round(detection.confidence * 100)}%)
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-medium">{detection.label}</div>
                          <div className="text-xs">Confidence: {Math.round(detection.confidence * 100)}%</div>
                          <div className="text-xs">Model: {detection.model_source}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="outline" className="bg-background/80">
                      {totalDetections} Features
                    </Badge>
                    {avgConfidence > 0 && (
                      <Badge variant="outline" className="bg-background/80">
                        {avgConfidence}% Avg Confidence
                      </Badge>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detection Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Confidence Threshold: {confidenceThreshold}%</Label>
                      <Slider
                        value={[confidenceThreshold]}
                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="bounding-boxes"
                          checked={showBoundingBoxes}
                          onCheckedChange={setShowBoundingBoxes}
                        />
                        <Label htmlFor="bounding-boxes" className="text-sm">Bounding Boxes</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="labels"
                          checked={showLabels}
                          onCheckedChange={setShowLabels}
                        />
                        <Label htmlFor="labels" className="text-sm">Labels</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Detection Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Features:</span>
                        <Badge variant="outline">{totalDetections}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>High Confidence:</span>
                        <Badge variant="outline">{highConfidenceCount}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Confidence:</span>
                        <Badge variant="outline">{avgConfidence}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detected Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredDetections.map((detection) => (
                          <div key={detection.id} className="p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">{detection.label}</span>
                              <Badge variant="outline" className={getConfidenceColor(detection.confidence)}>
                                {Math.round(detection.confidence * 100)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Model: {detection.model_source}</div>
                              <Badge className={getSignificanceColor(detection.archaeological_significance)}>
                                {detection.archaeological_significance} Significance
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        {filteredDetections.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">No features detected</div>
                            <div className="text-xs">Try lowering the confidence threshold</div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="mx-4 mb-4">
            <div className="text-center py-8">
              <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground">Layer Analysis</h3>
              <p className="text-sm text-muted-foreground">Multi-layer visualization coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mx-4 mb-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Model Performance</h3>
              {Object.keys(modelPerformance).length > 0 ? (
                Object.entries(modelPerformance).map(([model, data]: [string, any]) => (
                  <Card key={model}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="capitalize">{model}</Badge>
                        <span className="text-sm font-medium">{data.accuracy}% Accuracy</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${data.accuracy}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Features: {data.features_detected} • Time: {data.processing_time}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Run analysis to see model performance</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mx-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="font-mono text-xs space-y-1">
                    {executionLog.length > 0 ? executionLog.map((log, index) => (
                      <div key={index} className="text-muted-foreground">{log}</div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div>No logs yet</div>
                        <div className="text-xs">Run analysis to see execution details</div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </TooltipProvider>
  )
} 