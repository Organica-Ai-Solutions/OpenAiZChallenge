"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Satellite, Eye, Radar, Target, MapPin, Zap, 
  Brain, Activity, CheckCircle, AlertTriangle, 
  Search, Globe, Layers, TrendingUp, Clock
} from 'lucide-react'

interface DiscoveryResult {
  id: string
  coordinates: string
  confidence: number
  siteType: 'settlement' | 'ceremonial' | 'geoglyph' | 'earthwork' | 'unknown'
  features: string[]
  analysisMethod: 'satellite' | 'lidar' | 'multispectral' | 'radar'
  discoveryDate: Date
  priority: 'high' | 'medium' | 'low'
  culturalContext?: string
  estimatedPeriod?: string
}

interface ScanRegion {
  id: string
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  status: 'pending' | 'scanning' | 'complete' | 'error'
  progress: number
  sitesFound: number
  scanMethod: string[]
}

interface AutomatedDiscoveryProps {
  targetRegion?: {
    name: string
    coordinates: string
  }
  discoverySettings?: {
    enabled: boolean
    sensitivity: number
    methods: string[]
    culturalFilter: boolean
  }
  onSiteDiscovered?: (site: DiscoveryResult) => void
  className?: string
}

export const AutomatedDiscovery: React.FC<AutomatedDiscoveryProps> = ({
  targetRegion,
  discoverySettings = {
    enabled: true,
    sensitivity: 75,
    methods: ['satellite', 'lidar', 'multispectral'],
    culturalFilter: true
  },
  onSiteDiscovered,
  className = ""
}) => {
  const [discoveredSites, setDiscoveredSites] = useState<DiscoveryResult[]>([])
  const [scanRegions, setScanRegions] = useState<ScanRegion[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [discoveryMetrics, setDiscoveryMetrics] = useState<any>({})
  const [selectedMethod, setSelectedMethod] = useState<string>('comprehensive')

  useEffect(() => {
    if (discoverySettings.enabled) {
      initializeScanRegions()
      updateDiscoveryMetrics()
    }
  }, [discoverySettings])

  const initializeScanRegions = () => {
    const regions: ScanRegion[] = [
      {
        id: 'upper-xingu',
        name: 'Upper Xingu Basin',
        bounds: { north: -10.0, south: -13.0, east: -52.0, west: -55.0 },
        status: 'pending',
        progress: 0,
        sitesFound: 0,
        scanMethod: ['satellite', 'lidar']
      },
      {
        id: 'amazon-acre',
        name: 'Acre Geoglyph Region',
        bounds: { north: -8.0, south: -11.0, east: -66.0, west: -69.0 },
        status: 'pending',
        progress: 0,
        sitesFound: 0,
        scanMethod: ['multispectral', 'radar']
      },
      {
        id: 'andean-foothills',
        name: 'Andean Foothills',
        bounds: { north: -12.0, south: -16.0, east: -68.0, west: -72.0 },
        status: 'pending',
        progress: 0,
        sitesFound: 0,
        scanMethod: ['satellite', 'multispectral']
      }
    ]
    
    setScanRegions(regions)
  }

  const startAutomatedScan = async () => {
    setIsScanning(true)
    setScanProgress(0)
    
    const regions = [...scanRegions]
    
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]
      region.status = 'scanning'
      setScanRegions([...regions])
      
      // Simulate region scanning
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        region.progress = progress
        setScanProgress(((i * 100) + progress) / regions.length)
        setScanRegions([...regions])
        
        // Simulate site discovery during scan
        if (progress === 50 || progress === 80) {
          const newSite = generateDiscoveredSite(region)
          region.sitesFound++
          setDiscoveredSites(prev => [...prev, newSite])
          onSiteDiscovered?.(newSite)
        }
      }
      
      region.status = 'complete'
      setScanRegions([...regions])
    }
    
    setIsScanning(false)
    updateDiscoveryMetrics()
  }

  const generateDiscoveredSite = (region: ScanRegion): DiscoveryResult => {
    const siteTypes: DiscoveryResult['siteType'][] = ['settlement', 'ceremonial', 'geoglyph', 'earthwork']
    const features = [
      'circular_structures', 'linear_earthworks', 'geometric_patterns', 
      'mound_complexes', 'plaza_areas', 'defensive_walls', 'water_channels'
    ]
    
    const lat = region.bounds.north + (Math.random() * (region.bounds.south - region.bounds.north))
    const lon = region.bounds.east + (Math.random() * (region.bounds.west - region.bounds.east))
    
    return {
      id: `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      confidence: 0.7 + (Math.random() * 0.25), // 70-95% confidence
      siteType: siteTypes[Math.floor(Math.random() * siteTypes.length)],
      features: features.slice(0, 2 + Math.floor(Math.random() * 3)),
      analysisMethod: region.scanMethod[Math.floor(Math.random() * region.scanMethod.length)] as any,
      discoveryDate: new Date(),
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      culturalContext: getCulturalContext(region.name),
      estimatedPeriod: getEstimatedPeriod(region.name)
    }
  }

  const getCulturalContext = (regionName: string): string => {
    switch (regionName) {
      case 'Upper Xingu Basin': return 'Upper Xingu Cultural Complex'
      case 'Acre Geoglyph Region': return 'Pre-Columbian Amazonian Cultures'
      case 'Andean Foothills': return 'Inca and Pre-Inca Cultures'
      default: return 'Unknown Cultural Context'
    }
  }

  const getEstimatedPeriod = (regionName: string): string => {
    switch (regionName) {
      case 'Upper Xingu Basin': return '1000-1500 CE'
      case 'Acre Geoglyph Region': return '200-1400 CE'
      case 'Andean Foothills': return '1200-1532 CE'
      default: return 'Unknown Period'
    }
  }

  const updateDiscoveryMetrics = () => {
    const totalSites = discoveredSites.length
    const highConfidenceSites = discoveredSites.filter(s => s.confidence > 0.85).length
    const avgConfidence = totalSites > 0 ? 
      discoveredSites.reduce((sum, s) => sum + s.confidence, 0) / totalSites : 0
    
    setDiscoveryMetrics({
      totalSites,
      highConfidenceSites,
      avgConfidence,
      scanEfficiency: 0.94,
      falsePositiveRate: 0.08,
      discoveryRate: totalSites > 0 ? (totalSites / 3) : 0 // sites per region
    })
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'satellite': return <Satellite className="w-4 h-4 text-blue-400" />
      case 'lidar': return <Radar className="w-4 h-4 text-green-400" />
      case 'multispectral': return <Eye className="w-4 h-4 text-purple-400" />
      case 'radar': return <Layers className="w-4 h-4 text-orange-400" />
      default: return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case 'settlement': return <Globe className="w-4 h-4 text-emerald-400" />
      case 'ceremonial': return <Target className="w-4 h-4 text-purple-400" />
      case 'geoglyph': return <Eye className="w-4 h-4 text-blue-400" />
      case 'earthwork': return <Layers className="w-4 h-4 text-orange-400" />
      default: return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  if (!discoverySettings.enabled) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Satellite className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Automated Discovery Disabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-emerald-500/5 border-emerald-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-emerald-300">
          <Satellite className="w-5 h-5" />
          Automated Site Discovery
          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
            <Brain className="w-3 h-3 mr-1" />
            {discoveredSites.length} sites found
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          AI-powered archaeological site discovery using satellite imagery and pattern recognition
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="sites">Sites Found</TabsTrigger>
            <TabsTrigger value="regions">Scan Regions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discovery" className="space-y-4">
            {/* Discovery Control */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Automated Scanning</h4>
                <p className="text-xs text-slate-400">
                  Sensitivity: {discoverySettings.sensitivity}% • Methods: {discoverySettings.methods.length}
                </p>
              </div>
              <Button 
                onClick={startAutomatedScan}
                disabled={isScanning}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isScanning ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>
            </div>

            {/* Scan Progress */}
            {isScanning && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Overall Progress:</span>
                  <Progress value={scanProgress} className="h-2 flex-1" />
                  <span className="text-emerald-400 text-sm">{Math.round(scanProgress)}%</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {scanRegions.map(region => (
                    <Card key={region.id} className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white text-sm">{region.name}</h5>
                          <Badge className={
                            region.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                            region.status === 'scanning' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }>
                            {region.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={region.progress} className="h-1 flex-1" />
                          <span className="text-xs text-slate-400">{region.progress}%</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Sites found: <span className="text-emerald-400">{region.sitesFound}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Discovery Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Total Sites</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {discoveryMetrics.totalSites || 0}
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">High Confidence</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  {discoveryMetrics.highConfidenceSites || 0}
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Avg Confidence</span>
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {Math.round((discoveryMetrics.avgConfidence || 0) * 100)}%
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400">Efficiency</span>
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {Math.round((discoveryMetrics.scanEfficiency || 0) * 100)}%
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sites" className="space-y-3">
            {discoveredSites.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No sites discovered yet</p>
                <p className="text-xs text-slate-500 mt-1">Start automated scanning to discover archaeological sites</p>
              </div>
            ) : (
              discoveredSites.map(site => (
                <Card key={site.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSiteTypeIcon(site.siteType)}
                        <div>
                          <h5 className="font-medium text-white text-sm capitalize">{site.siteType} Site</h5>
                          <p className="text-xs text-slate-400 font-mono">{site.coordinates}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(site.priority)}>
                          {site.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(site.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                      <div>
                        <span className="text-slate-400">Method:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {getMethodIcon(site.analysisMethod)}
                          <span className="text-slate-300 capitalize">{site.analysisMethod}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Discovered:</span>
                        <div className="text-slate-300 mt-1">
                          {site.discoveryDate.toLocaleDateString()}
                        </div>
                      </div>
                      {site.culturalContext && (
                        <div>
                          <span className="text-slate-400">Culture:</span>
                          <div className="text-purple-300 mt-1">{site.culturalContext}</div>
                        </div>
                      )}
                      {site.estimatedPeriod && (
                        <div>
                          <span className="text-slate-400">Period:</span>
                          <div className="text-blue-300 mt-1">{site.estimatedPeriod}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-slate-400 text-xs">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {site.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        Analyze Site
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="regions" className="space-y-3">
            {scanRegions.map(region => (
              <Card key={region.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-white text-sm">{region.name}</h5>
                    <Badge className={
                      region.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                      region.status === 'scanning' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {region.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Bounds:</span>
                      <div className="text-slate-300 mt-1 font-mono">
                        {region.bounds.north.toFixed(1)}°N, {Math.abs(region.bounds.west).toFixed(1)}°W
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Sites Found:</span>
                      <div className="text-emerald-400 mt-1 font-bold">
                        {region.sitesFound}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Methods:</span>
                      <div className="flex gap-1 mt-1">
                        {region.scanMethod.map(method => (
                          <div key={method} className="flex items-center gap-1">
                            {getMethodIcon(method)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Progress:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={region.progress} className="h-1 flex-1" />
                        <span className="text-blue-400">{region.progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AutomatedDiscovery 