"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Send, MapPin, Info, Layers, Database, Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { ResearchAPI, ArchaeologicalSite } from "@/lib/api/research-api"
import MapViewer from './MapViewer'

interface ChatMessage {
  id: string
  type: 'user' | 'system' | 'discovery' | 'suggestion'
  content: string
  coordinates?: [number, number]
  timestamp: Date
  site?: ArchaeologicalSite
}

const QUICK_ACTIONS = [
  {
    label: "Verify Data Sources",
    icon: Database,
    description: "Cross-reference multiple data sources for comprehensive analysis",
    action: async () => "Initiating multi-source verification process..."
  },
  {
    label: "Compare Nearby Sites",
    icon: Layers,
    description: "Analyze archaeological contexts in surrounding regions",
    action: async () => "Searching for comparable archaeological sites..."
  },
  {
    label: "Request High-Res Imagery",
    icon: Search,
    description: "Obtain detailed satellite and LIDAR imagery",
    action: async () => "Requesting high-resolution archaeological imagery..."
  }
]

export default function NISProtocolChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'system',
      content: "Welcome to the NIS Protocol Agent. Discover archaeological sites in the Amazon using AI-powered analysis.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSite, setSelectedSite] = useState<ArchaeologicalSite | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = async (action: () => Promise<string>) => {
    setIsLoading(true)
    try {
      const result = await action()
      const suggestionMessage: ChatMessage = {
        id: `suggestion-${Date.now()}`,
        type: 'suggestion',
        content: result,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, suggestionMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: "An error occurred during the quick action. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscoveryRequest = async (coordinates: string) => {
    setIsLoading(true)
    try {
      const [lat, lon] = coordinates.split(',').map(parseFloat)
      
      const sites = await ResearchAPI.discoverSites({
        coordinates,
        dataSources: ['satellite', 'lidar', 'historical_text', 'indigenous_map'],
        confidenceThreshold: 70
      })

      if (sites.length > 0) {
        const topSite = sites[0]
        setSelectedSite(topSite)

        const discoveryMessage: ChatMessage = {
          id: topSite.id,
          type: 'discovery',
          content: `I've analyzed the patterns at coordinates ${coordinates}. The formations appear to be consistent with ${topSite.type.toLowerCase()} dating to approximately ${topSite.metadata?.archaeological_period || 'unknown period'}. 

Confidence: ${topSite.confidence}%
Settlement Type: ${topSite.metadata?.settlement_type}
Estimated Population: ${topSite.metadata?.population_estimate}

This site bears similarity to known archaeological contexts in the Amazon Basin.`,
          coordinates: [lat, lon],
          site: topSite,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, discoveryMessage])
      } else {
        const noSitesMessage: ChatMessage = {
          id: `no-sites-${Date.now()}`,
          type: 'system',
          content: `No significant archaeological sites found at coordinates ${coordinates}. The area may require further investigation.`,
          coordinates: [lat, lon],
          timestamp: new Date()
        }

        setMessages(prev => [...prev, noSitesMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: "An error occurred during site discovery. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Check if message looks like coordinates
    const coordinateRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/
    if (coordinateRegex.test(inputMessage.trim())) {
      await handleDiscoveryRequest(inputMessage.trim())
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Compass className="mr-2 h-6 w-6 text-emerald-600" />
            NIS Protocol Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`
                p-3 rounded-lg max-w-[80%]
                ${message.type === 'user' ? 'bg-blue-100 text-blue-900 self-end ml-auto' : 
                  message.type === 'discovery' ? 'bg-emerald-100 text-emerald-900' : 
                  message.type === 'suggestion' ? 'bg-purple-100 text-purple-900' :
                  'bg-gray-100 text-gray-900'}
              `}
            >
              {message.content}
              {message.coordinates && (
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Coordinates: {message.coordinates.map(coord => coord.toFixed(4)).join(', ')}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t space-y-2">
          <div className="flex space-x-2 mb-2">
            {QUICK_ACTIONS.map((action) => (
              <TooltipProvider key={action.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleQuickAction(action.action)}
                      disabled={isLoading}
                    >
                      <action.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter coordinates or ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading}
            >
              {isLoading ? <Compass className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-emerald-600" />
            Archaeological Site Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <MapViewer 
            initialCoordinates={
              selectedSite 
                ? selectedSite.coordinates 
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  )
} 