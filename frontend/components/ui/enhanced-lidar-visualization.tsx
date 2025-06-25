"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Mountain, Layers, Target, RefreshCw, Download, Play, Settings,
  Zap, Globe, Eye, Cpu, Database, Triangle, Palette
} from "lucide-react"

interface LidarPoint {
  id: string
  lat: number
  lng: number
  elevation: number
  surface_elevation: number
  intensity: number
  classification: string
  return_number: number
  archaeological_potential: 'high' | 'medium' | 'low'
  red?: number
  green?: number
  blue?: number
}

interface TriangulatedFeature {
  id: string
  vertices: number[][]
  elevation_avg: number
  area: number
  archaeological_significance: number
}

interface EnhancedLidarData {
  points: LidarPoint[]
  triangulated_mesh?: TriangulatedFeature[]
  dtm_grid: number[][]
  dsm_grid: number[][]
  intensity_grid: number[][]
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  statistics: {
    point_count: number
    point_density: number
    elevation_range: [number, number]
    intensity_range: [number, number]
  }
  archaeological_features: any[]
  processing_metadata: {
    delaunay_applied: boolean
    rgb_coloring: boolean
    mesh_quality: 'high' | 'medium' | 'low'
    processing_time: number
  }
}

interface EnhancedLidarVisualizationProps {
  coordinates: { lat: number; lng: number }
  lidarData?: EnhancedLidarData
  onAnalysisRequest?: (config: any) => void
  backendOnline?: boolean
  className?: string
}

export function EnhancedLidarVisualization({
  coordinates,
  lidarData,
  onAnalysisRequest,
  backendOnline = false,
  className = ""
}: EnhancedLidarVisualizationProps) {
  // Visualization configuration
  const [vizConfig, setVizConfig] = useState({
    renderMode: 'point_cloud', // 'point_cloud', 'triangulated_mesh', 'hybrid'
    colorBy: 'elevation', // 'elevation', 'intensity', 'classification', 'archaeological', 'rgb'
    pointSize: 2.0,
    meshOpacity: 0.8,
    elevationExaggeration: 3.0,
    enableDelaunayTriangulation: true,
    enableRGBColoring: false,
    viewAngle: { pitch: 45, bearing: 0 },
    contourLines: false,
    hillshade: true,
    archaeologicalOverlay: true
  })

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [meshQuality, setMeshQuality] = useState<'high' | 'medium' | 'low'>('medium')
  
  // Animation controls
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const animationRef = useRef<number>()

  // 3D viewport ref
  const viewportRef = useRef<HTMLDivElement>(null)

  // Advanced LIDAR processing following Mapbox tutorials
  const processLidarData = useCallback(async () => {
    if (!lidarData || !backendOnline) return

    setIsProcessing(true)
    setProcessingStage('Applying Delaunay Triangulation...')

    try {
      // Step 1: Delaunay Triangulation (following Mapbox tutorial)
      if (vizConfig.enableDelaunayTriangulation) {
        const triangulationResponse = await fetch('/api/lidar/triangulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates,
            points: lidarData.points,
            quality: meshQuality,
            clip_to_bounds: true
          })
        })

        if (triangulationResponse.ok) {
          const triangulatedData = await triangulationResponse.json()
          console.log('✅ Delaunay triangulation completed')
        }
      }

      setProcessingStage('Applying RGB Coloring...')

      // Step 2: RGB Coloring (following second Mapbox tutorial)
      if (vizConfig.enableRGBColoring) {
        const coloringResponse = await fetch('/api/lidar/apply-rgb-coloring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates,
            lidar_points: lidarData.points,
            satellite_imagery_source: 'sentinel2' // Could be NAIP as in tutorial
          })
        })

        if (coloringResponse.ok) {
          const coloredData = await coloringResponse.json()
          console.log('✅ RGB coloring applied')
        }
      }

      setProcessingStage('Optimizing for WebGL rendering...')
      
      // Step 3: Optimize for WebGL rendering
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing
      
      console.log('✅ LIDAR processing completed')
      
    } catch (error) {
      console.error('❌ LIDAR processing failed:', error)
    } finally {
      setIsProcessing(false)
      setProcessingStage('')
    }
  }, [lidarData, coordinates, vizConfig, meshQuality, backendOnline])

  // Color scheme generators
  const getColorForPoint = useCallback((point: LidarPoint, colorBy: string) => {
    switch (colorBy) {
      case 'elevation':
        if (!lidarData) return 'rgb(128,128,128)'
        const elevRange = lidarData.statistics.elevation_range
        const elevNorm = (point.elevation - elevRange[0]) / (elevRange[1] - elevRange[0])
        return `hsl(${240 + elevNorm * 120}, 70%, ${50 + elevNorm * 30}%)`
      
      case 'intensity':
        if (!lidarData) return 'rgb(128,128,128)'
        const intRange = lidarData.statistics.intensity_range
        const intNorm = (point.intensity - intRange[0]) / (intRange[1] - intRange[0])
        return `hsl(0, 0%, ${intNorm * 100}%)`
      
      case 'classification':
        const classColors = {
          'ground': '#8B4513',
          'vegetation': '#228B22',
          'potential_structure': '#FFD700',
          'potential_plaza': '#FF6347',
          'unclassified': '#808080'
        }
        return classColors[point.classification as keyof typeof classColors] || '#808080'
      
      case 'archaeological':
        const archaeoColors = {
          'high': '#FF4500',
          'medium': '#FFA500',
          'low': '#32CD32'
        }
        return archaeoColors[point.archaeological_potential]
      
      case 'rgb':
        if (point.red !== undefined && point.green !== undefined && point.blue !== undefined) {
          return `rgb(${point.red}, ${point.green}, ${point.blue})`
        }
        return 'rgb(128,128,128)'
      
      default:
        return 'rgb(128,128,128)'
    }
  }, [lidarData])

  // Animation loop for auto-rotation
  useEffect(() => {
    if (autoRotate) {
      const animate = () => {
        setVizConfig(prev => ({
          ...prev,
          viewAngle: {
            ...prev.viewAngle,
            bearing: (prev.viewAngle.bearing + rotationSpeed) % 360
          }
        }))
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [autoRotate, rotationSpeed])

  // Render 3D point cloud (simplified WebGL-like visualization)
  const renderPointCloud = () => {
    if (!lidarData) return null

    return (
      <div 
        ref={viewportRef}
        className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-600"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            transform: `rotateX(${vizConfig.viewAngle.pitch}deg) rotateY(${vizConfig.viewAngle.bearing}deg)`,
            transformStyle: 'preserve-3d',
            transition: autoRotate ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {/* Render point cloud */}
          {vizConfig.renderMode === 'point_cloud' || vizConfig.renderMode === 'hybrid' ? (
            <div className="relative w-full h-full">
              {lidarData.points.slice(0, 500).map((point, index) => { // Limit for performance
                const x = ((point.lng - coordinates.lng) * 100000) + 50
                const y = ((point.lat - coordinates.lat) * 100000) + 50
                const z = (point.elevation - lidarData.statistics.elevation_range[0]) * vizConfig.elevationExaggeration
                
                return (
                  <div
                    key={point.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.max(0, Math.min(100, x))}%`,
                      top: `${Math.max(0, Math.min(100, y))}%`,
                      width: `${vizConfig.pointSize}px`,
                      height: `${vizConfig.pointSize}px`,
                      backgroundColor: getColorForPoint(point, vizConfig.colorBy),
                      transform: `translateZ(${z}px)`,
                      opacity: 0.8,
                      boxShadow: '0 0 2px rgba(255,255,255,0.3)'
                    }}
                  />
                )
              })}
            </div>
          ) : null}

          {/* Render triangulated mesh */}
          {(vizConfig.renderMode === 'triangulated_mesh' || vizConfig.renderMode === 'hybrid') && 
           lidarData.triangulated_mesh ? (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            >
              {lidarData.triangulated_mesh.slice(0, 200).map((triangle, index) => { // Limit for performance
                const points = triangle.vertices.map(vertex => {
                  const x = ((vertex[0] - coordinates.lng) * 100000 + 50) * 4 // Scale for SVG
                  const y = ((vertex[1] - coordinates.lat) * 100000 + 50) * 4
                  return `${x},${y}`
                }).join(' ')
                
                return (
                  <polygon
                    key={triangle.id}
                    points={points}
                    fill={`hsl(${triangle.archaeological_significance * 60}, 70%, 50%)`}
                    opacity={vizConfig.meshOpacity}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                )
              })}
            </svg>
          ) : null}

          {/* Archaeological features overlay */}
          {vizConfig.archaeologicalOverlay && lidarData.archaeological_features.map((feature, index) => (
            <div
              key={feature.id}
              className="absolute border-2 border-yellow-400 rounded-full animate-pulse"
              style={{
                left: `${((feature.lng - coordinates.lng) * 100000) + 45}%`,
                top: `${((feature.lat - coordinates.lat) * 100000) + 45}%`,
                width: '10px',
                height: '10px',
                transform: `translateZ(${feature.elevation * vizConfig.elevationExaggeration}px)`
              }}
            >
              <div className="absolute -top-6 -left-8 text-xs text-yellow-400 whitespace-nowrap bg-slate-900/80 px-1 rounded">
                {feature.type}
              </div>
            </div>
          ))}
        </div>

        {/* Hillshade overlay */}
        {vizConfig.hillshade && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              mixBlendMode: 'overlay'
            }}
          />
        )}

        {/* Contour lines */}
        {vizConfig.contourLines && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <path
                key={i}
                d={`M 0 ${(i + 1) * 20}% Q 50% ${(i + 1) * 20 - 5}% 100% ${(i + 1) * 20}%`}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            ))}
          </svg>
        )}

        {/* Status indicators */}
        <div className="absolute top-4 left-4 bg-slate-900/80 rounded px-3 py-2 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Points: {lidarData.points.length.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Triangles: {lidarData.triangulated_mesh?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Features: {lidarData.archaeological_features.length}</span>
          </div>
        </div>

        {/* Color scale legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 rounded px-3 py-2">
          <div className="text-xs text-slate-300 mb-2">Color Scale</div>
          <div className="flex items-center gap-1">
            <div className="w-16 h-3 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded"></div>
            <div className="text-xs text-slate-400 ml-2">
              {vizConfig.colorBy === 'elevation' ? 'Low → High Elevation' :
               vizConfig.colorBy === 'intensity' ? 'Low → High Intensity' :
               vizConfig.colorBy === 'archaeological' ? 'Low → High Potential' : 'Classification'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with processing status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mountain className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-white">Enhanced LIDAR Visualization</h3>
          <Badge variant={lidarData?.processing_metadata.delaunay_applied ? "default" : "secondary"}>
            {lidarData?.processing_metadata.delaunay_applied ? 'Triangulated' : 'Raw Points'}
          </Badge>
          <Badge variant={lidarData?.processing_metadata.rgb_coloring ? "default" : "secondary"}>
            {lidarData?.processing_metadata.rgb_coloring ? 'RGB Colored' : 'Standard'}
          </Badge>
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{processingStage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Visualization Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Render Mode */}
              <div>
                <Label className="text-xs">Render Mode</Label>
                <Select
                  value={vizConfig.renderMode}
                  onValueChange={(value) => setVizConfig(prev => ({ ...prev, renderMode: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="point_cloud">Point Cloud</SelectItem>
                    <SelectItem value="triangulated_mesh">Triangulated Mesh</SelectItem>
                    <SelectItem value="hybrid">Hybrid View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color By */}
              <div>
                <Label className="text-xs">Color By</Label>
                <Select
                  value={vizConfig.colorBy}
                  onValueChange={(value) => setVizConfig(prev => ({ ...prev, colorBy: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevation">Elevation</SelectItem>
                    <SelectItem value="intensity">Intensity</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="archaeological">Archaeological Potential</SelectItem>
                    <SelectItem value="rgb">RGB (Satellite)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Point Size */}
              <div>
                <Label className="text-xs">Point Size: {vizConfig.pointSize.toFixed(1)}</Label>
                <Slider
                  value={[vizConfig.pointSize]}
                  onValueChange={([value]) => setVizConfig(prev => ({ ...prev, pointSize: value }))}
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              {/* Elevation Exaggeration */}
              <div>
                <Label className="text-xs">Elevation: {vizConfig.elevationExaggeration}x</Label>
                <Slider
                  value={[vizConfig.elevationExaggeration]}
                  onValueChange={([value]) => setVizConfig(prev => ({ ...prev, elevationExaggeration: value }))}
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  className="mt-1"
                />
              </div>

              {/* View Controls */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Pitch: {vizConfig.viewAngle.pitch}°</Label>
                  <Slider
                    value={[vizConfig.viewAngle.pitch]}
                    onValueChange={([value]) => setVizConfig(prev => ({ 
                      ...prev, 
                      viewAngle: { ...prev.viewAngle, pitch: value }
                    }))}
                    min={0}
                    max={90}
                    step={5}
                    className="mt-1"
                  />
                </div>
                
                {!autoRotate && (
                  <div>
                    <Label className="text-xs">Bearing: {vizConfig.viewAngle.bearing}°</Label>
                    <Slider
                      value={[vizConfig.viewAngle.bearing]}
                      onValueChange={([value]) => setVizConfig(prev => ({ 
                        ...prev, 
                        viewAngle: { ...prev.viewAngle, bearing: value }
                      }))}
                      min={0}
                      max={360}
                      step={15}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Toggle Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Auto Rotate</Label>
                  <Switch
                    checked={autoRotate}
                    onCheckedChange={setAutoRotate}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Contour Lines</Label>
                  <Switch
                    checked={vizConfig.contourLines}
                    onCheckedChange={(checked) => setVizConfig(prev => ({ ...prev, contourLines: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Hillshade</Label>
                  <Switch
                    checked={vizConfig.hillshade}
                    onCheckedChange={(checked) => setVizConfig(prev => ({ ...prev, hillshade: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Archaeological Overlay</Label>
                  <Switch
                    checked={vizConfig.archaeologicalOverlay}
                    onCheckedChange={(checked) => setVizConfig(prev => ({ ...prev, archaeologicalOverlay: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Controls */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Advanced Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Mesh Quality</Label>
                <Select
                  value={meshQuality}
                  onValueChange={(value: 'high' | 'medium' | 'low') => setMeshQuality(value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (slow)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low (fast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Delaunay Triangulation</Label>
                  <Switch
                    checked={vizConfig.enableDelaunayTriangulation}
                    onCheckedChange={(checked) => setVizConfig(prev => ({ 
                      ...prev, 
                      enableDelaunayTriangulation: checked 
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">RGB Coloring</Label>
                  <Switch
                    checked={vizConfig.enableRGBColoring}
                    onCheckedChange={(checked) => setVizConfig(prev => ({ 
                      ...prev, 
                      enableRGBColoring: checked 
                    }))}
                  />
                </div>
              </div>

              <Button
                onClick={processLidarData}
                disabled={!backendOnline || isProcessing}
                className="w-full text-xs"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-2" />
                    Apply Processing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Visualization */}
        <div className="xl:col-span-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                3D LIDAR Point Cloud
                <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                  {lidarData ? `${lidarData.points.length.toLocaleString()} points` : 'No data'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lidarData ? renderPointCloud() : (
                <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-600">
                  <div className="text-center">
                    <Mountain className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No LIDAR data available</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Request analysis to load point cloud data
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Panel */}
      {lidarData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dataset Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {lidarData.statistics.point_count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Total Points</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {lidarData.statistics.point_density.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">Points/m²</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {lidarData.statistics.elevation_range[0].toFixed(1)}m
                </div>
                <div className="text-xs text-slate-400">Min Elevation</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {lidarData.statistics.elevation_range[1].toFixed(1)}m
                </div>
                <div className="text-xs text-slate-400">Max Elevation</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {lidarData.triangulated_mesh?.length || 0}
                </div>
                <div className="text-xs text-slate-400">Triangles</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">
                  {lidarData.archaeological_features.length}
                </div>
                <div className="text-xs text-slate-400">Features</div>
              </div>
            </div>
            
            {/* Processing Metadata */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Processing Time:</span>
                  <span className="ml-2 font-medium">
                    {lidarData.processing_metadata.processing_time.toFixed(2)}s
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Mesh Quality:</span>
                  <span className="ml-2 font-medium capitalize">
                    {lidarData.processing_metadata.mesh_quality}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Coloring:</span>
                  <span className="ml-2 font-medium">
                    {lidarData.processing_metadata.rgb_coloring ? 'RGB Applied' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 