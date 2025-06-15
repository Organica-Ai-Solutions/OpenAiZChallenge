"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Satellite, Eye, Target, MapPin, Zap, 
  Brain, Activity, CheckCircle, Search, Globe
} from 'lucide-react'

interface DiscoveredSite {
  id: string
  coordinates: string
  confidence: number
  siteType: 'settlement' | 'ceremonial' | 'geoglyph' | 'earthwork'
  features: string[]
  method: 'satellite' | 'lidar' | 'multispectral'
  priority: 'high' | 'medium' | 'low'
  culturalContext?: string
}

interface SiteDiscoveryProps {
  discoverySettings?: {
    enabled: boolean
    sensitivity: number
    methods: string[]
  }
  onSiteDiscovered?: (site: DiscoveredSite) => void
  className?: string
}

export const SiteDiscovery: React.FC<SiteDiscoveryProps> = ({
  discoverySettings = {
    enabled: true,
    sensitivity: 75,
    methods: ['satellite', 'lidar', 'multispectral']
  },
  onSiteDiscovered,
  className = ""
}) => {
  const [discoveredSites, setDiscoveredSites] = useState<DiscoveredSite[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanRegion, setScanRegion] = useState('Upper Xingu Basin')

  const startDiscovery = async () => {
    setIsScanning(true)
    setScanProgress(0)
    
    // Simulate discovery process
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 400))
      setScanProgress(progress)
      
      // Simulate site discovery at certain progress points
      if (progress === 30 || progress === 60 || progress === 90) {
        const newSite = generateDiscoveredSite()
        setDiscoveredSites(prev => [...prev, newSite])
        onSiteDiscovered?.(newSite)
      }
    }
    
    setIsScanning(false)
  }

  const generateDiscoveredSite = (): DiscoveredSite => {
    const siteTypes: DiscoveredSite['siteType'][] = ['settlement', 'ceremonial', 'geoglyph', 'earthwork']
    const features = ['circular_structures', 'linear_earthworks', 'geometric_patterns', 'mound_complexes']
    const methods: DiscoveredSite['method'][] = ['satellite', 'lidar', 'multispectral']
    
    // Generate coordinates in Upper Xingu region
    const lat = -11.5 + (Math.random() * 2) // -11.5 to -9.5
    const lon = -53.5 + (Math.random() * 2) // -53.5 to -51.5
    
    return {
      id: `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      confidence: 0.7 + (Math.random() * 0.25), // 70-95% confidence
      siteType: siteTypes[Math.floor(Math.random() * siteTypes.length)],
      features: features.slice(0, 2 + Math.floor(Math.random() * 2)),
      method: methods[Math.floor(Math.random() * methods.length)],
      priority: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      culturalContext: 'Upper Xingu Cultural Complex'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'satellite': return <Satellite className="w-4 h-4 text-blue-400" />
      case 'lidar': return <Eye className="w-4 h-4 text-green-400" />
      case 'multispectral': return <Target className="w-4 h-4 text-purple-400" />
      default: return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case 'settlement': return <Globe className="w-4 h-4 text-emerald-400" />
      case 'ceremonial': return <Target className="w-4 h-4 text-purple-400" />
      case 'geoglyph': return <Eye className="w-4 h-4 text-blue-400" />
      case 'earthwork': return <MapPin className="w-4 h-4 text-orange-400" />
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
              <p className="text-slate-400">Site Discovery Disabled</p>
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
          AI-powered archaeological site discovery using satellite imagery
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Discovery Control */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Discovery Scan</h4>
            <p className="text-xs text-slate-400">
              Target: {scanRegion} • Sensitivity: {discoverySettings.sensitivity}%
            </p>
          </div>
          <Button 
            onClick={startDiscovery}
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
              <span className="text-sm text-slate-400">Scan Progress:</span>
              <Progress value={scanProgress} className="h-2 flex-1" />
              <span className="text-emerald-400 text-sm">{Math.round(scanProgress)}%</span>
            </div>
            
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-medium">Scanning in progress...</span>
              </div>
              <p className="text-slate-300 text-sm">
                Analyzing satellite imagery and detecting archaeological patterns
              </p>
            </div>
          </div>
        )}

        {/* Discovery Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Sites Found</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {discoveredSites.length}
            </div>
          </div>
          
          <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">High Priority</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {discoveredSites.filter(s => s.priority === 'high').length}
            </div>
          </div>
          
          <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Avg Confidence</span>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {discoveredSites.length > 0 ? 
                Math.round(discoveredSites.reduce((sum, s) => sum + s.confidence, 0) / discoveredSites.length * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Discovered Sites */}
        <div>
          <h4 className="font-medium text-white mb-3">Discovered Sites</h4>
          {discoveredSites.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No sites discovered yet</p>
              <p className="text-xs text-slate-500 mt-1">Start discovery scan to find archaeological sites</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discoveredSites.map(site => (
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
                          {getMethodIcon(site.method)}
                          <span className="text-slate-300 capitalize">{site.method}</span>
                        </div>
                      </div>
                      {site.culturalContext && (
                        <div>
                          <span className="text-slate-400">Culture:</span>
                          <div className="text-purple-300 mt-1">{site.culturalContext}</div>
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
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SiteDiscovery 