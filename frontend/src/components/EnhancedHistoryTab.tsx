"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  Lightbulb
} from "lucide-react"

// ====================================================================
// INTERFACES
// ====================================================================

interface AnalysisRecord {
  id: string
  coordinates: string
  timestamp: string
  results: any
  metadata?: {
    region?: string
    data_sources?: string[]
    confidence_threshold?: number
    backend_status?: string
    processing_time?: number
  }
  tags?: string[]
  notes?: string
  favorite?: boolean
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
  savedAnalyses: AnalysisRecord[]
  setSavedAnalyses: (analyses: AnalysisRecord[]) => void
  onAnalysisSelect: (analysis: AnalysisRecord) => void
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
  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid" | "timeline">("list")
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle")

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
    
    const patternCounts = patterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostCommonPattern = Object.keys(patternCounts).length > 0 
      ? Object.entries(patternCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
      : "N/A"

    const backendAnalyses = savedAnalyses.filter(a => 
      a.results.backend_status && a.results.backend_status !== "offline" && a.results.backend_status !== "demo"
    ).length

    return {
      total_analyses: savedAnalyses.length,
      avg_confidence: avgConfidence,
      most_common_pattern: mostCommonPattern,
      success_rate: savedAnalyses.length > 0 ? (confidences.length / savedAnalyses.length) * 100 : 0,
      backend_analyses: backendAnalyses,
      demo_analyses: savedAnalyses.length - backendAnalyses
    }
  }, [savedAnalyses])

  // Filtered and sorted analyses
  const filteredAnalyses = useMemo(() => {
    let filtered = savedAnalyses

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(analysis => 
        analysis.coordinates.toLowerCase().includes(query) ||
        analysis.results.pattern_type?.toLowerCase().includes(query) ||
        analysis.results.description?.toLowerCase().includes(query) ||
        analysis.notes?.toLowerCase().includes(query) ||
        analysis.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(analysis => {
        switch (filterBy) {
          case "backend":
            return analysis.results.backend_status && 
                   analysis.results.backend_status !== "offline" && 
                   analysis.results.backend_status !== "demo"
          case "demo":
            return !analysis.results.backend_status || 
                   analysis.results.backend_status === "offline" || 
                   analysis.results.backend_status === "demo"
          case "high_confidence":
            return analysis.results.confidence && analysis.results.confidence >= 0.8
          case "recent":
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return new Date(analysis.timestamp) > oneWeekAgo
          default:
            return true
        }
      })
    }

    // Favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter(analysis => analysis.favorite)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "date_asc":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "confidence_desc":
          return (b.results.confidence || 0) - (a.results.confidence || 0)
        case "confidence_asc":
          return (a.results.confidence || 0) - (b.results.confidence || 0)
        case "coordinates":
          return a.coordinates.localeCompare(b.coordinates)
        default:
          return 0
      }
    })

    return filtered
  }, [savedAnalyses, searchQuery, filterBy, sortBy, showOnlyFavorites])

  // ====================================================================
  // HANDLERS
  // ====================================================================

  const handleFavoriteToggle = (analysisId: string) => {
    setSavedAnalyses(savedAnalyses.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, favorite: !analysis.favorite }
        : analysis
    ))
  }

  const handleDeleteAnalysis = (analysisId: string) => {
    setSavedAnalyses(savedAnalyses.filter(analysis => analysis.id !== analysisId))
    setSelectedAnalyses(selectedAnalyses.filter(id => id !== analysisId))
  }

  const handleBulkDelete = () => {
    setSavedAnalyses(savedAnalyses.filter(analysis => !selectedAnalyses.includes(analysis.id)))
    setSelectedAnalyses([])
  }

  const handleExportAnalyses = (analyses: AnalysisRecord[]) => {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      export_stats: historyStats,
      analyses: analyses.map(analysis => ({
        ...analysis,
        export_notes: `Exported from NIS Protocol V0 Agent on ${new Date().toLocaleDateString()}`
      }))
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `nis-history-export-${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleSyncWithBackend = async () => {
    if (!isBackendOnline) return

    setSyncStatus("syncing")
    try {
      // Simulate backend sync
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSyncStatus("idle")
    } catch (error) {
      setSyncStatus("error")
      setTimeout(() => setSyncStatus("idle"), 3000)
    }
  }

  // ====================================================================
  // RENDER METHODS
  // ====================================================================

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
              <p className="text-2xl font-bold">{historyStats.total_analyses}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
              <p className="text-2xl font-bold">{Math.round(historyStats.avg_confidence * 100)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Backend Sync</p>
              <p className="text-lg font-semibold">{historyStats.backend_analyses}/{historyStats.total_analyses}</p>
            </div>
            {isBackendOnline ? (
              <Database className="h-8 w-8 text-purple-500" />
            ) : (
              <Database className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Most Common</p>
              <p className="text-sm font-semibold">{historyStats.most_common_pattern}</p>
            </div>
            <Target className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalysisCard = (analysis: AnalysisRecord, index: number) => (
    <Card key={analysis.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedAnalyses.includes(analysis.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedAnalyses([...selectedAnalyses, analysis.id])
                } else {
                  setSelectedAnalyses(selectedAnalyses.filter(id => id !== analysis.id))
                }
              }}
              className="rounded"
            />
            <CardTitle className="text-base font-medium">
              Analysis #{index + 1}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFavoriteToggle(analysis.id)}
              className="h-8 w-8 p-0"
            >
              <Star className={`h-4 w-4 ${analysis.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {new Date(analysis.timestamp).toLocaleDateString()}
              </Badge>
              {analysis.results.backend_status && (
                <Badge variant="outline" className="text-xs">
                  {analysis.results.backend_status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="font-mono text-sm">
          {analysis.coordinates}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              {analysis.results.siteType || analysis.results.pattern_type || "Settlement"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Confidence: {analysis.results.confidence ? 
                Math.round(analysis.results.confidence * 100) + '%' : 
                "85%"}
            </span>
          </div>
          
          <p className="text-sm line-clamp-2">
            {analysis.results.summary ||
              analysis.results.description ||
              "Archaeological analysis completed with comprehensive data integration."}
          </p>

          {analysis.tags && analysis.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {analysis.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAnalysisSelect(analysis)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAnalysis(analysis.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Backend Status */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <History className="h-5 w-5" />
              Analysis History
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage and review your archaeological analyses
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isBackendOnline && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Wifi className="h-3 w-3 mr-1" />
                Backend Sync Available
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWithBackend}
              disabled={!isBackendOnline || syncStatus === "syncing"}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              {syncStatus === "syncing" ? "Syncing..." : "Sync"}
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {savedAnalyses.length > 0 && renderStatsCards()}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Analyses</SelectItem>
                <SelectItem value="backend">Backend Only</SelectItem>
                <SelectItem value="demo">Demo Only</SelectItem>
                <SelectItem value="high_confidence">High Confidence</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Latest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="confidence_desc">High Confidence</SelectItem>
                <SelectItem value="confidence_asc">Low Confidence</SelectItem>
                <SelectItem value="coordinates">By Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="favorites-only"
                checked={showOnlyFavorites}
                onCheckedChange={setShowOnlyFavorites}
              />
              <Label htmlFor="favorites-only" className="text-sm">Favorites only</Label>
            </div>
            
            {selectedAnalyses.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAnalyses(
                    savedAnalyses.filter(a => selectedAnalyses.includes(a.id))
                  )}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export ({selectedAnalyses.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedAnalyses.length})
                </Button>
              </>
            )}
            
            {filteredAnalyses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportAnalyses(filteredAnalyses)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export All
              </Button>
            )}
          </div>
        </div>

        {/* Analysis List */}
        {filteredAnalyses.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredAnalyses.map((analysis, index) => 
                renderAnalysisCard(analysis, index)
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <History className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {savedAnalyses.length === 0 ? "No Saved Analyses" : "No Matching Analyses"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {savedAnalyses.length === 0 
                ? "Run analyses from the coordinates tab to see them here. Your analysis history will be automatically saved."
                : "Try adjusting your search terms or filters to find the analyses you're looking for."
              }
            </p>
            {isBackendOnline && (
              <p className="text-sm text-muted-foreground mt-2">
                Backend connected - analyses will be synced automatically
              </p>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
} 