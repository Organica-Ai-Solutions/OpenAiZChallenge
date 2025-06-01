"use client"

import EnhancedChatInterface from "../../src/components/EnhancedChatInterface"
import { NISDataProvider } from "../../src/lib/context/nis-data-context"

export default function ChatPage() {
  return (
    <NISDataProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-emerald-900 py-4 text-white">
          <div className="container mx-auto flex items-center justify-between px-4">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900">NIS</span>
              Protocol
            </a>
            <nav className="hidden space-x-6 md:flex">
              <a href="/" className="hover:text-emerald-200">
                Home
              </a>
              <a href="/agent" className="hover:text-emerald-200">
                Agent
              </a>
              <a href="/map" className="hover:text-emerald-200">
                Map
              </a>
              <a href="/chat" className="text-emerald-200">
                Chat
              </a>
              <a href="/documentation" className="hover:text-emerald-200">
                Documentation
              </a>
            </nav>
          </div>
        </header>

        <main className="container mx-auto py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">NIS Protocol Chat Agent</h1>
            <p className="mt-2 text-gray-600">
              Engage with our AI archaeological discovery agent using natural language
            </p>
          </div>

          <EnhancedChatInterface 
            onCoordinateSelect={(coords) => {
              // Handle coordinate selection if needed
              console.log('Coordinates selected:', coords)
            }} 
          />
        </main>

        <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
          <div className="container mx-auto px-4">
            © 2024 NIS Protocol. All rights reserved. | Archaeological discovery through neural-inspired systems.
          </div>
        </footer>
      </div>
    </NISDataProvider>
  )
}
