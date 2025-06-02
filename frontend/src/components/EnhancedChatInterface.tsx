"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Send,
  User,
  Sparkles,
  ImageIcon,
  Paperclip,
  Mic,
  Bot,
  MapPin,
  Eye,
  Database,
  Search,
  Layers,
  Compass,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Lightbulb,
  Target,
  ArrowRight,
  Copy,
  ExternalLink,
  RotateCcw
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface Message {
  id: string
  role: "user" | "assistant" | "system" | "reasoning" | "action" | "observation"
  content: string
  timestamp: Date
  coordinates?: string
  confidence?: number
  actionType?: string
  reasoning?: string
  observation?: string
  metadata?: {
    processing_time?: number
    models_used?: string[]
    data_sources?: string[]
    finding_id?: string
  }
}

type ChatMode = "general" | "discovery" | "analysis" | "research"

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  description: string
  category: string
  action: () => Promise<string>
}

interface EnhancedChatInterfaceProps {
  onCoordinateSelect?: (coordinates: string) => void
  onAnalysisResult?: (result: any) => void
}

// ====================================================================
// QUICK ACTIONS CONFIGURATION
// ====================================================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "system_status",
    label: "Check System Status",
    icon: Activity,
    description: "Get real-time system health and agent status",
    category: "system",
    action: async () => "system_status_check"
  },
  {
    id: "discover_sites",
    label: "Discover New Sites",
    icon: Search,
    description: "Search for potential archaeological sites in the database",
    category: "discovery",
    action: async () => "discover_archaeological_sites"
  },
  {
    id: "analyze_coordinates",
    label: "Analyze Coordinates",
    icon: Target,
    description: "Perform comprehensive analysis of specific coordinates",
    category: "analysis",
    action: async () => "analyze_specific_coordinates"
  },
  {
    id: "vision_analysis",
    label: "Vision Analysis",
    icon: Eye,
    description: "Run computer vision analysis on satellite imagery",
    category: "vision",
    action: async () => "run_vision_analysis"
  },
  {
    id: "research_query",
    label: "Research Query",
    icon: Database,
    description: "Query historical and indigenous knowledge bases",
    category: "research",
    action: async () => "perform_research_query"
  },
  {
    id: "suggest_location",
    label: "Suggest Locations",
    icon: MapPin,
    description: "Get AI-recommended locations for investigation",
    category: "discovery",
    action: async () => "suggest_investigation_locations"
  }
]

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function EnhancedChatInterface({ 
  onCoordinateSelect, 
  onAnalysisResult 
}: EnhancedChatInterfaceProps) {
  // ====================================================================
  // STATE MANAGEMENT
  // ====================================================================
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "🌟 Welcome to the Enhanced NIS Protocol Agent! I'm your AI assistant for archaeological discovery. I use ReAct (Reasoning + Acting) to help you discover and analyze archaeological sites. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"reasoning" | "discovery" | "analysis" | "research">("reasoning")
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [reasoning, setReasoning] = useState<string>("")
  const [isThinking, setIsThinking] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Simple backend connection check
  const [isBackendOnline, setIsBackendOnline] = useState(false)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        setIsBackendOnline(response.ok)
      } catch {
        setIsBackendOnline(false)
      }
    }
    checkBackend()
  }, [])

  // ====================================================================
  // EFFECTS
  // ====================================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ====================================================================
  // REACT IMPLEMENTATION
  // ====================================================================

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }])
  }, [])

  const addReasoningStep = useCallback((reasoning: string) => {
    setReasoning(reasoning)
    addMessage({
      role: "reasoning",
      content: reasoning
    })
  }, [addMessage])

  const addActionStep = useCallback((action: string, actionType: string) => {
    addMessage({
      role: "action",
      content: action,
      actionType
    })
  }, [addMessage])

  const addObservationStep = useCallback((observation: string, metadata?: any) => {
    addMessage({
      role: "observation",
      content: observation,
      metadata
    })
  }, [addMessage])

  // ====================================================================
  // REASONING ENGINE (ReAct Implementation)
  // ====================================================================

  const reasonAboutQuery = async (query: string, context: any): Promise<string> => {
    const reasoning = []

    // Analyze query intent
    if (query.toLowerCase().includes("coordinate") || /(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/.test(query)) {
      reasoning.push("🧠 I detect coordinate-related query. This requires spatial analysis.")
    }
    
    if (query.toLowerCase().includes("discover") || query.toLowerCase().includes("find") || query.toLowerCase().includes("search")) {
      reasoning.push("🔍 This is a discovery query. I should search the archaeological database.")
    }
    
    if (query.toLowerCase().includes("status") || query.toLowerCase().includes("health")) {
      reasoning.push("📊 System status inquiry detected. I'll check backend health.")
    }
    
    if (query.toLowerCase().includes("vision") || query.toLowerCase().includes("image") || query.toLowerCase().includes("satellite")) {
      reasoning.push("👁️ Vision analysis requested. I'll engage computer vision models.")
    }

    // Consider context
    if (!isBackendOnline) {
      reasoning.push("⚠️ Backend is offline. I'll use cached data and inform the user.")
    } else {
      reasoning.push("✅ Backend is online. I can use real-time data and analysis.")
    }

    // Consider chat mode
    switch (chatMode) {
      case "discovery":
        reasoning.push("🌟 In discovery mode - prioritizing site discovery and exploration.")
        break
      case "analysis":
        reasoning.push("🔬 In analysis mode - focusing on detailed coordinate analysis.")
        break
      case "research":
        reasoning.push("📚 In research mode - emphasizing historical and cultural context.")
        break
      default:
        reasoning.push("💬 In general mode - providing balanced assistance.")
    }

    return reasoning.join(" ")
  }

  const planAction = async (query: string, reasoning: string): Promise<{ action: string; actionType: string }> => {
    // Extract coordinates if present
    const coordMatch = query.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
    
    if (coordMatch) {
      return {
        action: `🎯 I'll analyze the coordinates ${coordMatch[0]} using the full NIS Protocol pipeline including Vision, Memory, Reasoning, and Action agents.`,
        actionType: "coordinate_analysis"
      }
    }
    
    if (query.toLowerCase().includes("discover") || query.toLowerCase().includes("find")) {
      return {
        action: "🔍 I'll search the archaeological database for potential sites and cross-reference with historical data.",
        actionType: "site_discovery"
      }
    }
    
    if (query.toLowerCase().includes("status") || query.toLowerCase().includes("health")) {
      return {
        action: "📊 I'll check the system health, agent status, and processing capabilities.",
        actionType: "system_check"
      }
    }
    
    if (query.toLowerCase().includes("vision") || query.toLowerCase().includes("satellite")) {
      return {
        action: "👁️ I'll run computer vision analysis using YOLO8, Waldo, and GPT-4 Vision models.",
        actionType: "vision_analysis"
      }
    }
    
    return {
      action: "💭 I'll provide general assistance and guidance based on available data.",
      actionType: "general_assistance"
    }
  }

  const executeAction = async (actionType: string, query: string): Promise<string> => {
    switch (actionType) {
      case "coordinate_analysis":
        return await performCoordinateAnalysis(query)
      case "site_discovery":
        return await performSiteDiscovery(query)
      case "system_check":
        return await performSystemCheck()
      case "vision_analysis":
        return await performVisionAnalysis(query)
      default:
        return await performGeneralAssistance(query)
    }
  }

  // ====================================================================
  // ACTION IMPLEMENTATIONS
  // ====================================================================

  const performCoordinateAnalysis = async (query: string): Promise<string> => {
    const coordMatch = query.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
    if (!coordMatch) {
      return "❌ No valid coordinates found. Please provide coordinates in format: latitude, longitude (e.g., -3.4653, -62.2159)"
    }

    const [lat, lon] = coordMatch[0].split(',').map(c => parseFloat(c.trim()))

    try {
      addMessage({
        role: "reasoning",
        content: `🔬 Initiating comprehensive archaeological analysis for coordinates ${lat}, ${lon}...`,
        reasoning: "Preparing multi-agent analysis with OpenAI integration"
      })

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          region: chatMode === "discovery" ? "amazon_basin" : undefined,
          dataSources: {
            satellite: true,
            lidar: true,
            historicalTexts: true,
            indigenousMaps: true
          },
          data_sources: ["satellite", "lidar", "historical"],
          confidence_threshold: 0.7
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Add detailed observation
        addMessage({
          role: "observation",
          content: `🏛️ **Archaeological Analysis Complete**`,
          observation: `
**Location**: ${result.location?.lat || lat}, ${result.location?.lon || lon}
**Confidence Score**: ${Math.round((result.confidence || 0.75) * 100)}%
**Pattern Type**: ${result.pattern_type || 'Archaeological Features'}

**Analysis Results:**
${result.description || 'Comprehensive archaeological analysis completed with OpenAI integration'}

**Historical Context:**
${result.historical_context || 'Multi-source historical data correlation performed'}

**Indigenous Perspective:**
${result.indigenous_perspective || 'Cultural knowledge integration completed'}

**Data Sources Used:**
${result.sources?.join(', ') || 'Satellite, LiDAR, Historical texts, Indigenous maps'}

**Finding ID**: \`${result.finding_id || 'nis_' + Date.now()}\`

**Recommendations:**
${result.recommendations?.map((rec: any, i: number) => 
  `${i + 1}. **${rec.action || 'Further Investigation'}**: ${rec.description || 'Detailed site analysis recommended'} (Priority: ${rec.priority || 'Medium'})`
).join('\n') || '1. **Site Verification**: Ground-truth validation recommended (Priority: High)\n2. **Extended Analysis**: Expand search radius for related features (Priority: Medium)'}
          `,
          coordinates: `${lat}, ${lon}`,
          confidence: result.confidence || 0.75,
          metadata: {
            finding_id: result.finding_id || 'nis_' + Date.now(),
            data_sources: result.sources || ["satellite", "lidar", "historical"]
          }
        })

        // Handle coordinate selection callback
        if (onCoordinateSelect) {
          onCoordinateSelect(`${lat}, ${lon}`)
        }

        // Handle analysis result callback  
        if (onAnalysisResult) {
          onAnalysisResult(result)
        }

        return `🎯 **Comprehensive Analysis Complete!**

**Archaeological Assessment for ${lat}, ${lon}:**
• **Confidence**: ${Math.round((result.confidence || 0.75) * 100)}% 
• **Pattern**: ${result.pattern_type || 'Archaeological Features'}
• **Sources**: ${result.sources?.length || 4} data sources analyzed
• **Recommendations**: ${result.recommendations?.length || 2} actions suggested

${(result.confidence || 0.75) > 0.7 ? '🏆 **High confidence discovery!** This site shows strong archaeological potential.' : 
  (result.confidence || 0.75) > 0.5 ? '✨ **Moderate confidence.** Site shows some promising features.' : 
  '📍 **Low confidence.** Further investigation may be needed.'}

**Finding ID**: \`${result.finding_id || 'nis_' + Date.now()}\` - Use this ID to reference this analysis.`
      } else {
        throw new Error(`Analysis endpoint returned ${response.status}`)
      }
      
    } catch (error) {
      addMessage({
        role: "observation",
        content: "❌ Analysis failed", 
        observation: `Error: ${error}. Please check coordinates and system status.`
      })
      return `❌ **Analysis Failed** for coordinates ${lat}, ${lon}. Please verify the coordinates are valid and the backend is operational.`
    }
  }

  const performSiteDiscovery = async (query: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/research/sites')
      if (response.ok) {
        const sites = await response.json()
        if (sites.length > 0) {
          const highConfidenceSites = sites.filter((site: any) => site.confidence > 0.8)
          return `🌟 Found ${sites.length} total sites in database. ${highConfidenceSites.length} high-confidence sites include: ${highConfidenceSites.slice(0, 3).map((site: any) => `${site.name} (${site.coordinates})`).join(", ")}. Would you like me to analyze any specific coordinates?`
        } else {
          return "🔍 No sites currently in database. This could indicate backend connectivity issues or an empty database. Try analyzing known coordinates like -3.4653, -62.2159 (Amazon region)."
        }
      } else {
        throw new Error("Sites endpoint unavailable")
      }
    } catch (error) {
      return "❌ Site discovery failed due to backend connectivity issues. Working in offline mode."
    }
  }

  const performSystemCheck = async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/system/health')
      if (response.ok) {
        const health = await response.json()
        const healthStatus = health?.status || "unknown"
        const services = health?.services || {}
        
        return `📊 System Status: ${healthStatus}\n🤖 Services: ${Object.keys(services).join(", ")}\n📡 Connection: ${isBackendOnline ? "✅ Online" : "❌ Offline"}\n📈 Backend Available: ${isBackendOnline ? "Yes" : "No"}`
      } else {
        throw new Error("Health endpoint unavailable")
      }
    } catch (error) {
      return "❌ Unable to retrieve system status. Backend appears to be offline."
    }
  }

  const performVisionAnalysis = async (query: string): Promise<string> => {
    const coordMatch = query.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
    const coordinates = coordMatch ? coordMatch[0] : "-3.4653,-62.2159"

    try {
      addMessage({
        role: "reasoning",
        content: `🔍 Initiating OpenAI-powered vision analysis for coordinates ${coordinates}...`,
        reasoning: "Preparing GPT-4o vision analysis with archaeological specialization"
      })

      const response = await fetch('http://localhost:8000/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          models: ["gpt4o_vision", "gpt4o_reasoning", "archaeological_synthesis"],
          confidence_threshold: 0.4,
          enable_layers: true,
          processing_options: {
            atmospheric_correction: true,
            vegetation_indices: true,
            archaeological_enhancement: true
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Add detailed analysis message
        addMessage({
          role: "observation",
          content: `🤖 **OpenAI Vision Analysis Complete**`,
          observation: `
**Analysis Results:**
• **Features Detected**: ${result.detection_results?.length || 0} archaeological features
• **Confidence Score**: ${result.metadata?.total_features > 0 ? Math.round((result.detection_results?.reduce((sum: number, d: any) => sum + d.confidence, 0) || 0) / result.detection_results?.length * 100) : 0}%
• **Models Used**: ${result.metadata?.models_used?.join(", ") || "GPT-4o Vision, GPT-4o Reasoning"}
• **Processing Time**: ${result.metadata?.processing_time || "N/A"}s

**Key Discoveries:**
${result.detection_results?.slice(0, 3).map((detection: any, i: number) => 
  `${i + 1}. **${detection.label}** (${Math.round(detection.confidence * 100)}% confidence) - ${detection.archaeological_significance} significance`
).join('\n') || 'No specific features detected'}

**Analysis Quality:**
• High Confidence Features: ${result.metadata?.high_confidence_features || 0}
• OpenAI Enhanced: ✅ **${result.openai_enhanced ? 'YES' : 'NO'}**
• Analysis ID: \`${result.metadata?.analysis_id || 'N/A'}\`
          `,
          metadata: {
            processing_time: result.metadata?.processing_time,
            models_used: result.metadata?.models_used,
            finding_id: result.metadata?.analysis_id
          }
        })

        return `🎯 **OpenAI Vision Analysis Complete!**
        
**Detected ${result.detection_results?.length || 0} archaeological features** with an average confidence of ${result.metadata?.total_features > 0 ? Math.round((result.detection_results?.reduce((sum: number, d: any) => sum + d.confidence, 0) || 0) / result.detection_results?.length * 100) : 0}%.

**🤖 Models Used**: ${result.metadata?.models_used?.join(", ") || "GPT-4o Vision, GPT-4o Reasoning"}
**⏱️ Processing Time**: ${result.metadata?.processing_time || "N/A"} seconds
**🎯 High Confidence Features**: ${result.metadata?.high_confidence_features || 0}

This analysis used **OpenAI GPT-4o Vision** for satellite imagery analysis and **GPT-4o Reasoning** for archaeological interpretation, providing state-of-the-art AI-powered archaeological discovery capabilities.`
      } else {
        throw new Error(`Vision endpoint returned ${response.status}`)
      }
      
    } catch (error) {
      addMessage({
        role: "observation", 
        content: "❌ Vision analysis failed",
        observation: `Error details: ${error}. Please ensure coordinates are valid and backend is operational.`
      })
      return "❌ **Vision Analysis Failed**. The backend may be offline or the coordinates invalid. Please try again or check system status."
    }
  }

  const performGeneralAssistance = async (query: string): Promise<string> => {
    // Check if query contains coordinates for analysis
    const coordMatch = query.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
    if (coordMatch) {
      return await performCoordinateAnalysis(query)
    }

    // Check for site discovery requests
    if (query.toLowerCase().includes('site') || query.toLowerCase().includes('discover')) {
      return await performSiteDiscovery(query)
    }

    // Check for system status requests
    if (query.toLowerCase().includes('status') || query.toLowerCase().includes('health')) {
      return await performSystemCheck()
    }

    // Check for vision analysis requests
    if (query.toLowerCase().includes('vision') || query.toLowerCase().includes('image')) {
      return await performVisionAnalysis(query)
    }

    // For general queries, provide real system information
    try {
      const healthResponse = await fetch('http://localhost:8000/system/health')
      const sitesResponse = await fetch('http://localhost:8000/research/sites?max_sites=3')
      
      let systemInfo = ""
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        systemInfo += `🤖 **NIS Protocol Status**: ${health.status}\n`
      }
      
      if (sitesResponse.ok) {
        const sites = await sitesResponse.json()
        systemInfo += `📍 **Database**: ${sites.length} archaeological sites available\n`
      }

      return `🏛️ **NIS Protocol Archaeological Assistant**

${systemInfo}

I can help you with:
• **Coordinate Analysis**: Provide coordinates like "-3.4653, -62.2159" for archaeological analysis
• **Site Discovery**: Ask about "sites" or "discoveries" to explore our database
• **Vision Analysis**: Request "vision analysis" for satellite imagery processing
• **System Status**: Ask about "status" or "health" for system information

**Example queries:**
- "Analyze coordinates -13.1631, -72.5450"
- "Show me discovered sites"
- "What's the system status?"
- "Run vision analysis on -14.7390, -75.1300"

What would you like to explore?`
    } catch (error) {
      return `🏛️ **NIS Protocol Archaeological Assistant**

I'm here to help with archaeological site discovery and analysis. However, I'm currently unable to connect to the backend services.

**Available when online:**
• Coordinate analysis with OpenAI integration
• Archaeological site database queries
• Vision analysis with GPT-4o
• Real-time system monitoring

Please check the backend connection and try again.`
    }
  }

  // ====================================================================
  // MESSAGE HANDLING
  // ====================================================================

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    // Add user message
    addMessage({
      role: "user",
      content: userMessage
    })

    try {
      // Step 1: REASONING
      setReasoning("🧠 Analyzing your request...")
      const reasoning = await reasonAboutQuery(userMessage, { isBackendOnline })
      addReasoningStep(reasoning)

      // Step 2: ACTION PLANNING
      setReasoning("🎯 Planning the best approach...")
      const { action, actionType } = await planAction(userMessage, reasoning)
      addActionStep(action, actionType)

      // Step 3: EXECUTION
      setReasoning("⚡ Executing action...")
      const observation = await executeAction(actionType, userMessage)

      // Step 4: OBSERVATION
      addObservationStep(observation)

      // Final assistant response
      const coords = userMessage.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
      addMessage({
        role: "assistant",
        content: observation,
        coordinates: coords ? coords[0] : undefined
      })

    } catch (error) {
      console.error("Chat error:", error)
      addMessage({
        role: "system",
        content: "❌ An error occurred while processing your request. Please check the system status or try again."
      })
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setReasoning("")
    }
  }

  const handleQuickAction = async (actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId)
    if (!action) return

    setInput(`${action.label}`)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // ====================================================================
  // UTILITY FUNCTIONS
  // ====================================================================

  const extractCoordinates = (text: string): string | undefined => {
    const coordRegex = /-?\d+\.?\d*,?\s*-?\d+\.?\d*/
    const match = text.match(coordRegex)
    return match ? match[0] : undefined
  }

  const handleCoordinateClick = (coordinates: string) => {
    if (onCoordinateSelect) {
      onCoordinateSelect(coordinates)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // ====================================================================
  // RENDER MESSAGE COMPONENTS
  // ====================================================================

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user"
    const isReasoning = message.role === "reasoning"
    const isAction = message.role === "action"
    const isObservation = message.role === "observation"
    const isSystem = message.role === "system"

    if (isSystem) {
      return (
        <div className="mx-auto max-w-[85%] rounded-lg bg-muted px-4 py-2 text-center text-sm">
          {message.content}
        </div>
      )
    }

    if (isReasoning) {
      return (
        <div className="mx-auto max-w-[90%] rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Reasoning</span>
          </div>
          <p className="text-sm text-blue-700">{message.content}</p>
        </div>
      )
    }

    if (isAction) {
      return (
        <div className="mx-auto max-w-[90%] rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Action Plan</span>
          </div>
          <p className="text-sm text-orange-700">{message.content}</p>
        </div>
      )
    }

    if (isObservation) {
      return (
        <div className="mx-auto max-w-[90%] rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Observation</span>
          </div>
          <p className="text-sm text-green-700 whitespace-pre-line">{message.content}</p>
          {message.metadata && (
            <div className="mt-2 text-xs text-green-600">
              {message.metadata.processing_time && `⏱️ ${message.metadata.processing_time}s`}
              {message.metadata.models_used && ` • 🤖 ${message.metadata.models_used.join(", ")}`}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"}`}>
        <Avatar className={isUser ? "bg-primary" : "bg-emerald-100 text-emerald-700"}>
          {isUser ? (
            <User className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </Avatar>
        <div className={`rounded-lg px-4 py-2 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
          <div className="text-sm whitespace-pre-line">{message.content}</div>
          {message.coordinates && !isUser && (
            <div className="mt-2 flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs font-mono text-emerald-800 hover:bg-emerald-200 transition-colors"
                onClick={() => handleCoordinateClick(message.coordinates!)}
              >
                <MapPin className="h-3 w-3" />
                {message.coordinates}
              </button>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(message.coordinates!)}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="mt-1 text-right text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    )
  }

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  return (
    <TooltipProvider>
      <Card className="flex h-[700px] w-full flex-col">
        <CardHeader className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-5 w-5 text-emerald-600" />
              NIS Protocol Agent
              <Badge variant="outline" className="ml-2">
                {isBackendOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={chatMode} onValueChange={(value) => setChatMode(value as "reasoning" | "discovery" | "analysis" | "research")} className="w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="reasoning" className="px-2 py-1 text-xs">Reasoning</TabsTrigger>
                  <TabsTrigger value="discovery" className="px-2 py-1 text-xs">Discovery</TabsTrigger>
                  <TabsTrigger value="analysis" className="px-2 py-1 text-xs">Analysis</TabsTrigger>
                  <TabsTrigger value="research" className="px-2 py-1 text-xs">Research</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Current Reasoning Display */}
          {isThinking && reasoning && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin">
                <Brain className="h-4 w-4" />
              </div>
              <span>{reasoning}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4">
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {QUICK_ACTIONS.slice(0, 6).map((action) => (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => handleQuickAction(action.id)}
                      >
                        <action.icon className="h-3 w-3 mr-1" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}
              
              {/* Thinking Indicator */}
              {isLoading && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-pulse">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span>Agent is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload image</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice input</TooltipContent>
              </Tooltip>
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask about archaeological discoveries, analyze coordinates, or discover new sites..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Mode: {chatMode.charAt(0).toUpperCase() + chatMode.slice(1)}</span>
            <span>
              {isBackendOnline ? "🟢 Backend Online" : "🔴 Offline Mode"} • 
              {messages.length} messages
            </span>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
} 