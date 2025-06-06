"use client";

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <div className="text-white text-sm">Loading...</div>
      </motion.div>
    </div>
  );
}

export function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );
} 