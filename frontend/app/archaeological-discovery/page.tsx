"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  MapPin, 
  Satellite, 
  Eye, 
  Brain, 
  Database,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Activity,
  Download,
  Share2,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { discoveryService, DiscoveryRequest, DiscoveredSite } from '@/lib/discovery-service'
import { webSocketService } from '@/lib/websocket'

interface DiscoveryState {
  isSearching: boolean
  isAnalyzing: boolean
  currentStep: string
  progress: number
  discoveries: DiscoveredSite[]
  error: string | null
  analysisResults: any
}

export default function ArchaeologicalDiscoveryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Form state
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '')
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '')
  const [description, setDescription] = useState('')
  const [selectedDataSources, setSelectedDataSources] = useState(['satellite', 'lidar', 'historical_text'])
  
  // Discovery state
  const [state, setState] = useState<DiscoveryState>({
    isSearching: false,
    isAnalyzing: false,
    currentStep: '',
    progress: 0,
    discoveries: [],
    error: null,
    analysisResults: null
  })
  
  const [selectedDiscovery, setSelectedDiscovery] = useState<DiscoveredSite | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-discover if URL parameters are present and auto=true
    if (searchParams.get('auto') === 'true' && latitude && longitude) {
      handleDiscovery()
    }
  }, [])

  useEffect(() => {
    // Subscribe to WebSocket updates
    const unsubscribeAnalysis = webSocketService.subscribe('analysis_update', (data: any) => {
      setState(prev => ({
        ...prev,
        currentStep: data.currentStep,
        progress: data.progress,
        isAnalyzing: data.status === 'processing'
      }))
    })

    const unsubscribeDiscovery = webSocketService.subscribe('discovery', (data: any) => {
      setState(prev => ({
        ...prev,
        discoveries: [...prev.discoveries, {
          site_id: data.id,
          latitude: data.coordinates.lat,
          longitude: data.coordinates.lng,
          confidence_score: data.confidence,
          validation_status: data.confidence > 0.7 ? 'HIGH_CONFIDENCE' : 'MEDIUM_CONFIDENCE',
          description: data.description,
          cultural_significance: null,
          data_sources: ['satellite', 'lidar'],
          metadata: {
            analysis_timestamp: new Date().toISOString(),
            sources_analyzed: ['satellite', 'lidar'],
            confidence_breakdown: { satellite: data.confidence * 0.6, lidar: data.confidence * 0.4 }
          }
        }]
      }))
    })

    return () => {
      unsubscribeAnalysis()
      unsubscribeDiscovery()
    }
  }, [])

  const handleDiscovery = async () => {
    if (!latitude || !longitude) {
      setState(prev => ({ ...prev, error: 'Please enter valid coordinates' }))
      return
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      isAnalyzing: false,
      error: null,
      discoveries: [],
      progress: 0,
      currentStep: 'Preparing discovery request...'
    }))

    try {
      const request: DiscoveryRequest = discoveryService.generateDiscoveryRequest(
        parseFloat(latitude),
        parseFloat(longitude),
        description || `Archaeological discovery at ${latitude}, ${longitude}`,
        selectedDataSources as any[]
      )

      setState(prev => ({ ...prev, currentStep: 'Submitting request to discovery service...', progress: 20 }))

      const response = await discoveryService.discoverSites(request)
      
      setState(prev => ({ 
        ...prev, 
        currentStep: 'Processing discovered sites...', 
        progress: 60,
        discoveries: response.validated_sites || []
      }))

      // If we have discoveries, auto-select the first one
      if (response.validated_sites && response.validated_sites.length > 0) {
        setSelectedDiscovery(response.validated_sites[0])
        setState(prev => ({ ...prev, currentStep: 'Discovery completed!', progress: 100 }))
      }

    } catch (error) {
      console.error('Discovery failed:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Discovery failed',
        currentStep: 'Discovery failed'
      }))
    } finally {
      setState(prev => ({ ...prev, isSearching: false }))
    }
  }

  const analyzeWithAgents = async (site: DiscoveredSite) => {
    setState(prev => ({ ...prev, isAnalyzing: true, currentStep: 'Starting AI agent analysis...', progress: 0 }))

    try {
      setState(prev => ({ ...prev, currentStep: 'Analyzing with Vision, Reasoning, Memory, and Action agents...', progress: 25 }))
      
      const results = await discoveryService.analyzeDiscoveredSite(site)
      
      setState(prev => ({ 
        ...prev, 
        analysisResults: results,
        currentStep: 'Agent analysis completed!',
        progress: 100,
        isAnalyzing: false
      }))
    } catch (error) {
      console.error('Agent analysis failed:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Agent analysis failed',
        isAnalyzing: false
      }))
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600'
    if (confidence > 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getValidationBadge = (status: string) => {
    const colors = {
      'HIGH_CONFIDENCE': 'bg-green-100 text-green-800',
      'MEDIUM_CONFIDENCE': 'bg-yellow-100 text-yellow-800',
      'LOW_CONFIDENCE': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const dataSources = [
    { id: 'satellite', label: 'Satellite Imagery', icon: Satellite },
    { id: 'lidar', label: 'LiDAR Data', icon: Layers },
    { id: 'historical_text', label: 'Historical Texts', icon: Database },
    { id: 'indigenous_map', label: 'Indigenous Maps', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Search className="h-10 w-10 mr-3 text-green-400" />
            Archaeological Discovery
          </h1>
          <p className="text-xl text-slate-300">
            Multi-source archaeological site discovery and AI-powered analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discovery Form */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Site Discovery
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter coordinates to discover archaeological sites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-slate-300">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-3.4653"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-slate-300">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-62.2159"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Archaeological site search in Amazon Basin"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-3 block">Data Sources</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {dataSources.map((source) => (
                      <Button
                        key={source.id}
                        variant={selectedDataSources.includes(source.id) ? "default" : "outline"}
                        size="sm"
                        className={`justify-start ${
                          selectedDataSources.includes(source.id) 
                            ? "bg-blue-600 text-white" 
                            : "border-slate-600 text-slate-300 hover:bg-slate-700"
                        }`}
                        onClick={() => {
                          setSelectedDataSources(prev => 
                            prev.includes(source.id)
                              ? prev.filter(id => id !== source.id)
                              : [...prev, source.id]
                          )
                        }}
                      >
                        <source.icon className="h-4 w-4 mr-2" />
                        {source.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {state.error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-600">
                      {state.error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleDiscovery}
                  disabled={state.isSearching || !latitude || !longitude}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {state.isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Discover Sites
                    </>
                  )}
                </Button>

                {/* Progress indicator */}
                {(state.isSearching || state.isAnalyzing) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{state.currentStep}</span>
                      <span className="text-slate-400">{state.progress}%</span>
                    </div>
                    <Progress value={state.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Locations */}
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Quick Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Amazon Basin', lat: -3.4653, lng: -62.2159 },
                    { name: 'Andes Mountains', lat: -13.1631, lng: -72.5450 },
                    { name: 'Cerrado Savanna', lat: -15.7975, lng: -47.8919 }
                  ].map((location, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        setLatitude(location.lat.toString())
                        setLongitude(location.lng.toString())
                        setDescription(`Archaeological discovery in ${location.name}`)
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {location.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {state.discoveries.length > 0 ? (
              <Tabs defaultValue="discoveries" className="space-y-6">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="discoveries" className="text-slate-300">
                    Discoveries ({state.discoveries.length})
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="text-slate-300">
                    AI Analysis
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-slate-300">
                    Map View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discoveries" className="space-y-4">
                  {state.discoveries.map((discovery, index) => (
                    <Card 
                      key={discovery.site_id}
                      className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all ${
                        selectedDiscovery?.site_id === discovery.site_id ? 'border-blue-500' : 'hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedDiscovery(discovery)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">
                            Site {index + 1}
                          </CardTitle>
                          <Badge className={getValidationBadge(discovery.validation_status)}>
                            {discovery.validation_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription className="text-slate-400">
                          {discovery.description || 'Archaeological site discovered'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Coordinates</p>
                            <p className="text-white">{discovery.latitude.toFixed(4)}, {discovery.longitude.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Confidence</p>
                            <p className={`font-semibold ${getConfidenceColor(discovery.confidence_score)}`}>
                              {(discovery.confidence_score * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                          {discovery.data_sources.map((source) => (
                            <Badge key={source} variant="outline" className="border-slate-600 text-slate-300">
                              {source}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              analyzeWithAgents(discovery)
                            }}
                            disabled={state.isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            AI Analysis
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              router.push(`/map?lat=${discovery.latitude}&lng=${discovery.longitude}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View on Map
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="analysis">
                  {state.analysisResults ? (
                    <div className="space-y-4">
                      {Object.entries(state.analysisResults).map(([agentType, result]: [string, any]) => (
                        <Card key={agentType} className="bg-slate-800/50 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white capitalize">
                              {agentType} Agent Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Confidence:</span>
                                <span className={`font-semibold ${getConfidenceColor(result.confidence_score)}`}>
                                  {(result.confidence_score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Processing Time:</span>
                                <span className="text-white">{result.processing_time.toFixed(2)}s</span>
                              </div>
                              <div>
                                <p className="text-slate-400 mb-2">Results:</p>
                                <pre className="text-slate-300 text-sm bg-slate-900 p-3 rounded overflow-x-auto">
                                  {JSON.stringify(result.results, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="py-8 text-center">
                        <Brain className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-400 mb-4">
                          Select a discovery and run AI analysis to see detailed results
                        </p>
                        {selectedDiscovery && (
                          <Button 
                            onClick={() => analyzeWithAgents(selectedDiscovery)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Start AI Analysis
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="map">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-8">
                      <div 
                        ref={mapRef}
                        className="h-96 bg-slate-900 rounded-lg flex items-center justify-center"
                      >
                        <div className="text-center text-slate-400">
                          <Globe className="h-12 w-12 mx-auto mb-4" />
                          <p className="mb-4">Interactive map will be displayed here</p>
                          <Button 
                            onClick={() => router.push('/map')}
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                          >
                            Open Full Map View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Search className="h-16 w-16 mx-auto text-slate-500 mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Ready to Discover Archaeological Sites
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Enter coordinates and select data sources to begin your archaeological discovery journey
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => {
                        setLatitude('-3.4653')
                        setLongitude('-62.2159')
                        setDescription('Amazon Basin archaeological discovery')
                      }}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Try Amazon Basin
                    </Button>
                    <Button 
                      onClick={() => router.push('/satellite')}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Monitor Satellites
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 