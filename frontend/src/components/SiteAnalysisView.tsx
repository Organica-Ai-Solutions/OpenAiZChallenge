"use client"

import React, { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Clock, 
  Layers, 
  Share2, 
  Download, 
  Info, 
  Compass, 
  Database,
  Microscope,
  Ruler,
  Trees,
  Waves
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

import MapViewer from './MapViewer'

interface SiteFeature {
  type: string
  description: string
  confidence: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
}

interface SimilarSite {
  name: string
  similarity: number
  distance: string
  type: string
}

interface DataSources {
  satellite?: string
  lidar?: string
  historical?: string
}

interface EnvironmentalContext {
  vegetation: string
  waterProximity: string
  elevation: number
  terrainComplexity: string
}

interface SiteAnalysisProps {
  coordinates: string
  timestamp: string
  confidence: number
  siteType: string
  features: SiteFeature[]
  analysis: string
  aiInsights?: {
    culturalSignificance: string
    researchPriority: string
    preservationStatus: string
  }
  similarSites: SimilarSite[]
  dataSources: DataSources
  recommendations: string[]
  environmentalContext?: EnvironmentalContext
}

export default function SiteAnalysisView({
  coordinates,
  timestamp,
  confidence,
  siteType,
  features,
  analysis,
  aiInsights,
  similarSites,
  dataSources,
  recommendations,
  environmentalContext
}: SiteAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeFeature, setActiveFeature] = useState<SiteFeature | null>(null)

  const renderConfidenceColor = (confidenceScore: number) => {
    if (confidenceScore > 80) return 'bg-emerald-500 text-white'
    if (confidenceScore > 60) return 'bg-yellow-500 text-white'
    return 'bg-red-500 text-white'
  }

  const exportAnalysis = () => {
    const analysisJson = JSON.stringify({
      coordinates,
      timestamp,
      confidence,
      siteType,
      features,
      analysis,
      aiInsights,
      similarSites,
      dataSources,
      recommendations,
      environmentalContext
    }, null, 2)

    const blob = new Blob([analysisJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `site_analysis_${coordinates.replace(/,/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareAnalysis = () => {
    if (navigator.share) {
      navigator.share({
        title: `Archaeological Site Analysis - ${coordinates}`,
        text: `Discovered archaeological site at ${coordinates} with ${confidence}% confidence`,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Main Analysis Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-emerald-600" />
              Site Analysis: {coordinates}
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={exportAnalysis}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export Analysis</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={shareAnalysis}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold">Site Classification</span>
                  </div>
                  <Badge variant="outline">{siteType}</Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">Confidence Score</span>
                  <Progress value={confidence} className={`w-1/2 ${renderConfidenceColor(confidence)}`} />
                  <span className="font-bold">{confidence}%</span>
                </div>
                
                <p className="text-sm text-muted-foreground">{analysis}</p>

                {aiInsights && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-emerald-800 mb-2">Cultural Significance</h4>
                      <p className="text-xs text-muted-foreground">
                        {aiInsights.culturalSignificance}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-blue-800 mb-2">Research Priority</h4>
                      <p className="text-xs text-muted-foreground">
                        {aiInsights.researchPriority}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-yellow-800 mb-2">Preservation Status</h4>
                      <p className="text-xs text-muted-foreground">
                        {aiInsights.preservationStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="features">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index} 
                      className={`
                        border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer
                        ${activeFeature === feature ? 'border-emerald-500 bg-emerald-50' : ''}
                      `}
                      onClick={() => setActiveFeature(feature)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-sm">{feature.type}</span>
                        </div>
                        <Badge variant="outline" className={renderConfidenceColor(feature.confidence)}>
                          {feature.confidence}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                  ))}
                </div>
                
                {activeFeature && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 flex items-center">
                      <Info className="mr-2 h-5 w-5 text-emerald-600" />
                      Feature Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium">Type</span>
                        <span className="text-xs">{activeFeature.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium">Description</span>
                        <span className="text-xs">{activeFeature.description}</span>
                      </div>
                      {activeFeature.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Dimensions</span>
                          <span className="text-xs">
                            {activeFeature.dimensions.length && `Length: ${activeFeature.dimensions.length}m `}
                            {activeFeature.dimensions.width && `Width: ${activeFeature.dimensions.width}m`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-xs font-medium">Confidence</span>
                        <span className={`text-xs font-bold ${renderConfidenceColor(activeFeature.confidence)}`}>
                          {activeFeature.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="environment">
              {environmentalContext && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-lg">
                      <Trees className="h-5 w-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-semibold">Vegetation</span>
                        <p className="text-xs text-muted-foreground">{environmentalContext.vegetation}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                      <Waves className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-xs font-semibold">Water Proximity</span>
                        <p className="text-xs text-muted-foreground">{environmentalContext.waterProximity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg">
                      <Compass className="h-5 w-5 text-yellow-600" />
                      <div>
                        <span className="text-xs font-semibold">Elevation</span>
                        <p className="text-xs text-muted-foreground">{environmentalContext.elevation}m</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-50 p-3 rounded-lg">
                      <Layers className="h-5 w-5 text-purple-600" />
                      <div>
                        <span className="text-xs font-semibold">Terrain Complexity</span>
                        <p className="text-xs text-muted-foreground">{environmentalContext.terrainComplexity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sources">
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(dataSources).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="bg-gray-50 p-3 rounded-lg flex items-center space-x-2"
                    >
                      <Database className="h-5 w-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-semibold capitalize">{key}</span>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Microscope className="mr-2 h-5 w-5 text-emerald-600" />
                    Recommendations
                  </h3>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Similar Sites Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
            Similar Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {similarSites.map((site, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold">{site.name}</h4>
                    <p className="text-xs text-muted-foreground">{site.type}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                      {site.similarity}% Similar
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{site.distance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 