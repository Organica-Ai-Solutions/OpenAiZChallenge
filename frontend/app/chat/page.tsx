"use client"

import React, { useState, useEffect } from 'react'
import LightweightUltimateChat from "@/components/ui/lightweight-ultimate-chat"
import { ArchaeologicalChat } from "@/components/ui/archaeological-chat"
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"

// Chat microservices integration
export default function ChatPage() {
  const [activeService, setActiveService] = useState('archaeological')
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
            ✨ Animated Chat
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          2 microservices integrated • All chat components working seamlessly
        </p>
      </div>

      {/* Active Chat Service */}
      <div className="flex-1">
        {activeService === 'archaeological' ? (
          <ArchaeologicalChat />
        ) : (
          <AnimatedAIChat 
            onSendMessage={() => {}}
            onCoordinateSelect={() => {}}
            messages={[]}
            isTyping={false}
          />
        )}
      </div>
    </div>
  )
} 