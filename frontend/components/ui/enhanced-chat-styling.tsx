"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TypingBubbleProps {
  className?: string;
}

export function TypingBubble({ className }: TypingBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 max-w-xs",
        className
      )}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">NIS Agent is thinking...</span>
    </motion.div>
  );
}

interface MessageBubbleProps {
  children: React.ReactNode;
  role: 'user' | 'assistant' | 'agent' | 'system';
  isTyping?: boolean;
  className?: string;
}

export function MessageBubble({ children, role, isTyping = false, className }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        opacity: { duration: 0.2 }
      }}
      className={cn(
        "relative max-w-4xl rounded-2xl p-4 shadow-sm",
        isUser
          ? "ml-auto bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
          : "mr-auto bg-slate-800/40 border border-slate-700/30 text-white/90",
        isTyping && "animate-pulse",
        className
      )}
    >
      {children}
      
      {/* Message tail for visual connection */}
      <div 
        className={cn(
          "absolute top-4 w-3 h-3 transform rotate-45",
          isUser 
            ? "-right-1.5 bg-emerald-600/10 border-r border-b border-emerald-500/20"
            : "-left-1.5 bg-slate-800/40 border-l border-t border-slate-700/30"
        )}
      />
    </motion.div>
  );
}

interface ChatScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatScrollArea({ children, className }: ChatScrollAreaProps) {
  return (
    <div className={cn(
      "h-[500px] overflow-y-auto overflow-x-hidden scroll-smooth",
      "scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600",
      "hover:scrollbar-thumb-slate-500 transition-colors",
      className
    )}>
      <div className="space-y-6 p-4">
        {children}
      </div>
    </div>
  );
}

interface MessageTimestampProps {
  timestamp: Date;
  className?: string;
}

export function MessageTimestamp({ timestamp, className }: MessageTimestampProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <span className={cn(
      "text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      className
    )}>
      {formatTime(timestamp)}
    </span>
  );
}

interface MessageStatusProps {
  role: 'user' | 'assistant' | 'agent' | 'system';
  confidence?: number;
  processing?: boolean;
  className?: string;
}

export function MessageStatus({ role, confidence, processing, className }: MessageStatusProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {processing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full"
        />
      )}
      
      {role === 'assistant' && !processing && (
        <div className="flex items-center gap-1 text-blue-400">
          <span className="text-emerald-400">🏛️</span>
          <span>NIS Protocol</span>
        </div>
      )}
      
      {confidence && (
        <span className="text-emerald-400">
          {Math.round(confidence * 100)}% confidence
        </span>
      )}
    </div>
  );
}

interface MessageActionsProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
  className?: string;
}

export function MessageActions({ onCopy, onRegenerate, onShare, className }: MessageActionsProps) {
  return (
    <div className={cn(
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      className
    )}>
      {onCopy && (
        <button
          onClick={onCopy}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
          title="Copy message"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
      
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
          title="Regenerate response"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
      
      {onShare && (
        <button
          onClick={onShare}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
          title="Share message"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      )}
    </div>
  );
} 