"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  Box, 
  Camera,
  Settings,
  Play,
  Pause,
  Download,
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Info,
  Target,
  Activity
} from 'lucide-react'

export default function Advanced3DVisualization() {
  const [renderProgress, setRenderProgress] = useState(0)
  const [activeView, setActiveView] = useState<string>('site')
  const [isRendering, setIsRendering] = useState(false)
  const [viewMode, setViewMode] = useState<'realistic' | 'analytical' | 'temporal' | 'cultural'>('realistic')
  const [timeSlider, setTimeSlider] = useState([800])
  const [qualityLevel, setQualityLevel] = useState([75])
  const [showLabels, setShowLabels] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          setIsRendering(false)
          return 100
        }
        return prev + Math.random() * 4
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const startRendering = (view: string) => {
    setActiveView(view)
    setIsRendering(true)
    setRenderProgress(0)
  }

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return 'Ultra High'
    if (quality >= 75) return 'High'
    if (quality >= 50) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Box className="mr-2 h-6 w-6 text-purple-400" />
            🎮 Advanced 3D Archaeological Visualization
          </CardTitle>
          <CardDescription className="text-purple-200">
            Immersive 3D reconstruction and visualization of archaeological sites with real-time rendering, temporal analysis, and interactive exploration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-purple-400">3</div>
              <div className="text-xs text-slate-400">3D Structures</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">82.5%</div>
              <div className="text-xs text-slate-400">Reconstruction Confidence</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">4K</div>
              <div className="text-xs text-slate-400">Render Resolution</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-violet-400">60fps</div>
              <div className="text-xs text-slate-400">Real-time Rendering</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-white">
                  <Camera className="mr-2 h-5 w-5 text-blue-400" />
                  3D Viewport
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Mode
                  </Badge>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {getQualityLabel(qualityLevel[0])} Quality
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-900 rounded-lg border border-slate-600 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Box className="h-16 w-16 mx-auto mb-4 text-purple-400 animate-pulse" />
                    <h3 className="text-white font-medium mb-2">3D Archaeological Site Reconstruction</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Ceremonial Complex - Classic Period (600-900 CE)
                    </p>
                    {isRendering && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Rendering {activeView}...</span>
                          <span className="text-slate-400">{Math.round(renderProgress)}%</span>
                        </div>
                        <Progress value={renderProgress} className="h-2 w-64" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-slate-800/90 backdrop-blur-sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-slate-800/90 backdrop-blur-sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-slate-800/90 backdrop-blur-sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-slate-800/90 backdrop-blur-sm">
                    <Move3D className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-300">Temporal Navigation</h4>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">300 CE</span>
                    <span className="text-white font-medium">{timeSlider[0]} CE</span>
                    <span className="text-slate-400">1000 CE</span>
                  </div>
                  <Slider
                    value={timeSlider}
                    onValueChange={setTimeSlider}
                    max={1000}
                    min={300}
                    step={25}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-sm">
                <Eye className="mr-2 h-4 w-4 text-cyan-400" />
                View Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'site', name: 'Site View' },
                  { id: 'terrain', name: 'Terrain' },
                  { id: 'vegetation', name: 'Vegetation' },
                  { id: 'artifacts', name: 'Artifacts' }
                ].map((view) => (
                  <Button
                    key={view.id}
                    variant={activeView === view.id ? "default" : "outline"}
                    onClick={() => startRendering(view.id)}
                    className="h-8 text-xs"
                    disabled={isRendering}
                  >
                    {view.name}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-slate-300">View Mode</h5>
                <div className="grid grid-cols-2 gap-1">
                  {['realistic', 'analytical', 'temporal', 'cultural'].map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? "default" : "outline"}
                      onClick={() => setViewMode(mode as any)}
                      className="h-7 text-xs"
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-sm">
                <Settings className="mr-2 h-4 w-4 text-yellow-400" />
                Render Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quality Level</span>
                  <span className="text-slate-300">{getQualityLabel(qualityLevel[0])}</span>
                </div>
                <Slider
                  value={qualityLevel}
                  onValueChange={setQualityLevel}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Show Labels</span>
                <Button
                  size="sm"
                  variant={showLabels ? "default" : "outline"}
                  onClick={() => setShowLabels(!showLabels)}
                  className="h-6 text-xs"
                >
                  {showLabels ? 'On' : 'Off'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-sm">
                <Download className="mr-2 h-4 w-4 text-green-400" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start h-8 text-xs">
                <Camera className="mr-2 h-3 w-3" />
                Screenshot (4K)
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start h-8 text-xs">
                <Box className="mr-2 h-3 w-3" />
                3D Model (.obj)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Info className="mr-2 h-5 w-5 text-indigo-400" />
            Structure Analysis & Reconstruction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[
              { name: 'Main Temple', type: 'Temple', material: 'Limestone', confidence: 78, condition: 65, significance: 95 },
              { name: 'Ball Court', type: 'Sports Complex', material: 'Stone', confidence: 91, condition: 82, significance: 88 },
              { name: 'Elite Residence', type: 'Residential', material: 'Adobe/Stone', confidence: 65, condition: 45, significance: 72 }
            ].map((structure, index) => (
              <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{structure.name}</h4>
                    <p className="text-slate-400 text-sm">{structure.type} | {structure.material}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                    {structure.confidence}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Condition:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={structure.condition} className="w-16 h-2" />
                      <span className="text-slate-300">{structure.condition}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Cultural Significance:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={structure.significance} className="w-16 h-2" />
                      <span className="text-slate-300">{structure.significance}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Reconstruction:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={structure.confidence} className="w-16 h-2" />
                      <span className="text-slate-300">{structure.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <div className="flex items-center mb-2">
              <Info className="h-5 w-5 mr-2 text-indigo-400" />
              <span className="text-white font-semibold">Reconstruction Methodology</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Methods Used:</span>
                <ul className="text-slate-300 mt-1 space-y-1">
                  {['Archaeological excavation', 'LiDAR scanning', 'Comparative analysis', 'Digital reconstruction'].map((method, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-indigo-400" />
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400">Data Sources:</span>
                <ul className="text-slate-300 mt-1 space-y-1">
                  {['Field data', 'Historical records', 'Ethnographic parallels'].map((source, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-emerald-400" />
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 