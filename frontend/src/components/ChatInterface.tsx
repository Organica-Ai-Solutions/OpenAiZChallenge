"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Send, User, Sparkles, ImageIcon, Paperclip, Mic, Bot } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  coordinates?: string // Optional coordinates that can be extracted
}

type ChatMode = "general" | "discovery" | "analysis"

interface ChatInterfaceProps {
  onCoordinateSelect?: (coordinates: string) => void
}

export default function ChatInterface({ onCoordinateSelect }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the NIS Protocol Agent. How can I assist with your archaeological discovery today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Function to extract coordinates from text
  const extractCoordinates = (text: string): string | undefined => {
    // Simple regex to match patterns like "-12.3456, 78.9012"
    const coordRegex = /-?\d+\.\d+,\s*-?\d+\.\d+/
    const match = text.match(coordRegex)
    return match ? match[0] : undefined
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        let responseContent = ""
        let coordinates: string | undefined

        switch (chatMode) {
          case "discovery":
            responseContent = generateDiscoveryResponse(input)
            coordinates = "-3.7891, -62.4567" // Example coordinates for discovery mode
            break
          case "analysis":
            responseContent = generateAnalysisResponse(input)
            coordinates = extractCoordinates(input) || "-12.2551, -53.2134" // Try to extract from input or use default
            break
          default:
            responseContent = generateGeneralResponse(input)
            coordinates = extractCoordinates(input)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
          coordinates,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    }
  }

  // Mock response generators
  const generateGeneralResponse = (query: string): string => {
    if (query.toLowerCase().includes("lost city")) {
      return "The 'Lost City of Z' is a legendary settlement believed to exist in the Amazon. While some think it refers to Kuhikugu, our NIS Protocol can help analyze potential locations based on historical accounts and geographical data."
    } else if (query.toLowerCase().includes("protocol") || query.toLowerCase().includes("nis")) {
      return "The NIS Protocol is a neural-inspired system for agent communication and cognitive processing. It implements a universal meta-protocol for AI agent communication, with layered cognitive processing similar to human neural systems."
    } else if (query.toLowerCase().includes("coordinate") || query.toLowerCase().includes("location")) {
      return "You can analyze specific coordinates by entering them in the format 'latitude, longitude' (e.g., -3.4653, -62.2159). Would you like me to suggest some interesting locations to analyze?"
    } else {
      return "I'm your NIS Protocol assistant, specialized in archaeological discovery in the Amazon region. I can help analyze coordinates, explain patterns in geographical data, or discuss historical accounts of ancient civilizations in South America."
    }
  }

  const generateDiscoveryResponse = (query: string): string => {
    return "Based on your query, I've identified several promising locations. The most notable shows geometric patterns consistent with human modification at coordinates -3.7891, -62.4567. Satellite imagery reveals subtle rectangular formations, while LIDAR data suggests the presence of earthworks beneath the canopy. Would you like me to analyze these coordinates in detail?"
  }

  const generateAnalysisResponse = (query: string): string => {
    const coords = extractCoordinates(query) || "-12.2551, -53.2134"
    return `I've analyzed the patterns at coordinates ${coords}. The formations appear to be consistent with pre-colonial settlements dating to approximately 800-1200 CE. The arrangement suggests a community of 200-300 individuals with agricultural modifications extending approximately 1.5km from the central area. This bears similarity to known sites along the Xingu River, though with distinct architectural elements that may indicate a separate cultural tradition.`
  }

  // Handle clicking on coordinates in messages
  const handleCoordinateClick = (coordinates: string) => {
    if (onCoordinateSelect) {
      onCoordinateSelect(coordinates)
    }
  }

  return (
    <Card className="flex h-[600px] w-full flex-col">
      <CardHeader className="px-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-emerald-600" />
            NIS Protocol Chat
          </CardTitle>
          <Tabs value={chatMode} onValueChange={(value) => setChatMode(value as ChatMode)} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="px-3 py-1 text-xs">
                General
              </TabsTrigger>
              <TabsTrigger value="discovery" className="px-3 py-1 text-xs">
                Discovery
              </TabsTrigger>
              <TabsTrigger value="analysis" className="px-3 py-1 text-xs">
                Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } ${message.role === "system" ? "justify-center" : ""}`}
              >
                {message.role === "system" ? (
                  <div className="mx-auto max-w-[85%] rounded-lg bg-muted px-4 py-2 text-center text-sm">
                    {message.content}
                  </div>
                ) : (
                  <div
                    className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className={message.role === "assistant" ? "bg-emerald-100 text-emerald-700" : "bg-primary"}>
                      {message.role === "assistant" ? (
                        <Bot className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5 text-primary-foreground" />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      {message.coordinates && message.role === "assistant" && (
                        <div
                          className="mt-2 cursor-pointer rounded bg-emerald-100 px-2 py-1 text-xs font-mono text-emerald-800 hover:bg-emerald-200"
                          onClick={() => handleCoordinateClick(message.coordinates!)}
                        >
                          📍 {message.coordinates} (click to analyze)
                        </div>
                      )}
                      <div className="mt-1 text-right text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <div className="flex gap-2">
            <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask about archaeological discoveries..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
