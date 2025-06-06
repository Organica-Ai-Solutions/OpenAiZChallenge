'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  MapPin, 
  Clock, 
  BookOpen, 
  Download, 
  Eye, 
  Zap,
  Globe,
  Database,
  Brain,
  Loader2,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Target,
  Settings,
  History,
  FileText,
  Image as ImageIcon,
  Command,
  Play,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  Users,
  MessageCircle,
  Send,
  Bot,
  User,
  Calendar,
  TrendingUp,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion"

interface Codex {
  id: string
  title: string
  source: string
  image_url: string
  period: string
  geographic_relevance: string
  relevance_score: number
  content_type: string
  auto_extractable: boolean
  metadata?: any
  analysis?: any
}

interface CodexAnalysis {
  visual_elements: any
  textual_content: any
  archaeological_insights: any
  coordinate_relevance: any
  recommendations: any
  metadata: any
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  active: boolean
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  codexContext?: string
}

interface AnalysisHistoryItem {
  id: string
  codexTitle: string
  timestamp: Date
  confidence: number
  keyFindings: string[]
}

export default function CodexReaderPage() {
  const [coordinates, setCoordinates] = useState('')
  const [radiusKm, setRadiusKm] = useState(50)
  const [period, setPeriod] = useState('all')
  const [sources, setSources] = useState(['famsi', 'world_digital_library', 'inah'])
  const [discoveredCodeces, setDiscoveredCodeces] = useState<Codex[]>([])
  const [selectedCodex, setSelectedCodex] = useState<Codex | null>(null)
  const [codexAnalysis, setCodexAnalysis] = useState<CodexAnalysis | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('workflow')
  const [availableSources, setAvailableSources] = useState([])
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Analysis history
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([])
  
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'coordinates',
      title: 'Set Coordinates',
      description: 'Enter archaeological coordinates to search for relevant codices',
      icon: <MapPin className="h-4 w-4" />,
      completed: false,
      active: true
    },
    {
      id: 'search',
      title: 'Search Archives',
      description: 'Discover relevant codices from digital archives',
      icon: <Search className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'results',
      title: 'Review Results',
      description: 'Examine discovered codices and their relevance',
      icon: <BookOpen className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      description: 'Analyze selected codices with GPT-4.1 Vision',
      icon: <Brain className="h-4 w-4" />,
      completed: false,
      active: false
    }
  ])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isBackendOnline, setIsBackendOnline] = useState(false)

  useEffect(() => {
    fetchAvailableSources()
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/ikrp/status')
      setIsBackendOnline(response.ok)
    } catch {
      setIsBackendOnline(false)
    }
  }

  const fetchAvailableSources = async () => {
    try {
      const response = await fetch('http://localhost:8000/ikrp/sources')
      if (response.ok) {
        const data = await response.json()
        setAvailableSources(data.sources)
      }
    } catch (error) {
      console.error('Failed to fetch available sources:', error)
    }
  }

  const updateWorkflowStep = (stepId: string, completed: boolean, active: boolean = false) => {
    setWorkflowSteps(prev => prev.map(step => ({
      ...step,
      completed: step.id === stepId ? completed : step.completed,
      active: step.id === stepId ? active : false
    })))
  }

  const nextStep = () => {
    if (currentStepIndex < workflowSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      setWorkflowSteps(prev => prev.map((step, index) => ({
        ...step,
        active: index === currentStepIndex + 1,
        completed: index < currentStepIndex + 1 ? true : step.completed
      })))
    }
  }

  const handleSearch = async () => {
    if (!coordinates) {
      alert('Please enter coordinates (e.g., -3.4653, -62.2159)')
      return
    }

    setIsSearching(true)
    setSearchProgress(0)
    updateWorkflowStep('search', false, true)
    
    try {
      // Parse coordinates
      const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()))
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates format')
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 20, 90))
      }, 500)

      // Call IKRP service directly
      const response = await fetch('http://localhost:8001/codex/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: { lat, lng },
          radius_km: radiusKm,
          period: period,
          sources: sources,
          max_results: 20
        }),
      })

      clearInterval(progressInterval)
      setSearchProgress(100)

      if (response.ok) {
        const data = await response.json()
        setDiscoveredCodeces(data.codices || [])
        updateWorkflowStep('search', true)
        updateWorkflowStep('results', false, true)
        nextStep()
        setActiveTab('results')
        console.log(`🔍 Discovered ${data.codices?.length || 0} codices`)
      } else {
        throw new Error('Search failed')
      }
    } catch (error) {
      console.error('Codex search failed:', error)
      alert('Search failed. Please try again.')
      updateWorkflowStep('search', false)
    } finally {
      setIsSearching(false)
      setTimeout(() => setSearchProgress(0), 1000)
    }
  }

  const handleAnalyzeCodex = async (codex: Codex) => {
    setSelectedCodex(codex)
    setIsAnalyzing(true)
    updateWorkflowStep('analysis', false, true)
    setActiveTab('analysis')

    try {
      // Call IKRP service directly
      const response = await fetch('http://localhost:8001/codex/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codex_id: codex.id,
          image_url: codex.image_url,
          coordinates: coordinates ? (() => {
            const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()))
            return { lat, lng }
          })() : null,
          context: `Archaeological analysis for ${codex.title}`
        }),
      })

      if (response.ok) {
        const analysisData = await response.json()
        setCodexAnalysis(analysisData.analysis)
        updateWorkflowStep('analysis', true)
        
        // Add to analysis history
        addToAnalysisHistory(codex, analysisData.analysis, analysisData.confidence)
        
        console.log(`🔍 Analysis completed for ${codex.title} with ${analysisData.confidence} confidence`)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Codex analysis failed:', error)
      // Use existing analysis if available
      if (codex.analysis) {
        setCodexAnalysis(codex.analysis)
        updateWorkflowStep('analysis', true)
      } else {
        alert('Analysis failed. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadFullCodex = async (codex: Codex) => {
    try {
      setIsAnalyzing(true)
      console.log(`📥 Downloading full codex: ${codex.title}`)
      
      // Call IKRP service directly
      const response = await fetch('http://localhost:8001/codex/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codex_id: codex.id,
          download_type: 'full',
          include_metadata: true,
          include_images: true
        }),
      })

      if (response.ok) {
        const downloadData = await response.json()
        
        // Create download link for the full codex
        const blob = new Blob([JSON.stringify(downloadData, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${codex.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full_codex.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        console.log(`✅ Full codex downloaded: ${codex.title}`)
        alert(`Full codex "${codex.title}" downloaded successfully! Check your downloads folder.`)
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error('Full codex download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewOnlineCodex = (codex: Codex) => {
    if (codex.image_url) {
      window.open(codex.image_url, '_blank')
    } else {
      alert('Online version not available for this codex.')
    }
  }

  const handleCompareCodex = (codex: Codex) => {
    // Add to comparison list
    const currentComparisons = JSON.parse(localStorage.getItem('codex_comparisons') || '[]')
    if (!currentComparisons.find((c: any) => c.id === codex.id)) {
      currentComparisons.push(codex)
      localStorage.setItem('codex_comparisons', JSON.stringify(currentComparisons))
      alert(`${codex.title} added to comparison list. Visit the comparison page to analyze similarities.`)
    } else {
      alert('This codex is already in your comparison list.')
    }
  }

  const handleCoordinateSelection = (coords: string) => {
    setCoordinates(coords)
    updateWorkflowStep('coordinates', true)
    updateWorkflowStep('search', false, true)
    setCurrentStepIndex(1)
  }

  // Chat functionality
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
      codexContext: selectedCodex?.title
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('http://localhost:8000/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          mode: 'archaeological_expert',
          coordinates: coordinates,
          context: {
            selectedCodex: selectedCodex,
            analysisResults: codexAnalysis,
            chatHistory: chatMessages.slice(-5) // Last 5 messages for context
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response || 'I\'m here to help you analyze this codex. What would you like to know?',
          timestamp: new Date(),
          codexContext: selectedCodex?.title
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        // Fallback response if backend is unavailable
        const fallbackMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: generateFallbackResponse(chatInput, selectedCodex, codexAnalysis),
          timestamp: new Date(),
          codexContext: selectedCodex?.title
        }
        setChatMessages(prev => [...prev, fallbackMessage])
      }
    } catch (error) {
      console.error('Chat request failed:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateFallbackResponse(chatInput, selectedCodex, codexAnalysis),
        timestamp: new Date(),
        codexContext: selectedCodex?.title
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const generateFallbackResponse = (input: string, codex: Codex | null, analysis: CodexAnalysis | null): string => {
    if (!codex) return "Please select a codex first, then I can help you analyze it!"
    
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('tell me about') || lowerInput.includes('what is')) {
      return `${codex.title} is a ${codex.content_type} from the ${codex.source} collection. It originates from the ${codex.period} period and is particularly relevant to ${codex.geographic_relevance}. This codex has a relevance score of ${Math.round(codex.relevance_score * 100)}% for your research area.`
    }
    
    if (lowerInput.includes('glyph') || lowerInput.includes('symbol')) {
      if (analysis?.textual_content?.glyph_translations) {
        const glyphs = analysis.textual_content.glyph_translations
        return `I've identified ${glyphs.length} key glyph translations in this codex: ${glyphs.map((g: any) => `"${g.meaning}"`).join(', ')}. Each provides important insights into the cultural and historical context.`
      }
      return "The analysis shows various glyphs and symbols that would require detailed examination to interpret their meanings."
    }
    
    if (lowerInput.includes('recommend') || lowerInput.includes('next step')) {
      if (analysis?.recommendations) {
        return `Based on the analysis, I recommend: ${Object.values(analysis.recommendations).slice(0, 2).join('. Also, ')}.`
      }
      return "I recommend conducting a detailed field survey and engaging with local communities to better understand this codex's cultural significance."
    }
    
    return `The ${codex.title} shows fascinating insights into ${codex.geographic_relevance}. The analysis reveals important archaeological and cultural patterns that could inform your research. What specific aspect would you like to explore further?`
  }

  const addToAnalysisHistory = (codex: Codex, analysis: CodexAnalysis, confidence: number) => {
    const historyItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      codexTitle: codex.title,
      timestamp: new Date(),
      confidence: confidence,
      keyFindings: [
        ...(analysis.visual_elements?.figures?.slice(0, 2) || []),
        ...(analysis.textual_content?.glyph_translations?.slice(0, 2).map((g: any) => g.meaning) || [])
      ]
    }
    setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items
  }

  const renderWorkflowInterface = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 pb-8 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              NIS Protocol Codex Reader
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Discover and analyze historical Mesoamerican codices using AI-powered archaeological analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {availableSources.length} Archives Connected
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            GPT-4.1 Vision Enabled
          </Badge>
          <Badge variant={isBackendOnline ? "default" : "secondary"} className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {isBackendOnline ? "Service Online" : "Demo Mode"}
          </Badge>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Discovery Workflow
        </h2>
        
        <div className="grid gap-4">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-4 rounded-lg border transition-all duration-200
                ${step.active 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' 
                  : step.completed 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  p-2 rounded-full 
                  ${step.active 
                    ? 'bg-violet-500 text-white' 
                    : step.completed 
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                  }
                `}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : step.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
                
                {step.active && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-violet-500"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                )}
                
                {step.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Start Section */}
      <Card className="border-violet-200 dark:border-violet-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <Play className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get started with codex discovery in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="p-1 bg-violet-500 text-white rounded-full text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                1
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Enter Coordinates</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Input archaeological coordinates (e.g., -3.4653, -62.2159) or try one of our examples
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="p-1 bg-violet-500 text-white rounded-full text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                2
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Search Archives</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Discover relevant codices from FAMSI, World Digital Library, and INAH
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="p-1 bg-violet-500 text-white rounded-full text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                3
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">AI Analysis</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Analyze codices with GPT-4.1 Vision for archaeological insights
                </p>
              </div>
            </div>
          </div>
          
          {/* Example Coordinates */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Try These Example Coordinates:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { coords: '-3.4653, -62.2159', name: 'Amazon Settlement Platform', confidence: '87%' },
                { coords: '-14.739, -75.13', name: 'Nazca Lines Complex', confidence: '92%' },
                { coords: '-13.1631, -72.545', name: 'Andean Terracing System', confidence: '84%' },
                { coords: '-8.1116, -79.0291', name: 'Coastal Ceremonial Center', confidence: '79%' }
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleCoordinateSelection(example.coords)}
                  className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all duration-200"
                >
                  <div className="font-mono text-sm text-violet-600 dark:text-violet-400">{example.coords}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{example.name}</div>
                  <Badge variant="outline" className="mt-1 text-xs">{example.confidence}</Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordinate Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Archaeological Coordinates
          </CardTitle>
          <CardDescription>
            Enter coordinates for the archaeological site you want to research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Coordinates (Latitude, Longitude)</label>
              <Input
                placeholder="e.g., -3.4653, -62.2159"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Format: decimal degrees (latitude, longitude)</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Search Radius (km)</label>
              <Input
                type="number"
                value={radiusKm || 50}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setRadiusKm(isNaN(value) ? 50 : value);
                }}
                className="w-full"
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Historical Period</label>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Periods</option>
                <option value="pre-columbian">Pre-Columbian</option>
                <option value="colonial">Colonial</option>
                <option value="post-contact">Post-Contact</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Digital Archives</label>
              <div className="flex flex-wrap gap-2">
                {['famsi', 'world_digital_library', 'inah'].map(source => (
                  <Badge 
                    key={source}
                    variant={sources.includes(source) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900"
                    onClick={() => {
                      if (sources.includes(source)) {
                        setSources(sources.filter(s => s !== source))
                      } else {
                        setSources([...sources, source])
                      }
                    }}
                  >
                    {source.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {isSearching && (
            <div className="space-y-2 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Searching digital archives...</span>
              </div>
              <Progress value={Math.min(Math.max(searchProgress || 0, 0), 100)} className="w-full" />
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Analyzing {sources.length} archives for relevant historical documents
              </p>
            </div>
          )}

          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !coordinates}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            size="lg"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching Archives...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Discover Codices
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderSearchResults = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            📜 Discovered Codices ({discoveredCodeces.length})
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            Historical documents relevant to coordinates: {coordinates}
          </p>
        </div>
        <Button variant="outline" onClick={() => {
          setActiveTab('workflow')
          setCurrentStepIndex(0)
          setWorkflowSteps(prev => prev.map((step, index) => ({
            ...step,
            active: index === 0,
            completed: false
          })))
        }}>
          <Search className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discoveredCodeces.map((codex, index) => (
          <motion.div
            key={codex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium line-clamp-2 text-slate-900 dark:text-white">
                      {codex.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {codex.source} • {codex.period}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {((codex.relevance_score || 0) * 100).toFixed(0)}%
                    </Badge>
                    {codex.analysis && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <Image
                    src={codex.image_url}
                    alt={codex.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-codex.svg'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{codex.geographic_relevance}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <FileText className="h-3 w-3" />
                    <span>{codex.content_type}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAnalyzeCodex(codex)}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Analyze with AI
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadFullCodex(codex)}
                    className="hover:bg-violet-50 dark:hover:bg-violet-950/20"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewOnlineCodex(codex)}
                    className="hover:bg-violet-50 dark:hover:bg-violet-950/20"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCompareCodex(codex)}
                    className="hover:bg-violet-50 dark:hover:bg-violet-950/20"
                  >
                    <Target className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {discoveredCodeces.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No codices found</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Try adjusting your search parameters or coordinates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCodexAnalysis = () => (
    <div className="space-y-6">
      {selectedCodex && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                🔍 Codex Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                AI-powered archaeological analysis using GPT-4.1 Vision
              </p>
            </div>
            <Button variant="outline" onClick={() => setActiveTab('results')}>
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Results
            </Button>
          </div>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-600" />
                {selectedCodex.title}
              </CardTitle>
              <CardDescription>
                {selectedCodex.source} • {selectedCodex.period} • Relevance: {((selectedCodex.relevance_score || 0) * 100).toFixed(0)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-slate-900 dark:text-white">Codex Image</h4>
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src={selectedCodex.image_url}
                      alt={selectedCodex.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-codex.svg'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-slate-900 dark:text-white">Metadata</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Content Type:</span>
                      <span className="font-medium">{selectedCodex.content_type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Geographic Relevance:</span>
                      <span className="font-medium text-right">{selectedCodex.geographic_relevance}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Auto-Extractable:</span>
                      <Badge variant={selectedCodex.auto_extractable ? "default" : "secondary"}>
                        {selectedCodex.auto_extractable ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAnalyzing && (
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="p-4 bg-violet-100 dark:bg-violet-900 rounded-full"
                  >
                    <Brain className="h-8 w-8 text-violet-600" />
                  </motion.div>
                  <div className="text-center">
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Analyzing with GPT-4.1 Vision...
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Processing visual elements, extracting text, and identifying archaeological significance
                    </p>
                  </div>
                  <div className="w-full max-w-md">
                    <Progress value={66} className="w-full" />
                    <p className="text-xs text-center mt-2 text-slate-500">
                      Estimated completion: 30 seconds
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {codexAnalysis && !isAnalyzing && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      Analysis Complete
                    </CardTitle>
                    <CardDescription>
                      GPT-4.1 Vision has completed the archaeological analysis
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Visual Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Visual Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-detected visual elements and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Figures Detected</h5>
                      <div className="space-y-2">
                        {codexAnalysis.visual_elements?.figures?.map((figure: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {figure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Symbols</h5>
                      <div className="space-y-2">
                        {codexAnalysis.visual_elements?.symbols?.map((symbol: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Geographic Features</h5>
                      <div className="space-y-2">
                        {codexAnalysis.visual_elements?.geographical_features?.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Textual Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Textual Content & Translations
                  </CardTitle>
                  <CardDescription>
                    Glyph translations and narrative elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Glyph Translations</h5>
                      <div className="space-y-3">
                        {codexAnalysis.textual_content?.glyph_translations?.map((translation: any, index: number) => (
                          <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-sm text-slate-900 dark:text-white">
                                  {translation.meaning}
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  Glyph: {translation.glyph}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {((translation.confidence || 0) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Archaeological Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Archaeological Insights
                  </CardTitle>
                  <CardDescription>
                    Historical and cultural significance analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Site Types</h5>
                      <div className="space-y-2">
                        {codexAnalysis.archaeological_insights?.site_types?.map((type: string, index: number) => (
                          <Badge key={index} variant="default" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-3 text-slate-900 dark:text-white">Cultural Affiliations</h5>
                      <div className="space-y-2">
                        {codexAnalysis.archaeological_insights?.cultural_affiliations?.map((affiliation: string, index: number) => (
                          <Badge key={index} variant="default" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                            {affiliation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    Archaeological Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable insights for field research and further study
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Dynamic recommendations based on available data */}
                    {codexAnalysis.recommendations && Object.keys(codexAnalysis.recommendations).filter(key => key !== 'confidence').map((key, index) => {
                      const recommendationMap: Record<string, { title: string; color: string; icon: React.ReactNode }> = {
                        'field_survey': { title: 'Field Survey', color: 'blue', icon: <Search className="h-4 w-4" /> },
                        'community_engagement': { title: 'Community Engagement', color: 'green', icon: <Users className="h-4 w-4" /> },
                        'comparative_analysis': { title: 'Comparative Analysis', color: 'purple', icon: <Database className="h-4 w-4" /> },
                        'archival_research': { title: 'Archival Research', color: 'amber', icon: <FileText className="h-4 w-4" /> },
                        'cultural_protocols': { title: 'Cultural Protocols', color: 'emerald', icon: <Users className="h-4 w-4" /> }
                      };
                      
                      const rec = recommendationMap[key] || { 
                        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
                        color: 'slate', 
                        icon: <Info className="h-4 w-4" /> 
                      };
                      
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/[0.1] rounded-lg text-violet-400">
                              {rec.icon}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-sm text-white">
                                {rec.title}
                              </h6>
                              <p className="text-sm text-white/70 mt-1">
                                {codexAnalysis.recommendations[key]}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {/* Fallback if no recommendations or for backwards compatibility */}
                    {(!codexAnalysis.recommendations || Object.keys(codexAnalysis.recommendations).length === 0) && (
                      [
                        { key: 'field_survey', title: 'Field Survey', color: 'blue', icon: <Search className="h-4 w-4" /> },
                        { key: 'community_engagement', title: 'Community Engagement', color: 'green', icon: <Users className="h-4 w-4" /> },
                        { key: 'comparative_analysis', title: 'Comparative Analysis', color: 'purple', icon: <Database className="h-4 w-4" /> }
                      ].map((rec, index) => (
                        <motion.div
                          key={rec.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/[0.1] rounded-lg text-violet-400">
                              {rec.icon}
                            </div>
                            <div>
                              <h6 className="font-medium text-sm text-white">
                                {rec.title}
                              </h6>
                              <p className="text-sm text-white/70 mt-1">
                                {`${rec.title} recommendations available`}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-violet-900/5 to-purple-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Link 
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                  <BookOpen className="h-12 w-12 text-violet-400" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Codex Reader & Analyzer
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Discover and analyze ancient Mesoamerican codices with AI-powered archaeological insights
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-2">
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={discoveredCodeces.length === 0}>
                <BookOpen className="h-4 w-4" />
                Results ({discoveredCodeces.length})
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2" disabled={!selectedCodex}>
                <Brain className="h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History ({analysisHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="mt-6">
              {renderWorkflowInterface()}
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              {renderSearchResults()}
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              {renderCodexAnalysis()}
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      💬 Codex Analysis Chat
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Discuss your findings with our AI archaeological expert
                    </p>
                  </div>
                  {selectedCodex && (
                    <Badge variant="outline" className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      {selectedCodex.title}
                    </Badge>
                  )}
                </div>

                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5 text-violet-600" />
                      Archaeological Expert Assistant
                    </CardTitle>
                    <CardDescription>
                      Ask questions about codex analysis, interpretations, and archaeological insights
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 pr-4 mb-4">
                      <div className="space-y-4">
                        {chatMessages.length === 0 && (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">Start a conversation about your codex analysis!</p>
                            <p className="text-sm mt-1">Ask about glyphs, symbols, historical context, or recommendations.</p>
                          </div>
                        )}
                        
                        {chatMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.type === 'assistant' && (
                              <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-full shrink-0">
                                <Bot className="h-4 w-4 text-violet-600" />
                              </div>
                            )}
                            
                            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                              <div className={`p-3 rounded-2xl shadow-sm ${
                                message.type === 'user' 
                                  ? 'bg-violet-600 text-white' 
                                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                              }`}>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 px-3">
                                {message.timestamp.toLocaleTimeString()}
                                {message.codexContext && (
                                  <span className="ml-2 opacity-75">• {message.codexContext}</span>
                                )}
                              </p>
                            </div>
                            
                            {message.type === 'user' && (
                              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full order-1 shrink-0">
                                <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {isChatLoading && (
                          <div className="flex gap-3 justify-start">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-full">
                              <Bot className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="max-w-[80%]">
                              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                  <span className="text-sm text-slate-600 dark:text-slate-300">
                                    Analyzing your question...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <Textarea
                        placeholder="Ask about the codex analysis, glyphs, historical context, or recommendations..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="flex-1 min-h-[80px] resize-none rounded-xl border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        disabled={isChatLoading}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        size="lg"
                        className="px-6 bg-violet-600 hover:bg-violet-700 rounded-xl"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      📊 Analysis History
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Track your codex analysis sessions and insights over time
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      {analysisHistory.length} Sessions
                    </Badge>
                    {analysisHistory.length > 0 && (
                      <Badge variant="default" className="flex items-center gap-2 bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3" />
                        Research Active
                      </Badge>
                    )}
                  </div>
                </div>

                {analysisHistory.length === 0 ? (
                  <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
                    <CardContent className="py-16 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-full">
                            <History className="h-12 w-12 text-violet-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                            <Sparkles className="h-4 w-4 text-yellow-800" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Begin Your Research Journey
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 max-w-md">
                            Start analyzing codices to build your archaeological research timeline and track discoveries
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => setActiveTab('workflow')}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Start Analyzing
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setActiveTab('chat')}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Ask Expert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Timeline Header */}
                    <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 rounded-lg border border-violet-200 dark:border-violet-800">
                      <div className="p-2 bg-violet-500 rounded-full">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-violet-900 dark:text-violet-100">
                          Research Timeline
                        </h4>
                        <p className="text-sm text-violet-700 dark:text-violet-300">
                          Chronological record of your codex analyses
                        </p>
                      </div>
                    </div>

                    {/* Timeline Items */}
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-400 to-purple-400"></div>
                      
                      <div className="space-y-6">
                        {analysisHistory.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            {/* Timeline Dot */}
                            <div className="absolute left-6 top-6 w-4 h-4 bg-violet-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
                            
                            <Card className="ml-16 hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                                        <BookOpen className="h-4 w-4 text-violet-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">
                                          {item.codexTitle}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                          <Calendar className="h-3 w-3" />
                                          {item.timestamp.toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                      Analysis Confidence
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={item.confidence * 100} 
                                        className="w-24 h-2"
                                      />
                                      <Badge 
                                        variant={item.confidence > 0.8 ? "default" : "secondary"}
                                        className={item.confidence > 0.8 ? "bg-green-100 text-green-800 border-green-200" : ""}
                                      >
                                        {Math.round(item.confidence * 100)}%
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      Key Archaeological Findings
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {item.keyFindings.map((finding, findingIndex) => (
                                        <Badge 
                                          key={findingIndex} 
                                          variant="outline" 
                                          className="text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                                        >
                                          {finding}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Review Analysis
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Discuss
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Export
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Statistics */}
                    {analysisHistory.length > 0 && (
                      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-violet-900 dark:text-violet-100 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Research Progress Summary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {analysisHistory.length}
                              </div>
                              <div className="text-sm text-violet-700 dark:text-violet-300">
                                Codices Analyzed
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {Math.round((analysisHistory.reduce((acc, item) => acc + item.confidence, 0) / analysisHistory.length) * 100)}%
                              </div>
                              <div className="text-sm text-violet-700 dark:text-violet-300">
                                Average Confidence
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {analysisHistory.reduce((acc, item) => acc + item.keyFindings.length, 0)}
                              </div>
                              <div className="text-sm text-violet-700 dark:text-violet-300">
                                Total Findings
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}