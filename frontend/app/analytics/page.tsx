"use client"

import { motion } from 'framer-motion'
import Link from "next/link"
import { BarChart3, ArrowLeft } from "lucide-react"

import { AnalyticsDashboard } from "../../src/components/ui/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-y-auto pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-emerald-900/5 to-blue-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Link 
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                  <BarChart3 className="h-12 w-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Advanced Analytics Dashboard
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Comprehensive statistical analysis and insights from archaeological discoveries
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <AnalyticsDashboard />
          </motion.div>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="relative bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.08] py-8 text-white/60 mt-12"
          >
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm">© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
              <p className="mt-2 text-white/40">
                Built with Next.js, FastAPI, and advanced AI for archaeological research.
              </p>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  )
} 