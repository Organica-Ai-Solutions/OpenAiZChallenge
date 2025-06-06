"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  RotateCcw,
  MessageSquare,
  Microscope,
  RefreshCw,
  Download,
  Settings,
  Star,
  Globe,
  Plus,
  ChevronDown,
  Filter,
  Archive,
  FileText,
  Image,
  BookOpen,
  ArrowUp,
  Users,
  History
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResearchTools } from "./research-tools"

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface ChatMessage {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: string
  metadata?: {
  coordinates?: string
  confidence?: number
    sources?: string[]
    research_id?: string
    analysis_type?: string
  }
  attachments?: {
    type: 'image' | 'document' | 'location' | 'analysis'
    data: any
  }[]
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

export default function EnhancedChatInterface({ onCoordinateSelect }: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to the NIS Protocol Archaeological Research Assistant. I can help you with site analysis, historical research, and coordinate-based investigations. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeMode, setActiveMode] = useState<'chat' | 'research' | 'analysis'>('chat')
  const [chatContext, setChatContext] = useState({
    currentCoordinates: null as string | null,
    researchFocus: null as string | null,
    analysisHistory: [] as any[]
  })
  const [backendOnline, setBackendOnline] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        setBackendOnline(response.ok)
      } catch {
        setBackendOnline(false)
      }
    }
    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Enhanced message processing with archaeological context
  const processMessage = async (userMessage: string) => {
    setIsLoading(true)
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])

    try {
      let agentResponse = ""
      let metadata = {}
      let attachments = []

      // Enhanced AI processing with archaeological intelligence
      if (backendOnline) {
        // Use backend chat API with enhanced archaeological context
        const response = await fetch('http://localhost:8000/chat/archaeological-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: chatContext,
            include_coordinates: true,
            include_research: true,
            analysis_mode: activeMode
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          agentResponse = data.response
          metadata = data.metadata || {}
          attachments = data.attachments || []
        } else {
          throw new Error('Backend chat failed')
        }
    } else {
        // Enhanced local archaeological AI simulation
        const result = await simulateArchaeologicalAgent(userMessage, chatContext)
        agentResponse = result.response
        metadata = result.metadata
        attachments = result.attachments
      }

      // Add agent response
      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        type: "agent",
        content: agentResponse,
        timestamp: new Date().toISOString(),
        metadata,
        attachments
      }

      setMessages(prev => [...prev, agentMsg])

      // Handle coordinate extraction and selection
      if ((metadata as any).coordinates && onCoordinateSelect) {
        onCoordinateSelect((metadata as any).coordinates as string)
        setChatContext(prev => ({
          ...prev,
          currentCoordinates: (metadata as any).coordinates as string
        }))
      }

      } catch (error) {
      console.error('Chat processing failed:', error)
      
      // Error fallback with helpful message
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "I'm having trouble processing your request. Let me try with local archaeological knowledge instead.",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMsg])

      // Try local fallback
      const fallbackResult = await simulateArchaeologicalAgent(userMessage, chatContext)
      const fallbackMsg: ChatMessage = {
        id: `fallback_${Date.now()}`,
        type: "agent", 
        content: fallbackResult.response,
        timestamp: new Date().toISOString(),
        metadata: fallbackResult.metadata
      }
      
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced archaeological agent simulation
  const simulateArchaeologicalAgent = async (message: string, context: any) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

    const messageLower = message.toLowerCase()
    
    // Archaeological knowledge base
    const knowledgePatterns = {
      coordinates: /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/,
      sites: ['nazca', 'caral', 'kuhikugu', 'machu picchu', 'amazon', 'andes'],
      techniques: ['lidar', 'satellite', 'excavation', 'survey', 'ground penetrating radar'],
      periods: ['pre-columbian', 'inca', 'colonial', 'prehistoric', 'ancient'],
      cultures: ['inca', 'nazca', 'moche', 'chavin', 'tiwanaku', 'chimu']
    }

    let response = ""
    let metadata = {}
    let attachments = []

    // Coordinate analysis
    const coordMatch = messageLower.match(knowledgePatterns.coordinates)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lon = parseFloat(coordMatch[2])
      const coordinates = `${lat}, ${lon}`
      
      response = `I've detected coordinates ${coordinates}. This location appears to be in the ${getRegionName(lat, lon)} region. Based on archaeological patterns in this area, I recommend conducting a multi-spectral analysis including LIDAR and satellite imagery review. Would you like me to initiate a comprehensive site analysis?`
      
      metadata = { 
        coordinates,
        confidence: 0.9,
        analysis_type: 'coordinate_recognition',
        region: getRegionName(lat, lon)
      }
      
      attachments.push({
        type: 'location',
        data: { coordinates, region: getRegionName(lat, lon) }
      })
    }
    
    // Site-specific knowledge
    else if (knowledgePatterns.sites.some(site => messageLower.includes(site))) {
      const matchedSite = knowledgePatterns.sites.find(site => messageLower.includes(site))
      response = getSiteInformation(matchedSite!)
      metadata = { 
        research_focus: matchedSite,
        confidence: 0.85,
        analysis_type: 'site_information'
      }
    }
    
    // Technical questions
    else if (knowledgePatterns.techniques.some(tech => messageLower.includes(tech))) {
      const technique = knowledgePatterns.techniques.find(tech => messageLower.includes(tech))
      response = getTechnicalInformation(technique!)
      metadata = { 
        technique,
        confidence: 0.8,
        analysis_type: 'technical_consultation'
      }
    }
    
    // Cultural/historical questions
    else if (knowledgePatterns.cultures.some(culture => messageLower.includes(culture))) {
      const culture = knowledgePatterns.cultures.find(culture => messageLower.includes(culture))
      response = getCulturalInformation(culture!)
      metadata = { 
        culture,
        confidence: 0.85,
        analysis_type: 'cultural_information'
      }
    }
    
    // General archaeological assistance
    else {
      response = `I understand you're asking about ${message}. As an archaeological research assistant, I can help you with:

🗺️ **Site Analysis**: Coordinate-based investigations and site characterization
🔬 **Research Methods**: LIDAR, satellite imagery, geophysical surveys
📚 **Historical Context**: Pre-Columbian cultures, colonial periods, indigenous knowledge
🎯 **Data Integration**: Multi-source analysis and pattern recognition

Would you like to focus on any specific aspect? You can also provide coordinates for detailed site analysis, or ask about specific archaeological techniques or cultures.`
      
      metadata = { 
        confidence: 0.7,
        analysis_type: 'general_assistance'
      }
    }

    return { response, metadata, attachments }
  }

  // Helper functions for archaeological knowledge
  const getRegionName = (lat: number, lon: number): string => {
    if (lat < -10 && lon < -70) return "Amazon Basin"
    if (lat < -10 && lon > -75) return "Andean Highlands" 
    if (lat > -10 && lon < -75) return "Coastal Plains"
    return "Highland Regions"
  }

  const getSiteInformation = (site: string): string => {
    const siteInfo: Record<string, string> = {
      nazca: "The Nazca Lines are a series of large ancient geoglyphs in southern Peru, created between 500 BCE and 500 CE. These remarkable ground drawings include geometric patterns and stylized animals, best viewed from above. Recent research suggests they may have been created for astronomical or ceremonial purposes.",
      caral: "Caral is one of the oldest cities in the Americas, dating to approximately 3500-1800 BCE. Located in Peru's Supe Valley, it represents the Norte Chico civilization and features impressive pyramid complexes and urban planning that predates other major civilizations.",
      kuhikugu: "Kuhikugu is an ancient settlement complex in the Amazon rainforest, representing sophisticated indigenous engineering. The site features circular plazas, defensive earthworks, and agricultural systems that supported large populations in the rainforest environment.",
      amazon: "The Amazon Basin contains numerous archaeological sites that challenge assumptions about rainforest habitation. Evidence includes terra preta (anthropogenic soils), earthworks, and settlement patterns indicating complex societies managed vast forest areas sustainably."
    }
    return siteInfo[site] || `The ${site} region contains significant archaeological evidence that requires detailed investigation.`
  }

  const getTechnicalInformation = (technique: string): string => {
    const techInfo: Record<string, string> = {
      lidar: "LIDAR (Light Detection and Ranging) has revolutionized archaeology by penetrating forest canopy to reveal hidden structures. This technology has discovered thousands of previously unknown sites in places like the Amazon and Central America, revealing complex settlement patterns and landscape modifications.",
      satellite: "Satellite imagery analysis uses multispectral and hyperspectral data to identify archaeological features. Changes in vegetation patterns, soil composition, and thermal signatures can indicate buried structures or ancient land use patterns.",
      excavation: "Archaeological excavation remains fundamental for understanding site formation, chronology, and cultural practices. Modern techniques combine traditional methods with 3D documentation, environmental sampling, and interdisciplinary collaboration."
    }
    return techInfo[technique] || `${technique} is an important archaeological method that requires specialized expertise and proper implementation.`
  }

  const getCulturalInformation = (culture: string): string => {
    const cultureInfo: Record<string, string> = {
      inca: "The Inca Empire (1438-1533 CE) was the largest empire in pre-Columbian America, known for sophisticated architecture, road systems, and administrative organization. Their archaeological record includes Machu Picchu, road networks, and agricultural terraces.",
      nazca: "The Nazca culture (100-700 CE) is famous for the Nazca Lines but also produced remarkable textiles, ceramics, and irrigation systems. They developed sophisticated water management techniques in Peru's arid coastal region.",
      moche: "The Moche civilization (100-700 CE) created some of the finest Pre-Columbian art, including detailed ceramics and metalwork. Their monumental architecture includes huacas (pyramid temples) and complex urban centers."
    }
    return cultureInfo[culture] || `The ${culture} culture represents an important archaeological tradition that contributed significantly to pre-Columbian development.`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    const message = inputValue.trim()
    setInputValue("")
    await processMessage(message)
  }

  const handleResearchComplete = (results: any) => {
    setChatContext(prev => ({
      ...prev,
      analysisHistory: [...prev.analysisHistory, results]
    }))
    
    // Add research results as a system message
    const researchMsg: ChatMessage = {
      id: `research_${Date.now()}`,
      type: "system",
      content: `Research completed: ${results.summary || 'Analysis finished successfully'}`,
      timestamp: new Date().toISOString(),
            metadata: {
        research_id: results.id,
        confidence: results.confidence_score
      },
      attachments: [{
        type: 'analysis',
        data: results
      }]
    }
    
    setMessages(prev => [...prev, researchMsg])
  }

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      type: "system", 
      content: "Chat cleared. How can I assist with your archaeological research?",
      timestamp: new Date().toISOString()
    }])
    setChatContext({
      currentCoordinates: null,
      researchFocus: null, 
      analysisHistory: []
    })
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Enhanced Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <span>Archaeological Research Assistant</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Advanced AI-powered archaeological investigation and analysis
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${
                backendOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
              }`}>
                {backendOnline ? 'Enhanced AI' : 'Local Mode'}
              </Badge>
              <Button size="sm" variant="outline" onClick={clearChat} className="border-slate-600 text-slate-300">
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mode Selector */}
      <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="chat" className="text-slate-300">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="research" className="text-slate-300">
            <Microscope className="h-4 w-4 mr-2" />
            Research
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-slate-300">
            <Target className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          {/* Chat Messages */}
          <Card className="bg-slate-800 border-slate-700 h-[500px] flex flex-col">
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`${
                            message.type === 'user' ? 'bg-emerald-600' : 
                            message.type === 'agent' ? 'bg-blue-600' : 'bg-slate-600'
                          }`}>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : 
                             message.type === 'agent' ? <Bot className="h-4 w-4" /> : 
                             <Sparkles className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user' ? 'bg-emerald-600 text-white' :
                          message.type === 'agent' ? 'bg-slate-700 text-white' :
                          'bg-slate-900 text-slate-300 border border-slate-600'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {message.metadata && (
                            <div className="mt-2 pt-2 border-t border-slate-600/50">
                              <div className="flex flex-wrap gap-1">
                                {message.metadata.coordinates && (
                                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                    <MapPin className="h-2 w-2 mr-1" />
                                    {message.metadata.coordinates}
                                  </Badge>
                                )}
                                {message.metadata.confidence && (
                                  <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                                    {Math.round(message.metadata.confidence * 100)}% confidence
                                  </Badge>
                                )}
                                {message.metadata.analysis_type && (
                                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                    {message.metadata.analysis_type.replace('_', ' ')}
                                  </Badge>
                                )}
        </div>
          </div>
                          )}

                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-600/50">
                              <div className="flex flex-wrap gap-2">
                                {message.attachments.map((attachment, index) => (
                                  <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-slate-600 text-slate-300"
                                    onClick={() => {
                                      if (attachment.type === 'location' && onCoordinateSelect) {
                                        onCoordinateSelect(attachment.data.coordinates)
                                      }
                                    }}
                                  >
                                    {attachment.type === 'location' && <MapPin className="h-3 w-3 mr-1" />}
                                    {attachment.type === 'analysis' && <Target className="h-3 w-3 mr-1" />}
                                    {attachment.type === 'document' && <FileText className="h-3 w-3 mr-1" />}
                                    View {attachment.type}
                                  </Button>
                                ))}
          </div>
        </div>
                          )}
                          
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
          </div>
            </div>
        </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-3 max-w-[80%]">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-600">
                            <Bot className="h-4 w-4 animate-pulse" />
                          </AvatarFallback>
        </Avatar>
                        <div className="bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                            <span className="text-white text-sm">Analyzing archaeological data...</span>
            </div>
          </div>
        </div>
      </div>
                  )}
            </div>
              </ScrollArea>
            </CardContent>
            
            {/* Enhanced Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about archaeological sites, coordinates, research methods..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

          {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline" 
                  onClick={() => setInputValue("Analyze coordinates -12.2551, -53.2134")}
                  className="text-xs border-slate-600 text-slate-300"
                  disabled={isLoading}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Sample Coordinates
                </Button>
                      <Button
                  size="sm" 
                        variant="outline"
                  onClick={() => setInputValue("Tell me about LIDAR archaeology")}
                  className="text-xs border-slate-600 text-slate-300"
                  disabled={isLoading}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  LIDAR Methods
                </Button>
                <Button 
                        size="sm"
                  variant="outline" 
                  onClick={() => setInputValue("What are the Nazca Lines?")}
                  className="text-xs border-slate-600 text-slate-300"
                  disabled={isLoading}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Nazca Lines
                      </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <ResearchTools 
            onResearchComplete={handleResearchComplete}
            onCoordinateSelect={onCoordinateSelect}
            backendOnline={backendOnline}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-400" />
                <span>Cross-Platform Analysis</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Integrated analysis combining chat insights, research data, and coordinate analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span>Chat Context</span>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Current Coordinates:</span>
                      <span className="font-mono">{chatContext.currentCoordinates || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Research Focus:</span>
                      <span>{chatContext.researchFocus || 'General'}</span>
                  </div>
                    <div className="flex justify-between">
                      <span>Analysis History:</span>
                      <span>{chatContext.analysisHistory.length} items</span>
                </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-400" />
                    <span>Data Integration</span>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Backend Status:</span>
                      <Badge variant="outline" className={`text-xs ${
                        backendOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
                      }`}>
                        {backendOnline ? 'Connected' : 'Offline'}
                      </Badge>
            </div>
                    <div className="flex justify-between">
                      <span>Data Sources:</span>
                      <span>{backendOnline ? '4 active' : '2 demo'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Analysis Mode:</span>
                      <span className="capitalize">{activeMode}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex-col border-slate-600 text-slate-300">
                  <Brain className="h-6 w-6 mb-1 text-emerald-400" />
                  <span className="text-xs">AI Synthesis</span>
                  </Button>
                <Button variant="outline" className="h-16 flex-col border-slate-600 text-slate-300">
                  <Globe className="h-6 w-6 mb-1 text-blue-400" />
                  <span className="text-xs">Spatial Analysis</span>
                  </Button>
                <Button variant="outline" className="h-16 flex-col border-slate-600 text-slate-300">
                  <Clock className="h-6 w-6 mb-1 text-purple-400" />
                  <span className="text-xs">Temporal Trends</span>
                  </Button>
            </div>
            </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
