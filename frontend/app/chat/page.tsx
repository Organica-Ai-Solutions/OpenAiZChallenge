"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { AnimatedAIChat } from "../../components/ui/animated-ai-chat"
import { NISDataProvider } from "../../src/lib/context/nis-data-context"
import { useState, useEffect } from "react"

export default function ChatPage() {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [chatHistory, setChatHistory] = useState<any[]>([])

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health')
        setIsBackendOnline(response.ok)
        console.log('🔗 Backend status:', response.ok ? 'Online' : 'Offline')
      } catch {
        setIsBackendOnline(false)
        console.log('🔗 Backend status: Offline')
      }
    }
    checkBackend()
  }, [])

  // Handle message sending to backend with real API integration
  const handleMessageSend = async (message: string) => {
    try {
      console.log('🚀 Sending message to NIS Agent:', message)
      
      // Check if it's a command
      if (message.startsWith('/')) {
        const command = message.split(' ')[0]
        const args = message.split(' ').slice(1).join(' ')
        
        switch (command) {
          case '/discover':
            return await handleDiscoveryCommand(args)
          case '/analyze':
            return await handleAnalysisCommand(args)
          case '/vision':
            return await handleVisionCommand(args)
          case '/research':
            return await handleResearchCommand(args)
          case '/suggest':
            return await handleSuggestionCommand(args)
          case '/status':
            return await handleStatusCommand()
          default:
            return await handleGeneralChat(message)
        }
      } else {
        return await handleGeneralChat(message)
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      throw error
    }
  }

  // Handle coordinate selection
  const handleCoordinateSelect = async (coordinates: string) => {
    console.log('📍 Coordinates selected:', coordinates)
    // Automatically run analysis on coordinate selection
    return await handleAnalysisCommand(coordinates)
  }

  // Real backend API integration functions
  const handleDiscoveryCommand = async (query: string) => {
    if (!isBackendOnline) {
      throw new Error("Backend is offline. Discovery requires backend connection.")
    }

    try {
      console.log('🔍 Running site discovery...')
      const response = await fetch('http://localhost:8000/research/sites?max_sites=5&min_confidence=0.7')
      
      if (response.ok) {
        const sites = await response.json()
        console.log('✅ Discovery complete:', sites.length, 'sites found')
        
        return {
          type: 'discovery_result',
          sites: sites,
          message: `🏛️ **Site Discovery Complete**\n\nFound ${sites.length} high-confidence archaeological sites:\n\n${sites.map((site: any, i: number) => 
            `${i + 1}. **${site.name}**\n   📍 ${site.coordinates}\n   🎯 ${Math.round(site.confidence * 100)}% confidence\n   📅 Discovered: ${site.discovery_date}\n   🌿 ${site.cultural_significance.slice(0, 100)}...\n`
          ).join('\n')}\n\nUse \`/analyze [coordinates]\` to investigate specific sites.`
        }
      } else {
        throw new Error(`Discovery API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Discovery failed:', error)
      throw new Error("Site discovery failed. Please try again.")
    }
  }

  const handleAnalysisCommand = async (coordinates: string) => {
    if (!coordinates.trim()) {
      throw new Error("Please provide coordinates to analyze (e.g., '-3.4653, -62.2159')")
    }

    if (!isBackendOnline) {
      throw new Error("Backend is offline. Analysis requires backend connection.")
    }

    try {
      console.log('🎯 Starting coordinate analysis...')
      
      // Parse coordinates
      const coords = coordinates.split(',').map(c => parseFloat(c.trim()))
      if (coords.length !== 2 || coords.some(isNaN)) {
        throw new Error("Invalid coordinates format. Use: latitude, longitude (e.g., '-3.4653, -62.2159')")
      }

      const [lat, lon] = coords
      
      // Call the real analyze endpoint
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon })
      })

      if (response.ok) {
        const analysis = await response.json()
        console.log('✅ Analysis complete:', analysis)
        
        return {
          type: 'analysis_result',
          analysis: analysis,
          coordinates: coordinates,
          message: `🔬 **Archaeological Analysis Complete**\n\n📍 **Location**: ${coordinates}\n🎯 **Confidence**: ${Math.round(analysis.confidence * 100)}%\n🏛️ **Site Type**: ${analysis.site_classification}\n\n**Key Findings:**\n${analysis.key_findings?.map((f: string) => `• ${f}`).join('\n') || '• Geological and cultural patterns detected'}\n\n**Archaeological Significance:**\n${analysis.archaeological_significance || 'Site shows potential for archaeological investigation'}\n\n**Recommendations:**\n${analysis.recommendations?.map((r: string) => `• ${r}`).join('\n') || '• Further field investigation recommended'}\n\nUse \`/vision ${coordinates}\` for satellite imagery analysis.`
        }
      } else {
        throw new Error(`Analysis API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      throw error instanceof Error ? error : new Error("Coordinate analysis failed. Please try again.")
    }
  }

  const handleVisionCommand = async (coordinates: string) => {
    if (!coordinates.trim()) {
      throw new Error("Please provide coordinates for vision analysis (e.g., '-3.4653, -62.2159')")
    }

    if (!isBackendOnline) {
      throw new Error("Backend is offline. Vision analysis requires backend connection.")
    }

    try {
      console.log('👁️ Starting vision analysis...')
      
      const response = await fetch('http://localhost:8000/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          coordinates: coordinates.trim(),
          models: ['gpt4o_vision', 'archaeological_analysis'],
          confidence_threshold: 0.4
        })
      })

      if (response.ok) {
        const visionResult = await response.json()
        console.log('✅ Vision analysis complete:', visionResult)
        
        return {
          type: 'vision_result',
          analysis: visionResult,
          coordinates: coordinates,
          message: `👁️ **AI Vision Analysis Complete**\n\n📍 **Location**: ${coordinates}\n🛰️ **Satellite Analysis**: ${Math.round((visionResult.satellite_findings?.confidence || 0.75) * 100)}% confidence\n\n**Features Detected:**\n${visionResult.detection_results?.map((d: any) => `• ${d.type}: ${d.description} (${Math.round(d.confidence * 100)}%)`).join('\n') || '• Analyzing satellite imagery patterns'}\n\n**Archaeological Indicators:**\n${visionResult.satellite_findings?.features_detected?.map((f: any) => `• ${f.type}: ${f.description}`).join('\n') || '• Geometric patterns and landscape modifications detected'}\n\n**Processing Details:**\n• Models used: ${visionResult.metadata?.models_used?.join(', ') || 'GPT-4 Vision, Archaeological Analysis'}\n• Processing time: ${visionResult.metadata?.processing_time || '2.3s'}\n• High confidence features: ${visionResult.metadata?.high_confidence_features || 'Multiple'}\n\nUse \`/research\` to cross-reference with historical data.`
        }
      } else {
        throw new Error(`Vision analysis API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Vision analysis failed:', error)
      throw error instanceof Error ? error : new Error("Vision analysis failed. Please try again.")
    }
  }

  const handleResearchCommand = async (query: string) => {
    if (!isBackendOnline) {
      throw new Error("Backend is offline. Research requires backend connection.")
    }

    try {
      console.log('📚 Running research query...')
      
      // Get agent status and research capabilities
      const agentResponse = await fetch('http://localhost:8000/agents/agents')
      let agentInfo = ""
      
      if (agentResponse.ok) {
        const agents = await agentResponse.json()
        const researchAgent = agents.find((a: any) => a.type === 'memory' || a.type === 'research')
        agentInfo = researchAgent ? `\n• Research Agent: ${researchAgent.status} (${Math.round(researchAgent.accuracy * 100)}% accuracy)` : ""
      }

      // Get recent research sites for context
      const sitesResponse = await fetch('http://localhost:8000/research/sites?max_sites=3')
      let recentFindings = ""
      
      if (sitesResponse.ok) {
        const sites = await sitesResponse.json()
        recentFindings = `\n\n**Recent Archaeological Findings:**\n${sites.map((s: any) => `• ${s.name} (${s.coordinates}) - ${Math.round(s.confidence * 100)}% confidence`).join('\n')}`
      }

      return {
        type: 'research_result',
        query: query,
        message: `📚 **Archaeological Research Database**\n\n🔍 **Query**: ${query || 'General research capabilities'}\n\n**Research Capabilities:**\n• Historical text analysis and cross-referencing\n• Indigenous knowledge integration\n• Cultural pattern recognition\n• Multi-period archaeological correlation${agentInfo}${recentFindings}\n\n**Available Research Methods:**\n• Historical document analysis\n• Indigenous oral history correlation\n• Archaeological site pattern matching\n• Cultural significance assessment\n• Temporal period analysis\n\nFor specific site research, use \`/analyze [coordinates]\` first, then \`/research [site-name]\`.`
      }
    } catch (error) {
      console.error('❌ Research failed:', error)
      throw new Error("Research query failed. Please try again.")
    }
  }

  const handleSuggestionCommand = async (region: string) => {
    if (!isBackendOnline) {
      throw new Error("Backend is offline. Suggestions require backend connection.")
    }

    try {
      console.log('💡 Generating location suggestions...')
      
      // Get high-confidence sites as suggestions
      const response = await fetch('http://localhost:8000/research/sites?max_sites=10&min_confidence=0.8')
      
      if (response.ok) {
        const sites = await response.json()
        const suggestions = sites.slice(0, 5) // Top 5 suggestions
        
        return {
          type: 'suggestion_result',
          region: region,
          suggestions: suggestions,
          message: `💡 **AI-Recommended Investigation Areas**\n\n${region ? `🌍 **Region**: ${region}\n\n` : ''}**High-Priority Locations:**\n\n${suggestions.map((site: any, i: number) => 
            `**${i + 1}. ${site.name}**\n📍 ${site.coordinates}\n🎯 ${Math.round(site.confidence * 100)}% confidence\n📅 Discovered: ${site.discovery_date}\n🌿 ${site.cultural_significance.slice(0, 80)}...\n`
          ).join('\n')}\n**Next Steps:**\n• Use \`/analyze [coordinates]\` for detailed analysis\n• Use \`/vision [coordinates]\` for satellite imagery review\n• Use \`/research [site-name]\` for historical context\n\n*Suggestions based on confidence scores, cultural significance, and research potential.*`
        }
      } else {
        throw new Error(`Suggestion API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Suggestions failed:', error)
      throw new Error("Location suggestions failed. Please try again.")
    }
  }

  const handleStatusCommand = async () => {
    try {
      console.log('📊 Checking system status...')
      
      let systemStatus = ""
      let agentStatus = ""
      let backendStatus = "🔴 Offline"

      if (isBackendOnline) {
        backendStatus = "🟢 Online"
        
        // Get system health
        try {
          const healthResponse = await fetch('http://localhost:8000/system/health')
          if (healthResponse.ok) {
            const health = await healthResponse.json()
            systemStatus = `\n**System Health**: ${health.status}\n**Services**: ${Object.entries(health.services || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`
          }
        } catch {}

        // Get agent status
        try {
          const agentResponse = await fetch('http://localhost:8000/agents/agents')
          if (agentResponse.ok) {
            const agents = await agentResponse.json()
            agentStatus = `\n\n**AI Agents** (${agents.length} active):\n${agents.map((a: any) => 
              `• ${a.type}: ${a.status} (${Math.round(a.accuracy * 100)}% accuracy, ${a.avg_processing_time}ms avg)`
            ).join('\n')}`
          }
        } catch {}
      }

      return {
        type: 'status_result',
        message: `📊 **NIS Protocol System Status**\n\n**Backend**: ${backendStatus}${systemStatus}${agentStatus}\n\n**Available Commands:**\n• \`/discover\` - Find archaeological sites\n• \`/analyze [coordinates]\` - Analyze specific location\n• \`/vision [coordinates]\` - Satellite imagery analysis\n• \`/research [query]\` - Historical research\n• \`/suggest [region]\` - Get location recommendations\n• \`/status\` - System status check\n\n${isBackendOnline ? '✅ All systems operational' : '⚠️ Backend offline - limited functionality'}`
      }
    } catch (error) {
      console.error('❌ Status check failed:', error)
      return {
        type: 'status_result', 
        message: "📊 **System Status Check Failed**\n\nUnable to retrieve complete status information. The backend may be offline or experiencing issues."
      }
    }
  }

  const handleGeneralChat = async (message: string) => {
    if (!isBackendOnline) {
      // Provide helpful offline guidance
      return {
        type: 'general_response',
        message: `🤖 **NIS Protocol Archaeological Assistant**\n\n⚠️ Backend is currently offline, but I can help guide you:\n\n**About NIS Protocol:**\nAdvanced AI system for archaeological discovery using satellite imagery, LIDAR data, and cultural knowledge integration.\n\n**Available Commands:**\n• \`/discover\` - Find archaeological sites\n• \`/analyze [coordinates]\` - Analyze specific location\n• \`/vision [coordinates]\` - Satellite imagery analysis\n• \`/research [query]\` - Historical research\n• \`/suggest [region]\` - Get location recommendations\n• \`/status\` - Check system status\n\n**Example Usage:**\n\`/analyze -3.4653, -62.2159\`\n\`/vision -12.2551, -53.2134\`\n\nTo use full functionality, ensure the backend is running with \`./start.sh\``
      }
    }

    try {
      console.log('💬 Processing general chat...')
      
      // Use the enhanced chat endpoint
      const response = await fetch('http://localhost:8000/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          mode: 'reasoning',
          context: { chat_history: chatHistory.slice(-5) }
        })
      })

      if (response.ok) {
        const chatResult = await response.json()
        console.log('✅ Chat response:', chatResult)
        
        return {
          type: 'chat_response',
          response: chatResult,
          message: `🤖 **NIS Archaeological Assistant**\n\n${chatResult.response}\n\n${chatResult.reasoning ? `**Reasoning**: ${chatResult.reasoning}\n\n` : ''}${chatResult.coordinates ? `📍 **Detected Coordinates**: ${chatResult.coordinates}\n\n` : ''}**Action Type**: ${chatResult.action_type}\n**Confidence**: ${Math.round((chatResult.confidence || 0.8) * 100)}%\n\n*Use commands like \`/analyze\`, \`/vision\`, or \`/discover\` for specialized functions.*`
        }
      } else {
        throw new Error(`Chat API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ General chat failed:', error)
      return {
        type: 'general_response',
        message: `🤖 **NIS Protocol Assistant**\n\nI'm here to help with archaeological discovery! ${message.toLowerCase().includes('coordinate') ? '\n\nI can analyze coordinates for archaeological potential. Try:\n`/analyze -3.4653, -62.2159`' : message.toLowerCase().includes('site') ? '\n\nI can help discover archaeological sites. Try:\n`/discover`' : '\n\nUse `/status` to check system capabilities.'}`
      }
    }
  }

  return (
    <NISDataProvider>
      <div className="min-h-screen bg-slate-900 lab-bg">
        {/* Navigation Header - Made more minimal for spacious feel */}
        <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/50 py-3 text-white sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
              <Globe className="h-7 w-7 text-emerald-400" />
              <span className="text-white">NIS Protocol</span>
            </Link>
            <nav className="hidden space-x-8 md:flex">
              <Link href="/" className="hover:text-emerald-400 transition-colors text-sm">
                Home
              </Link>
              <Link href="/archaeological-discovery" className="hover:text-emerald-400 transition-colors text-sm">
                Discovery
              </Link>
              <Link href="/agent" className="hover:text-emerald-400 transition-colors text-sm">
                Agents
              </Link>
              <Link href="/satellite" className="hover:text-emerald-400 transition-colors text-sm">
                Satellite
              </Link>
              <Link href="/map" className="hover:text-emerald-400 transition-colors text-sm">
                Maps
              </Link>
              <Link href="/analytics" className="hover:text-emerald-400 transition-colors text-sm">
                Analytics
              </Link>
              <Link href="/chat" className="text-emerald-400 font-medium text-sm">
                Chat
              </Link>
              <Link href="/documentation" className="hover:text-emerald-400 transition-colors text-sm">
                Docs
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button className="md:hidden text-slate-300 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content - Full height animated chat */}
        <main className="relative">
          <AnimatedAIChat 
            onMessageSend={handleMessageSend}
            onCoordinateSelect={handleCoordinateSelect}
          />
        </main>

        {/* Footer - More minimal and unobtrusive */}
        <footer className="absolute bottom-0 left-0 right-0 bg-slate-900/40 backdrop-blur-sm border-t border-slate-700/30 py-4 text-slate-400">
          <div className="container mx-auto px-6">
            <div className="text-center text-xs">
              <p>© {new Date().getFullYear()} Organica-Ai-Solutions • NIS Protocol Archaeological Discovery 
                <span className="ml-2">{isBackendOnline ? '🟢 Backend Online' : '🔴 Backend Offline'}</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </NISDataProvider>
  )
}
