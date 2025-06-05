"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { SatelliteMonitor } from "../../src/components/ui/satellite-monitor"
import { HealthStatusMonitor } from "../../src/components/ui/health-status"
import Navigation from "../../components/shared/Navigation"

export default function SatellitePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Satellite Monitoring System</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
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