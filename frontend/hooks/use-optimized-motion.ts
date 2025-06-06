"use client";

import { useEffect, useState } from 'react';

// Lazy load framer-motion
let motionPromise: Promise<typeof import('framer-motion')> | null = null;

export function useOptimizedMotion() {
  const [motion, setMotion] = useState<typeof import('framer-motion') | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMotion = async () => {
    if (motion) return motion;
    if (motionPromise) return motionPromise;

    setIsLoading(true);
    motionPromise = import('framer-motion');
    
    try {
      const motionLib = await motionPromise;
      setMotion(motionLib);
      setIsLoading(false);
      return motionLib;
    } catch (error) {
      console.warn('Failed to load framer-motion:', error);
      setIsLoading(false);
      return null;
    }
  };

  return {
    motion,
    isLoading,
    loadMotion
  };
}

// For components that need motion immediately
export function useMotionOnMount() {
  const { motion, loadMotion } = useOptimizedMotion();

  useEffect(() => {
    // Only load motion after component mounts
    const timer = setTimeout(() => {
      loadMotion();
    }, 100); // Small delay to avoid blocking initial render

    return () => clearTimeout(timer);
  }, [loadMotion]);

  return motion;
} 