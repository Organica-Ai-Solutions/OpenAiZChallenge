import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  relatedCodex?: string;
}

interface CodexTimelineProps {
  events: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent) => void;
}

export function CodexTimeline({ events, onEventSelect }: CodexTimelineProps) {
  return (
    <div className="relative w-full">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-400/30 to-emerald-500/50" />
      
      <div className="space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-16"
          >
            {/* Timeline dot */}
            <div className="absolute left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500/80 border-2 border-emerald-400" />
            
            {/* Event content */}
            <div 
              className="group cursor-pointer"
              onClick={() => onEventSelect?.(event)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{event.date}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  event.significance === 'high' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : event.significance === 'medium'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {event.significance}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {event.title}
              </h3>
              
              <p className="text-sm text-slate-400 mb-3">
                {event.description}
              </p>
              
              {event.relatedCodex && (
                <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <span>Related Codex: {event.relatedCodex}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 