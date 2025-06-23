'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { analysisService, AnalysisRequest, AnalysisResult } from '@/services/AnalysisService'
import { 
  Brain, 
  Eye, 
  Zap, 
  Layers, 
  Satellite, 
  Users, 
  Clock, 
  Globe, 
  Network, 
  Database,
  MapPin,
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface AnalysisTriggerProps {
  coordinates?: { lat: number; lon: number }
  onAnalysisComplete?: (result: AnalysisResult) => void
  onAnalysisStart?: (analysisType: string) => void
  className?: string
  mode?: 'map' | 'chat' | 'standalone'
}

interface AnalysisState {
  isRunning: boolean
  currentAnalysis: string | null
  progress: number
  results: AnalysisResult[]
  errors: string[]
  queuedAnalyses: string[]
}

const ANALYSIS_METHODS = [
  { 
    id: 'standard', 
    name: 'Standard Analysis', 
    icon: Activity, 
    description: 'Basic archaeological analysis',
    category: 'core',
    estimatedTime: '2-5s'
  },
  { 
    id: 'vision', 
    name: 'Vision Analysis', 
    icon: Eye, 
    description: 'GPT-4 Vision + LIDAR fusion',
    category: 'core',
    estimatedTime: '10-15s'
  },
  { 
    id: 'enhanced', 
    name: 'Enhanced Analysis', 
    icon: Zap, 
    description: 'Multi-agent enhanced processing',
    category: 'core',
    estimatedTime: '8-12s'
  },
  { 
    id: 'comprehensive', 
    name: 'Comprehensive Analysis', 
    icon: Brain, 
    description: 'All agents + consciousness integration',
    category: 'core',
    estimatedTime: '15-25s'
  },
  { 
    id: 'archaeological', 
    name: 'Archaeological Analysis', 
    icon: Database, 
    description: 'Specialized archaeological features',
    category: 'specialized',
    estimatedTime: '12-18s'
  },
  { 
    id: 'cultural_significance', 
    name: 'Cultural Significance', 
    icon: Users, 
    description: 'Cultural context and significance',
    category: 'specialized',
    estimatedTime: '6-10s'
  },
  { 
    id: 'settlement_patterns', 
    name: 'Settlement Patterns', 
    icon: MapPin, 
    description: 'Settlement distribution analysis',
    category: 'specialized',
    estimatedTime: '8-12s'
  },
  { 
    id: 'trade_networks', 
    name: 'Trade Networks', 
    icon: Network, 
    description: 'Trade route and network analysis',
    category: 'specialized',
    estimatedTime: '10-15s'
  },
  { 
    id: 'environmental_factors', 
    name: 'Environmental Factors', 
    icon: Globe, 
    description: 'Climate, geology, hydrology analysis',
    category: 'specialized',
    estimatedTime: '7-11s'
  },
  { 
    id: 'chronological_sequence', 
    name: 'Chronological Sequence', 
    icon: Clock, 
    description: 'Temporal analysis and dating',
    category: 'specialized',
    estimatedTime: '9-14s'
  },
  { 
    id: 'lidar_comprehensive', 
    name: 'Comprehensive LIDAR', 
    icon: Layers, 
    description: 'Advanced LIDAR with triangulation',
    category: 'technical',
    estimatedTime: '12-20s'
  },
  { 
    id: 'lidar_professional', 
    name: 'Professional LIDAR', 
    icon: Layers, 
    description: 'DTM/DSM/CHM analysis',
    category: 'technical',
    estimatedTime: '15-25s'
  },
  { 
    id: 'satellite_latest', 
    name: 'Latest Satellite', 
    icon: Satellite, 
    description: 'Recent satellite imagery analysis',
    category: 'technical',
    estimatedTime: '8-15s'
  },
  { 
    id: 'satellite_change_detection', 
    name: 'Change Detection', 
    icon: Satellite, 
    description: 'Multi-temporal change analysis',
    category: 'technical',
    estimatedTime: '10-18s'
  }
]

const CATEGORY_COLORS = {
  core: 'bg-blue-500',
  specialized: 'bg-green-500',
  technical: 'bg-purple-500'
}

const CATEGORY_NAMES = {
  core: 'Core Analysis',
  specialized: 'Specialized Analysis',
  technical: 'Technical Analysis'
}

export default function AnalysisTrigger({ 
  coordinates, 
  onAnalysisComplete, 
  onAnalysisStart,
  className = '',
  mode = 'standalone'
}: AnalysisTriggerProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isRunning: false,
    currentAnalysis: null,
    progress: 0,
    results: [],
    errors: [],
    queuedAnalyses: []
  })

  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>(['standard', 'vision'])
  const [analysisOptions, setAnalysisOptions] = useState({
    confidenceThreshold: 0.7,
    analysisDepth: 'comprehensive' as 'quick' | 'comprehensive' | 'specialized',
    useGPT4Vision: true,
    useLidarFusion: true,
    useKANNetworks: false,
    dataSources: ['satellite', 'lidar', 'historical'],
    agentsToUse: ['vision', 'memory', 'reasoning']
  })

  const [activeTab, setActiveTab] = useState('select')

  // Run single analysis
  const runSingleAnalysis = useCallback(async (analysisId: string) => {
    if (!coordinates) {
      setAnalysisState(prev => ({
        ...prev,
        errors: [...prev.errors, 'No coordinates provided']
      }))
      return
    }

    const analysisMethod = ANALYSIS_METHODS.find(m => m.id === analysisId)
    if (!analysisMethod) return

    setAnalysisState(prev => ({
      ...prev,
      isRunning: true,
      currentAnalysis: analysisId,
      progress: 0
    }))

    onAnalysisStart?.(analysisId)

    try {
      const request: AnalysisRequest = {
        coordinates,
        analysisType: analysisId,
        options: analysisOptions
      }

      // Get the analysis method from the service
      const service = analysisService
      let result: AnalysisResult

      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 500)

      // Execute the appropriate analysis method
      switch (analysisId) {
        case 'standard':
          result = await service.analyzeCoordinates(request)
          break
        case 'vision':
          result = await service.analyzeVision(request)
          break
        case 'enhanced':
          result = await service.analyzeEnhanced(request)
          break
        case 'comprehensive':
          result = await service.analyzeComprehensive(request)
          break
        case 'archaeological':
          result = await service.analyzeArchaeological(request)
          break
        case 'cultural_significance':
          result = await service.analyzeCulturalSignificance(request)
          break
        case 'settlement_patterns':
          result = await service.analyzeSettlementPatterns(request)
          break
        case 'trade_networks':
          result = await service.analyzeTradeNetworks(request)
          break
        case 'environmental_factors':
          result = await service.analyzeEnvironmentalFactors(request)
          break
        case 'chronological_sequence':
          result = await service.analyzeChronologicalSequence(request)
          break
        case 'lidar_comprehensive':
          result = await service.analyzeLidarComprehensive(request)
          break
        case 'lidar_professional':
          result = await service.analyzeLidarProfessional(request)
          break
        case 'satellite_latest':
          result = await service.analyzeSatelliteLatest(request)
          break
        case 'satellite_change_detection':
          result = await service.analyzeSatelliteChangeDetection(request)
          break
        default:
          throw new Error(`Unknown analysis type: ${analysisId}`)
      }

      clearInterval(progressInterval)
      
      setAnalysisState(prev => ({
        ...prev,
        progress: 100,
        results: [...prev.results, result],
        isRunning: false,
        currentAnalysis: null
      }))

      onAnalysisComplete?.(result)

      // Auto-save result
      await service.saveAnalysis(result)

    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      
      setAnalysisState(prev => ({
        ...prev,
        isRunning: false,
        currentAnalysis: null,
        progress: 0,
        errors: [...prev.errors, `${analysisMethod.name}: ${errorMessage}`]
      }))
    }
  }, [coordinates, analysisOptions, onAnalysisComplete, onAnalysisStart])

  // Run batch analysis
  const runBatchAnalysis = useCallback(async () => {
    if (!coordinates || selectedAnalyses.length === 0) return

    setAnalysisState(prev => ({
      ...prev,
      isRunning: true,
      queuedAnalyses: [...selectedAnalyses],
      progress: 0,
      results: [],
      errors: []
    }))

    for (let i = 0; i < selectedAnalyses.length; i++) {
      const analysisId = selectedAnalyses[i]
      setAnalysisState(prev => ({
        ...prev,
        progress: (i / selectedAnalyses.length) * 100,
        queuedAnalyses: prev.queuedAnalyses.filter(id => id !== analysisId)
      }))

      await runSingleAnalysis(analysisId)
      
      // Small delay between analyses
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setAnalysisState(prev => ({
      ...prev,
      isRunning: false,
      currentAnalysis: null,
      progress: 100,
      queuedAnalyses: []
    }))
  }, [selectedAnalyses, coordinates, runSingleAnalysis])

  // Clear results
  const clearResults = useCallback(() => {
    setAnalysisState({
      isRunning: false,
      currentAnalysis: null,
      progress: 0,
      results: [],
      errors: [],
      queuedAnalyses: []
    })
  }, [])

  // Toggle analysis selection
  const toggleAnalysis = useCallback((analysisId: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId)
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    )
  }, [])

  // Render analysis method card
  const renderAnalysisMethod = (method: typeof ANALYSIS_METHODS[0]) => {
    const Icon = method.icon
    const isSelected = selectedAnalyses.includes(method.id)
    const isRunning = analysisState.currentAnalysis === method.id
    const hasResult = analysisState.results.some(r => r.analysisType.includes(method.id))
    const hasError = analysisState.errors.some(e => e.includes(method.name))

    return (
      <Card 
        key={method.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isRunning ? 'bg-blue-50' : ''}`}
        onClick={() => !analysisState.isRunning && toggleAnalysis(method.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${isRunning ? 'animate-pulse' : ''}`} />
              <CardTitle className="text-sm">{method.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${CATEGORY_COLORS[method.category]} text-white`}
              >
                {CATEGORY_NAMES[method.category]}
              </Badge>
              {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
              {hasResult && <CheckCircle className="h-4 w-4 text-green-500" />}
              {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs mb-2">
            {method.description}
          </CardDescription>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Est. Time: {method.estimatedTime}</span>
            <Checkbox 
              checked={isSelected}
              onChange={() => {}}
              className="pointer-events-none"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group methods by category
  const groupedMethods = ANALYSIS_METHODS.reduce((acc, method) => {
    if (!acc[method.category]) acc[method.category] = []
    acc[method.category].push(method)
    return acc
  }, {} as Record<string, typeof ANALYSIS_METHODS>)

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="select">Select Analysis</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="results">Results ({analysisState.results.length})</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Analysis Methods</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAnalyses(ANALYSIS_METHODS.map(m => m.id))}
                disabled={analysisState.isRunning}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAnalyses([])}
                disabled={analysisState.isRunning}
              >
                Clear All
              </Button>
            </div>
          </div>

          {Object.entries(groupedMethods).map(([category, methods]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {methods.map(renderAnalysisMethod)}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedAnalyses.length} analysis methods selected
              {coordinates && (
                <span className="ml-2">
                  • Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={clearResults}
                disabled={analysisState.isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
              <Button
                onClick={runBatchAnalysis}
                disabled={analysisState.isRunning || selectedAnalyses.length === 0 || !coordinates}
              >
                {analysisState.isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Selected Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Options</CardTitle>
              <CardDescription>Configure analysis parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Depth</label>
                  <Select 
                    value={analysisOptions.analysisDepth} 
                    onValueChange={(value: any) => setAnalysisOptions(prev => ({ ...prev, analysisDepth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick Analysis</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="specialized">Specialized Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confidence Threshold: {analysisOptions.confidenceThreshold}
                  </label>
                  <Slider
                    value={[analysisOptions.confidenceThreshold]}
                    onValueChange={([value]) => setAnalysisOptions(prev => ({ ...prev, confidenceThreshold: value }))}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Options</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={analysisOptions.useGPT4Vision}
                      onCheckedChange={(checked) => setAnalysisOptions(prev => ({ ...prev, useGPT4Vision: !!checked }))}
                    />
                    <span className="text-sm">GPT-4 Vision</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={analysisOptions.useLidarFusion}
                      onCheckedChange={(checked) => setAnalysisOptions(prev => ({ ...prev, useLidarFusion: !!checked }))}
                    />
                    <span className="text-sm">LIDAR Fusion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={analysisOptions.useKANNetworks}
                      onCheckedChange={(checked) => setAnalysisOptions(prev => ({ ...prev, useKANNetworks: !!checked }))}
                    />
                    <span className="text-sm">KAN Networks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {analysisState.results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No analysis results yet</p>
                <p className="text-sm text-gray-400">Run some analyses to see results here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analysisState.results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {ANALYSIS_METHODS.find(m => result.analysisType.includes(m.id))?.name || result.analysisType}
                      </CardTitle>
                      <Badge variant={result.confidence > 0.8 ? 'default' : result.confidence > 0.6 ? 'secondary' : 'destructive'}>
                        {(result.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                    <CardDescription>
                      Completed at {new Date(result.timestamp).toLocaleString()} • {result.processingTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Agents Used</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.agentsUsed.map(agent => (
                            <Badge key={agent} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Data Sources</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.dataSources.map(source => (
                            <Badge key={source} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {result.results && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Analysis Results</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
                          <pre>{JSON.stringify(result.results, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Status</CardTitle>
              <CardDescription>Current analysis progress and system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisState.isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {analysisState.currentAnalysis ? 
                        `Running: ${ANALYSIS_METHODS.find(m => m.id === analysisState.currentAnalysis)?.name}` :
                        'Processing...'
                      }
                    </span>
                    <span className="text-sm text-gray-500">{analysisState.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysisState.progress} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisState.results.length}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analysisState.errors.length}</div>
                  <div className="text-sm text-gray-500">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisState.queuedAnalyses.length}</div>
                  <div className="text-sm text-gray-500">Queued</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedAnalyses.length}</div>
                  <div className="text-sm text-gray-500">Selected</div>
                </div>
              </div>

              {analysisState.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors</h4>
                  <div className="space-y-1">
                    {analysisState.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 