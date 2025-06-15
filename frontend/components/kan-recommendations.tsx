"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Brain, MapPin, Clock, Users, Lightbulb, TrendingUp, Search } from 'lucide-react'

interface RecommendationData {
  id: string
  type: 'site' | 'culture' | 'period' | 'method' | 'research'
  title: string
  description: string
  relevance: number
  coordinates?: string
  culturalContext?: string
  timeframe?: string
  priority: 'high' | 'medium' | 'low'
  reasoning: string
  actionable: boolean
}

interface KANRecommendationsProps {
  analysisContext?: {
    coordinates?: string
    culturalReferences?: string[]
    temporalReferences?: string[]
    confidence?: number
  }
  kanSettings?: {
    enabled: boolean
    culturalContext: boolean
    temporalReasoning: boolean
    indigenousKnowledge: boolean
  }
  onRecommendationSelect?: (recommendation: RecommendationData) => void
  className?: string
}

export const KANRecommendations: React.FC<KANRecommendationsProps> = ({
  analysisContext = {},
  kanSettings = {
    enabled: true,
    culturalContext: true,
    temporalReasoning: true,
    indigenousKnowledge: true
  },
  onRecommendationSelect,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])

  useEffect(() => {
    if (kanSettings.enabled) {
      generateRecommendations()
    }
  }, [analysisContext, kanSettings])

  const generateRecommendations = async () => {
    setIsGenerating(true)
    
    // Simulate intelligent recommendation generation
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const contextualRecommendations = generateContextualRecommendations()
    setRecommendations(contextualRecommendations)
    setIsGenerating(false)
  }

  const generateContextualRecommendations = (): RecommendationData[] => {
    const recs: RecommendationData[] = []
    
    // Site-specific recommendations
    if (analysisContext.coordinates) {
      const [lat, lon] = analysisContext.coordinates.split(',').map(s => parseFloat(s.trim()))
      
      if (lat < -10 && lon > -55) {
        recs.push({
          id: 'upper-xingu-sites',
          type: 'site',
          title: 'Explore Upper Xingu Settlement Network',
          description: 'Investigate connected Kamayurá and Yawalapiti settlements with similar cultural patterns',
          relevance: 0.94,
          coordinates: '-11.8, -54.2',
          culturalContext: 'Upper Xingu Cultural Complex',
          timeframe: '1000-1500 CE',
          priority: 'high',
          reasoning: 'KAN analysis identifies strong cultural connectivity patterns in this region',
          actionable: true
        })
      } else if (lat < -15 && lon < -70) {
        recs.push({
          id: 'inca-network',
          type: 'site',
          title: 'Qhapaq Ñan Road Network Analysis',
          description: 'Investigate nearby Inca road segments and administrative centers',
          relevance: 0.91,
          coordinates: lat + ', ' + lon,
          culturalContext: 'Inca Empire (Tawantinsuyu)',
          timeframe: '1438-1532 CE',
          priority: 'high',
          reasoning: 'Temporal reasoning indicates potential Inca period significance',
          actionable: true
        })
      }
    }
    
    // Cultural recommendations
    if (kanSettings.culturalContext) {
      recs.push({
        id: 'community-consultation',
        type: 'research',
        title: 'Indigenous Community Consultation',
        description: 'Engage with local communities for traditional knowledge and cultural protocols',
        relevance: 0.95,
        priority: 'high',
        reasoning: 'Indigenous knowledge integration identifies community expertise',
        actionable: true
      })
      
      recs.push({
        id: 'cultural-mapping',
        type: 'method',
        title: 'Cultural Landscape Mapping',
        description: 'Map traditional land use patterns and sacred sites',
        relevance: 0.88,
        culturalContext: 'Traditional knowledge systems',
        priority: 'medium',
        reasoning: 'Cultural context analysis reveals landscape significance',
        actionable: true
      })
    }
    
    // Temporal recommendations
    if (kanSettings.temporalReasoning) {
      recs.push({
        id: 'chronological-dating',
        type: 'method',
        title: 'Multi-proxy Dating Strategy',
        description: 'Implement radiocarbon, OSL, and ceramic seriation for temporal control',
        relevance: 0.83,
        priority: 'medium',
        reasoning: 'Temporal analysis indicates complex stratigraphy requiring dating',
        actionable: true
      })
    }
    
    // Method recommendations
    recs.push({
      id: 'lidar-analysis',
      type: 'method',
      title: 'LiDAR Forest Penetration Analysis',
      description: 'Use LiDAR to detect hidden structures beneath forest canopy',
      relevance: 0.89,
      priority: 'high',
      reasoning: 'Vegetation analysis suggests potential concealed features',
      actionable: true
    })
    
    recs.push({
      id: 'geophysical-survey',
      type: 'method',
      title: 'Ground Penetrating Radar Survey',
      description: 'Apply GPR to map subsurface archaeological features',
      relevance: 0.85,
      priority: 'medium',
      reasoning: 'Soil analysis indicates potential buried remains',
      actionable: true
    })
    
    recs.push({
      id: 'environmental-reconstruction',
      type: 'research',
      title: 'Paleoenvironmental Reconstruction',
      description: 'Analyze pollen and sediment cores for ancient climate data',
      relevance: 0.81,
      timeframe: 'Last 2000 years',
      priority: 'medium',
      reasoning: 'Environmental context crucial for understanding site selection',
      actionable: true
    })
    
    return recs.sort((a, b) => b.relevance - a.relevance)
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'site': return <MapPin className="w-4 h-4 text-emerald-400" />
      case 'culture': return <Users className="w-4 h-4 text-purple-400" />
      case 'period': return <Clock className="w-4 h-4 text-blue-400" />
      case 'method': return <Search className="w-4 h-4 text-orange-400" />
      case 'research': return <Lightbulb className="w-4 h-4 text-yellow-400" />
      default: return <Brain className="w-4 h-4 text-violet-400" />
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

  const filteredRecommendations = recommendations.filter(rec => 
    selectedCategories.includes('all') || selectedCategories.includes(rec.type)
  )

  if (!kanSettings.enabled) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">KAN Recommendations Disabled</p>
              <p className="text-xs text-slate-500 mt-1">Enable KAN reasoning to see intelligent research suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-violet-500/5 border-violet-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-violet-300">
          <Sparkles className="w-5 h-5" />
          KAN Research Recommendations
          <Badge className="bg-violet-500/20 text-violet-300 text-xs">
            <Brain className="w-3 h-3 mr-1" />
            {recommendations.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'site', 'method', 'research'].map(category => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (category === 'all') {
                  setSelectedCategories(['all'])
                } else {
                  setSelectedCategories(prev => 
                    prev.includes(category) 
                      ? prev.filter(c => c !== category)
                      : [...prev.filter(c => c !== 'all'), category]
                  )
                }
              }}
              className="text-xs"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-violet-300">Generating intelligent recommendations...</p>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {!isGenerating && filteredRecommendations.map((rec, index) => (
          <Card 
            key={rec.id}
            className="bg-slate-800/30 border-slate-700/50 hover:border-violet-500/50 transition-all duration-200 cursor-pointer"
            onClick={() => onRecommendationSelect?.(rec)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRecommendationIcon(rec.type)}
                  <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.relevance * 100)}%
                  </Badge>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
              
              {/* Context Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs">
                {rec.culturalContext && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-400" />
                    <span className="text-slate-400">Culture:</span>
                    <span className="text-purple-300">{rec.culturalContext}</span>
                  </div>
                )}
                {rec.timeframe && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-400">Period:</span>
                    <span className="text-blue-300">{rec.timeframe}</span>
                  </div>
                )}
                {rec.coordinates && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-400">Location:</span>
                    <span className="text-emerald-300 font-mono">{rec.coordinates}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-violet-400" />
                  <span className="text-slate-400">Relevance:</span>
                  <span className="text-violet-300">{Math.round(rec.relevance * 100)}%</span>
                </div>
              </div>
              
              {/* KAN Reasoning */}
              <div className="p-2 bg-violet-500/10 border border-violet-500/30 rounded text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span className="text-violet-300 font-medium">KAN Reasoning:</span>
                </div>
                <p className="text-slate-300">{rec.reasoning}</p>
              </div>
              
              {rec.actionable && (
                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                  >
                    Apply Recommendation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

export default KANRecommendations 