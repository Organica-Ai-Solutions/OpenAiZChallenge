"use client"

import { SatelliteMonitor } from "../../src/components/ui/satellite-monitor"
import { HealthStatusMonitor } from "../../src/components/ui/health-status"

export default function SatellitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-900">NIS</span>
            Protocol
          </a>
          <nav className="hidden space-x-6 md:flex">
            <a href="/" className="hover:text-blue-200">Home</a>
            <a href="/agent" className="hover:text-blue-200">Agent</a>
            <a href="/map" className="hover:text-blue-200">Map</a>
            <a href="/chat" className="hover:text-blue-200">Chat</a>
            <a href="/analytics" className="hover:text-blue-200">Analytics</a>
            <a href="/satellite" className="border-b-2 border-blue-200 pb-1 text-blue-200">Satellite</a>
            <a href="/documentation" className="hover:text-blue-200">Documentation</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Satellite Monitoring System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time satellite feeds, automated change detection, weather correlation, and soil analysis 
            for comprehensive archaeological site monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <HealthStatusMonitor />
          </div>
          <div className="lg:col-span-3">
            <SatelliteMonitor />
          </div>
        </div>
      </div>
    </div>
  )
} 