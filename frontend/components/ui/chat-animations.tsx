"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Animation variants for different components
export const chatAnimations = {
  messageSlide: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  } as Variants,

  typingDots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
    },
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  },

  confidenceBar: {
    initial: { width: 0 },
    animate: (confidence: number) => ({
      width: `${confidence * 100}%`,
    }),
    transition: { duration: 1, delay: 0.5 }
  },

  headerPulse: {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 2, repeat: Infinity }
  },

  pageTransition: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  }
};

// Background gradient processor
export function useBackgroundGradient() {
  const [gradient, setGradient] = useState('from-slate-900 via-slate-800 to-slate-900');
  
  useEffect(() => {
    const updateGradient = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setGradient('from-slate-800 via-slate-700 to-slate-800');
      } else if (hour >= 12 && hour < 18) {
        setGradient('from-slate-900 via-slate-800 to-slate-900');
      } else {
        setGradient('from-slate-950 via-slate-900 to-slate-950');
      }
    };
    
    updateGradient();
    const interval = setInterval(updateGradient, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  
  return gradient;
}

// Optimized typing indicator
export function TypingIndicator({ userId, userName }: { userId: string; userName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 text-muted-foreground text-sm px-4 py-2"
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={chatAnimations.typingDots.animate}
            transition={{
              ...chatAnimations.typingDots.transition,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span>{userName || 'NIS Agent'} is typing...</span>
    </motion.div>
  );
}

// Optimized message bubble with lazy animations
interface AnimatedMessageBubbleProps {
  children: React.ReactNode;
  role: 'user' | 'assistant' | 'agent' | 'system';
  isTyping?: boolean;
  className?: string;
  confidence?: number;
}

export function AnimatedMessageBubble({ 
  children, 
  role, 
  isTyping = false, 
  className,
  confidence 
}: AnimatedMessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isUser = role === 'user';
  
  useEffect(() => {
    // Delay animation to avoid blocking initial render
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    // Return simple static version while animations load
    return (
      <div className={`relative max-w-4xl rounded-2xl p-4 shadow-sm ${
        isUser
          ? "ml-auto bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
          : "mr-auto bg-slate-800/40 border border-slate-700/30 text-white/90"
      } ${className || ''}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={chatAnimations.messageSlide}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative max-w-4xl rounded-2xl p-4 shadow-sm ${
        isUser
          ? "ml-auto bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
          : "mr-auto bg-slate-800/40 border border-slate-700/30 text-white/90"
      } ${isTyping ? "animate-pulse" : ""} ${className || ''}`}
    >
      {children}
      
      {/* Confidence animation */}
      {confidence && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Confidence</span>
            <span className="text-emerald-400">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1">
            <motion.div
              className="bg-emerald-400 h-1 rounded-full"
              variants={chatAnimations.confidenceBar}
              initial="initial"
              animate="animate"
              custom={confidence}
            />
          </div>
        </div>
      )}
      
      {/* Message tail */}
      <div 
        className={`absolute top-4 w-3 h-3 transform rotate-45 ${
          isUser 
            ? "-right-1.5 bg-emerald-600/10 border-r border-b border-emerald-500/20"
            : "-left-1.5 bg-slate-800/40 border-l border-t border-slate-700/30"
        }`}
      />
    </motion.div>
  );
}

// Optimized scroll area with virtual scrolling for large message lists
export function OptimizedChatScrollArea({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`h-[500px] overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 transition-colors ${className || ''}`}>
      <div className="space-y-6 p-4">
        {children}
      </div>
    </div>
  );
}

// Lazy loading wrapper for heavy animations
export function LazyAnimationWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    // Load animations after component mounts
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!animationsReady) {
    return <>{fallback || children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={chatAnimations.pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Background effects processor
export function useBackgroundEffects() {
  const [effects, setEffects] = useState({
    particles: false,
    gradientShift: false,
    mouseparallax: false
  });

  const enableEffect = useCallback((effectName: keyof typeof effects) => {
    setEffects(prev => ({ ...prev, [effectName]: true }));
  }, []);

  const disableEffect = useCallback((effectName: keyof typeof effects) => {
    setEffects(prev => ({ ...prev, [effectName]: false }));
  }, []);

  return { effects, enableEffect, disableEffect };
}

// Performance monitor for animations
export function useAnimationPerformance() {
  const [performance, setPerformance] = useState({
    fps: 60,
    frameTime: 16.67,
    isLagging: false
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const frameTime = (currentTime - lastTime) / frameCount;
        
        setPerformance({
          fps,
          frameTime,
          isLagging: fps < 30
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    requestAnimationFrame(measurePerformance);
  }, []);

  return performance;
} 