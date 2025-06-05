"use client"

import Navigation from "../../components/shared/Navigation"
import NISAgentUI from "../../src/components/NISAgentUI"

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-slate-900 lab-bg">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <NISAgentUI />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/40 backdrop-blur-sm border-t border-slate-700/30 py-6 text-slate-400">
        <div className="container mx-auto px-6">
          <div className="text-center text-sm">
            <p>© {new Date().getFullYear()} Organica-Ai-Solutions • NIS Protocol Archaeological Discovery Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
