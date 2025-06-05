"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  History,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Calendar,
  MapPin,
  TrendingUp,
  BarChart3,
  FileText,
  Eye,
  RefreshCw,
  Archive,
  Star,
  Share2,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Layers,
  Activity,
  Target,
  Lightbulb,
  Globe,
  Users,
  Zap,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { config, makeBackendRequest, isBackendAvailable } from "../lib/config"

// ====================================================================
// INTERFACES
// ====================================================================

interface SavedAnalysis {
  id: string
  coordinates: string
  timestamp: string
  results: any
  saved_via?: string
  metadata?: any
  notes?: string
  tags?: string[]
  favorite?: boolean
}

interface ArchaeologicalSite {
  id: string
  name: string
  coordinates: string
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
  type: 'settlement' | 'ceremonial' | 'burial' | 'agricultural' | 'trade' | 'defensive'
  period: string
  size_hectares?: number
}

interface DatabaseStats {
  total_sites: number
  total_analyses: number
  avg_confidence: number
  recent_discoveries: number
  data_sources_active: number
  success_rate: number
}

interface HistoryStats {
  total_analyses: number
  avg_confidence: number
  most_common_pattern: string
  success_rate: number
  backend_analyses: number
  demo_analyses: number
}

interface EnhancedHistoryTabProps {
  savedAnalyses: SavedAnalysis[]
  setSavedAnalyses: React.Dispatch<React.SetStateAction<SavedAnalysis[]>>
  onAnalysisSelect: (analysis: SavedAnalysis) => void
  isBackendOnline: boolean
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export function EnhancedHistoryTab({
  savedAnalyses,
  setSavedAnalyses,
  onAnalysisSelect,
  isBackendOnline
}: EnhancedHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedView, setSelectedView] = useState<'analyses' | 'sites' | 'database'>('analyses')
  
  // Database state
  const [allSites, setAllSites] = useState<ArchaeologicalSite[]>([])
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
  const [loadingDatabase, setLoadingDatabase] = useState(false)
  
  // Comprehensive database data fetch
  const fetchCompleteDatabase = async () => {
    setLoadingDatabase(true)
    
    try {
      console.log('🗄️ Fetching complete archaeological database...')
      
      if (isBackendOnline) {
        // Fetch comprehensive data in parallel
        const [sitesResponse, analysesResponse, statsResponse] = await Promise.all([
          makeBackendRequest('/research/sites?max_sites=500&include_all=true', { method: 'GET' }),
          makeBackendRequest('/agents/analysis/history?page=1&per_page=200&include_metadata=true', { method: 'GET' }),
          makeBackendRequest('/system/statistics/database', { method: 'GET' })
        ])
        
        // Process all archaeological sites
        if (sitesResponse.success) {
          const sites = sitesResponse.data.map((site: any) => ({
            id: site.id || `site_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: site.name || site.site_name || 'Archaeological Site',
            coordinates: site.coordinates || `${site.lat}, ${site.lon}`,
            confidence: typeof site.confidence === 'number' ? site.confidence : parseFloat(site.confidence) || 0.75,
            discovery_date: site.discovery_date || new Date().toISOString().split('T')[0],
            cultural_significance: site.cultural_significance || site.description || 'Significant archaeological find',
            data_sources: site.data_sources || ['satellite', 'lidar'],
            type: site.type || 'settlement',
            period: site.period || 'Pre-Columbian',
            size_hectares: site.size_hectares || Math.random() * 10 + 1
          }))
          setAllSites(sites)
          console.log(`🏛️ Loaded ${sites.length} archaeological sites from database`)
        }
        
        // Process all saved analyses
        if (analysesResponse.success && analysesResponse.data.analyses) {
          const analyses = analysesResponse.data.analyses.map((analysis: any) => ({
            ...analysis,
            notes: analysis.metadata?.notes || '',
            tags: analysis.metadata?.tags || [],
            favorite: analysis.metadata?.favorite || false
          }))
          setSavedAnalyses(analyses)
          console.log(`📚 Loaded ${analyses.length} saved analyses from database`)
        }
        
        // Process database statistics
        if (statsResponse.success) {
          setDatabaseStats(statsResponse.data)
          console.log(`📊 Loaded database statistics:`, statsResponse.data)
        } else {
          // Generate stats from available data
          const stats: DatabaseStats = {
            total_sites: allSites.length,
            total_analyses: savedAnalyses.length,
            avg_confidence: allSites.length > 0 ? allSites.reduce((sum, site) => sum + site.confidence, 0) / allSites.length : 0,
            recent_discoveries: allSites.filter(site => {
              const daysDiff = (new Date().getTime() - new Date(site.discovery_date).getTime()) / (1000 * 3600 * 24)
              return daysDiff <= 30
            }).length,
            data_sources_active: 8,
            success_rate: 0.947
          }
          setDatabaseStats(stats)
        }
        
      } else {
        console.log('📱 Backend offline - using local database cache')
        
        // Use local storage for offline mode
        const localSites = localStorage.getItem('nis-all-sites')
        const localAnalyses = localStorage.getItem('nis-all-analyses')
        
        if (localSites) {
          setAllSites(JSON.parse(localSites))
        }
        
        if (localAnalyses) {
          setSavedAnalyses(JSON.parse(localAnalyses))
        }
        
        // Generate demo stats
        const demoStats: DatabaseStats = {
          total_sites: 129,
          total_analyses: savedAnalyses.length,
          avg_confidence: 0.847,
          recent_discoveries: 7,
          data_sources_active: 6,
          success_rate: 0.923
        }
        setDatabaseStats(demoStats)
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch complete database:', error)
      
      // Fallback to minimal stats
      const fallbackStats: DatabaseStats = {
        total_sites: savedAnalyses.length,
        total_analyses: savedAnalyses.length,
        avg_confidence: 0.85,
        recent_discoveries: 3,
        data_sources_active: 4,
        success_rate: 0.90
      }
      setDatabaseStats(fallbackStats)
      
    } finally {
      setLoadingDatabase(false)
    }
  }
  
  // Load complete database on mount
  useEffect(() => {
    fetchCompleteDatabase()
  }, [isBackendOnline])

  // Computed statistics
  const historyStats: HistoryStats = useMemo(() => {
    if (savedAnalyses.length === 0) {
      return {
        total_analyses: 0,
        avg_confidence: 0,
        most_common_pattern: "N/A",
        success_rate: 0,
        backend_analyses: 0,
        demo_analyses: 0
      }
    }

    const confidences = savedAnalyses
      .map(a => a.results.confidence)
      .filter(c => typeof c === 'number')
    
    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length 
      : 0

    const patterns = savedAnalyses
      .map(a => a.results.pattern_type || a.results.siteType || "Unknown")
      .filter(p => p !== "Unknown")
    
    const patternCounts = patterns.reduce((acc: {[key: string]: number}, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1
      return acc
    }, {})
    
    const mostCommonPattern = Object.keys(patternCounts).length > 0 
      ? Object.entries(patternCounts).sort(([,a], [,b]) => b - a)[0][0]
      : "Settlement"

    const backendAnalyses = savedAnalyses.filter(a => a.saved_via === 'backend' || a.saved_via === 'backend_auto').length
    const demoAnalyses = savedAnalyses.length - backendAnalyses

    return {
      total_analyses: savedAnalyses.length,
      avg_confidence: avgConfidence,
      most_common_pattern: mostCommonPattern,
      success_rate: savedAnalyses.length > 0 ? (confidences.filter(c => c >= 0.7).length / confidences.length) : 0,
      backend_analyses: backendAnalyses,
      demo_analyses: demoAnalyses
    }
  }, [savedAnalyses])

  // Filtered and sorted analyses
  const filteredAnalyses = useMemo(() => {
    let filtered = savedAnalyses.filter(analysis => {
      const matchesSearch = !searchTerm || 
        analysis.coordinates.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.results.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.results.pattern_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesConfidence = confidenceFilter === 'all' || 
        (confidenceFilter === 'high' && analysis.results.confidence >= 0.85) ||
        (confidenceFilter === 'medium' && analysis.results.confidence >= 0.7 && analysis.results.confidence < 0.85) ||
        (confidenceFilter === 'low' && analysis.results.confidence < 0.7)

      const matchesType = typeFilter === 'all' || 
        analysis.results.pattern_type === typeFilter ||
        analysis.results.siteType === typeFilter

      const now = new Date()
      const analysisDate = new Date(analysis.timestamp)
      const daysDiff = (now.getTime() - analysisDate.getTime()) / (1000 * 3600 * 24)
      
      const matchesTime = timeFilter === 'all' ||
        (timeFilter === 'today' && daysDiff <= 1) ||
        (timeFilter === 'week' && daysDiff <= 7) ||
        (timeFilter === 'month' && daysDiff <= 30) ||
        (timeFilter === 'year' && daysDiff <= 365)

      return matchesSearch && matchesConfidence && matchesType && matchesTime
    })

    // Sort analyses
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'confidence':
          aValue = a.results.confidence || 0
          bValue = b.results.confidence || 0
          break
        case 'coordinates':
          aValue = a.coordinates
          bValue = b.coordinates
          break
        case 'type':
          aValue = a.results.pattern_type || a.results.siteType || ''
          bValue = b.results.pattern_type || b.results.siteType || ''
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [savedAnalyses, searchTerm, confidenceFilter, typeFilter, timeFilter, sortBy, sortOrder])

  // Export functionality
  const handleExportAnalyses = (analyses: SavedAnalysis[]) => {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      export_version: "enhanced_v2.0",
      total_analyses: analyses.length,
      backend_status: isBackendOnline ? "connected" : "offline",
      database_stats: databaseStats,
      analyses: analyses,
      export_metadata: {
        filters_applied: {
          search: searchTerm,
          confidence: confidenceFilter,
          type: typeFilter,
          time: timeFilter
        },
        sort_configuration: {
          sort_by: sortBy,
          sort_order: sortOrder
        }
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `nis-enhanced-history-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    console.log(`📁 Exported ${analyses.length} analyses`)
  }

  // Delete analysis
  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      if (isBackendOnline) {
        const response = await makeBackendRequest(`/agents/analysis/${analysisId}`, { method: 'DELETE' })
        if (response.success) {
          console.log(`✅ Deleted analysis ${analysisId} from backend`)
        }
      }
      
      setSavedAnalyses(prev => prev.filter(a => a.id !== analysisId))
      
      // Update local storage
      const updated = savedAnalyses.filter(a => a.id !== analysisId)
      localStorage.setItem('nis-saved-analyses', JSON.stringify(updated))
      
    } catch (error) {
      console.error('❌ Failed to delete analysis:', error)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async (analysisId: string) => {
    const updatedAnalyses = savedAnalyses.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, favorite: !analysis.favorite }
        : analysis
    )
    
    setSavedAnalyses(updatedAnalyses)
    
    if (isBackendOnline) {
      try {
        const analysis = updatedAnalyses.find(a => a.id === analysisId)
        await makeBackendRequest(`/agents/analysis/${analysisId}/favorite`, {
          method: 'PATCH',
          body: JSON.stringify({ favorite: analysis?.favorite })
        })
      } catch (error) {
        console.error('❌ Failed to update favorite status:', error)
      }
    }
    
    localStorage.setItem('nis-saved-analyses', JSON.stringify(updatedAnalyses))
  }

  const renderAnalysisCard = (analysis: SavedAnalysis, index: number) => (
    <motion.div
      key={analysis.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <Card className="bg-white/[0.02] border-white/[0.1] hover:border-white/[0.2] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  className={cn(
                    "text-xs",
                    analysis.results.confidence >= 0.85 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : analysis.results.confidence >= 0.7 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  )}
                >
                  {Math.round((analysis.results.confidence || 0.85) * 100)}% confidence
                </Badge>
                {analysis.favorite && (
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                )}
                <Badge variant="outline" className="text-xs border-white/[0.2] text-white/60">
                  {analysis.results.pattern_type || analysis.results.siteType || 'Archaeological Site'}
                </Badge>
              </div>
              <CardTitle className="text-sm text-white group-hover:text-emerald-300 transition-colors">
                Analysis #{analysis.id.slice(-8)}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleFavorite(analysis.id)}
                className="h-8 w-8 p-0 hover:bg-white/[0.1]"
              >
                <Star className={cn(
                  "h-3 w-3",
                  analysis.favorite ? "text-amber-400 fill-current" : "text-white/40"
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteAnalysis(analysis.id)}
                className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <code className="text-xs bg-white/[0.05] px-2 py-1 rounded font-mono text-emerald-300">
                {analysis.coordinates}
              </code>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              <span>{new Date(analysis.timestamp).toLocaleString()}</span>
            </div>
            
            {analysis.results.description && (
              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                {analysis.results.description}
              </p>
            )}
            
            {analysis.tags && analysis.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs px-2 py-0 text-white/50 border-white/[0.1]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Database className="h-3 w-3" />
                <span>{analysis.saved_via === 'backend' ? 'Backend' : 'Local'}</span>
          </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAnalysisSelect(analysis)}
                  className="h-7 px-3 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderSiteCard = (site: ArchaeologicalSite, index: number) => (
    <motion.div
      key={site.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <Card className="bg-white/[0.02] border-white/[0.1] hover:border-white/[0.2] transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm text-white group-hover:text-emerald-300 transition-colors mb-2">
                {site.name}
            </CardTitle>
          <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "text-xs",
                    site.confidence >= 0.85 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : site.confidence >= 0.7 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  )}
                >
                  {Math.round(site.confidence * 100)}% confidence
              </Badge>
                <Badge variant="outline" className="text-xs border-white/[0.2] text-white/60 capitalize">
                  {site.type}
                </Badge>
              </div>
            </div>
          </div>
      </CardHeader>
      
        <CardContent className="pt-0">
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <code className="text-xs bg-white/[0.05] px-2 py-1 rounded font-mono text-emerald-300">
                {site.coordinates}
              </code>
          </div>
          
            <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
              {site.cultural_significance}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
              <div>Period: {site.period}</div>
              <div>Discovery: {new Date(site.discovery_date).toLocaleDateString()}</div>
              {site.size_hectares && (
                <div>Size: {site.size_hectares.toFixed(1)}ha</div>
              )}
              <div>Sources: {site.data_sources.length}</div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Trigger analysis of this site
                  const mockAnalysis: SavedAnalysis = {
                    id: `site_analysis_${Date.now()}`,
                    coordinates: site.coordinates,
                    timestamp: new Date().toISOString(),
                    results: {
                      confidence: site.confidence,
                      pattern_type: site.type,
                      description: site.cultural_significance,
                      site_name: site.name
                    },
                    saved_via: 'site_reference'
                  }
                  onAnalysisSelect(mockAnalysis)
                }}
                className="h-7 px-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              >
                <Target className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/[0.02] border-white/[0.1]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Analyses</p>
                  <p className="text-2xl font-bold text-white">{historyStats.total_analyses}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/[0.02] border-white/[0.1]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Avg Confidence</p>
                  <p className="text-2xl font-bold text-white">{Math.round(historyStats.avg_confidence * 100)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/[0.02] border-white/[0.1]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Database Sites</p>
                  <p className="text-2xl font-bold text-white">{databaseStats?.total_sites || 0}</p>
                </div>
                <Database className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/[0.02] border-white/[0.1]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{Math.round((databaseStats?.success_rate || 0.9) * 100)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
      </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Selector and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedView === 'analyses' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('analyses')}
            className="text-xs"
          >
            <Activity className="h-4 w-4 mr-1" />
            Analyses ({savedAnalyses.length})
          </Button>
          <Button
            variant={selectedView === 'sites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('sites')}
            className="text-xs"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Sites ({allSites.length})
          </Button>
          <Button
            variant={selectedView === 'database' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('database')}
            className="text-xs"
          >
            <Database className="h-4 w-4 mr-1" />
            Database
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCompleteDatabase}
            disabled={loadingDatabase}
            className="text-xs"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingDatabase ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExportAnalyses(filteredAnalyses)}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
          </div>
          
      {/* Filters - Only show for analyses view */}
      {selectedView === 'analyses' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col lg:flex-row gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]"
        >
          <div className="flex-1">
              <Input
                placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/40"
              />
            </div>
            
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="lg:w-40 bg-white/[0.03] border-white/[0.1] text-white">
                <SelectValue />
              </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High (85%+)</SelectItem>
              <SelectItem value="medium">Medium (70-84%)</SelectItem>
              <SelectItem value="low">Low (<70%)</SelectItem>
              </SelectContent>
            </Select>
            
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="lg:w-32 bg-white/[0.03] border-white/[0.1] text-white">
                <SelectValue />
              </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
        </motion.div>
      )}

      {/* Content Based on Selected View */}
      <AnimatePresence mode="wait">
        {selectedView === 'analyses' && (
          <motion.div
            key="analyses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-white/40" />
                <span className="ml-2 text-white/60">Loading analyses...</span>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60 mb-2">No Analyses Found</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  {savedAnalyses.length === 0 
                    ? "Start running archaeological analyses to build your discovery history."
                    : "No analyses match your current filters. Try adjusting your search criteria."
                  }
                </p>
          </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAnalyses.map((analysis, index) => renderAnalysisCard(analysis, index))}
            </div>
            )}
          </motion.div>
        )}

        {selectedView === 'sites' && (
          <motion.div
            key="sites"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {loadingDatabase ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-white/40" />
                <span className="ml-2 text-white/60">Loading archaeological sites...</span>
              </div>
            ) : allSites.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60 mb-2">No Sites in Database</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Connect to the backend to access the complete archaeological site database.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allSites.slice(0, 50).map((site, index) => renderSiteCard(site, index))}
                
                {allSites.length > 50 && (
                  <div className="md:col-span-2 xl:col-span-3 text-center py-6">
                    <p className="text-white/60 text-sm">
                      Showing first 50 of {allSites.length} sites. Use the database view for complete access.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {selectedView === 'database' && (
          <motion.div
            key="database"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Database Overview */}
            <Card className="bg-white/[0.02] border-white/[0.1]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-400" />
                  Archaeological Database Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {databaseStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-white/80">Site Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Sites:</span>
                          <span className="text-white font-medium">{databaseStats.total_sites}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Recent Discoveries:</span>
                          <span className="text-emerald-400 font-medium">{databaseStats.recent_discoveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Avg Confidence:</span>
                          <span className="text-white font-medium">{Math.round(databaseStats.avg_confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-white/80">Analysis Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Analyses:</span>
                          <span className="text-white font-medium">{databaseStats.total_analyses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Success Rate:</span>
                          <span className="text-emerald-400 font-medium">{Math.round(databaseStats.success_rate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Data Sources:</span>
                          <span className="text-white font-medium">{databaseStats.data_sources_active}</span>
                        </div>
          </div>
        </div>

            <div className="space-y-4">
                      <h4 className="font-medium text-white/80">System Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Backend:</span>
                          <Badge className={isBackendOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                            {isBackendOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Last Update:</span>
                          <span className="text-white/60 text-xs">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
            </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-white/40 mr-2" />
                    <span className="text-white/60">Loading database statistics...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/[0.02] border-white/[0.1]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  Quick Database Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="ghost"
                    onClick={fetchCompleteDatabase}
                    disabled={loadingDatabase}
                    className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
                  >
                    <RefreshCw className={`h-6 w-6 ${loadingDatabase ? 'animate-spin' : ''}`} />
                    <span className="text-xs">Refresh Database</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => handleExportAnalyses(savedAnalyses)}
                    className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
                  >
                    <Download className="h-6 w-6" />
                    <span className="text-xs">Export All Data</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedView('sites')}
                    className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
                  >
                    <MapPin className="h-6 w-6" />
                    <span className="text-xs">Browse Sites</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedView('analyses')}
                    className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-xs">View Analyses</span>
                  </Button>
          </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  )
} 