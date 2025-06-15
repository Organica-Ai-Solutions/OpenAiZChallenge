"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, Calendar, TrendingUp, BarChart3, 
  Brain, Activity, Target, Users, Globe
} from 'lucide-react'

interface TemporalPeriod {
  id: string
  name: string
  startYear: number
  endYear: number
  culturalMarkers: string[]
  confidence: number
  siteCount: number
  significance: number
}

interface TemporalCorrelation {
  periodA: string
  periodB: string
  correlation: number
  sharedFeatures: string[]
  culturalContinuity: 'high' | 'medium' | 'low'
}

interface TemporalAnalysisProps {
  analysisData?: {
    coordinates?: string
    culturalContext?: string
  }
  temporalSettings?: {
    enabled: boolean
    periodRange: number
    correlationThreshold: number
  }
  className?: string
}

export const TemporalAnalysis: React.FC<TemporalAnalysisProps> = ({
  analysisData = {},
  temporalSettings = {
    enabled: true,
    periodRange: 2000,
    correlationThreshold: 0.7
  },
  className = ""
}) => {
  const [periods, setPeriods] = useState<TemporalPeriod[]>([])
  const [correlations, setCorrelations] = useState<TemporalCorrelation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  useEffect(() => {
    if (temporalSettings.enabled && analysisData.coordinates) {
      generateTemporalData()
    }
  }, [temporalSettings, analysisData])

  const generateTemporalData = () => {
    const temporalPeriods: TemporalPeriod[] = [
      {
        id: 'pre-ceramic',
        name: 'Pre-Ceramic Period',
        startYear: -3000,
        endYear: -1000,
        culturalMarkers: ['stone_tools', 'shell_middens', 'early_settlements'],
        confidence: 0.75,
        siteCount: 12,
        significance: 0.6
      },
      {
        id: 'early-ceramic',
        name: 'Early Ceramic Period',
        startYear: -1000,
        endYear: 500,
        culturalMarkers: ['ceramic_vessels', 'agricultural_tools', 'village_sites'],
        confidence: 0.85,
        siteCount: 28,
        significance: 0.8
      },
      {
        id: 'formative',
        name: 'Formative Period',
        startYear: 500,
        endYear: 1000,
        culturalMarkers: ['complex_ceramics', 'earthwork_construction', 'social_stratification'],
        confidence: 0.92,
        siteCount: 45,
        significance: 0.9
      },
      {
        id: 'classic',
        name: 'Classic Period',
        startYear: 1000,
        endYear: 1500,
        culturalMarkers: ['monumental_architecture', 'elaborate_burials', 'trade_networks'],
        confidence: 0.88,
        siteCount: 67,
        significance: 0.95
      },
      {
        id: 'late-period',
        name: 'Late Period',
        startYear: 1500,
        endYear: 1750,
        culturalMarkers: ['european_contact', 'metal_tools', 'cultural_synthesis'],
        confidence: 0.79,
        siteCount: 34,
        significance: 0.7
      }
    ]

    const temporalCorrelations: TemporalCorrelation[] = [
      {
        periodA: 'early-ceramic',
        periodB: 'formative',
        correlation: 0.87,
        sharedFeatures: ['ceramic_traditions', 'settlement_patterns', 'subsistence_strategies'],
        culturalContinuity: 'high'
      },
      {
        periodA: 'formative',
        periodB: 'classic',
        correlation: 0.93,
        sharedFeatures: ['earthwork_techniques', 'social_organization', 'ritual_practices'],
        culturalContinuity: 'high'
      },
      {
        periodA: 'classic',
        periodB: 'late-period',
        correlation: 0.65,
        sharedFeatures: ['settlement_locations', 'ceramic_styles'],
        culturalContinuity: 'medium'
      }
    ]

    setPeriods(temporalPeriods)
    setCorrelations(temporalCorrelations)
  }

  const runTemporalAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate temporal analysis process
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setAnalysisProgress(progress)
    }

    setIsAnalyzing(false)
  }

  const formatYear = (year: number): string => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`
    } else {
      return `${year} CE`
    }
  }

  const getCorrelationColor = (correlation: number): string => {
    if (correlation >= 0.8) return 'text-green-400 bg-green-500/20'
    if (correlation >= 0.6) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getContinuityColor = (continuity: string): string => {
    switch (continuity) {
      case 'high': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-red-400 bg-red-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  if (!temporalSettings.enabled) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Temporal Analysis Disabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-blue-500/5 border-blue-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <Clock className="w-5 h-5" />
          Temporal Correlation Analysis
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            <Brain className="w-3 h-3 mr-1" />
            {periods.length} periods
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          Multi-period archaeological analysis with temporal pattern recognition
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analysis Control */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Temporal Analysis</h4>
            <p className="text-xs text-slate-400">
              {analysisData.coordinates ? `Location: ${analysisData.coordinates}` : 'No coordinates provided'} • 
              Range: {temporalSettings.periodRange} years
            </p>
          </div>
          <Button 
            onClick={runTemporalAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Analysis Progress:</span>
              <Progress value={analysisProgress} className="h-2 flex-1" />
              <span className="text-blue-400 text-sm">{Math.round(analysisProgress)}%</span>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-blue-300 font-medium">Temporal correlation analysis in progress...</span>
              </div>
              <p className="text-slate-300 text-sm">
                Analyzing chronological patterns and cultural continuity
              </p>
            </div>
          </div>
        )}

        {/* Temporal Periods */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Temporal Periods
          </h4>
          <div className="space-y-3">
            {periods.map(period => (
              <Card key={period.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-white text-sm">{period.name}</h5>
                      <p className="text-xs text-slate-400">
                        {formatYear(period.startYear)} - {formatYear(period.endYear)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(period.confidence * 100)}% confidence
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                        {period.siteCount} sites
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 text-xs">Cultural Significance:</span>
                      <Progress value={period.significance * 100} className="h-1 flex-1" />
                      <span className="text-blue-400 text-xs">{Math.round(period.significance * 100)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-slate-400 text-xs">Cultural Markers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {period.culturalMarkers.map(marker => (
                        <Badge key={marker} variant="outline" className="text-xs">
                          {marker.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Temporal Correlations */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Period Correlations
          </h4>
          <div className="space-y-3">
            {correlations.map((correlation, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-white text-sm">
                        {periods.find(p => p.id === correlation.periodA)?.name} → {periods.find(p => p.id === correlation.periodB)?.name}
                      </h5>
                      <p className="text-xs text-slate-400">Temporal transition analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCorrelationColor(correlation.correlation)}>
                        {Math.round(correlation.correlation * 100)}% correlation
                      </Badge>
                      <Badge className={getContinuityColor(correlation.culturalContinuity)}>
                        {correlation.culturalContinuity} continuity
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-slate-400 text-xs">Shared Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {correlation.sharedFeatures.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
          <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Temporal Analysis Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Time Span:</span>
              <div className="text-blue-300 font-mono">
                {periods.length > 0 ? 
                  `${Math.abs(periods[0].startYear) + periods[periods.length - 1].endYear} years` : 
                  'N/A'
                }
              </div>
            </div>
            <div>
              <span className="text-slate-400">Cultural Periods:</span>
              <div className="text-blue-300">{periods.length} identified</div>
            </div>
            <div>
              <span className="text-slate-400">Avg Correlation:</span>
              <div className="text-green-400">
                {correlations.length > 0 ? 
                  Math.round(correlations.reduce((sum, c) => sum + c.correlation, 0) / correlations.length * 100) : 0}%
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-slate-300 text-sm">
              <strong>Key Insight:</strong> Analysis reveals {correlations.filter(c => c.culturalContinuity === 'high').length} periods 
              with high cultural continuity, suggesting sustained occupation and cultural development over time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TemporalAnalysis 