"use client"

import Navigation from "../../components/shared/Navigation"
import { AnalyticsDashboard } from "../../src/components/ui/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

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