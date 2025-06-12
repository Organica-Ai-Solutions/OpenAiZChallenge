"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/api/chat-service';
import { User, Bot, MapPin, Eye, Sparkles, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessageHistoryProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function ChatMessageHistory({ messages, isTyping = false }: ChatMessageHistoryProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (messages.length === 0 && !isTyping) {
    return null;
  }

  return (
    <motion.div 
      className="fixed top-20 right-4 w-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-40"
      animate={{ 
        height: isMinimized ? 'auto' : 'auto',
        maxHeight: isMinimized ? '60px' : '70vh'
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            Chat History
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {messages.length} messages • Real-time analysis
          </p>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white/40 hover:text-white/80 transition-colors p-1 rounded"
        >
          {isMinimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-full p-3 rounded-2xl text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-500/10 text-blue-100 border border-blue-500/20'
                    : 'bg-white/5 text-white/90 border border-white/10'
                }`}>
                  {/* Message text with markdown-like formatting */}
                  <div className="whitespace-pre-wrap">
                    {formatMessageContent(message.content)}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex flex-wrap gap-1">
                        {message.attachments.map((attachment, idx) => (
                          <span key={idx} className="text-xs bg-white/10 px-2 py-1 rounded">
                            📎 {attachment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coordinates */}
                  {message.coordinates && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <MapPin className="w-3 h-3" />
                        {message.coordinates.lat}, {message.coordinates.lon}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        {message.metadata.action_type && (
                          <span className="flex items-center gap-1">
                            {getActionIcon(message.metadata.action_type)}
                            {message.metadata.action_type}
                          </span>
                        )}
                        {message.metadata.confidence && (
                          <span>
                            {Math.round(message.metadata.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className={`text-xs text-white/30 mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-white/5 text-white/90 border border-white/10 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm text-white/60">Analyzing...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      )}
    </motion.div>
  );
}

// Helper function to format message content with basic markdown-like styling
function formatMessageContent(content: string): React.ReactNode {
  // Split by lines and process each line
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Handle headers
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <div key={index} className="font-semibold text-white mb-2">
          {line.slice(2, -2)}
        </div>
      );
    }
    
    // Handle bullet points
    if (line.startsWith('• ')) {
      return (
        <div key={index} className="ml-2 mb-1 text-white/80">
          {line}
        </div>
      );
    }
    
    // Handle regular lines
    return (
      <div key={index} className={line.trim() === '' ? 'mb-2' : 'mb-1'}>
        {line || '\u00A0'}
      </div>
    );
  });
}

// Helper function to get action type icon
function getActionIcon(actionType: string): React.ReactNode {
  switch (actionType) {
    case 'coordinate_analysis':
      return <MapPin className="w-3 h-3" />;
    case 'vision_analysis':
      return <Eye className="w-3 h-3" />;
    case 'general_chat':
      return <Sparkles className="w-3 h-3" />;
    case 'error':
    case 'vision_error':
    case 'analysis_error':
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <Bot className="w-3 h-3" />;
  }
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
} 