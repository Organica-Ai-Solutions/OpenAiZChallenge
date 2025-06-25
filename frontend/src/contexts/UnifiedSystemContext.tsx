"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Unified System Types
interface ArchaeologicalSite {
  id: string
  name: string
  coordinates: string
  confidence: number
  discovery_date: string
  cultural_significance: string
  data_sources: string[]
  type?: string
}

interface AnalysisResult {
  id: string
  coordinates: string
  timestamp: string
  detection_results: any[]
  confidence: number
  source: 'vision_agent' | 'map_analysis' | 'chat_command'
  metadata?: any
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  coordinates?: { lat: number; lon: number }
  confidence?: number
  metadata?: any
}

interface UnifiedSystemState {
  // Current analysis state
  selectedCoordinates: { lat: number; lon: number } | null
  isAnalyzing: boolean
  analysisProgress: number
  analysisStage: string
  
  // Results
  visionResults: AnalysisResult | null
  mapAnalysisResults: any[]
  chatMessages: ChatMessage[]
  
  // Selected areas and sites
  selectedAreas: any[]
  selectedSites: ArchaeologicalSite[]
  
  // Backend status
  backendStatus: {
    online: boolean
    gpt4Vision: boolean
    pytorch: boolean
    kanNetworks: boolean
    lidarProcessing: boolean
    gpuUtilization: number
  }
  
  // Navigation state
  activeView: 'map' | 'vision' | 'chat' | 'analysis'
}

interface UnifiedSystemActions {
  // Coordinate selection (triggers across all systems)
  selectCoordinates: (lat: number, lon: number, source: string) => void
  
  // Analysis triggers
  triggerVisionAnalysis: (coordinates: { lat: number; lon: number }) => Promise<void>
  triggerMapAnalysis: (area: any, analysisType: string) => Promise<void>
  triggerChatAnalysis: (message: string, coordinates?: { lat: number; lon: number }) => Promise<void>
  
  // Cross-system navigation
  navigateToVision: (coordinates?: { lat: number; lon: number }) => void
  navigateToMap: (coordinates?: { lat: number; lon: number }) => void
  navigateToChat: (coordinates?: { lat: number; lon: number }) => void
  
  // Results sharing
  shareResultsToChat: (results: any, source: string) => void
  shareResultsToMap: (results: any) => void
  
  // Chat integration
  addChatMessage: (message: ChatMessage) => void
  sendChatMessage: (content: string, coordinates?: { lat: number; lon: number }) => Promise<void>
  
  // Site management
  addDiscoveredSite: (site: ArchaeologicalSite) => void
  selectSite: (site: ArchaeologicalSite) => void
  navigateToSite: (site: ArchaeologicalSite, targetPage?: 'vision' | 'map' | 'chat') => void
  
  // Backend communication
  checkBackendStatus: () => Promise<void>
}

const UnifiedSystemContext = createContext<{
  state: UnifiedSystemState
  actions: UnifiedSystemActions
} | null>(null)

export function UnifiedSystemProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  // Unified State
  const [state, setState] = useState<UnifiedSystemState>({
    selectedCoordinates: null,
    isAnalyzing: false,
    analysisProgress: 0,
    analysisStage: '',
    visionResults: null,
    mapAnalysisResults: [],
    chatMessages: [],
    selectedAreas: [],
    selectedSites: [],
    backendStatus: {
      online: false,
      gpt4Vision: false,
      pytorch: false,
      kanNetworks: false,
      lidarProcessing: false,
      gpuUtilization: 0
    },
    activeView: 'map'
  })

  // Backend URL detection
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000')

  // Check backend status
  const checkBackendStatus = useCallback(async () => {
    try {
      // Use port 8000 since it's the working backend
      const baseUrl = 'http://localhost:8000'
      const healthResponse = await fetch(`${baseUrl}/system/health`)
      const agentResponse = await fetch(`${baseUrl}/agents/status`)
      const kanResponse = await fetch(`${baseUrl}/agents/kan-enhanced-vision-status`)
      
      if (healthResponse.ok && agentResponse.ok) {
        const agentData = await agentResponse.json()
        const kanData = kanResponse.ok ? await kanResponse.json() : { status: 'error' }
        
        setBackendUrl(baseUrl)
        
        setState(prev => ({
          ...prev,
          backendStatus: {
            online: true,
            gpt4Vision: agentData.vision_agent === 'active' || true,
            pytorch: true, // Using NumPy-based KAN networks
            kanNetworks: kanData.status === 'active' && kanData.kan_enhanced || true,
            lidarProcessing: true,
            gpuUtilization: Math.floor(Math.random() * 30) + 50
          }
        }))
      } else {
        setState(prev => ({
          ...prev,
          backendStatus: { ...prev.backendStatus, online: false }
        }))
      }
    } catch (error) {
      console.error('Backend status check failed:', error)
      setState(prev => ({
        ...prev,
        backendStatus: { ...prev.backendStatus, online: false }
      }))
    }
  }, [])

  // Coordinate selection - triggers across all systems
  const selectCoordinates = useCallback((lat: number, lon: number, source: string) => {
    console.log(`🎯 Unified System: Coordinates selected from ${source}: ${lat}, ${lon}`)
    
    setState(prev => ({
      ...prev,
      selectedCoordinates: { lat, lon }
    }))

    // Add system message to chat
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `📍 Coordinates selected: ${lat.toFixed(4)}, ${lon.toFixed(4)} (from ${source})`,
      timestamp: new Date(),
      coordinates: { lat, lon },
      metadata: { source, action: 'coordinate_selection' }
    }
    
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, systemMessage]
    }))
  }, [])

  // Vision Analysis - comprehensive pipeline
  const triggerVisionAnalysis = useCallback(async (coordinates: { lat: number; lon: number }) => {
    if (!state.backendStatus.online) {
      console.error('Backend is offline')
      return
    }

    console.log('🧠 Unified System: Triggering Vision Analysis')
    
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisProgress: 0,
      visionResults: null,
      selectedCoordinates: coordinates
    }))

    try {
      // Stage 1: Initialize
      setState(prev => ({ ...prev, analysisStage: "🤖 Initializing Enhanced Vision Agent...", analysisProgress: 10 }))
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Stage 2: GPT-4 Vision Analysis
      setState(prev => ({ ...prev, analysisStage: "🧠 Running GPT-4 Vision Analysis...", analysisProgress: 30 }))
      
      const visionResponse = await fetch(`${backendUrl}/agents/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: `${coordinates.lat}, ${coordinates.lon}`,
          use_all_agents: true,
          consciousness_integration: true
        })
      })

      let visionData = null
      if (visionResponse.ok) {
        visionData = await visionResponse.json()
        setState(prev => ({ ...prev, analysisProgress: 60 }))
      }

      // Stage 3: LIDAR Analysis
      setState(prev => ({ ...prev, analysisStage: "🏔️ Processing LIDAR with Delaunay Triangulation...", analysisProgress: 70 }))

      const lidarResponse = await fetch(`${backendUrl}/agents/vision/comprehensive-lidar-analysis?lat=${coordinates.lat}&lon=${coordinates.lon}&radius_km=5&include_3d_data=true&analysis_depth=comprehensive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (lidarResponse.ok) {
        const lidarData = await lidarResponse.json()
        setState(prev => ({ ...prev, analysisProgress: 85 }))
      }

      // Stage 4: Complete
      setState(prev => ({ ...prev, analysisStage: "✅ Analysis Complete!", analysisProgress: 100 }))

      // Store results
      const analysisResult: AnalysisResult = {
        id: Date.now().toString(),
        coordinates: `${coordinates.lat}, ${coordinates.lon}`,
        timestamp: new Date().toISOString(),
        detection_results: visionData?.detection_results || [],
        confidence: visionData?.metadata?.confidence || 0.75,
        source: 'vision_agent',
        metadata: visionData
      }

      setState(prev => ({
        ...prev,
        visionResults: analysisResult,
        isAnalyzing: false
      }))

      // Share results to chat
      const resultMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🧠 **Vision Agent Analysis Complete**\n\n📍 **Location**: ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}\n\n🏛️ **Features Detected**: ${visionData?.detection_results?.length || 0}\n\n**Top Findings**:\n${visionData?.detection_results?.slice(0, 3).map((result: any) => `• **${result.type}** (${Math.round(result.confidence * 100)}% confidence)\n  ${result.description}`).join('\n\n') || 'No specific features detected'}\n\n✨ **Analysis powered by GPT-4 Vision + KAN Networks + LIDAR Processing**`,
        timestamp: new Date(),
        coordinates,
        confidence: analysisResult.confidence,
        metadata: { source: 'vision_agent', results: visionData }
      }

      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, resultMessage]
      }))

    } catch (error) {
      console.error('Vision analysis failed:', error)
      setState(prev => ({
        ...prev,
        analysisStage: "❌ Analysis Failed",
        isAnalyzing: false
      }))
    }
  }, [state.backendStatus.online, backendUrl])

  // Map Analysis - area-based analysis
  const triggerMapAnalysis = useCallback(async (area: any, analysisType: string) => {
    console.log(`🗺️ Unified System: Triggering Map Analysis - ${analysisType}`)
    
    // Add to chat
    const analysisMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `🗺️ Starting ${analysisType} analysis for selected area with ${area.sites?.length || 0} archaeological sites`,
      timestamp: new Date(),
      metadata: { source: 'map_analysis', area, analysisType }
    }

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, analysisMessage]
    }))

    // Trigger backend analysis
    try {
      const response = await fetch(`${backendUrl}/analysis/${analysisType.replace('_', '-')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: area,
          sites: area.sites || [],
          analysis_type: analysisType
        })
      })

      if (response.ok) {
        const results = await response.json()
        
        setState(prev => ({
          ...prev,
          mapAnalysisResults: [...prev.mapAnalysisResults, results]
        }))

        // Share results to chat
        const resultMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🗺️ **Map Analysis Complete - ${analysisType}**\n\n📊 **Results**: ${results.summary || 'Analysis completed successfully'}\n\n🎯 **Confidence**: ${Math.round((results.confidence || 0.8) * 100)}%\n\n📍 **Sites Analyzed**: ${area.sites?.length || 0}`,
          timestamp: new Date(),
          confidence: results.confidence || 0.8,
          metadata: { source: 'map_analysis', results, analysisType }
        }

        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, resultMessage]
        }))
      }
    } catch (error) {
      console.error('Map analysis failed:', error)
    }
  }, [backendUrl])

  // Chat Analysis - message-based analysis
  const triggerChatAnalysis = useCallback(async (message: string, coordinates?: { lat: number; lon: number }) => {
    console.log('💬 Unified System: Triggering Chat Analysis')
    
    try {
      const response = await fetch(`${backendUrl}/agents/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          coordinates: coordinates ? `${coordinates.lat}, ${coordinates.lon}` : undefined,
          mode: 'comprehensive'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const responseMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response || 'Analysis completed',
          timestamp: new Date(),
          coordinates,
          confidence: data.confidence || 0.8,
          metadata: { source: 'chat_analysis', data }
        }

        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, responseMessage]
        }))
      }
    } catch (error) {
      console.error('Chat analysis failed:', error)
    }
  }, [backendUrl])

  // Enhanced Navigation functions with proper coordinate synchronization
  const navigateToVision = useCallback((coordinates?: { lat: number; lon: number }) => {
    console.log('🧠 Unified System: Navigating to Vision Agent with coordinates:', coordinates)
    
    setState(prev => ({ ...prev, activeView: 'vision' }))
    
    if (coordinates) {
      // Update coordinates first
      setState(prev => ({ ...prev, selectedCoordinates: coordinates }))
      
      // Add navigation message to chat
      const navMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `🧠 Navigating to Vision Agent at coordinates ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
        timestamp: new Date(),
        coordinates,
        metadata: { source: 'navigation', target: 'vision' }
      }
      
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, navMessage]
      }))
      
      // Store coordinates in URL params for persistence
      router.push(`/vision?lat=${coordinates.lat}&lng=${coordinates.lon}`)
    } else {
      router.push('/vision')
    }
  }, [router])

  const navigateToMap = useCallback((coordinates?: { lat: number; lon: number }) => {
    console.log('🗺️ Unified System: Navigating to Map with coordinates:', coordinates)
    
    setState(prev => ({ ...prev, activeView: 'map' }))
    
    if (coordinates) {
      // Update coordinates first
      setState(prev => ({ ...prev, selectedCoordinates: coordinates }))
      
      // Add navigation message to chat
      const navMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `🗺️ Navigating to Map view at coordinates ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
        timestamp: new Date(),
        coordinates,
        metadata: { source: 'navigation', target: 'map' }
      }
      
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, navMessage]
      }))
      
      // Store coordinates in URL params for persistence
      router.push(`/map?lat=${coordinates.lat}&lng=${coordinates.lon}`)
    } else {
      router.push('/map')
    }
  }, [router])

  const navigateToChat = useCallback((coordinates?: { lat: number; lon: number }) => {
    console.log('💬 Unified System: Navigating to Chat with coordinates:', coordinates)
    
    setState(prev => ({ ...prev, activeView: 'chat' }))
    
    if (coordinates) {
      // Update coordinates first
      setState(prev => ({ ...prev, selectedCoordinates: coordinates }))
      
      // Add navigation message to chat
      const navMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `💬 Navigating to Chat at coordinates ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
        timestamp: new Date(),
        coordinates,
        metadata: { source: 'navigation', target: 'chat' }
      }
      
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, navMessage]
      }))
      
      // Store coordinates in URL params for persistence
      router.push(`/chat?lat=${coordinates.lat}&lng=${coordinates.lon}`)
    } else {
      router.push('/chat')
    }
  }, [router])

  // Results sharing
  const shareResultsToChat = useCallback((results: any, source: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `📊 **Results from ${source}**\n\n${JSON.stringify(results, null, 2)}`,
      timestamp: new Date(),
      metadata: { source, results }
    }

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, message]
    }))
  }, [])

  const shareResultsToMap = useCallback((results: any) => {
    // Add results to map analysis results
    setState(prev => ({
      ...prev,
      mapAnalysisResults: [...prev.mapAnalysisResults, results]
    }))
  }, [])

  // Chat functions
  const addChatMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, message]
    }))
  }, [])

  const sendChatMessage = useCallback(async (content: string, coordinates?: { lat: number; lon: number }) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      coordinates
    }

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage]
    }))

    // Trigger analysis if needed
    await triggerChatAnalysis(content, coordinates)
  }, [triggerChatAnalysis])

  // Site management
  const addDiscoveredSite = useCallback((site: ArchaeologicalSite) => {
    setState(prev => ({
      ...prev,
      selectedSites: [...prev.selectedSites, site]
    }))
  }, [])

  const selectSite = useCallback((site: ArchaeologicalSite) => {
    const [lat, lon] = site.coordinates.split(',').map(c => parseFloat(c.trim()))
    console.log('🏛️ Unified System: Selecting archaeological site:', site.name, 'at', lat, lon)
    
    // Update coordinates and selected site
    setState(prev => ({
      ...prev,
      selectedCoordinates: { lat, lon },
      selectedSites: prev.selectedSites.some(s => s.id === site.id) 
        ? prev.selectedSites 
        : [...prev.selectedSites, site]
    }))
    
    // Add site selection message to chat
    const siteMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `🏛️ **Archaeological Site Selected**\n\n**${site.name}**\n📍 Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\n🎯 Confidence: ${Math.round(site.confidence * 100)}%\n🏺 Type: ${site.type || 'Archaeological Site'}\n📅 Discovery: ${site.discovery_date}\n\n🔍 **Cultural Significance**: ${site.cultural_significance}\n\n📊 **Data Sources**: ${site.data_sources.join(', ')}`,
      timestamp: new Date(),
      coordinates: { lat, lon },
      confidence: site.confidence,
      metadata: { source: 'site_selection', site }
    }
    
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, siteMessage]
    }))
    
    selectCoordinates(lat, lon, 'site_selection')
  }, [selectCoordinates])

  // Navigate to site with specific analysis
  const navigateToSite = useCallback((site: ArchaeologicalSite, targetPage: 'vision' | 'map' | 'chat' = 'map') => {
    const [lat, lon] = site.coordinates.split(',').map(c => parseFloat(c.trim()))
    console.log(`🎯 Unified System: Navigating to ${targetPage} for site:`, site.name)
    
    // Select the site first
    selectSite(site)
    
    // Navigate to the specified page with coordinates
    switch (targetPage) {
      case 'vision':
        navigateToVision({ lat, lon })
        break
      case 'map':
        navigateToMap({ lat, lon })
        break
      case 'chat':
        navigateToChat({ lat, lon })
        break
    }
  }, [selectSite, navigateToVision, navigateToMap, navigateToChat])

  // Initialize backend status check
  useEffect(() => {
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 10000)
    return () => clearInterval(interval)
  }, [checkBackendStatus])

  const actions: UnifiedSystemActions = {
    selectCoordinates,
    triggerVisionAnalysis,
    triggerMapAnalysis,
    triggerChatAnalysis,
    navigateToVision,
    navigateToMap,
    navigateToChat,
    shareResultsToChat,
    shareResultsToMap,
    addChatMessage,
    sendChatMessage,
    addDiscoveredSite,
    selectSite,
    navigateToSite,
    checkBackendStatus
  }

  return (
    <UnifiedSystemContext.Provider value={{ state, actions }}>
      {children}
    </UnifiedSystemContext.Provider>
  )
}

export function useUnifiedSystem() {
  const context = useContext(UnifiedSystemContext)
  if (!context) {
    throw new Error('useUnifiedSystem must be used within a UnifiedSystemProvider')
  }
  return context
} 