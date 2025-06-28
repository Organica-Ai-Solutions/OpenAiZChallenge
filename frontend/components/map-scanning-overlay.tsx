"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface MapScanningOverlayProps {
  isScanning: boolean
  siteName?: string
  coordinates?: string
}

export default function MapScanningOverlay({ 
  isScanning, 
  siteName = "Archaeological Site",
  coordinates = "0.000, 0.000"
}: MapScanningOverlayProps) {
  if (!isScanning) return null

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Scanning Grid */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="cyan" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radar Sweep */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-96 h-96"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Radar Circles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border-2 border-emerald-400/30 rounded-full"
              style={{
                width: `${(i + 1) * 25}%`,
                height: `${(i + 1) * 25}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Rotating Radar Beam */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 340deg, rgba(16, 185, 129, 0.4) 350deg, rgba(16, 185, 129, 0.8) 360deg, transparent 10deg, transparent 360deg)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-8 h-8 border-2 border-emerald-400 rounded-full bg-emerald-400/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            </div>
          </div>

          {/* Scanning Lines */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent"
                style={{
                  left: '50%',
                  transformOrigin: 'center bottom',
                  transform: `rotate(${i * 45}deg)`
                }}
                animate={{
                  scaleY: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Status Display */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="bg-slate-900/95 border border-emerald-400/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 bg-emerald-400 rounded-full"
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div>
              <h3 className="text-emerald-400 font-bold text-lg">SCANNING IN PROGRESS</h3>
              <p className="text-slate-300 text-sm">Analyzing: {siteName}</p>
              <p className="text-slate-400 text-xs">Coordinates: {coordinates}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <motion.div
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="mt-3 space-y-1">
            {[
              "Satellite imaging analysis...",
              "LiDAR data processing...",
              "Cultural pattern recognition...",
              "Historical correlation..."
            ].map((step, i) => (
              <motion.div
                key={i}
                className="text-xs text-slate-400 flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.8, duration: 0.5 }}
              >
                <motion.div
                  className="w-1 h-1 bg-emerald-400 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.8 + i * 0.8,
                    ease: "easeInOut"
                  }}
                />
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Corner Scanning Brackets */}
      {[
        { top: '20%', left: '20%', rotate: '0deg' },
        { top: '20%', right: '20%', rotate: '90deg' },
        { bottom: '20%', left: '20%', rotate: '-90deg' },
        { bottom: '20%', right: '20%', rotate: '180deg' }
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-12"
          style={{ ...pos, transform: `rotate(${pos.rotate})` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
        >
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-emerald-400"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path 
              d="M7 7H3V3M17 7H21V3M7 17H3V21M17 17H21V21" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
            />
          </motion.svg>
        </motion.div>
      ))}

      {/* Floating Data Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
} 