"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Eye, Camera, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface VisionAgentFallbackProps {
  coordinates?: string
  onAnalysisComplete?: (results: any) => void
  isBackendOnline?: boolean
}

export function VisionAgentFallback({ 
  coordinates, 
  onAnalysisComplete,
  isBackendOnline = false 
}: VisionAgentFallbackProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)

  const runAnalysis = async () => {
    if (!coordinates) return

    setIsAnalyzing(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 200)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockResults = {
      detection_results: [
        {
          type: "Archaeological Structure",
          description: "Potential ceremonial platform with geometric patterns",
          confidence: 0.87
        },
        {
          type: "Settlement Pattern", 
          description: "Linear arrangement suggesting organized habitation",
          confidence: 0.73
        }
      ],
      satellite_findings: {
        confidence: 0.78,
        features_detected: ["Geometric anomalies", "Vegetation patterns"]
      },
      metadata: {
        processing_time: "2.3s",
        high_confidence_features: "2 of 3 detections above 70% confidence"
      }
    }

    clearInterval(progressInterval)
    setProgress(100)
    setResults(mockResults)
    setIsAnalyzing(false)

    if (onAnalysisComplete) {
      onAnalysisComplete(mockResults)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="w-5 h-5 text-emerald-400" />
            Vision Agent Analysis
            {!isBackendOnline && (
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                Offline Mode
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isBackendOnline 
              ? "Real-time satellite imagery analysis"
              : "Demonstration mode - simulated analysis"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAnalysis}
              disabled={isAnalyzing || !coordinates}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
            
            {coordinates && (
              <div className="text-sm text-slate-300">
                Target: <span className="font-mono">{coordinates}</span>
              </div>
            )}
          </div>

          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Analysis Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.detection_results.map((detection: any, index: number) => (
              <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{detection.type}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(detection.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm">{detection.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!isBackendOnline && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                Backend offline - using demonstration mode
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 