"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  Target, 
  Search, 
  Brain,
  Activity,
  Globe,
  FileText,
  Clock,
  Users,
  Network,
  Sparkles,
  Map,
  BarChart3,
  Layers
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Textarea } from './textarea';
import { Card, CardContent } from './card';
import { Badge } from './badge';

interface ArchaeologicalSite {
  id: string;
  name: string;
  coordinates: string;
  confidence: number;
  discovery_date: string;
  cultural_significance: string;
  data_sources: string[];
  type: 'settlement' | 'ceremonial' | 'burial' | 'agricultural' | 'trade' | 'defensive';
  period: string;
  size_hectares?: number;
}

interface SelectedArea {
  id: string;
  type: 'rectangle' | 'circle' | 'polygon';
  bounds: any;
  sites: ArchaeologicalSite[];
  timestamp: Date;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agent?: string;
  confidence?: number;
  metadata?: any;
  analysisType?: 'spatial' | 'temporal' | 'cultural' | 'trade' | 'defensive';
}

interface Props {
  selectedAreas?: SelectedArea[];
  onAreaAnalysis?: (analysis: any) => void;
  sites?: ArchaeologicalSite[];
}

export default function EnhancedArchaeologicalChat({ selectedAreas = [], onAreaAnalysis, sites = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'spatial' | 'temporal' | 'cultural' | 'auto'>('auto');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Generate enhanced archaeological analysis
  const generateAreaAnalysis = useCallback(async (area: SelectedArea) => {
    if (!area.sites || area.sites.length === 0) return;

    const analysis = {
      id: `analysis_${Date.now()}`,
      areaId: area.id,
      timestamp: new Date(),
      
      // Spatial Analysis
      spatial: {
        totalSites: area.sites.length,
        avgConfidence: area.sites.reduce((sum, site) => sum + site.confidence, 0) / area.sites.length,
        siteTypes: area.sites.reduce((acc, site) => {
          acc[site.type] = (acc[site.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        geographicSpread: calculateGeographicSpread(area.sites),
        clustersDetected: identifyClusters(area.sites)
      },

      // Temporal Analysis
      temporal: {
        periods: [...new Set(area.sites.map(s => s.period))],
        chronologicalSequence: analyzeChronology(area.sites),
        contemporaneousSites: findContemporaneousSites(area.sites),
        evolutionPattern: identifyEvolutionPattern(area.sites)
      },

      // Cultural Analysis
      cultural: {
        dominantCultures: identifyDominantCultures(area.sites),
        culturalDiversity: calculateCulturalDiversity(area.sites),
        interactionIndicators: findCulturalInteractions(area.sites),
        significanceRating: calculateOverallSignificance(area.sites)
      },

      // Trade & Economic Analysis
      economic: {
        tradeRoutes: identifyTradeRoutes(area.sites),
        economicCenters: identifyEconomicCenters(area.sites),
        resourceAccess: analyzeResourceAccess(area.sites),
        exchangeNetworks: identifyExchangeNetworks(area.sites)
      },

      // Strategic Analysis
      strategic: {
        defensivePositioning: analyzeDefensivePositioning(area.sites),
        territorialControl: analyzeTerritorialControl(area.sites),
        strategicImportance: calculateStrategicImportance(area.sites),
        militarySignificance: assessMilitarySignificance(area.sites)
      },

      // Research Recommendations
      recommendations: generateResearchRecommendations(area.sites)
    };

    return analysis;
  }, []);

  // Helper analysis functions
  const calculateGeographicSpread = (sites: ArchaeologicalSite[]) => {
    const coords = sites.map(site => {
      const [lat, lng] = site.coordinates.split(',').map(c => parseFloat(c.trim()));
      return { lat, lng };
    });

    const latitudes = coords.map(c => c.lat);
    const longitudes = coords.map(c => c.lng);

    return {
      latRange: Math.max(...latitudes) - Math.min(...latitudes),
      lngRange: Math.max(...longitudes) - Math.min(...longitudes),
      centerPoint: {
        lat: latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length,
        lng: longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length
      }
    };
  };

  const identifyClusters = (sites: ArchaeologicalSite[]) => {
    // Simple clustering based on proximity and type
    const clusters = [];
    const processed = new Set();

    sites.forEach(site => {
      if (processed.has(site.id)) return;

      const cluster = {
        id: `cluster_${clusters.length}`,
        primarySite: site,
        relatedSites: [],
        type: site.type,
        significance: 'high'
      };

      // Find nearby sites of similar type
      sites.forEach(otherSite => {
        if (otherSite.id !== site.id && !processed.has(otherSite.id)) {
          const [lat1, lng1] = site.coordinates.split(',').map(c => parseFloat(c.trim()));
          const [lat2, lng2] = otherSite.coordinates.split(',').map(c => parseFloat(c.trim()));
          const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));

          if (distance < 0.1 && (otherSite.type === site.type || otherSite.period === site.period)) {
            cluster.relatedSites.push(otherSite);
            processed.add(otherSite.id);
          }
        }
      });

      if (cluster.relatedSites.length > 0) {
        clusters.push(cluster);
        processed.add(site.id);
      }
    });

    return clusters;
  };

  const analyzeChronology = (sites: ArchaeologicalSite[]) => {
    const periods = sites.map(s => s.period);
    const periodCounts = periods.reduce((acc, period) => {
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPeriods: Object.keys(periodCounts).length,
      dominantPeriod: Object.entries(periodCounts).sort((a, b) => b[1] - a[1])[0],
      periodDistribution: periodCounts,
      chronologicalSpan: Object.keys(periodCounts).length > 1 ? 'multi-period' : 'single-period'
    };
  };

  const findContemporaneousSites = (sites: ArchaeologicalSite[]) => {
    const contemporary = [];
    const periods = [...new Set(sites.map(s => s.period))];

    periods.forEach(period => {
      const sitesInPeriod = sites.filter(s => s.period === period);
      if (sitesInPeriod.length > 1) {
        contemporary.push({
          period,
          sites: sitesInPeriod,
          interactions: analyzePotentialInteractions(sitesInPeriod)
        });
      }
    });

    return contemporary;
  };

  const identifyEvolutionPattern = (sites: ArchaeologicalSite[]) => {
    // Simplified evolution pattern analysis
    const typeEvolution = sites.reduce((acc, site) => {
      if (!acc[site.type]) acc[site.type] = [];
      acc[site.type].push({ period: site.period, confidence: site.confidence });
      return acc;
    }, {} as Record<string, Array<{ period: string; confidence: number }>>);

    return {
      siteTypeEvolution: typeEvolution,
      complexityTrend: calculateComplexityTrend(sites),
      populationIndicators: calculatePopulationIndicators(sites)
    };
  };

  const identifyDominantCultures = (sites: ArchaeologicalSite[]) => {
    // Analyze cultural significance patterns
    const culturalKeywords = sites.flatMap(s => 
      s.cultural_significance.toLowerCase().split(' ')
        .filter(word => word.length > 3)
    );

    const keywordCounts = culturalKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, frequency: count }));
  };

  const calculateCulturalDiversity = (sites: ArchaeologicalSite[]) => {
    const types = [...new Set(sites.map(s => s.type))];
    const periods = [...new Set(sites.map(s => s.period))];
    
    return {
      typesDiversity: types.length / 6, // Normalized by total possible types
      temporalDiversity: periods.length,
      culturalComplexity: (types.length * periods.length) / sites.length
    };
  };

  const identifyTradeRoutes = (sites: ArchaeologicalSite[]) => {
    const tradeSites = sites.filter(s => s.type === 'trade' || s.type === 'settlement');
    const routes = [];

    for (let i = 0; i < tradeSites.length; i++) {
      for (let j = i + 1; j < tradeSites.length; j++) {
        const site1 = tradeSites[i];
        const site2 = tradeSites[j];
        const [lat1, lng1] = site1.coordinates.split(',').map(c => parseFloat(c.trim()));
        const [lat2, lng2] = site2.coordinates.split(',').map(c => parseFloat(c.trim()));
        const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));

        if (distance < 2.0 && site1.period === site2.period) {
          routes.push({
            from: site1.name,
            to: site2.name,
            distance: distance,
            period: site1.period,
            likelihood: calculateTradeLikelihood(site1, site2)
          });
        }
      }
    }

    return routes.sort((a, b) => b.likelihood - a.likelihood);
  };

  // More helper functions...
  const generateResearchRecommendations = (sites: ArchaeologicalSite[]) => {
    const recommendations = [];

    // High-confidence site recommendations
    const highConfidenceSites = sites.filter(s => s.confidence > 0.85);
    if (highConfidenceSites.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'excavation',
        description: `Priority excavation recommended for ${highConfidenceSites.length} high-confidence sites`,
        sites: highConfidenceSites.map(s => s.name)
      });
    }

    // Cluster analysis recommendations
    const clusters = identifyClusters(sites);
    if (clusters.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'survey',
        description: `Systematic survey of ${clusters.length} identified site clusters`,
        details: clusters.map(c => `${c.type} cluster around ${c.primarySite.name}`)
      });
    }

    // Multi-period site recommendations
    const periods = [...new Set(sites.map(s => s.period))];
    if (periods.length > 2) {
      recommendations.push({
        priority: 'HIGH',
        type: 'chronological_study',
        description: `Detailed chronological analysis across ${periods.length} periods`,
        focus: 'cultural_continuity_and_change'
      });
    }

    return recommendations;
  };

  // Send message with enhanced analysis
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const messageId = `msg_${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Check if asking about selected areas
    const isAreaQuery = inputValue.toLowerCase().includes('area') || 
                       inputValue.toLowerCase().includes('region') ||
                       inputValue.toLowerCase().includes('selected');

    let response = '';
    let analysisType: Message['analysisType'] = 'spatial';

    if (isAreaQuery && selectedAreas.length > 0) {
      // Analyze all selected areas
      const analyses = await Promise.all(
        selectedAreas.map(area => generateAreaAnalysis(area))
      );

      response = formatAreaAnalysisResponse(analyses, selectedAreas);
      
      // Trigger callback if provided
      if (onAreaAnalysis) {
        onAreaAnalysis(analyses);
      }
    } else {
      // Generate contextual response based on analysis mode
      response = await generateContextualResponse(inputValue, sites, analysisMode);
      analysisType = analysisMode === 'auto' ? 'spatial' : analysisMode;
    }

    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      content: response,
      role: 'assistant',
      timestamp: new Date(),
      agent: 'Archaeological Spatial Analyst',
      confidence: 0.92,
      analysisType
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  }, [inputValue, selectedAreas, sites, analysisMode, generateAreaAnalysis, onAreaAnalysis]);

  const formatAreaAnalysisResponse = (analyses: any[], areas: SelectedArea[]) => {
    let response = `# 🗺️ Archaeological Area Analysis Report\n\n`;
    
    analyses.forEach((analysis, index) => {
      const area = areas[index];
      response += `## Area ${index + 1}: ${area.type.toUpperCase()} Selection\n\n`;
      response += `**Sites Analyzed:** ${analysis.spatial.totalSites}\n`;
      response += `**Average Confidence:** ${(analysis.spatial.avgConfidence * 100).toFixed(1)}%\n\n`;

      // Spatial findings
      response += `### 🎯 Spatial Analysis\n`;
      response += `- **Site Types:** ${Object.entries(analysis.spatial.siteTypes).map(([type, count]) => `${count} ${type}`).join(', ')}\n`;
      response += `- **Clusters Detected:** ${analysis.spatial.clustersDetected.length}\n`;
      response += `- **Geographic Spread:** ${analysis.spatial.geographicSpread.latRange.toFixed(3)}° lat × ${analysis.spatial.geographicSpread.lngRange.toFixed(3)}° lng\n\n`;

      // Cultural findings
      response += `### 🏛️ Cultural Analysis\n`;
      response += `- **Periods Represented:** ${analysis.temporal.periods.join(', ')}\n`;
      response += `- **Cultural Complexity:** ${(analysis.cultural.culturalComplexity * 100).toFixed(1)}%\n`;
      response += `- **Dominant Themes:** ${analysis.cultural.dominantCultures.slice(0, 3).map((c: any) => c.keyword).join(', ')}\n\n`;

      // Recommendations
      response += `### 📋 Research Recommendations\n`;
      analysis.recommendations.forEach((rec: any) => {
        response += `- **${rec.priority}:** ${rec.description}\n`;
      });
      response += `\n---\n\n`;
    });

    return response;
  };

  const generateContextualResponse = async (query: string, sites: ArchaeologicalSite[], mode: string) => {
    // Enhanced contextual response generation
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('trade') || lowerQuery.includes('economic')) {
      return generateTradeAnalysis(sites);
    } else if (lowerQuery.includes('defense') || lowerQuery.includes('military')) {
      return generateDefensiveAnalysis(sites);
    } else if (lowerQuery.includes('culture') || lowerQuery.includes('ritual')) {
      return generateCulturalAnalysis(sites);
    } else if (lowerQuery.includes('time') || lowerQuery.includes('chronology')) {
      return generateTemporalAnalysis(sites);
    } else {
      return generateGeneralAnalysis(sites);
    }
  };

  // Analysis helper functions (implement these based on your needs)
  const generateTradeAnalysis = (sites: ArchaeologicalSite[]) => {
    const tradeSites = sites.filter(s => s.type === 'trade' || s.type === 'settlement');
    return `# 🏪 Trade Network Analysis\n\nIdentified ${tradeSites.length} potential trade-related sites with evidence of commercial activity and exchange networks...`;
  };

  const generateDefensiveAnalysis = (sites: ArchaeologicalSite[]) => {
    const defensiveSites = sites.filter(s => s.type === 'defensive');
    return `# 🏰 Defensive Architecture Analysis\n\nAnalyzing ${defensiveSites.length} defensive sites reveals strategic positioning patterns and territorial control mechanisms...`;
  };

  const generateCulturalAnalysis = (sites: ArchaeologicalSite[]) => {
    const ceremonialSites = sites.filter(s => s.type === 'ceremonial');
    return `# ⛩️ Cultural Significance Analysis\n\nExamining ${ceremonialSites.length} ceremonial sites provides insights into religious practices and cultural organization...`;
  };

  const generateTemporalAnalysis = (sites: ArchaeologicalSite[]) => {
    const periods = [...new Set(sites.map(s => s.period))];
    return `# ⏰ Temporal Analysis\n\nChronological analysis across ${periods.length} periods (${periods.join(', ')}) reveals patterns of cultural development and change...`;
  };

  const generateGeneralAnalysis = (sites: ArchaeologicalSite[]) => {
    return `# 🔍 General Archaeological Analysis\n\nComprehensive analysis of ${sites.length} archaeological sites reveals complex patterns of human settlement and cultural development...`;
  };

  // Placeholder helper functions (implement as needed)
  const analyzePotentialInteractions = (sites: ArchaeologicalSite[]) => ({ score: 0.7 });
  const calculateComplexityTrend = (sites: ArchaeologicalSite[]) => ({ trend: 'increasing' });
  const calculatePopulationIndicators = (sites: ArchaeologicalSite[]) => ({ growth: 'stable' });
  const findCulturalInteractions = (sites: ArchaeologicalSite[]) => ([]);
  const calculateOverallSignificance = (sites: ArchaeologicalSite[]) => 0.8;
  const identifyEconomicCenters = (sites: ArchaeologicalSite[]) => ([]);
  const analyzeResourceAccess = (sites: ArchaeologicalSite[]) => ({ resources: [] });
  const identifyExchangeNetworks = (sites: ArchaeologicalSite[]) => ([]);
  const analyzeDefensivePositioning = (sites: ArchaeologicalSite[]) => ({ strength: 'high' });
  const analyzeTerritorialControl = (sites: ArchaeologicalSite[]) => ({ control: 'regional' });
  const calculateStrategicImportance = (sites: ArchaeologicalSite[]) => 0.75;
  const assessMilitarySignificance = (sites: ArchaeologicalSite[]) => ({ significance: 'moderate' });
  const calculateTradeLikelihood = (site1: ArchaeologicalSite, site2: ArchaeologicalSite) => 0.6;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-700/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Archaeological Spatial Analyst</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
              {selectedAreas.length} areas selected
            </Badge>
            <select 
              value={analysisMode} 
              onChange={(e) => setAnalysisMode(e.target.value as any)}
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
            >
              <option value="auto">Auto Analysis</option>
              <option value="spatial">Spatial Focus</option>
              <option value="temporal">Temporal Focus</option>
              <option value="cultural">Cultural Focus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.role === 'user'
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-100 border border-slate-700"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <div key={i}>
                      {line.startsWith('# ') ? (
                        <h3 className="text-lg font-bold text-emerald-300 mb-2">{line.slice(2)}</h3>
                      ) : line.startsWith('## ') ? (
                        <h4 className="text-md font-semibold text-blue-300 mb-1">{line.slice(3)}</h4>
                      ) : line.startsWith('### ') ? (
                        <h5 className="text-sm font-medium text-purple-300 mb-1">{line.slice(4)}</h5>
                      ) : line.startsWith('**') && line.endsWith('**') ? (
                        <p className="font-semibold text-yellow-300">{line.slice(2, -2)}</p>
                      ) : line.startsWith('- ') ? (
                        <p className="ml-4 text-slate-300">• {line.slice(2)}</p>
                      ) : line === '---' ? (
                        <hr className="my-3 border-slate-600" />
                      ) : line ? (
                        <p className="text-slate-200">{line}</p>
                      ) : (
                        <br />
                      )}
                    </div>
                  ))}
                </div>
                
                {message.role === 'assistant' && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Activity className="h-3 w-3" />
                      <span>{message.agent}</span>
                      {message.analysisType && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {message.analysisType}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin">🧠</div>
                <span>Analyzing archaeological patterns...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedAreas.length > 0 
              ? `Ask about your ${selectedAreas.length} selected area${selectedAreas.length > 1 ? 's' : ''}...` 
              : "Ask about spatial patterns, cultural analysis, or temporal relationships..."
            }
            className="flex-1 min-h-[40px] max-h-[120px] bg-slate-800 border-slate-600 text-white resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            "Analyze selected areas",
            "Find trade routes", 
            "Cultural patterns",
            "Temporal analysis",
            "Defensive positioning"
          ].map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(action)}
              className="h-6 px-2 text-xs bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 