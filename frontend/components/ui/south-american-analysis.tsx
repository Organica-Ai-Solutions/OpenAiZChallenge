"use client";

import React from 'react';
import { Mountain, Trees, Crown, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SouthAmericanAnalysisProps {
  onAnalyzeRegion: (coordinates: string, context: string) => void;
  className?: string;
}

export function SouthAmericanAnalysis({
  onAnalyzeRegion,
  className
}: SouthAmericanAnalysisProps) {
  return (
    <div className={cn("bg-slate-800/50 rounded-lg border border-slate-700/50 p-4", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">South American Regional Analysis</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <button
          onClick={() => onAnalyzeRegion('0.1807, -78.4678', 'Northern Andes - Muisca and Tairona cultures')}
          className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
        >
          <Mountain className="w-3 h-3 text-emerald-400" />
          N. Andes
        </button>
        
        <button
          onClick={() => onAnalyzeRegion('-8.2275, -74.5975', 'Western Amazon - Pre-Columbian settlements')}
          className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
        >
          <Trees className="w-3 h-3 text-green-400" />
          Amazon
        </button>
        
        <button
          onClick={() => onAnalyzeRegion('-13.5170, -71.9785', 'Inca Heartland - Sacred Valley complex')}
          className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
        >
          <Crown className="w-3 h-3 text-yellow-400" />
          Inca Core
        </button>
      </div>
    </div>
  );
} 