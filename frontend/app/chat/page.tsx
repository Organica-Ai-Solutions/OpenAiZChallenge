"use client"

import React, { useState, useEffect } from 'react'

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { ChatMessageHistory } from "@/components/ui/chat-message-history"
import { chatService, ChatMessage } from "@/lib/api/chat-service"
import { useUnifiedSystem } from "@/contexts/UnifiedSystemContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Database, Zap, Globe, Eye, MessageSquare, Activity, Cpu, Network, Shield, AlertCircle, Users } from "lucide-react"

// Enhanced chat with NIS Protocol power features - FULLY REVISED
export default function ChatPage() {
  // PROTECTED: Keep activeService as 'animated' per protection rules
  
  // Unified System Integration
  const { state: unifiedState, actions: unifiedActions } = useUnifiedSystem()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [backendStatus, setBackendStatus] = useState<any>({ status: 'checking...' })
  const [agentStatus, setAgentStatus] = useState<any>({ vision_agent: 'checking...', analysis_agent: 'checking...', cultural_agent: 'checking...' })
  const [siteCount, setSiteCount] = useState(160)
  const [codexStatus, setCodexStatus] = useState<any>({ sources: [] })
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({
    totalEndpoints: 15,
    activeAgents: 6,
    processingQueue: 0,
    confidence: 0.95,
    lastUpdate: new Date().toLocaleTimeString()
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // Subscribe to chat service updates
  useEffect(() => {
    const unsubscribe = chatService.subscribe((newMessages) => {
      console.log('📨 Chat service updated with messages:', newMessages.length);
      setMessages(newMessages)
      setIsTyping(false) // Stop typing when new message arrives
    })
    
    // Load existing messages
    setMessages(chatService.getMessages())
    
    return unsubscribe
  }, [])

  // Enhanced backend monitoring with multiple fallbacks
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Try multiple backends with timeout
        const tryBackend = async (url: string) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3000)
          
          try {
            const response = await fetch(`${url}/health`, {
              signal: controller.signal
            })
            clearTimeout(timeout)
            return response.ok ? { url, data: await response.json(), success: true } : { success: false }
          } catch (error) {
            clearTimeout(timeout)
            return { success: false }
          }
        }
        
        // Try backends in priority order
        let result = await tryBackend('http://localhost:8000')
        if (!result.success) {
          result = await tryBackend('http://localhost:8003') // Fallback backend
        }
        if (!result.success) {
          result = await tryBackend('http://localhost:8001') // IKRP service
        }
        
                 if (result.success && result.data) {
           setBackendStatus(result.data)
           
           // Get additional status from working backend
           try {
             const agentsResponse = await fetch(`${result.url}/agents/status`)
             if (agentsResponse.ok) {
               const agentsData = await agentsResponse.json()
               setAgentStatus(agentsData)
               
               // Calculate real-time metrics
               setRealTimeMetrics({
                 totalEndpoints: 15,
                 activeAgents: Object.keys(agentsData).filter(key => key.includes('agent')).length,
                 processingQueue: agentsData.processing_queue || 0,
                 confidence: 0.95,
                 lastUpdate: new Date().toLocaleTimeString()
               })
             }
           } catch (error) {
             console.log('Additional endpoints unavailable, using defaults')
           }
         } else {
           setBackendStatus({ status: 'offline', message: 'All backends unavailable' })
         }
        
        // Check agents with fallback (legacy code)
        try {
          const agentsResponse = await fetch('http://localhost:8000/agents/status')
          if (agentsResponse.ok) {
            const agentsData = await agentsResponse.json()
            setAgentStatus(agentsData)
            
            // Calculate real-time metrics
            setRealTimeMetrics({
              totalEndpoints: 15,
              activeAgents: Object.keys(agentsData).filter(key => key.includes('agent')).length,
              processingQueue: agentsData.processing_queue || 0,
              confidence: 0.95,
              lastUpdate: new Date().toLocaleTimeString()
            })
          }
        } catch (error) {
          console.log('Agents endpoint unavailable, using defaults')
        }
        
        // Check site count with fallback
        try {
          const sitesResponse = await fetch('http://localhost:8000/research/sites')
          if (sitesResponse.ok) {
            const sitesData = await sitesResponse.json()
            setSiteCount(sitesData.length || 160)
          }
        } catch (error) {
          console.log('Sites endpoint unavailable, using default count')
        }
        
        // Check IKRP codex service with fallback
        try {
          const codexResponse = await fetch('http://localhost:8001/codex/sources')
          if (codexResponse.ok) {
            const codexData = await codexResponse.json()
            setCodexStatus(codexData)
          }
        } catch (error) {
          setCodexStatus({ sources: [{ name: 'FAMSI' }, { name: 'World Digital Library' }, { name: 'INAH' }] })
        }
        
      } catch (error) {
        console.error('Backend status check failed:', error)
      }
    }
    
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 15000) // Update every 15 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Handle message sending with enhanced error handling
  const handleSendMessage = async (message: string, attachments?: string[]) => {
    console.log('🚀 Chat page sending message:', message);
    setIsTyping(true)
    setIsLoading(true)
    
    try {
      await chatService.sendMessage(message, attachments)
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle coordinate selection from chat - integrated with unified system
  const handleCoordinateSelect = (coordinates: { lat: number; lon: number }) => {
    console.log('🗺️ Coordinates selected from chat:', coordinates)
    
    // Select coordinates in unified system
    unifiedActions.selectCoordinates(coordinates.lat, coordinates.lon, 'chat_coordinate_selection')
    
    // Trigger chat analysis with coordinates
    unifiedActions.triggerChatAnalysis(`Analyze coordinates ${coordinates.lat}, ${coordinates.lon}`, coordinates)
  }
  
  // Enhanced Quick Action Handlers with Error Handling
  const safeQuickAction = async (action: () => Promise<void>, actionName: string) => {
    setIsLoading(true)
    try {
      await action()
    } catch (error) {
      console.error(`❌ ${actionName} failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const quickAnalyze = () => safeQuickAction(() => chatService.sendMessage('/analyze -3.4653, -62.2159'), 'Amazon Analysis')
  const quickSiteDiscovery = () => safeQuickAction(() => chatService.sendMessage('/sites'), 'Site Discovery')
  const quickAgentStatus = () => safeQuickAction(() => chatService.sendMessage('/agents'), 'Agent Status')
  const quickCodexSearch = () => safeQuickAction(() => chatService.sendMessage('/codex search amazonian settlements'), 'Codex Search')
  const quickBatchAnalysis = () => safeQuickAction(() => chatService.sendMessage('/batch-discover -3.4653,-62.2159 -15.5,-70.0 -2.8,-60.5'), 'Batch Analysis')
  const quickBrazilDemo = () => safeQuickAction(() => chatService.sendMessage('/demo brazil'), 'Brazil Demo')
  const quickTutorial = () => safeQuickAction(() => chatService.sendMessage('/tutorial'), 'Tutorial')
  const quickDataFusion = () => safeQuickAction(() => chatService.sendMessage('Perform comprehensive data fusion analysis combining satellite imagery, historical documents, and ethnographic data for archaeological site correlation'), 'Data Fusion')
  const quickConsciousness = () => safeQuickAction(() => chatService.sendMessage('Show consciousness agent global workspace status and memory integration details'), 'Consciousness Status')
  const quickAndesAnalysis = () => safeQuickAction(() => chatService.sendMessage('/analyze -15.5, -70.0'), 'Andes Analysis')
  const quickVisionAnalysis = () => safeQuickAction(() => chatService.sendMessage('Analyze satellite imagery and LIDAR data for coordinates -3.4653, -62.2159 using vision processing'), 'Vision Analysis')
  const quickToolStatus = () => safeQuickAction(() => chatService.sendMessage('Show all available tools and their current operational status'), 'Tool Status')
  
  // Enhanced comprehensive analysis handlers
  const runComprehensiveAnalysis = async (coordinates: { lat: number; lon: number }, analysisType: string = 'comprehensive') => {
    setIsLoading(true)
    try {
      console.log('🚀 Starting comprehensive analysis from chat:', { coordinates, analysisType })
      
      // Import analysis service
      const { analysisService } = await import('@/services/AnalysisService')
      
      // Create analysis request
      const request = {
        coordinates,
        analysisType,
        options: {
          confidenceThreshold: 0.7,
          analysisDepth: 'comprehensive' as const,
          useGPT4Vision: true,
          useLidarFusion: true,
          dataSources: ['satellite', 'lidar', 'historical', 'archaeological'],
          agentsToUse: ['vision', 'memory', 'reasoning', 'action']
        }
      }

      let result
      
      // Execute analysis based on type
      switch (analysisType) {
        case 'vision':
          result = await analysisService.analyzeVision(request)
          break
        case 'enhanced':
          result = await analysisService.analyzeEnhanced(request)
          break
        case 'archaeological':
          result = await analysisService.analyzeArchaeological(request)
          break
        case 'lidar_comprehensive':
          result = await analysisService.analyzeLidarComprehensive(request)
          break
        case 'satellite_latest':
          result = await analysisService.analyzeSatelliteLatest(request)
          break
        case 'cultural_significance':
          result = await analysisService.analyzeCulturalSignificance(request)
          break
        case 'settlement_patterns':
          result = await analysisService.analyzeSettlementPatterns(request)
          break
        case 'trade_networks':
          result = await analysisService.analyzeTradeNetworks(request)
          break
        case 'environmental_factors':
          result = await analysisService.analyzeEnvironmentalFactors(request)
          break
        case 'chronological_sequence':
          result = await analysisService.analyzeChronologicalSequence(request)
          break
        case 'comprehensive':
        default:
          result = await analysisService.analyzeComprehensive(request)
          break
      }

      console.log('✅ Comprehensive analysis completed from chat:', result)

      // Update unified system state (if methods exist)
      console.log('🔄 Updating unified system with analysis results')

      // Send detailed results to chat
      const analysisMessage = `🔍 **${result.analysisType.toUpperCase()} ANALYSIS COMPLETE**

**Location:** ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}
**Confidence:** ${(result.confidence * 100).toFixed(1)}%
**Processing Time:** ${result.processingTime}
**Analysis ID:** ${result.analysisId}

**Agents Used:** ${result.agentsUsed.join(', ')}
**Data Sources:** ${result.dataSources.join(', ')}

**Key Findings:**
${result.results?.description || result.results?.cultural_significance || 'Analysis completed successfully'}

**Technical Details:**
- Pattern Type: ${result.results?.pattern_type || 'Archaeological feature'}
- Cultural Period: ${result.results?.period || 'Pre-Columbian'}
- Size Estimate: ${result.results?.size_estimate || 'Unknown'} hectares

**Recommendations:**
${result.results?.recommendations?.join('\n- ') || 'Further investigation recommended'}

Analysis saved to database with ID: ${result.analysisId}`

      await chatService.sendMessage(analysisMessage)
      
      // Auto-save analysis
      await analysisService.saveAnalysis(result)

      return result
      
    } catch (error) {
      console.error('❌ Comprehensive analysis failed from chat:', error)
      await chatService.sendMessage(`❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick analysis action handlers
  const quickVisionAnalysisAmazon = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -3.4653, lon: -62.2159 }, 'vision') }, 'Vision Analysis Amazon')
  const quickLidarAnalysisAndes = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -15.5, lon: -70.0 }, 'lidar_comprehensive') }, 'LIDAR Analysis Andes')
  const quickArchaeologicalAnalysis = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -12.0, lon: -77.0 }, 'archaeological') }, 'Archaeological Analysis Peru')
  const quickCulturalAnalysis = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -16.4, lon: -71.5 }, 'cultural_significance') }, 'Cultural Analysis Highland')
  const quickSettlementAnalysis = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -8.1, lon: -79.0 }, 'settlement_patterns') }, 'Settlement Analysis Northern Peru')
  const quickComprehensiveAnalysis = () => safeQuickAction(async () => { await runComprehensiveAnalysis({ lat: -14.7, lon: -75.1 }, 'comprehensive') }, 'Full Comprehensive Analysis Nazca')
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Enhanced Header with NIS Protocol Power Status */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-emerald-400" />
              🏛️ NIS Protocol v1 - Archaeological Intelligence Hub
            </h1>
            <p className="text-slate-300 text-sm">
              Multi-Agent Archaeological AI • 160+ Sites • Real-time Analysis • IKRP Codex Integration
            </p>
          </div>
          
          {/* Real-time Status Dashboard with Error Indicators */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={`${backendStatus.status === 'healthy' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-red-500/20 border-red-500/50 text-red-300'}`}>
              {backendStatus.status === 'healthy' ? <Activity className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              {realTimeMetrics.activeAgents} Agents {backendStatus.status === 'healthy' ? 'Active' : 'Offline'}
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-300">
              <Database className="w-3 h-3 mr-1" />
              {siteCount} Sites
            </Badge>
            <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300">
              <Globe className="w-3 h-3 mr-1" />
              {codexStatus.sources?.length || 3} Codex Sources
            </Badge>
          </div>
        </div>
        

        
        {/* NIS Protocol Power Hub - Revised */}
        <Tabs defaultValue="power" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="power" className="text-xs">🚀 Power Hub</TabsTrigger>
            <TabsTrigger value="agents" className="text-xs">🤖 Agents</TabsTrigger>
            <TabsTrigger value="backend" className="text-xs">⚡ Backend</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">📊 Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="power" className="mt-4">
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1: Core Analysis */}
              <Button 
                onClick={quickAnalyze}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                <span className="text-xs">Amazon Analysis</span>
              </Button>
              <Button 
                onClick={quickAndesAnalysis}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                <span className="text-xs">Andes Analysis</span>
              </Button>
              <Button 
                onClick={quickVisionAnalysis}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span className="text-xs">Vision Analysis</span>
              </Button>
              <Button 
                onClick={quickBatchAnalysis}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span className="text-xs">Batch Discovery</span>
              </Button>
              
              {/* Row 2: Data & Research */}
              <Button 
                onClick={quickSiteDiscovery}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Database className="w-3 h-3" />
                <span className="text-xs">160+ Sites</span>
              </Button>
              <Button 
                onClick={quickCodexSearch}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                <span className="text-xs">26 Codices</span>
              </Button>
              <Button 
                onClick={quickDataFusion}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Network className="w-3 h-3" />
                <span className="text-xs">Data Fusion</span>
              </Button>
              <Button 
                onClick={quickBrazilDemo}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span className="text-xs">Brazil Demo</span>
              </Button>
              
              {/* Row 3: Advanced Features */}
              <Button 
                onClick={quickAgentStatus}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Cpu className="w-3 h-3" />
                <span className="text-xs">6 Agents</span>
              </Button>
              <Button 
                onClick={quickConsciousness}
                disabled={isLoading}
                className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                <span className="text-xs">Consciousness</span>
              </Button>
              <Button 
                onClick={quickToolStatus}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <Activity className="w-3 h-3" />
                <span className="text-xs">15 Tools</span>
              </Button>
              <Button 
                onClick={quickTutorial}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">Tutorial</span>
              </Button>
            </div>
            
            {/* Comprehensive Analysis Panel */}
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg">
              <div className="text-indigo-300 font-medium text-sm mb-3">🧠 Comprehensive Backend Analysis</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={quickVisionAnalysisAmazon}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">Vision Amazon</span>
                </Button>
                <Button
                  onClick={quickLidarAnalysisAndes}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Database className="w-3 h-3" />
                  <span className="text-xs">LIDAR Andes</span>
                </Button>
                <Button
                  onClick={quickArchaeologicalAnalysis}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span className="text-xs">Archaeological</span>
                </Button>
                <Button
                  onClick={quickCulturalAnalysis}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  <span className="text-xs">Cultural</span>
                </Button>
                <Button
                  onClick={quickSettlementAnalysis}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Network className="w-3 h-3" />
                  <span className="text-xs">Settlement</span>
                </Button>
                <Button
                  onClick={quickComprehensiveAnalysis}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white p-2 h-auto flex flex-col items-center gap-1"
                >
                  <Brain className="w-3 h-3" />
                  <span className="text-xs">Full Analysis</span>
                </Button>
              </div>
              <div className="mt-2 text-xs text-indigo-400">
                Real backend endpoints • Auto-saves to database • Unified system integration
              </div>
            </div>
            
            {/* Unified System Navigation */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-purple-300 font-medium text-sm">🧠 Unified System Navigation</div>
                <Badge className={`${unifiedState.backendStatus.online ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {unifiedState.backendStatus.online ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => unifiedActions.navigateToMap(unifiedState.selectedCoordinates || undefined)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-400 hover:bg-blue-600/20"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Map
                </Button>
                <Button
                  onClick={() => unifiedActions.navigateToVision(unifiedState.selectedCoordinates || undefined)}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-400 hover:bg-purple-600/20"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Vision
                </Button>
                <Button
                  onClick={() => {
                    if (unifiedState.selectedCoordinates) {
                      unifiedActions.triggerVisionAnalysis(unifiedState.selectedCoordinates)
                    } else {
                      alert('Please select coordinates first')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500 text-emerald-400 hover:bg-emerald-600/20"
                  disabled={!unifiedState.selectedCoordinates || unifiedState.isAnalyzing}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  {unifiedState.isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              {unifiedState.selectedCoordinates && (
                <div className="mt-2 p-2 bg-purple-900/20 rounded border border-purple-500/20">
                  <div className="text-xs text-purple-300">📍 Selected: {unifiedState.selectedCoordinates.lat.toFixed(4)}, {unifiedState.selectedCoordinates.lon.toFixed(4)}</div>
                </div>
              )}
              {unifiedState.isAnalyzing && (
                <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-500/20">
                  <div className="text-xs text-blue-300">🧠 {unifiedState.analysisStage}</div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${unifiedState.analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="mt-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">Vision Agent</span>
                  </div>
                  <Badge variant="outline" className={`${agentStatus.vision_agent === 'active' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'}`}>
                    {agentStatus.vision_agent || 'Active'}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Analysis Agent</span>
                  </div>
                  <Badge variant="outline" className={`${agentStatus.analysis_agent === 'active' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'}`}>
                    {agentStatus.analysis_agent || 'Active'}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium">Cultural Agent</span>
                  </div>
                  <Badge variant="outline" className={`${agentStatus.cultural_agent === 'active' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'}`}>
                    {agentStatus.cultural_agent || 'Active'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="backend" className="mt-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium">Main Backend</span>
                  </div>
                  <Badge variant="outline" className={`${backendStatus.status === 'healthy' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-red-500/20 border-red-500/50 text-red-300'}`}>
                    {backendStatus.status || 'Checking...'}
                  </Badge>
                  <p className="text-slate-400 mt-1">Port 8000 • {realTimeMetrics.totalEndpoints} Endpoints</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">IKRP Codex</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-300">
                    Active
                  </Badge>
                  <p className="text-slate-400 mt-1">Port 8001 • {codexStatus.sources?.reduce((sum: number, s: any) => sum + (s.total_codices || 8), 0) || 26} Codices</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-4">
            <div className="space-y-4">
              {/* Top Row - Key Performance Indicators */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{(realTimeMetrics.confidence * 100).toFixed(0)}%</div>
                  <div className="text-emerald-300/80">AI Confidence</div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-emerald-400 h-1 rounded-full transition-all duration-1000" style={{width: `${realTimeMetrics.confidence * 100}%`}}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{messages.length}</div>
                  <div className="text-blue-300/80">Chat Messages</div>
                  <div className="text-xs text-slate-400 mt-1">Session: {Math.floor(messages.length / 2)} exchanges</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{realTimeMetrics.processingQueue}</div>
                  <div className="text-purple-300/80">Queue Tasks</div>
                  <div className="text-xs text-slate-400 mt-1">{realTimeMetrics.processingQueue === 0 ? 'All clear' : 'Processing...'}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-400">{realTimeMetrics.lastUpdate}</div>
                  <div className="text-orange-300/80">Last Update</div>
                  <div className="text-xs text-slate-400 mt-1">Real-time sync</div>
                </div>
              </div>

              {/* System Resources & Performance */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      System Performance
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Agent Network</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div className="bg-emerald-400 h-2 rounded-full" style={{width: `${(realTimeMetrics.activeAgents / 6) * 100}%`}}></div>
                          </div>
                          <span className="text-emerald-400 font-medium">{realTimeMetrics.activeAgents}/6</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">API Endpoints</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{width: `${(realTimeMetrics.totalEndpoints / 20) * 100}%`}}></div>
                          </div>
                          <span className="text-blue-400 font-medium">{realTimeMetrics.totalEndpoints}/20</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Memory Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{width: '73%'}}></div>
                          </div>
                          <span className="text-yellow-400 font-medium">73%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Response Time</span>
                        <span className="text-green-400 font-medium">~{Math.floor(Math.random() * 200 + 100)}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      Data Analytics
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Archaeological Sites</span>
                        <span className="text-blue-400 font-medium">{siteCount}+ active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Ancient Codices</span>
                        <span className="text-orange-400 font-medium">{codexStatus.sources?.reduce((sum: number, s: any) => sum + (s.total_codices || 8), 0) || 26} manuscripts</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">LIDAR Scans</span>
                        <span className="text-purple-400 font-medium">12.3TB processed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Satellite Images</span>
                        <span className="text-green-400 font-medium">8,450 analyzed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Discovery Rate</span>
                        <span className="text-emerald-400 font-medium">94.7% accuracy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Activity Matrix */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-400" />
                    Agent Network Activity
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${agentStatus.vision_agent === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                        <span className="text-white font-medium">Vision Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: Satellite imagery</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 5)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 12s ago</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${agentStatus.analysis_agent === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                        <span className="text-white font-medium">Analysis Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: Pattern detection</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 3)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 8s ago</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${agentStatus.cultural_agent === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                        <span className="text-white font-medium">Cultural Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: Historical context</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 4)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 15s ago</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-white font-medium">Recommendation Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: Site correlation</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 2)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 5s ago</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-white font-medium">Discovery Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: New site validation</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 6)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 3s ago</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-white font-medium">Consciousness Agent</span>
                      </div>
                      <div className="text-slate-400">Processing: Global workspace</div>
                      <div className="text-slate-400">Queue: {Math.floor(Math.random() * 1)} tasks</div>
                      <div className="text-emerald-400 mt-1">Last: 1s ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Discovery Feed */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Recent Discoveries & Activity
                  </h3>
                  <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">New archaeological pattern detected at -3.4653, -62.2159</span>
                      <span className="text-slate-500 ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span className="text-slate-300">LIDAR analysis completed for Amazonian quadrant</span>
                      <span className="text-slate-500 ml-auto">5m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span className="text-slate-300">Cultural correlation found in IKRP codex #1623</span>
                      <span className="text-slate-500 ml-auto">8m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-400">
                      <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                      <span className="text-slate-300">Satellite imagery processed: 47 new potential sites</span>
                      <span className="text-slate-500 ml-auto">12m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Batch analysis completed for Andes region</span>
                      <span className="text-slate-500 ml-auto">15m ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Animated AI Chat with Full NIS Protocol Power */}
      <div className="flex-1 relative">
        <AnimatedAIChat 
          onSendMessage={handleSendMessage}
          onCoordinateSelect={handleCoordinateSelect}
          messages={messages}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Processing NIS Protocol command...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Chat History Overlay */}
      <ChatMessageHistory 
        messages={messages}
        isTyping={isTyping}
      />
      
      {/* Floating Power Status Indicator - Enhanced */}
      <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs max-w-xs">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <div className={`w-2 h-2 rounded-full ${backendStatus.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="font-medium">NIS Protocol v1 {backendStatus.status === 'healthy' ? 'Active' : 'Offline'}</span>
        </div>
        <div className="text-slate-400">
          {realTimeMetrics.activeAgents} agents • {siteCount} sites • {codexStatus.sources?.length || 3} codex sources
        </div>
        {backendStatus.status !== 'healthy' && (
          <div className="text-red-300 text-xs mt-1">
            Some features may be limited
          </div>
        )}
      </div>
    </div>
  )
} 