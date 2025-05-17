"use client"

import React from 'react'
import NISProtocolChat from '../../components/NISProtocolChat'

export default function AgentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-emerald-800">
          NIS Protocol V0 Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover archaeological sites in the Amazon using our neural-inspired system
        </p>
      </div>
      
      <NISProtocolChat />
    </div>
  )
} 