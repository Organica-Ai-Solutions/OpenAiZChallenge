"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Compass, 
  TreePine, 
  Mountain, 
  Waves, 
  Sun, 
  Moon, 
  Calendar, 
  Clock,
  Users,
  Home,
  Wheat,
  Pickaxe,
  Route,
  MapPin,
  Layers,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Eye,
  Globe
} from 'lucide-react'

interface LandscapeFeature {
  id: string
  name: string
  type: 'settlement' | 'ceremonial' | 'agricultural' | 'defensive' | 'resource' | 'transport'
  period: string
  coordinates: [number, number]
  culturalFunction: string
  landscapeRole: string
  connectivity: number
  preservation: number
  significance: number
  associations: string[]
  temporalSpan: {
    start: number
    end: number
    duration: number
  }
}

interface LandscapePattern {
  id: string
  name: string
  description: string
  spatialExtent: number
  temporalDepth: number
  culturalComplexity: number
  components: string[]
  relationships: string[]
  evolution: string[]
}

interface CulturalLandscape {
  name: string
  period: string
  extent: number
  population: number
  landUse: {
    residential: number
    ceremonial: number
    agricultural: number
    industrial: number
    transport: number
  }
  sustainability: number
  resilience: number
  transformation: string[]
}

export default function LandscapeArchaeology() {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [activeView, setActiveView] = useState<string>('features')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [landscapeFeatures, setLandscapeFeatures] = useState<LandscapeFeature[]>([])
  const [landscapePatterns, setLandscapePatterns] = useState<LandscapePattern[]>([])
  const [culturalLandscapes, setCulturalLandscapes] = useState<CulturalLandscape[]>([])

  // Simulate landscape analysis progress
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false)
          return 100
        }
        return prev + Math.random() * 2.5
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  // Mock landscape data
  useEffect(() => {
    const mockFeatures: LandscapeFeature[] = [
      {
        id: 'lf_001',
        name: 'Central Plaza Complex',
        type: 'ceremonial',
        period: 'Classic Period (600-900 CE)',
        coordinates: [-74.0059, 40.7128],
        culturalFunction: 'Religious and administrative center',
        landscapeRole: 'Focal point of settlement hierarchy',
        connectivity: 94.2,
        preservation: 78.5,
        significance: 96.8,
        associations: ['Elite residences', 'Ball court', 'Observatory', 'Sacred cenote'],
        temporalSpan: { start: 600, end: 900, duration: 300 }
      },
      {
        id: 'lf_002',
        name: 'Terraced Agricultural System',
        type: 'agricultural',
        period: 'Late Classic (700-1000 CE)',
        coordinates: [-74.0089, 40.7158],
        culturalFunction: 'Intensive agricultural production',
        landscapeRole: 'Economic foundation of settlement',
        connectivity: 87.3,
        preservation: 65.2,
        significance: 89.4,
        associations: ['Irrigation canals', 'Storage facilities', 'Processing areas', 'Field boundaries'],
        temporalSpan: { start: 700, end: 1000, duration: 300 }
      },
      {
        id: 'lf_003',
        name: 'Defensive Wall Network',
        type: 'defensive',
        period: 'Terminal Classic (800-1000 CE)',
        coordinates: [-74.0119, 40.7088],
        culturalFunction: 'Settlement protection and control',
        landscapeRole: 'Boundary definition and security',
        connectivity: 76.8,
        preservation: 82.1,
        significance: 84.7,
        associations: ['Watchtowers', 'Gates', 'Barracks', 'Moats'],
        temporalSpan: { start: 800, end: 1000, duration: 200 }
      },
      {
        id: 'lf_004',
        name: 'Quarry and Workshop Area',
        type: 'resource',
        period: 'Early Classic (300-600 CE)',
        coordinates: [-74.0149, 40.7198],
        culturalFunction: 'Stone extraction and tool production',
        landscapeRole: 'Resource procurement and craft specialization',
        connectivity: 69.5,
        preservation: 71.8,
        significance: 76.3,
        associations: ['Extraction pits', 'Tool caches', 'Waste deposits', 'Transport routes'],
        temporalSpan: { start: 300, end: 600, duration: 300 }
      }
    ]

    const mockPatterns: LandscapePattern[] = [
      {
        id: 'lp_001',
        name: 'Hierarchical Settlement Pattern',
        description: 'Multi-tiered settlement system with central plaza, secondary centers, and dispersed residences',
        spatialExtent: 25.7,
        temporalDepth: 700,
        culturalComplexity: 92.4,
        components: ['Primary center', 'Secondary nodes', 'Residential clusters', 'Specialized areas'],
        relationships: ['Administrative control', 'Economic integration', 'Social stratification', 'Ritual participation'],
        evolution: ['Initial nucleation', 'Hierarchical development', 'Peak complexity', 'Gradual abandonment']
      },
      {
        id: 'lp_002',
        name: 'Sacred Landscape Organization',
        description: 'Ritual and ceremonial landscape with astronomical alignments and sacred geography',
        spatialExtent: 18.3,
        temporalDepth: 600,
        culturalComplexity: 88.9,
        components: ['Ceremonial centers', 'Sacred natural features', 'Pilgrimage routes', 'Offering locations'],
        relationships: ['Cosmological alignment', 'Seasonal ceremonies', 'Community identity', 'Ancestor veneration'],
        evolution: ['Sacred site establishment', 'Ritual elaboration', 'Landscape integration', 'Continued reverence']
      },
      {
        id: 'lp_003',
        name: 'Agricultural Landscape System',
        description: 'Integrated agricultural system with terraces, irrigation, and field management',
        spatialExtent: 42.1,
        temporalDepth: 500,
        culturalComplexity: 85.6,
        components: ['Terraced fields', 'Irrigation network', 'Storage facilities', 'Processing areas'],
        relationships: ['Water management', 'Crop rotation', 'Labor organization', 'Surplus distribution'],
        evolution: ['Initial clearing', 'Terrace construction', 'System intensification', 'Maintenance challenges']
      }
    ]

    const mockLandscapes: CulturalLandscape[] = [
      {
        name: 'Classic Period Landscape',
        period: '600-900 CE',
        extent: 45.2,
        population: 12500,
        landUse: {
          residential: 35,
          ceremonial: 15,
          agricultural: 40,
          industrial: 5,
          transport: 5
        },
        sustainability: 87.3,
        resilience: 74.8,
        transformation: ['Population growth', 'Landscape intensification', 'Social complexity', 'Environmental adaptation']
      },
      {
        name: 'Terminal Classic Landscape',
        period: '800-1000 CE',
        extent: 38.7,
        population: 8900,
        landUse: {
          residential: 30,
          ceremonial: 10,
          agricultural: 35,
          industrial: 8,
          transport: 17
        },
        sustainability: 65.2,
        resilience: 58.4,
        transformation: ['Defensive measures', 'Population decline', 'Landscape abandonment', 'Resource depletion']
      }
    ]

    setLandscapeFeatures(mockFeatures)
    setLandscapePatterns(mockPatterns)
    setCulturalLandscapes(mockLandscapes)
  }, [])

  const startAnalysis = (view: string) => {
    setActiveView(view)
    setIsAnalyzing(true)
    setAnalysisProgress(0)
  }

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'settlement': return <Home className="h-4 w-4" />
      case 'ceremonial': return <Sun className="h-4 w-4" />
      case 'agricultural': return <Wheat className="h-4 w-4" />
      case 'defensive': return <Target className="h-4 w-4" />
      case 'resource': return <Pickaxe className="h-4 w-4" />
      case 'transport': return <Route className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getFeatureColor = (type: string) => {
    switch (type) {
      case 'settlement': return 'text-blue-400 border-blue-400'
      case 'ceremonial': return 'text-yellow-400 border-yellow-400'
      case 'agricultural': return 'text-green-400 border-green-400'
      case 'defensive': return 'text-red-400 border-red-400'
      case 'resource': return 'text-purple-400 border-purple-400'
      case 'transport': return 'text-cyan-400 border-cyan-400'
      default: return 'text-slate-400 border-slate-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <TreePine className="mr-2 h-6 w-6 text-green-400" />
            🌲 Landscape Archaeology Analysis
          </CardTitle>
          <CardDescription className="text-green-200">
            Comprehensive analysis of cultural landscapes, settlement patterns, and human-environment interactions across temporal scales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-green-400">{landscapeFeatures.length}</div>
              <div className="text-xs text-slate-400">Landscape Features</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">700</div>
              <div className="text-xs text-slate-400">Years Analyzed</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">45.2km²</div>
              <div className="text-xs text-slate-400">Landscape Extent</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-violet-400">87.3%</div>
              <div className="text-xs text-slate-400">Sustainability Index</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
            Landscape Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'features', name: 'Feature Analysis', icon: <MapPin className="h-4 w-4" /> },
              { id: 'patterns', name: 'Pattern Recognition', icon: <Layers className="h-4 w-4" /> },
              { id: 'evolution', name: 'Temporal Evolution', icon: <Clock className="h-4 w-4" /> },
              { id: 'sustainability', name: 'Sustainability Assessment', icon: <TreePine className="h-4 w-4" /> }
            ].map((analysis) => (
              <Button
                key={analysis.id}
                variant={activeView === analysis.id ? "default" : "outline"}
                onClick={() => startAnalysis(analysis.id)}
                className="flex items-center gap-2 h-12"
                disabled={isAnalyzing}
              >
                {analysis.icon}
                <span className="text-sm">{analysis.name}</span>
              </Button>
            ))}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Processing {activeView} analysis...</span>
                <span className="text-slate-400">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="features" className="text-slate-300 data-[state=active]:text-white">Features</TabsTrigger>
          <TabsTrigger value="patterns" className="text-slate-300 data-[state=active]:text-white">Patterns</TabsTrigger>
          <TabsTrigger value="evolution" className="text-slate-300 data-[state=active]:text-white">Evolution</TabsTrigger>
          <TabsTrigger value="landscapes" className="text-slate-300 data-[state=active]:text-white">Landscapes</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {landscapeFeatures.map((feature) => (
              <Card key={feature.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <div className={`mr-2 p-1 rounded ${getFeatureColor(feature.type)}`}>
                          {getFeatureIcon(feature.type)}
                        </div>
                        {feature.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {feature.period} | {feature.culturalFunction}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getScoreColor(feature.significance)} border-current`}>
                      {feature.significance.toFixed(1)}% Significance
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Landscape Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Connectivity:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={feature.connectivity} className="w-16 h-2" />
                            <span className="text-slate-300 text-sm">{feature.connectivity.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Preservation:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={feature.preservation} className="w-16 h-2" />
                            <span className="text-slate-300 text-sm">{feature.preservation.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Temporal Span</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Start:</span>
                          <span className="text-slate-300">{feature.temporalSpan.start} CE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">End:</span>
                          <span className="text-slate-300">{feature.temporalSpan.end} CE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-slate-300">{feature.temporalSpan.duration} years</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Associated Features</h4>
                      <div className="space-y-1">
                        {feature.associations.map((association, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1 border-slate-600 text-slate-300">
                            {association}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Landscape Role:</div>
                    <div className="text-sm text-slate-300">{feature.landscapeRole}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {landscapePatterns.map((pattern) => (
              <Card key={pattern.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Layers className="mr-2 h-5 w-5 text-blue-400" />
                        {pattern.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {pattern.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getScoreColor(pattern.culturalComplexity)} border-current`}>
                      {pattern.culturalComplexity.toFixed(1)}% Complexity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Pattern Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Spatial Extent:</span>
                            <span className="text-slate-300">{pattern.spatialExtent} km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Temporal Depth:</span>
                            <span className="text-slate-300">{pattern.temporalDepth} years</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Components</h4>
                        <div className="space-y-1">
                          {pattern.components.map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1 mb-1 border-blue-600 text-blue-300">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Relationships</h4>
                        <ul className="space-y-1 text-sm text-slate-400">
                          {pattern.relationships.map((relationship, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Target className="h-3 w-3 mt-1 text-emerald-400 flex-shrink-0" />
                              {relationship}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Evolution Stages</h4>
                        <ul className="space-y-1 text-sm text-slate-400">
                          {pattern.evolution.map((stage, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 mt-1 text-blue-400 flex-shrink-0" />
                              {stage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Calendar className="mr-2 h-6 w-6 text-orange-400" />
                Cultural Landscape Evolution
              </CardTitle>
              <CardDescription className="text-orange-200">
                Analysis of landscape transformation and cultural adaptation over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                    <div className="text-2xl font-bold text-orange-400">700</div>
                    <div className="text-sm text-slate-400">Years of Evolution</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-blue-400">4</div>
                    <div className="text-sm text-slate-400">Cultural Phases</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                    <div className="text-2xl font-bold text-emerald-400">92.4%</div>
                    <div className="text-sm text-slate-400">Pattern Complexity</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Major Transformation Phases</h4>
                  <div className="space-y-3">
                    {[
                      { phase: 'Initial Settlement (300-600 CE)', changes: ['Site establishment', 'Basic infrastructure', 'Resource exploitation'], impact: 'Low' },
                      { phase: 'Expansion Period (600-800 CE)', changes: ['Population growth', 'Landscape modification', 'Social complexity'], impact: 'Medium' },
                      { phase: 'Peak Complexity (800-900 CE)', changes: ['Maximum extent', 'Intensive agriculture', 'Monumental construction'], impact: 'High' },
                      { phase: 'Decline and Abandonment (900-1000 CE)', changes: ['Population decline', 'Defensive measures', 'Landscape abandonment'], impact: 'High' }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-slate-300">{item.phase}</h5>
                          <Badge variant="outline" className={`
                            ${item.impact === 'High' ? 'text-red-400 border-red-400' : 
                              item.impact === 'Medium' ? 'text-yellow-400 border-yellow-400' : 
                              'text-green-400 border-green-400'}
                          `}>
                            {item.impact} Impact
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {item.changes.map((change, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {change}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landscapes" className="space-y-4">
          <div className="grid gap-4">
            {culturalLandscapes.map((landscape, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Globe className="mr-2 h-5 w-5 text-green-400" />
                        {landscape.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {landscape.period} | Population: {landscape.population.toLocaleString()} | Extent: {landscape.extent} km²
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`${getScoreColor(landscape.sustainability)} border-current`}>
                        {landscape.sustainability.toFixed(1)}% Sustainable
                      </Badge>
                      <Badge variant="outline" className={`${getScoreColor(landscape.resilience)} border-current`}>
                        {landscape.resilience.toFixed(1)}% Resilient
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300">Land Use Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(landscape.landUse).map(([use, percentage]) => (
                          <div key={use} className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm capitalize">{use}:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="w-20 h-2" />
                              <span className="text-slate-300 text-sm w-8">{percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300">Transformation Processes</h4>
                      <ul className="space-y-1 text-sm text-slate-400">
                        {landscape.transformation.map((process, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Activity className="h-3 w-3 mt-1 text-blue-400 flex-shrink-0" />
                            {process}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 