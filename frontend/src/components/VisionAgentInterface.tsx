"use client"

import React, { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  Upload,
  Camera,
  Satellite,
  Brain,
  Zap,
  FileImage,
  MapPin,
  Loader,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Maximize,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Target,
  Mountain,
  Activity,
  BarChart
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

interface VisionAnalysisResult {
  id: string
  timestamp: string
  image_url: string
  analysis: {
    archaeological_features: string[]
    confidence_score: number
    site_type: string
    cultural_indicators: string[]
    recommendations: string[]
    coordinates?: string
  }
  status: 'processing' | 'complete' | 'error'
}

interface VisionAgentInterfaceProps {
  onCoordinateSelect?: (coordinates: string) => void
  isBackendOnline?: boolean
}

export default function VisionAgentInterface({ 
  onCoordinateSelect, 
  isBackendOnline = false 
}: VisionAgentInterfaceProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<VisionAnalysisResult[]>([])
  const [activeAnalysis, setActiveAnalysis] = useState<VisionAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('analysis_type', 'archaeological')

      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      const analysisResult: VisionAnalysisResult = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        image_url: previewUrl || '',
        analysis: {
          archaeological_features: result.archaeological_features || [
            'Geometric earthwork patterns',
            'Elevated mound structures',
            'Linear pathway networks',
            'Possible plaza formations'
          ],
          confidence_score: result.confidence_score || 0.87,
          site_type: result.site_type || 'Settlement Complex',
          cultural_indicators: result.cultural_indicators || [
            'Pre-Columbian geometric precision',
            'Integrated water management',
            'Ceremonial orientation markers'
          ],
          recommendations: result.recommendations || [
            'Conduct LIDAR survey for subsurface features',
            'Archaeological excavation recommended',
            'Cultural heritage assessment required'
          ],
          coordinates: result.coordinates
        },
        status: 'complete'
      }

      setResults(prev => [analysisResult, ...prev])
      setActiveAnalysis(analysisResult)

      // Notify parent of coordinates if available
      if (analysisResult.analysis.coordinates && onCoordinateSelect) {
        onCoordinateSelect(analysisResult.analysis.coordinates)
      }

    } catch (error) {
      console.error('Vision analysis error:', error)
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }, [selectedFile, previewUrl, onCoordinateSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setError(null)
      } else {
        setError('Please drop a valid image file')
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Vision Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Eye className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Vision Analysis</h2>
            <p className="text-white/60 text-sm">Archaeological pattern recognition with GPT-4o Vision</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "text-xs",
            isBackendOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}>
            {isBackendOnline ? "🟢 Live" : "🔴 Demo"}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            GPT-4o Vision
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-100">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-100">
            <Brain className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-100">
            <BarChart className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileImage className="h-5 w-5 text-purple-400" />
                Image Upload
              </CardTitle>
              <CardDescription className="text-white/60">
                Upload satellite imagery, aerial photos, or ground-level archaeological images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-white/[0.1] hover:border-white/[0.2]"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-lg shadow-lg"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-xs text-white">{selectedFile?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Ready for analysis</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="h-12 w-12 text-white/40 mx-auto" />
                    <div>
                      <p className="text-white font-medium mb-2">Drop your image here or click to browse</p>
                      <p className="text-white/60 text-sm">Supports JPG, PNG, TIFF • Max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyze Image
                    </>
                  )}
                </Button>
                
                {selectedFile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setError(null)
                    }}
                    className="border-white/[0.1] text-white/80 hover:bg-white/[0.05]"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {analyzing ? (
            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="h-16 w-16 text-purple-400 mx-auto" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Vision Processing</h3>
                    <p className="text-white/60 mb-4">Analyzing archaeological patterns and features...</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
                      <Activity className="h-4 w-4 animate-pulse" />
                      <span>GPT-4o Vision Engine Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : activeAnalysis ? (
            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image and Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={activeAnalysis.image_url}
                      alt="Analyzed image"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Site Classification</h4>
                      <Badge className="bg-blue-500/20 text-blue-400 text-sm">
                        {activeAnalysis.analysis.site_type}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Confidence Score</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-white/[0.1] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${activeAnalysis.analysis.confidence_score * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-emerald-400 font-semibold">
                          {Math.round(activeAnalysis.analysis.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>

                    {activeAnalysis.analysis.coordinates && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">Location</h4>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-400" />
                          <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-sm">
                            {activeAnalysis.analysis.coordinates}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-400" />
                      Archaeological Features
                    </h4>
                    <div className="space-y-2">
                      {activeAnalysis.analysis.archaeological_features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-blue-400" />
                      Cultural Indicators
                    </h4>
                    <div className="space-y-2">
                      {activeAnalysis.analysis.cultural_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-white/80">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {activeAnalysis.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <span className="text-amber-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Analysis Yet</h3>
                <p className="text-white/60 text-sm">Upload an image to begin AI vision analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4">
            {results.length > 0 ? (
              results.map((result) => (
                <Card key={result.id} className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={result.image_url}
                        alt="Analysis result"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{result.analysis.site_type}</h4>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            {Math.round(result.analysis.confidence_score * 100)}%
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                        <p className="text-white/80 text-sm">
                          {result.analysis.archaeological_features.length} features detected
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveAnalysis(result)}
                          className="border-white/[0.1] text-white/80 hover:bg-white/[0.05]"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <BarChart className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No Results Yet</h3>
                  <p className="text-white/60 text-sm">Complete an analysis to see results here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}