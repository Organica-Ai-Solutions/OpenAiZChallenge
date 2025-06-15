"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets, 
  TreePine, 
  Flower2, 
  Bug, 
  Fish,
  Mountain,
  Waves,
  Sun,
  Snowflake,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Globe,
  Leaf,
  Beaker
} from 'lucide-react'

interface ClimateData {
  period: string
  startYear: number
  endYear: number
  temperature: {
    mean: number
    range: [number, number]
    trend: 'warming' | 'cooling' | 'stable'
  }
  precipitation: {
    annual: number
    seasonal: {
      wet: number
      dry: number
    }
    variability: number
  }
  vegetation: {
    dominant: string
    diversity: number
    coverage: number
    types: string[]
  }
  fauna: {
    diversity: number
    keySpecies: string[]
    extinctions: string[]
    migrations: string[]
  }
}

interface EnvironmentalProxy {
  id: string
  type: 'pollen' | 'sediment' | 'isotope' | 'charcoal' | 'phytolith' | 'diatom'
  source: string
  resolution: number
  timespan: [number, number]
  reliability: number
  indicators: string[]
  findings: string[]
}

interface PaleoenvironmentalEvent {
  id: string
  name: string
  type: 'drought' | 'flood' | 'volcanic' | 'climate_shift' | 'ecological_change'
  timing: number
  duration: number
  magnitude: number
  impact: string
  evidence: string[]
  humanResponse: string[]
}

export default function EnvironmentalReconstruction() {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [activeProxy, setActiveProxy] = useState<string>('pollen')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [climateData, setClimateData] = useState<ClimateData[]>([])
  const [environmentalProxies, setEnvironmentalProxies] = useState<EnvironmentalProxy[]>([])
  const [paleoenvironmentalEvents, setPaleoenvironmentalEvents] = useState<PaleoenvironmentalEvent[]>([])

  // Simulate environmental analysis progress
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false)
          return 100
        }
        return prev + Math.random() * 2.8
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Mock environmental data
  useEffect(() => {
    const mockClimateData: ClimateData[] = [
      {
        period: 'Early Classic (300-600 CE)',
        startYear: 300,
        endYear: 600,
        temperature: {
          mean: 24.5,
          range: [22.1, 26.8],
          trend: 'warming'
        },
        precipitation: {
          annual: 1450,
          seasonal: { wet: 1150, dry: 300 },
          variability: 15.2
        },
        vegetation: {
          dominant: 'Tropical Deciduous Forest',
          diversity: 87.3,
          coverage: 78.5,
          types: ['Cecropia', 'Bursera', 'Ficus', 'Manilkara', 'Swietenia']
        },
        fauna: {
          diversity: 92.1,
          keySpecies: ['Jaguar', 'Howler Monkey', 'Quetzal', 'Tapir', 'Peccary'],
          extinctions: [],
          migrations: ['Seasonal bird migrations', 'Mammal altitudinal movements']
        }
      },
      {
        period: 'Late Classic (600-900 CE)',
        startYear: 600,
        endYear: 900,
        temperature: {
          mean: 25.8,
          range: [23.4, 28.1],
          trend: 'stable'
        },
        precipitation: {
          annual: 1280,
          seasonal: { wet: 980, dry: 300 },
          variability: 22.7
        },
        vegetation: {
          dominant: 'Mixed Forest-Grassland',
          diversity: 74.6,
          coverage: 65.2,
          types: ['Pinus', 'Quercus', 'Poaceae', 'Asteraceae', 'Fabaceae']
        },
        fauna: {
          diversity: 78.9,
          keySpecies: ['Deer', 'Turkey', 'Rabbit', 'Iguana', 'Freshwater Fish'],
          extinctions: ['Large Mammals'],
          migrations: ['Reduced seasonal movements']
        }
      },
      {
        period: 'Terminal Classic (800-1000 CE)',
        startYear: 800,
        endYear: 1000,
        temperature: {
          mean: 26.2,
          range: [24.1, 28.9],
          trend: 'warming'
        },
        precipitation: {
          annual: 980,
          seasonal: { wet: 720, dry: 260 },
          variability: 35.4
        },
        vegetation: {
          dominant: 'Grassland-Scrub',
          diversity: 58.3,
          coverage: 45.7,
          types: ['Poaceae', 'Cactaceae', 'Agave', 'Acacia', 'Prosopis']
        },
        fauna: {
          diversity: 62.4,
          keySpecies: ['Small Mammals', 'Reptiles', 'Drought-adapted Birds'],
          extinctions: ['Forest Specialists', 'Large Herbivores'],
          migrations: ['Population crashes', 'Range contractions']
        }
      }
    ]

    const mockProxies: EnvironmentalProxy[] = [
      {
        id: 'proxy_001',
        type: 'pollen',
        source: 'Lake Sediment Core LS-2024',
        resolution: 25,
        timespan: [200, 1200],
        reliability: 89.4,
        indicators: ['Vegetation composition', 'Climate conditions', 'Human impact'],
        findings: [
          'Forest decline from 800-1000 CE',
          'Increased grass pollen indicating deforestation',
          'Maize pollen peaks during occupation periods',
          'Charcoal particles suggest increased burning'
        ]
      },
      {
        id: 'proxy_002',
        type: 'isotope',
        source: 'Speleothem Sample SP-15',
        resolution: 10,
        timespan: [100, 1400],
        reliability: 94.7,
        indicators: ['Precipitation patterns', 'Temperature variations', 'Seasonal cycles'],
        findings: [
          'Severe drought events 850-950 CE',
          'Increased precipitation variability',
          'Temperature rise of 1.5°C during Terminal Classic',
          'Monsoon weakening after 800 CE'
        ]
      },
      {
        id: 'proxy_003',
        type: 'sediment',
        source: 'Alluvial Deposits AD-7',
        resolution: 50,
        timespan: [300, 1100],
        reliability: 76.8,
        indicators: ['Erosion rates', 'Land use changes', 'Hydrological conditions'],
        findings: [
          'Increased sedimentation rates 700-900 CE',
          'Evidence of agricultural terracing',
          'Flood deposits during wet periods',
          'Soil degradation markers in upper layers'
        ]
      },
      {
        id: 'proxy_004',
        type: 'charcoal',
        source: 'Archaeological Contexts',
        resolution: 75,
        timespan: [400, 1000],
        reliability: 82.3,
        indicators: ['Fire frequency', 'Human burning', 'Natural fires'],
        findings: [
          'Increased fire frequency during droughts',
          'Agricultural burning signatures',
          'Forest clearing evidence',
          'Fuel load reduction over time'
        ]
      }
    ]

    const mockEvents: PaleoenvironmentalEvent[] = [
      {
        id: 'event_001',
        name: 'Terminal Classic Drought',
        type: 'drought',
        timing: 850,
        duration: 150,
        magnitude: 8.7,
        impact: 'Severe water stress, agricultural failure, population decline',
        evidence: ['Isotope records', 'Lake level indicators', 'Vegetation changes'],
        humanResponse: ['Settlement abandonment', 'Water management intensification', 'Population migration']
      },
      {
        id: 'event_002',
        name: 'Late Classic Deforestation',
        type: 'ecological_change',
        timing: 750,
        duration: 200,
        magnitude: 7.2,
        impact: 'Forest cover reduction, biodiversity loss, soil erosion',
        evidence: ['Pollen records', 'Charcoal analysis', 'Sediment cores'],
        humanResponse: ['Agricultural intensification', 'Resource management', 'Settlement nucleation']
      },
      {
        id: 'event_003',
        name: 'Early Classic Volcanic Activity',
        type: 'volcanic',
        timing: 450,
        duration: 25,
        magnitude: 6.8,
        impact: 'Ash deposition, temporary cooling, agricultural disruption',
        evidence: ['Tephra layers', 'Geochemical signatures', 'Vegetation response'],
        humanResponse: ['Temporary abandonment', 'Ritual responses', 'Agricultural adaptation']
      }
    ]

    setClimateData(mockClimateData)
    setEnvironmentalProxies(mockProxies)
    setPaleoenvironmentalEvents(mockEvents)
  }, [])

  const startAnalysis = (proxy: string) => {
    setActiveProxy(proxy)
    setIsAnalyzing(true)
    setAnalysisProgress(0)
  }

  const getProxyIcon = (type: string) => {
    switch (type) {
      case 'pollen': return <Flower2 className="h-4 w-4" />
      case 'sediment': return <Mountain className="h-4 w-4" />
      case 'isotope': return <CloudRain className="h-4 w-4" />
      case 'charcoal': return <Zap className="h-4 w-4" />
      case 'phytolith': return <Leaf className="h-4 w-4" />
      case 'diatom': return <Droplets className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getProxyColor = (type: string) => {
    switch (type) {
      case 'pollen': return 'text-pink-400 border-pink-400'
      case 'sediment': return 'text-brown-400 border-brown-400'
      case 'isotope': return 'text-blue-400 border-blue-400'
      case 'charcoal': return 'text-orange-400 border-orange-400'
      case 'phytolith': return 'text-green-400 border-green-400'
      case 'diatom': return 'text-cyan-400 border-cyan-400'
      default: return 'text-slate-400 border-slate-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'warming': return <TrendingUp className="h-4 w-4 text-red-400" />
      case 'cooling': return <TrendingDown className="h-4 w-4 text-blue-400" />
      default: return <Activity className="h-4 w-4 text-slate-400" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'drought': return <Sun className="h-4 w-4" />
      case 'flood': return <Waves className="h-4 w-4" />
      case 'volcanic': return <Mountain className="h-4 w-4" />
      case 'climate_shift': return <Wind className="h-4 w-4" />
      case 'ecological_change': return <TreePine className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'drought': return 'text-yellow-400 border-yellow-400'
      case 'flood': return 'text-blue-400 border-blue-400'
      case 'volcanic': return 'text-red-400 border-red-400'
      case 'climate_shift': return 'text-purple-400 border-purple-400'
      case 'ecological_change': return 'text-green-400 border-green-400'
      default: return 'text-slate-400 border-slate-400'
    }
  }

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return 'text-emerald-400'
    if (reliability >= 80) return 'text-blue-400'
    if (reliability >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <CloudRain className="mr-2 h-6 w-6 text-teal-400" />
            🌿 Environmental Reconstruction System
          </CardTitle>
          <CardDescription className="text-teal-200">
            Paleoenvironmental analysis using multiple proxy data sources to reconstruct past climate, vegetation, and environmental conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-teal-400">1000</div>
              <div className="text-xs text-slate-400">Years Reconstructed</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">{environmentalProxies.length}</div>
              <div className="text-xs text-slate-400">Proxy Records</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">89.4%</div>
              <div className="text-xs text-slate-400">Avg Reliability</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-violet-400">{paleoenvironmentalEvents.length}</div>
              <div className="text-xs text-slate-400">Major Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
            Proxy Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'pollen', name: 'Pollen Analysis' },
              { id: 'isotope', name: 'Isotope Analysis' },
              { id: 'sediment', name: 'Sediment Analysis' },
              { id: 'charcoal', name: 'Charcoal Analysis' },
              { id: 'phytolith', name: 'Phytolith Analysis' },
              { id: 'diatom', name: 'Diatom Analysis' }
            ].map((analysis) => (
              <Button
                key={analysis.id}
                variant={activeProxy === analysis.id ? "default" : "outline"}
                onClick={() => startAnalysis(analysis.id)}
                className="flex items-center gap-2 h-12"
                disabled={isAnalyzing}
              >
                {getProxyIcon(analysis.id)}
                <span className="text-sm">{analysis.name}</span>
              </Button>
            ))}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Processing {activeProxy} analysis...</span>
                <span className="text-slate-400">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Tabs defaultValue="climate" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="climate" className="text-slate-300 data-[state=active]:text-white">Climate Data</TabsTrigger>
          <TabsTrigger value="proxies" className="text-slate-300 data-[state=active]:text-white">Proxy Records</TabsTrigger>
          <TabsTrigger value="events" className="text-slate-300 data-[state=active]:text-white">Paleo Events</TabsTrigger>
          <TabsTrigger value="synthesis" className="text-slate-300 data-[state=active]:text-white">Synthesis</TabsTrigger>
        </TabsList>

        <TabsContent value="climate" className="space-y-4">
          <div className="grid gap-4">
            {climateData.map((period, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                        {period.period}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {period.startYear}-{period.endYear} CE | Duration: {period.endYear - period.startYear} years
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(period.temperature.trend)}
                      <span className="text-slate-300 text-sm capitalize">{period.temperature.trend}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                        <Thermometer className="mr-2 h-4 w-4 text-red-400" />
                        Climate Conditions
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mean Temperature:</span>
                          <span className="text-slate-300">{period.temperature.mean}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Temperature Range:</span>
                          <span className="text-slate-300">{period.temperature.range[0]}-{period.temperature.range[1]}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Annual Precipitation:</span>
                          <span className="text-slate-300">{period.precipitation.annual}mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Precipitation Variability:</span>
                          <span className="text-slate-300">{period.precipitation.variability}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                        <TreePine className="mr-2 h-4 w-4 text-green-400" />
                        Vegetation
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-slate-400">Dominant Type:</span>
                          <div className="text-slate-300 mt-1">{period.vegetation.dominant}</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Diversity:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={period.vegetation.diversity} className="w-16 h-2" />
                            <span className="text-slate-300 text-sm">{period.vegetation.diversity.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Coverage:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={period.vegetation.coverage} className="w-16 h-2" />
                            <span className="text-slate-300 text-sm">{period.vegetation.coverage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                        <Bug className="mr-2 h-4 w-4 text-purple-400" />
                        Fauna
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Diversity:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={period.fauna.diversity} className="w-16 h-2" />
                            <span className="text-slate-300 text-sm">{period.fauna.diversity.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-sm">Key Species:</span>
                          <div className="flex flex-wrap gap-1">
                            {period.fauna.keySpecies.slice(0, 3).map((species, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-purple-600 text-purple-300">
                                {species}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proxies" className="space-y-4">
          <div className="grid gap-4">
            {environmentalProxies.map((proxy) => (
              <Card key={proxy.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <div className={`mr-2 p-1 rounded ${getProxyColor(proxy.type)}`}>
                          {getProxyIcon(proxy.type)}
                        </div>
                        {proxy.source}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {proxy.type.charAt(0).toUpperCase() + proxy.type.slice(1)} Analysis | 
                        Resolution: {proxy.resolution} years | 
                        Timespan: {proxy.timespan[0]}-{proxy.timespan[1]} CE
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getReliabilityColor(proxy.reliability)} border-current`}>
                      {proxy.reliability.toFixed(1)}% Reliable
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Environmental Indicators</h4>
                      <div className="space-y-1">
                        {proxy.indicators.map((indicator, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1 border-blue-600 text-blue-300">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">Key Findings</h4>
                      <ul className="space-y-1 text-sm text-slate-400">
                        {proxy.findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Target className="h-3 w-3 mt-1 text-emerald-400 flex-shrink-0" />
                            {finding}
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

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {paleoenvironmentalEvents.map((event) => (
              <Card key={event.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <div className={`mr-2 p-1 rounded ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        {event.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {event.timing} CE | Duration: {event.duration} years | 
                        Type: {event.type.replace('_', ' ').charAt(0).toUpperCase() + event.type.replace('_', ' ').slice(1)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${event.magnitude >= 8 ? 'text-red-400 border-red-400' : 
                      event.magnitude >= 6 ? 'text-yellow-400 border-yellow-400' : 'text-green-400 border-green-400'}`}>
                      Magnitude {event.magnitude.toFixed(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Environmental Impact</h4>
                      <p className="text-sm text-slate-400">{event.impact}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Evidence Sources</h4>
                        <div className="space-y-1">
                          {event.evidence.map((evidence, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1 mb-1 border-emerald-600 text-emerald-300">
                              {evidence}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Human Response</h4>
                        <ul className="space-y-1 text-sm text-slate-400">
                          {event.humanResponse.map((response, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Target className="h-3 w-3 mt-1 text-blue-400 flex-shrink-0" />
                              {response}
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

        <TabsContent value="synthesis" className="space-y-4">
          <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Globe className="mr-2 h-6 w-6 text-indigo-400" />
                Environmental-Cultural Synthesis
              </CardTitle>
              <CardDescription className="text-indigo-200">
                Integrated analysis of environmental change and human cultural responses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-400" />
                    <div className="text-2xl font-bold text-red-400">+1.7°C</div>
                    <div className="text-sm text-slate-400">Temperature Increase</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <Waves className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-blue-400">-32%</div>
                    <div className="text-sm text-slate-400">Precipitation Decline</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <TreePine className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold text-green-400">-42%</div>
                    <div className="text-sm text-slate-400">Forest Cover Loss</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Key Environmental-Cultural Correlations</h4>
                  <div className="space-y-3">
                    {[
                      {
                        period: '300-600 CE: Favorable Conditions',
                        environmental: 'Stable climate, abundant rainfall, diverse ecosystems',
                        cultural: 'Population growth, settlement expansion, cultural florescence',
                        correlation: 'High'
                      },
                      {
                        period: '600-800 CE: Intensification Phase',
                        environmental: 'Slight warming, seasonal variability increase',
                        cultural: 'Agricultural intensification, landscape modification, social complexity',
                        correlation: 'Medium'
                      },
                      {
                        period: '800-1000 CE: Crisis and Adaptation',
                        environmental: 'Severe droughts, ecosystem degradation, climate instability',
                        cultural: 'Population decline, settlement abandonment, defensive strategies',
                        correlation: 'High'
                      }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-semibold text-slate-300">{item.period}</h5>
                          <Badge variant="outline" className={`
                            ${item.correlation === 'High' ? 'text-red-400 border-red-400' : 
                              item.correlation === 'Medium' ? 'text-yellow-400 border-yellow-400' : 
                              'text-green-400 border-green-400'}
                          `}>
                            {item.correlation} Correlation
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Environmental:</span>
                            <p className="text-slate-300 mt-1">{item.environmental}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Cultural:</span>
                            <p className="text-slate-300 mt-1">{item.cultural}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 