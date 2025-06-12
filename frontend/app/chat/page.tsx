"use client"

import React, { useState, useEffect } from 'react'
import { ArchaeologicalChat } from "@/components/ui/archaeological-chat"
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { ChatMessageHistory } from "@/components/ui/chat-message-history"
import { chatService, ChatMessage } from "@/lib/api/chat-service"

// Chat microservices integration with backend
export default function ChatPage() {
  // PROTECTED: Keep activeService as 'animated' per protection rules
  const [activeService, setActiveService] = useState('animated')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
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

  // Handle message sending with backend integration
  const handleSendMessage = async (message: string, attachments?: string[]) => {
    console.log('🚀 Chat page sending message:', message);
    setIsTyping(true)
    
    try {
      await chatService.sendMessage(message, attachments)
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setIsTyping(false)
    }
  }

  // Handle coordinate selection from chat
  const handleCoordinateSelect = (coordinates: { lat: number; lon: number }) => {
    console.log('🗺️ Coordinates selected from chat:', coordinates)
    // Could trigger navigation to analysis page or show coordinate details
    // For now, just log the coordinates
  }
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Microservices Hub Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4">
        <h1 className="text-xl font-bold text-white mb-2">🏛️ Archaeological Chat Microservices Hub</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveService('archaeological')}
            className={`px-3 py-1 rounded text-sm ${activeService === 'archaeological' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            🏛️ Archaeological Chat
          </button>
          <button
            onClick={() => setActiveService('animated')}
            className={`px-3 py-1 rounded text-sm ${activeService === 'animated' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            ✨ Animated Chat (Backend Connected)
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Backend integrated • {messages.length} messages • Real-time analysis ready
        </p>
      </div>

      {/* Active Chat Service */}
      <div className="flex-1">
        {activeService === 'archaeological' ? (
          <ArchaeologicalChat />
        ) : (
          <AnimatedAIChat 
            onSendMessage={handleSendMessage}
            onCoordinateSelect={handleCoordinateSelect}
          />
        )}
      </div>

      {/* Chat History Overlay - Only show for animated chat */}
      {activeService === 'animated' && (
        <ChatMessageHistory 
          messages={messages}
          isTyping={isTyping}
        />
      )}
    </div>
  )
} 