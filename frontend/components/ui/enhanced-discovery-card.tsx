"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Eye, MessageSquare, BarChart3, ExternalLink } from "lucide-react"
import { useUnifiedSystem } from "../../src/contexts/UnifiedSystemContext"

interface DiscoveryCardProps {
  discovery: {
    id: string
    name: string
    coordinates: string
    confidence: number
    type: string
    description: string
    cultural_significance: string
    discovery_date: string
    data_sources: string[]
  }
  showNavigationActions?: boolean
}

export function EnhancedDiscoveryCard({ discovery, showNavigationActions = true }: DiscoveryCardProps) {
  const { actions } = useUnifiedSystem()

  // Parse coordinates
  const [lat, lon] = discovery.coordinates.split(',').map(c => parseFloat(c.trim()))

  // Convert discovery to archaeological site format
  const site = {
    id: discovery.id,
    name: discovery.name,
    coordinates: discovery.coordinates,
    confidence: discovery.confidence,
    type: discovery.type,
    discovery_date: discovery.discovery_date,
    cultural_significance: discovery.cultural_significance,
    data_sources: discovery.data_sources
  }

  const handleViewOnMap = () => {
    console.log('🗺️ Navigating to map for discovery:', discovery.name)
    actions.navigateToSite(site, 'map')
  }

  const handleVisionAnalysis = () => {
    console.log('🧠 Navigating to vision agent for discovery:', discovery.name)
    actions.navigateToSite(site, 'vision')
  }

  const handleChatAboutSite = () => {
    console.log('💬 Navigating to chat for discovery:', discovery.name)
    actions.navigateToSite(site, 'chat')
  }

  const handleSelectCoordinates = () => {
    console.log('📍 Selecting coordinates for discovery:', discovery.name)
    actions.selectCoordinates(lat, lon, `discovery_${discovery.id}`)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🏛️</span>
            <span className="text-white">{discovery.name}</span>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            {Math.round(discovery.confidence * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Site Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">{discovery.coordinates}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectCoordinates}
              className="w-6 h-6 p-0 hover:bg-slate-700"
              title="Select these coordinates"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="text-sm text-slate-400">
            <span className="font-medium">Type:</span> {discovery.type}
          </div>
          
          <div className="text-sm text-slate-400">
            <span className="font-medium">Discovered:</span> {discovery.discovery_date}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">
            {discovery.description}
          </p>
        </div>

        {/* Cultural Significance */}
        <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-500/30">
          <h5 className="text-sm font-medium text-amber-300 mb-2">Cultural Significance</h5>
          <p className="text-xs text-amber-200/80">
            {discovery.cultural_significance}
          </p>
        </div>

        {/* Data Sources */}
        <div className="flex flex-wrap gap-1">
          {discovery.data_sources.map((source, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>

        {/* Navigation Actions */}
        {showNavigationActions && (
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOnMap}
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Map
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisionAnalysis}
              className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
            >
              <Eye className="w-4 h-4 mr-1" />
              Vision
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatAboutSite}
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
          </div>
        )}

        {/* Quick Analysis Button */}
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            console.log('🎯 Triggering comprehensive analysis for:', discovery.name)
            actions.triggerVisionAnalysis({ lat, lon })
              .then(() => actions.navigateToVision({ lat, lon }))
          }}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Run Complete Analysis & Navigate
        </Button>
      </CardContent>
    </Card>
  )
} 