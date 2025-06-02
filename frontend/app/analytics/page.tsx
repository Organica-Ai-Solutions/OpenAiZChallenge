"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { AnalyticsDashboard } from "../../src/components/ui/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 py-4 text-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Globe className="h-8 w-8 text-blue-400" />
            <span className="text-white">NIS Protocol</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/archaeological-discovery" className="hover:text-blue-400 transition-colors">
              Discovery
            </Link>
            <Link href="/agent" className="hover:text-blue-400 transition-colors">
              Agents
            </Link>
            <Link href="/satellite" className="hover:text-blue-400 transition-colors">
              Satellite
            </Link>
            <Link href="/map" className="hover:text-blue-400 transition-colors">
              Maps
            </Link>
            <Link href="/analytics" className="text-blue-400 font-medium">
              Analytics
            </Link>
            <Link href="/chat" className="hover:text-blue-400 transition-colors">
              Chat
            </Link>
            <Link href="/documentation" className="hover:text-blue-400 transition-colors">
              Docs
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-slate-300 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Advanced Analytics Dashboard</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive statistical analysis and insights from archaeological discoveries
          </p>
        </div>

        <AnalyticsDashboard />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 py-8 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm">
            <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
            <p className="mt-2 text-slate-500">
              Built with Next.js, FastAPI, and advanced AI for archaeological research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 