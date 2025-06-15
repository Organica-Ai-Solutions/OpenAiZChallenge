"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Brain, MapPin, Clock, Users, Lightbulb, Search } from 'lucide-react'

interface Recommendation {
  id: string
  type: 'site' | 'method' | 'research'
  title: string
  description: string
  relevance: number
  priority: 'high' | 'medium' | 'low'
  reasoning: string
}

interface RecommendationsProps {
  kanSettings?: {
    enabled: boolean
    culturalContext: boolean
    temporalReasoning: boolean
    indigenousKnowledge: boolean
  }
  analysisContext?: any
  className?: string
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  kanSettings = { enabled: true, culturalContext: true, temporalReasoning: true, indigenousKnowledge: true },
  analysisContext = {},
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (kanSettings.enabled) {
      generateRecommendations()
    }
  }, [kanSettings])

  const generateRecommendations = async () => {
    setIsGenerating(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const recs: Recommendation[] = [
      {
        id: 'community-consultation',
        type: 'research',
        title: 'Indigenous Community Consultation',
        description: 'Engage with local communities for traditional knowledge and cultural protocols',
        relevance: 0.95,
        priority: 'high',
        reasoning: 'Indigenous knowledge integration identifies community expertise'
      },
      {
        id: 'lidar-analysis',
        type: 'method',
        title: 'LiDAR Forest Penetration Analysis',
        description: 'Use LiDAR to detect hidden structures beneath forest canopy',
        relevance: 0.89,
        priority: 'high',
        reasoning: 'Vegetation analysis suggests potential concealed features'
      },
      {
        id: 'cultural-mapping',
        type: 'method',
        title: 'Cultural Landscape Mapping',
        description: 'Map traditional land use patterns and sacred sites',
        relevance: 0.88,
        priority: 'medium',
        reasoning: 'Cultural context analysis reveals landscape significance'
      },
      {
        id: 'geophysical-survey',
        type: 'method',
        title: 'Ground Penetrating Radar Survey',
        description: 'Apply GPR to map subsurface archaeological features',
        relevance: 0.85,
        priority: 'medium',
        reasoning: 'Soil analysis indicates potential buried remains'
      },
      {
        id: 'chronological-dating',
        type: 'method',
        title: 'Multi-proxy Dating Strategy',
        description: 'Implement radiocarbon, OSL, and ceramic seriation for temporal control',
        relevance: 0.83,
        priority: 'medium',
        reasoning: 'Temporal analysis indicates complex stratigraphy requiring dating'
      },
      {
        id: 'environmental-reconstruction',
        type: 'research',
        title: 'Paleoenvironmental Reconstruction',
        description: 'Analyze pollen and sediment cores for ancient climate data',
        relevance: 0.81,
        priority: 'medium',
        reasoning: 'Environmental context crucial for understanding site selection'
      }
    ]
    
    setRecommendations(recs)
    setIsGenerating(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'site': return <MapPin className="w-4 h-4 text-emerald-400" />
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

  if (!kanSettings.enabled) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">KAN Recommendations Disabled</p>
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
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-violet-300">Generating recommendations...</p>
            </div>
          </div>
        )}

        {!isGenerating && recommendations.map((rec) => (
          <Card 
            key={rec.id}
            className="bg-slate-800/30 border-slate-700/50 hover:border-violet-500/50 transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(rec.type)}
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
              
              <div className="p-2 bg-violet-500/10 border border-violet-500/30 rounded text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span className="text-violet-300 font-medium">KAN Reasoning:</span>
                </div>
                <p className="text-slate-300">{rec.reasoning}</p>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button 
                  size="sm" 
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                >
                  Apply Recommendation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

export default Recommendations 