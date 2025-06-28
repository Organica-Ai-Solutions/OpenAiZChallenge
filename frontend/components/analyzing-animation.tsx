"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AnalyzingAnimationProps {
  title?: string
  subtitle?: string
  className?: string
}

export default function AnalyzingAnimation({ 
  title = "ANALYZING", 
  subtitle = "Archaeological Intelligence Processing...",
  className = ""
}: AnalyzingAnimationProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 p-8 ${className}`}>
      {/* Main Animation Container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        
        {/* Outer Rotating Ring */}
        <motion.div
          className="absolute w-44 h-44 border-2 border-emerald-400/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
        </motion.div>

        {/* Middle Ring - Counter Rotation */}
        <motion.div
          className="absolute w-32 h-32 border border-dashed border-blue-400/40 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full" />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full" />
        </motion.div>

        {/* Inner Pulsing Core */}
        <motion.div
          className="absolute w-20 h-20 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full backdrop-blur-sm border border-emerald-400/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central Icon */}
        <motion.div
          className="relative z-10 text-3xl"
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🧠
        </motion.div>

        {/* Radar Sweep */}
        <motion.div
          className="absolute w-36 h-36 border border-emerald-400/20 rounded-full overflow-hidden"
          style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 50%)' }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center center' }}
          />
        </motion.div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            animate={{
              x: [0, Math.cos(i * Math.PI / 4) * 60, 0],
              y: [0, Math.sin(i * Math.PI / 4) * 60, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Data Stream Lines */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-8 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                transform: `rotate(${i * 90}deg) translateY(-70px)`
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* DNA Helix Animation */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              animate={{
                x: [Math.cos(i * Math.PI / 3) * 25, Math.cos((i * Math.PI / 3) + Math.PI) * 25],
                y: [Math.sin(i * Math.PI / 3) * 15, Math.sin((i * Math.PI / 3) + Math.PI) * 15],
                opacity: [0.2, 1, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Text Animation */}
      <div className="text-center space-y-2">
        <motion.h3
          className="text-2xl font-bold text-emerald-400 tracking-wider"
          animate={{ 
            opacity: [1, 0.5, 1],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {title}
        </motion.h3>
        
        <motion.p
          className="text-sm text-slate-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          {subtitle}
        </motion.p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-1 mt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Neural Network Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          {/* Network Nodes */}
          {[
            { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 200, y: 200 },
            { x: 100, y: 300 }, { x: 300, y: 300 }, { x: 50, y: 200 }, { x: 350, y: 200 }
          ].map((node, i) => (
            <g key={i}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill="currentColor"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  r: [3, 6, 3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
              {/* Connection Lines */}
              {i < 6 && (
                <motion.line
                  x1={node.x}
                  y1={node.y}
                  x2={[300, 200, 100, 300, 50, 350][i]}
                  y2={[100, 200, 300, 300, 200, 200][i]}
                  stroke="currentColor"
                  strokeWidth="1"
                  animate={{
                    opacity: [0.1, 0.5, 0.1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeInOut"
                  }}
                />
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
} 