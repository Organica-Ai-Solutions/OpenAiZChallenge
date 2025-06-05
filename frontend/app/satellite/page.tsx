"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import Link from "next/link"
import { Globe, Satellite, ArrowLeft, Wifi, WifiOff } from "lucide-react"
import { SatelliteMonitor } from "../../src/components/ui/satellite-monitor"
import { HealthStatusMonitor } from "../../src/components/ui/health-status"
import Navigation from "../../components/shared/Navigation"
import { config, isBackendAvailable } from "../../src/lib/config"

export default function SatellitePage() {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check backend status on mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const isOnline = await isBackendAvailable()
        setIsBackendOnline(isOnline)
        console.log(`🛰️ Backend status: ${isOnline ? 'Online' : 'Offline'}`)
      } catch (error) {
        console.error('❌ Backend check failed:', error)
        setIsBackendOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBackendStatus()
    
    // Periodic backend health check
    const interval = setInterval(checkBackendStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-emerald-900/5 to-blue-900/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <Navigation />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-6">
              <Link 
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>

            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                  <Satellite className="h-12 w-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Satellite Monitoring System
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Real-time satellite feeds, automated change detection, weather correlation, and soil analysis 
                for comprehensive archaeological site monitoring and discovery
              </motion.p>

              {/* Status Indicator */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm text-white/70">Connecting...</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
                    isBackendOnline 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {isBackendOnline ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isBackendOnline ? 'Real-Time Data Active' : 'Offline Mode'}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Main Grid Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Health Status Monitor */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="h-full rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] p-1">
                <HealthStatusMonitor />
              </div>
            </motion.div>

            {/* Main Satellite Monitor */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] p-1">
                <SatelliteMonitor isBackendOnline={isBackendOnline} />
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              {
                icon: Globe,
                title: "Real-Time Imagery",
                description: "Live satellite feeds from Sentinel, Landsat, and commercial providers",
                color: "emerald"
              },
              {
                icon: Satellite,
                title: "Change Detection",
                description: "AI-powered analysis to identify archaeological features and site changes",
                color: "blue"
              },
              {
                icon: Wifi,
                title: "Environmental Data",
                description: "Weather patterns, soil composition, and environmental correlation analysis",
                color: "purple"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
                className="p-6 rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className={`p-3 rounded-lg bg-${feature.color}-500/10 w-fit mb-4 group-hover:bg-${feature.color}-500/20 transition-colors`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.08] py-8 text-white/60"
      >
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>System Status: {isBackendOnline ? 'Online' : 'Offline'}</span>
              </div>
              <span>•</span>
              <span>Archaeological Discovery Platform</span>
              <span>•</span>
              <span>Real-Time Monitoring</span>
            </div>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Organica-Ai-Solutions • NIS Protocol Archaeological Discovery Platform
            </p>
            <p className="text-white/30 text-xs">
              Built with Next.js, FastAPI, and advanced AI for archaeological research and satellite monitoring.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
} 