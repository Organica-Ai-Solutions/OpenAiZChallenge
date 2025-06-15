"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Globe, Mountain, Waves, Eye, Trees, Zap, Radar } from 'lucide-react'

export default function GeospatialAnalysis() {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [activeAnalysis, setActiveAnalysis] = useState<string>('terrain')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false)
          return 100
        }
        return prev + Math.random() * 3
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const startAnalysis = (type: string) => {
    setActiveAnalysis(type)
    setIsAnalyzing(true)
    setAnalysisProgress(0)
  }

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'terrain': return <Mountain className="h-5 w-5" />
      case 'hydrology': return <Waves className="h-5 w-5" />
      case 'visibility': return <Eye className="h-5 w-5" />
      case 'landcover': return <Trees className="h-5 w-5" />
      default: return <Globe className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Globe className="mr-2 h-6 w-6 text-blue-400" />
            🌍 Advanced Geospatial Analysis System
          </CardTitle>
          <CardDescription className="text-blue-200">
            Comprehensive spatial analysis for archaeological landscape interpretation using GIS, remote sensing, and advanced modeling techniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">3</div>
              <div className="text-xs text-slate-400">Active Sites</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">94.2%</div>
              <div className="text-xs text-slate-400">Analysis Confidence</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">1.2km²</div>
              <div className="text-xs text-slate-400">Study Area</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-violet-400">15</div>
              <div className="text-xs text-slate-400">Analysis Layers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
            Spatial Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'terrain', name: 'Terrain Analysis' },
              { id: 'hydrology', name: 'Hydrological Analysis' },
              { id: 'visibility', name: 'Visibility Analysis' },
              { id: 'landcover', name: 'Land Cover Analysis' }
            ].map((analysis) => (
              <Button
                key={analysis.id}
                variant={activeAnalysis === analysis.id ? "default" : "outline"}
                onClick={() => startAnalysis(analysis.id)}
                className="flex items-center gap-2 h-12"
                disabled={isAnalyzing}
              >
                {getAnalysisIcon(analysis.id)}
                <span className="text-sm">{analysis.name}</span>
              </Button>
            ))}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Processing {activeAnalysis} analysis...</span>
                <span className="text-slate-400">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Radar className="mr-2 h-6 w-6 text-purple-400" />
            Geospatial Analysis Results
          </CardTitle>
          <CardDescription className="text-purple-200">
            Advanced spatial modeling and predictive analysis for archaeological site discovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">87.3%</div>
              <div className="text-sm text-slate-400">Model Accuracy</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-sm text-slate-400">High Probability Sites</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-violet-400">94.2%</div>
              <div className="text-sm text-slate-400">Terrain Analysis Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
