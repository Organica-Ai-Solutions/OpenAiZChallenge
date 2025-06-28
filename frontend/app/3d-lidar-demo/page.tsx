"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RealMapboxLidar } from "@/components/ui/real-mapbox-lidar"
import { Enhanced3DLidarDemo } from "@/components/enhanced-3d-lidar-demo"
import { Mountain, Layers3, Globe, Sparkles } from "lucide-react"

export default function Enhanced3DLidarDemoPage() {
  const [coordinates, setCoordinates] = useState("-3.4653, -62.2159")
  const [activeDemo, setActiveDemo] = useState<'enhanced' | 'production'>('enhanced')
  
  // Mock backend status for demo
  const [backendStatus] = useState({ online: false })
  const [lidarVisualization] = useState({ enableDelaunayTriangulation: false })
  const [lidarProcessing] = useState({ isProcessing: false })
  const [lidarResults] = useState({})
  const [visionResults] = useState({})

  const processLidarTriangulation = () => {
    console.log('🔺 LiDAR Triangulation activated!')
  }

  const processLidarRGBColoring = () => {
    console.log('🌈 LiDAR RGB Coloring activated!')
  }

  const demoLocations = [
    { name: "Amazon Basin", coords: "-3.4653, -62.2159", description: "Dense rainforest terrain" },
    { name: "Andes Mountains", coords: "-13.5320, -71.9675", description: "High altitude archaeological sites" },
    { name: "Machu Picchu Region", coords: "-13.1631, -72.5450", description: "Inca terraces and settlements" },
    { name: "Brazilian Highlands", coords: "-15.7939, -47.8828", description: "Cerrado plateau formations" },
    { name: "Pantanal Wetlands", coords: "-19.5820, -56.0976", description: "Seasonal flood plains" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mountain className="w-8 h-8 text-cyan-400" />
                <div>
                  <CardTitle className="text-2xl text-white">
                    🏔️ Enhanced 3D LiDAR Terrain Visualization
                  </CardTitle>
                  <p className="text-slate-300 mt-1">
                    Spectacular 3D terrain extrusion with dynamic LiDAR elevation data
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-cyan-900/50 text-cyan-300 text-lg px-4 py-2">
                ZEUS APPROVED
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Demo Mode Selector */}
        <div className="flex gap-4">
          <Button
            variant={activeDemo === 'enhanced' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('enhanced')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Enhanced 3D Demo
          </Button>
          <Button
            variant={activeDemo === 'production' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('production')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Production LiDAR
          </Button>
        </div>

        {/* Location Quick Select */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Archaeological Site Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {demoLocations.map((location, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto p-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setCoordinates(location.coords)}
                >
                  <div>
                    <div className="font-medium text-white">{location.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{location.description}</div>
                    <div className="text-xs text-cyan-400 font-mono mt-1">{location.coords}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Enhanced 3D Demo */}
          {activeDemo === 'enhanced' && (
            <Enhanced3DLidarDemo 
              coordinates={coordinates}
              onCoordinateChange={setCoordinates}
            />
          )}

          {/* Production LiDAR Component */}
          {activeDemo === 'production' && (
            <Card className="bg-slate-900/90 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-cyan-400" />
                  Production 3D LiDAR System
                  <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                    ENHANCED
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealMapboxLidar
                  coordinates={coordinates}
                  setCoordinates={setCoordinates}
                  lidarVisualization={lidarVisualization}
                  lidarProcessing={lidarProcessing}
                  lidarResults={lidarResults}
                  visionResults={visionResults}
                  backendStatus={backendStatus}
                  processLidarTriangulation={processLidarTriangulation}
                  processLidarRGBColoring={processLidarRGBColoring}
                />
              </CardContent>
            </Card>
          )}

          {/* Feature Showcase */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                🏔️ Enhanced 3D Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Feature List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">3D Terrain Extrusion</div>
                    <div className="text-xs text-slate-400">Dynamic elevation-based fill-extrusion layers</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">Mapbox Terrain DEM</div>
                    <div className="text-xs text-slate-400">Real-world elevation data integration</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">Atmospheric Enhancement</div>
                    <div className="text-xs text-slate-400">Enhanced fog, sky layers, and depth perception</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">Archaeological 3D Markers</div>
                    <div className="text-xs text-slate-400">Elevated site visualization with confidence levels</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">Dynamic Controls</div>
                    <div className="text-xs text-slate-400">Adjustable exaggeration, gradients, and view modes</div>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-medium mb-3">📊 Technical Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pitch Angle:</span>
                    <span className="text-cyan-400">60-70° (Dramatic 3D)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terrain Exaggeration:</span>
                    <span className="text-cyan-400">1x - 6x Multiplier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DEM Resolution:</span>
                    <span className="text-cyan-400">512px Tiles, 14 Max Zoom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gradient Modes:</span>
                    <span className="text-cyan-400">Terrain, Plasma, Rainbow, Divine</span>
                  </div>
                </div>
              </div>

              {/* Current Location Info */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
                <h4 className="text-blue-300 font-medium mb-2">📍 Current Analysis Location</h4>
                <div className="text-white font-mono text-sm mb-2">{coordinates}</div>
                <div className="text-xs text-blue-200">
                  Click on any map location to update coordinates and regenerate 3D terrain
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <Card className="bg-slate-800/30 border-slate-600">
          <CardContent className="pt-6">
            <div className="text-center text-slate-400">
              <div className="mb-2">
                🌍 <strong>Enhanced 3D LiDAR Terrain Visualization</strong> - Archaeological Discovery System
              </div>
              <div className="text-xs">
                Powered by Mapbox GL JS • Real DEM Data • Divine Exaggeration Technology
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
} 