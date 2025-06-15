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

interface KANRecommendationEngineProps {
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

export const KANRecommendationEngine: React.FC<KANRecommendationEngineProps> = ({
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
    if (kanSettings.enabled && analysisContext.coordinates) {
      generateRecommendations()
    }
  }, [analysisContext, kanSettings])

  const generateRecommendations = async () => {
    setIsGenerating(true)
    
    // Simulate intelligent recommendation generation based on context
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const contextualRecommendations = generateContextualRecommendations()
    setRecommendations(contextualRecommendations)
    setIsGenerating(false)
  }

  const generateContextualRecommendations = (): RecommendationData[] => {
    const baseRecommendations: RecommendationData[] = []
    
    // Generate site-specific recommendations
    if (analysisContext.coordinates) {
      const [lat, lon] = analysisContext.coordinates.split(',').map(s => parseFloat(s.trim()))
      
      if (lat < -10 && lon > -55) {
        // Upper Xingu region
        baseRecommendations.push({
          id: 'upper-xingu-sites',
          type: 'site',
          title: 'Explore Related Upper Xingu Sites',
          description: 'Investigate connected Kamayurá and Yawalapiti settlements with similar cultural patterns',
          relevance: 0.94,
          coordinates: '-11.8, -54.2',
          culturalContext: 'Upper Xingu Cultural Complex',
          timeframe: '1000-1500 CE',
          priority: 'high',
          reasoning: 'KAN analysis identifies strong cultural connectivity patterns in this region',
          actionable: true
        })
        
        baseRecommendations.push({
          id: 'xingu-pottery',
          type: 'method',
          title: 'Ceramic Analysis Methodology',
          description: 'Apply specialized ceramic analysis techniques for Upper Xingu pottery traditions',
          relevance: 0.87,
          culturalContext: 'Kuikuro ceramic traditions',
          priority: 'medium',
          reasoning: 'Cultural context analysis suggests ceramic evidence may be present',
          actionable: true
        })
      } else if (lat < -15 && lon < -70) {
        // Andean region
        baseRecommendations.push({
          id: 'inca-road-network',
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
        
        baseRecommendations.push({
          id: 'terrace-agriculture',
          type: 'research',
          title: 'Agricultural Terrace Documentation',
          description: 'Document traditional Andean agricultural techniques and water management',
          relevance: 0.85,
          culturalContext: 'Quechua agricultural knowledge',
          priority: 'medium',
          reasoning: 'Indigenous knowledge integration suggests agricultural significance',
          actionable: true
        })
      }
    }
    
    // Cultural context recommendations
    if (kanSettings.culturalContext && analysisContext.culturalReferences?.length) {
      analysisContext.culturalReferences.forEach(culture => {
        if (culture.toLowerCase().includes('moche')) {
          baseRecommendations.push({
            id: 'moche-iconography',
            type: 'research',
            title: 'Moche Iconographic Analysis',
            description: 'Analyze ceramic and mural iconography for religious and political symbolism',
            relevance: 0.89,
            culturalContext: 'Moche civilization (100-700 CE)',
            timeframe: '100-700 CE',
            priority: 'high',
            reasoning: 'Cultural reference analysis indicates Moche artistic traditions',
            actionable: true
          })
        }
        
        if (culture.toLowerCase().includes('nazca')) {
          baseRecommendations.push({
            id: 'nazca-geoglyphs',
            type: 'method',
            title: 'Geoglyph Mapping Techniques',
            description: 'Apply advanced remote sensing for large-scale geoglyph detection',
            relevance: 0.92,
            culturalContext: 'Nazca culture (100-800 CE)',
            timeframe: '100-800 CE',
            priority: 'high',
            reasoning: 'Geometric pattern analysis suggests potential geoglyph presence',
            actionable: true
          })
        }
      })
    }
    
    // Temporal reasoning recommendations
    if (kanSettings.temporalReasoning) {
      baseRecommendations.push({
        id: 'chronological-sequence',
        type: 'method',
        title: 'Radiocarbon Dating Strategy',
        description: 'Implement systematic dating to establish chronological sequence',
        relevance: 0.83,
        priority: 'medium',
        reasoning: 'Temporal analysis indicates complex stratigraphy requiring dating',
        actionable: true
      })
      
      baseRecommendations.push({
        id: 'cultural-continuity',
        type: 'research',
        title: 'Cultural Continuity Assessment',
        description: 'Investigate evidence of cultural continuity and change over time',
        relevance: 0.81,
        priority: 'medium',
        reasoning: 'Multi-period analysis suggests cultural transition patterns',
        actionable: true
      })
    }
    
    // Indigenous knowledge recommendations
    if (kanSettings.indigenousKnowledge) {
      baseRecommendations.push({
        id: 'community-consultation',
        type: 'research',
        title: 'Community Knowledge Integration',
        description: 'Engage with local indigenous communities for traditional knowledge',
        relevance: 0.95,
        priority: 'high',
        reasoning: 'Indigenous knowledge integration identifies community expertise',
        actionable: true
      })
      
      baseRecommendations.push({
        id: 'traditional-practices',
        type: 'research',
        title: 'Traditional Practice Documentation',
        description: 'Document traditional land use and resource management practices',
        relevance: 0.88,
        priority: 'medium',
        reasoning: 'Traditional knowledge analysis reveals ongoing cultural practices',
        actionable: true
      })
    }
    
    // Add general methodological recommendations
    baseRecommendations.push({
      id: 'multi-spectral-analysis',
      type: 'method',
      title: 'Multi-spectral Satellite Analysis',
      description: 'Use advanced satellite imagery for feature detection and monitoring',
      relevance: 0.86,
      priority: 'medium',
      reasoning: 'KAN analysis suggests spectral anomalies may reveal archaeological features',
      actionable: true
    })
    
    baseRecommendations.push({
      id: 'landscape-archaeology',
      type: 'method',
      title: 'Landscape Archaeology Approach',
      description: 'Analyze site within broader landscape and settlement patterns',
      relevance: 0.84,
      priority: 'medium',
      reasoning: 'Spatial analysis indicates significance of landscape relationships',
      actionable: true
    })
    
    return baseRecommendations.sort((a, b) => b.relevance - a.relevance)
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
            AI-Generated
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          Intelligent research suggestions based on KAN analysis • {recommendations.length} recommendations
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'site', 'culture', 'method', 'research'].map(category => (
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
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-violet-300">Generating intelligent recommendations...</p>
              <p className="text-xs text-slate-400 mt-1">KAN analysis in progress</p>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {!isGenerating && filteredRecommendations.length > 0 && (
          <div className="space-y-3">
            {filteredRecommendations.map((recommendation, index) => (
              <Card 
                key={recommendation.id}
                className="bg-slate-800/30 border-slate-700/50 hover:border-violet-500/50 transition-all duration-200 cursor-pointer"
                onClick={() => onRecommendationSelect?.(recommendation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(recommendation.type)}
                      <h4 className="font-medium text-white text-sm">{recommendation.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(recommendation.relevance * 100)}% match
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3">{recommendation.description}</p>
                  
                  {/* Context Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {recommendation.culturalContext && (
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span className="text-slate-400">Culture:</span>
                        <span className="text-purple-300">{recommendation.culturalContext}</span>
                      </div>
                    )}
                    {recommendation.timeframe && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-400">Period:</span>
                        <span className="text-blue-300">{recommendation.timeframe}</span>
                      </div>
                    )}
                    {recommendation.coordinates && (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Location:</span>
                        <span className="text-emerald-300 font-mono">{recommendation.coordinates}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3 text-violet-400" />
                      <span className="text-slate-400">Relevance:</span>
                      <span className="text-violet-300">{Math.round(recommendation.relevance * 100)}%</span>
                    </div>
                  </div>
                  
                  {/* KAN Reasoning */}
                  <div className="p-2 bg-violet-500/10 border border-violet-500/30 rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span className="text-violet-300 font-medium">KAN Reasoning:</span>
                    </div>
                    <p className="text-slate-300">{recommendation.reasoning}</p>
                  </div>
                  
                  {recommendation.actionable && (
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm" 
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRecommendationSelect?.(recommendation)
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No recommendations for selected categories</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting different categories or provide analysis context</p>
          </div>
        )}

        {/* Regenerate Button */}
        {!isGenerating && recommendations.length > 0 && (
          <div className="pt-4 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRecommendations}
              className="w-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              Regenerate Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default KANRecommendationEngine 