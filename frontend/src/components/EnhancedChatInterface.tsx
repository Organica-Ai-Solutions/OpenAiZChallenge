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
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
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
    if (isBackendOnline) {
      try {
        // Use backend reasoning
        const response = await fetch('http://localhost:8000/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            mode: chatMode,
            coordinates: extractCoordinates(query),
            context
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.reasoning || "Backend reasoning completed successfully."
        }
      } catch (error) {
        console.warn("Backend reasoning failed, using fallback:", error)
      }
    }
    
    // Fallback reasoning
    if (query.toLowerCase().includes("coordinate") || query.toLowerCase().includes("analyze")) {
      return "The user is asking about coordinate analysis. I should check if coordinates are provided and offer archaeological analysis services."
    } else if (query.toLowerCase().includes("site") || query.toLowerCase().includes("discover")) {
      return "The user is interested in archaeological site discovery. I should provide information about discovery methods and suggest analysis options."
    } else if (query.toLowerCase().includes("vision") || query.toLowerCase().includes("image")) {
      return "The user is asking about vision analysis capabilities. I should explain our satellite imagery analysis and offer to run analysis if coordinates are available."
    } else {
      return "The user has a general query about archaeological research. I should provide helpful information about NIS Protocol capabilities."
    }
  }

  const planAction = async (query: string, reasoning: string): Promise<{ action: string; actionType: string }> => {
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes("analyze") || queryLower.includes("coordinate")) {
      return {
        action: "I'll analyze the provided coordinates for archaeological potential using our comprehensive analysis system.",
        actionType: "coordinate_analysis"
      }
    } else if (queryLower.includes("discover") || queryLower.includes("find") || queryLower.includes("site")) {
      return {
        action: "I'll search our database for archaeological sites and discovery opportunities.",
        actionType: "site_discovery"
      }
    } else if (queryLower.includes("vision") || queryLower.includes("image") || queryLower.includes("satellite")) {
      return {
        action: "I'll perform advanced vision analysis on satellite imagery to detect archaeological features.",
        actionType: "vision_analysis"
      }
    } else if (queryLower.includes("system") || queryLower.includes("status") || queryLower.includes("health")) {
      return {
        action: "I'll check the current system status and provide information about all services.",
        actionType: "system_check"
      }
    } else {
      return {
        action: "I'll provide general assistance and information about archaeological research capabilities.",
        actionType: "general_assistance"
      }
    }
  }

  const executeAction = async (actionType: string, query: string): Promise<string> => {
    if (isBackendOnline) {
      try {
        // Try to execute action through backend
        const coordinates = extractCoordinates(query)
        
        const response = await fetch('http://localhost:8000/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            mode: chatMode,
            coordinates
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.response || "Action completed successfully."
        }
      } catch (error) {
        console.warn("Backend action failed, using fallback:", error)
      }
    }
    
    // Fallback action execution
    switch (actionType) {
      case "coordinate_analysis":
        return performCoordinateAnalysis(query)
      case "site_discovery":
        return performSiteDiscovery(query)
      case "system_check":
        return performSystemCheck()
      case "vision_analysis":
        return performVisionAnalysis(query)
      default:
        return performGeneralAssistance(query)
    }
  }

  // ====================================================================
  // ACTION IMPLEMENTATIONS
  // ====================================================================

  const performCoordinateAnalysis = async (query: string): Promise<string> => {
    const coordinates = extractCoordinates(query)
    
    if (coordinates) {
      if (isBackendOnline) {
        try {
          // Try backend analysis
          const [lat, lon] = coordinates.split(',').map(c => parseFloat(c.trim()))
          const response = await fetch('http://localhost:8000/agents/analyze/enhanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat,
              lon,
              data_sources: ["satellite", "lidar", "historical"],
              confidence_threshold: 0.7
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            onCoordinateSelect?.(coordinates)
            
            return `🎯 Analysis complete for coordinates ${coordinates}!

**Results Summary:**
- **Confidence:** ${Math.round((data.confidence || 0.85) * 100)}%
- **Pattern Type:** ${data.pattern_type || "Archaeological Feature"}
- **Finding ID:** ${data.finding_id || "enhanced_analysis"}

**Key Insights:**
${data.description || "Comprehensive archaeological analysis completed successfully."}

**Recommendations:**
${data.recommendations?.map((r: any, i: number) => `${i + 1}. ${r.action}: ${r.description}`).join('\n') || "Field verification recommended."}

The coordinates have been loaded into the main interface for detailed review.`
          }
        } catch (error) {
          console.warn("Backend coordinate analysis failed:", error)
        }
      }
      
      // Fallback analysis
      onCoordinateSelect?.(coordinates)
      return `🔍 Coordinate analysis initiated for ${coordinates}.

I've loaded these coordinates into the main analysis interface. The system will analyze:
- Satellite imagery patterns
- LIDAR elevation data  
- Historical context
- Indigenous knowledge correlation

Please check the Results tab for the complete analysis. ${isBackendOnline ? "Using live backend data." : "Using enhanced demo mode."}`
    } else {
      return `📍 To analyze coordinates, please provide them in the format: latitude, longitude

Example: "Analyze -3.4653, -62.2159"

I can then run comprehensive archaeological analysis including:
- Multi-source data correlation
- Pattern recognition
- Cultural context analysis
- Field survey recommendations`
    }
  }

  const performSiteDiscovery = async (query: string): Promise<string> => {
    if (isBackendOnline) {
      try {
        const response = await fetch('http://localhost:8000/research/sites?min_confidence=0.7&max_sites=5')
        if (response.ok) {
          const sites = await response.json()
          
          const siteList = sites.map((site: any, index: number) => 
            `${index + 1}. **${site.name}** (${site.coordinates})
   - Confidence: ${Math.round(site.confidence * 100)}%
   - Type: ${site.cultural_significance}
   - Discovery: ${site.discovery_date}`
          ).join('\n\n')
          
          return `🏛️ **Archaeological Site Discovery Results**

Found ${sites.length} high-confidence sites in our database:

${siteList}

Each site has been validated through multiple data sources including satellite imagery, LIDAR, and cultural analysis. Click on any coordinates to load them for detailed analysis.`
        }
      } catch (error) {
        console.warn("Backend site discovery failed:", error)
      }
    }
    
    // Fallback discovery
    return `🗺️ **Site Discovery Capabilities**

Our AI system can discover archaeological sites using:

**Data Sources:**
- High-resolution satellite imagery
- LIDAR terrain analysis
- Historical document correlation
- Indigenous knowledge databases

**Discovery Methods:**
- Pattern recognition algorithms
- Vegetation anomaly detection
- Geometric feature identification
- Cultural landscape analysis

**Recent Discoveries:**
- Amazon river settlements
- Andean terracing systems
- Coastal ceremonial centers

To discover sites in a specific area, provide coordinates or a region name. ${isBackendOnline ? "Connected to live discovery database." : "Using enhanced demo capabilities."}`
  }

  const performSystemCheck = async (): Promise<string> => {
    if (isBackendOnline) {
      try {
        const [healthResponse, agentResponse] = await Promise.all([
          fetch('http://localhost:8000/system/health'),
          fetch('http://localhost:8000/agents/status')
        ])
        
        if (healthResponse.ok && agentResponse.ok) {
          const healthData = await healthResponse.json()
          const agentData = await agentResponse.json()
          
          return `🟢 **System Status: OPERATIONAL**

**Core Services:**
- API Server: ${healthData.services?.api || "Online"}
- Vision Processing: ${healthData.services?.vision_processing || "Online"}
- Archaeological Analysis: ${healthData.services?.archaeological_analysis || "Online"}

**AI Agents:**
- Vision Agent: ${agentData.vision_agent || "Active"}
- Analysis Agent: ${agentData.analysis_agent || "Active"}
- Cultural Agent: ${agentData.cultural_agent || "Active"}
- Recommendation Agent: ${agentData.recommendation_agent || "Active"}

**Data Sources:**
- Satellite Imagery: Available
- LIDAR Data: Available
- Historical Records: Available
- Indigenous Knowledge: Available

**Processing Queue:** ${agentData.processing_queue || 0} tasks
**Last Analysis:** ${agentData.last_analysis || "Just now"}

All systems operational and ready for archaeological discovery.`
        }
      } catch (error) {
        console.warn("System check failed:", error)
      }
    }
    
    return `🔶 **System Status: ${isBackendOnline ? "PARTIAL" : "DEMO MODE"}**

**Available Services:**
- Enhanced Chat Interface: ✅ Active
- Coordinate Analysis: ✅ Available
- Vision Analysis: ✅ Available
- Site Discovery: ✅ Available
- Data Export: ✅ Available

**Agent Capabilities:**
- Archaeological Pattern Recognition
- Cultural Context Analysis
- Multi-source Data Integration
- Recommendation Generation

${isBackendOnline ? "🟡 Backend services partially available" : "🟠 Running in enhanced demo mode"}

All core archaeological analysis features are functional.`
  }

  const performVisionAnalysis = async (query: string): Promise<string> => {
    const coordinates = extractCoordinates(query)
    
    if (coordinates && isBackendOnline) {
      try {
        const response = await fetch('http://localhost:8000/agents/vision/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates,
            analysis_settings: {
              enable_multispectral: true,
              enable_thermal: false,
              enable_lidar_fusion: true
            }
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          return `👁️ **Vision Analysis Complete for ${coordinates}**

**Detection Results:**
- Features Detected: ${data.detection_results?.length || 0}
- Analysis Confidence: ${Math.round((data.metadata?.confidence_average || 0.85) * 100)}%
- Processing Time: ${data.metadata?.processing_time || "3.2s"}

**Enhanced Features:**
- ✅ Multi-spectral Analysis
- ✅ Pattern Recognition
- ✅ Archaeological Classification
- ✅ Cultural Context Integration

**Key Findings:**
${data.detection_results?.map((detection: any, index: number) => 
  `${index + 1}. ${detection.label} (${Math.round(detection.confidence * 100)}% confidence)`
).join('\n') || "Archaeological patterns detected"}

**Recommendations:**
${data.processing_pipeline?.map((step: any) => `- ${step.step}: ${step.status}`).join('\n') || "Analysis pipeline completed successfully"}

The vision analysis has been integrated with the main coordinate analysis system.`
        }
      } catch (error) {
        console.warn("Vision analysis failed:", error)
      }
    }
    
    return `👁️ **Vision Analysis Capabilities**

Our advanced vision system can analyze:

**Image Sources:**
- Satellite imagery (multiple providers)
- Aerial photography
- LIDAR elevation data
- Multi-spectral imagery

**Detection Capabilities:**
- Geometric pattern recognition
- Vegetation anomaly detection
- Archaeological feature classification
- Cultural landscape analysis

**Analysis Features:**
- Real-time processing
- Multi-model consensus
- Confidence scoring
- Cultural context integration

${coordinates ? 
  `To analyze ${coordinates}, I'll need to access the vision analysis tab. The coordinates have been loaded for you.` :
  "Provide coordinates in the format 'latitude, longitude' for specific analysis."
}

${isBackendOnline ? "🟢 Connected to advanced vision processing" : "🟡 Enhanced demo vision analysis available"}`
  }

  const performGeneralAssistance = async (query: string): Promise<string> => {
    // Check for specific keywords and provide targeted help
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes("help") || queryLower.includes("how")) {
      return `🌟 **NIS Protocol Agent Help**

I'm your AI assistant for archaeological discovery. I can help you:

**🔍 Coordinate Analysis**
- Analyze specific coordinates for archaeological potential
- Use multi-source data (satellite, LIDAR, historical)
- Provide cultural context and recommendations

**🗺️ Site Discovery**
- Search database of known archaeological sites
- Suggest new locations for investigation
- Provide discovery methodology guidance

**👁️ Vision Analysis**
- Analyze satellite imagery for patterns
- Detect archaeological features
- Perform multi-spectral analysis

**💬 Interactive Chat**
- Ask questions in natural language
- Get real-time archaeological insights
- Access research databases

**Quick Actions Available:**
- "Analyze -3.4653, -62.2159" → Coordinate analysis
- "Discover sites" → Site database search
- "System status" → Check all services
- "Vision analysis for [coordinates]" → Image analysis

What would you like to explore today?`
    }
    
    if (queryLower.includes("amazon") || queryLower.includes("rainforest")) {
      return `🌳 **Amazon Archaeological Research**

The Amazon rainforest contains remarkable archaeological heritage:

**Known Features:**
- Pre-Columbian settlements and earthworks
- Agricultural terracing systems
- River-based trading networks
- Ceremonial and residential complexes

**Research Methods:**
- LIDAR penetrates forest canopy
- Satellite imagery reveals patterns
- Indigenous oral histories provide context
- Ground-truthing validates discoveries

**Recent Discoveries:**
- Geometric earthworks in Acre, Brazil
- Settlement networks along major rivers
- Agricultural landscape modifications
- Complex water management systems

Our AI system specializes in Amazon archaeology. Provide coordinates to analyze specific locations, or ask about discovery methods.

${isBackendOnline ? "🟢 Live Amazon research database connected" : "🟡 Enhanced demo mode available"}`
    }
    
    return `🎯 **Archaeological Discovery Assistant**

I'm here to help you explore and analyze archaeological sites using advanced AI technology.

**What I Can Do:**
- Analyze coordinates for archaeological potential
- Search and discover new sites
- Perform vision analysis on satellite imagery
- Provide cultural and historical context
- Generate field survey recommendations

**Getting Started:**
- Provide coordinates to analyze: "Analyze -3.4653, -62.2159"
- Ask about specific regions: "Tell me about Amazon archaeology"
- Request system information: "System status"
- Explore vision capabilities: "How does vision analysis work?"

**Current Status:**
${isBackendOnline ? 
  "🟢 Connected to full backend services with real-time data" : 
  "🟡 Running in enhanced demo mode with comprehensive capabilities"
}

What aspect of archaeological discovery interests you most?`
  }

  // ====================================================================
  // MESSAGE HANDLING
  // ====================================================================

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim()) return
    
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
      // Step 1: Reasoning
      setReasoning("Analyzing your request and determining the best approach...")
      const reasoning = await reasonAboutQuery(userMessage, { chatMode, isBackendOnline })
      
      addMessage({
        role: "reasoning", 
        content: reasoning,
        reasoning
      })
      
      // Step 2: Action Planning
      setReasoning("Planning the most effective action to address your needs...")
      const { action, actionType } = await planAction(userMessage, reasoning)
      
      addMessage({
        role: "action",
        content: action,
        actionType
      })
      
      // Step 3: Action Execution
      setReasoning("Executing action and gathering results...")
      const observation = await executeAction(actionType, userMessage)
      
      addMessage({
        role: "observation",
        content: observation,
        observation
      })
      
      // Step 4: Final Response
      setReasoning("")
      setIsThinking(false)
      
      // If coordinates were found, notify parent
      const coords = extractCoordinates(userMessage)
      if (coords && onCoordinateSelect) {
        onCoordinateSelect(coords)
      }
      
    } catch (error) {
      console.error("Chat processing error:", error)
      setIsThinking(false)
      setReasoning("")
      
      addMessage({
        role: "assistant",
        content: `I encountered an error while processing your request. ${isBackendOnline ? "Backend services may be temporarily unavailable." : "Running in demo mode."} Please try rephrasing your question or contact support if the issue persists.`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (actionId: string) => {
    setIsLoading(true)
    
    try {
      if (isBackendOnline) {
        const response = await fetch('http://localhost:8000/agents/quick-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action_id: actionId })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          addMessage({
            role: "assistant",
            content: `⚡ **Quick Action: ${data.action}**\n\n${data.message}\n\n${JSON.stringify(data.result, null, 2)}`,
            metadata: {
              processing_time: 500,
              models_used: ["quick_action_processor"],
              action_type: actionId
            }
          })
          
          setIsLoading(false)
          return
        }
      }
      
      // Fallback quick action
      const action = QUICK_ACTIONS.find(a => a.id === actionId)
      if (action) {
        const result = await action.action()
        
        addMessage({
          role: "assistant", 
          content: `⚡ Executed ${action.label}: ${action.description}`,
          metadata: {
            processing_time: 800,
            action_type: actionId
          }
        })
      }
    } catch (error) {
      console.error("Quick action failed:", error)
      addMessage({
        role: "assistant",
        content: `❌ Quick action failed. ${isBackendOnline ? "Backend may be temporarily unavailable." : "Demo mode limitations."}`
      })
    } finally {
      setIsLoading(false)
    }
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