"use client"

import { AnalyticsDashboard } from "../../src/components/ui/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900">NIS</span>
            Protocol
          </a>
          <nav className="hidden space-x-6 md:flex">
            <a href="/" className="hover:text-emerald-200">Home</a>
            <a href="/agent" className="hover:text-emerald-200">Agent</a>
            <a href="/map" className="hover:text-emerald-200">Map</a>
            <a href="/chat" className="hover:text-emerald-200">Chat</a>
            <a href="/analytics" className="border-b-2 border-emerald-200 pb-1 text-emerald-200">Analytics</a>
            <a href="/documentation" className="hover:text-emerald-200">Documentation</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Analytics Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive statistical analysis and insights from archaeological discoveries
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  )
} 