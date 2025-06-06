"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  MapPin, 
  Target, 
  Search, 
  Eye, 
  Zap,
  Activity,
  Globe,
  FileText,
  Upload,
  Camera,
  Clock,
  Users,
  Brain,
  Network,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Textarea } from './textarea';
import { Card, CardContent } from './card';

// Import the enhanced chat components
import { 
  TypingIndicator,
  EnhancedFileUpload,
  ConfidenceVisualization,
  MapIntegration
} from './enhanced-chat-features';
import { 
  MessageBubble,
  TypingBubble,
  ChatScrollArea,
  MessageTimestamp,
  MessageStatus,
  MessageActions
} from './enhanced-chat-styling';
import { 
  generateEnhancedArchaeologicalResponse,
  generateEnhancedVisionResponse,
  generateRealTimeResponse,
  ArchaeologicalAnalysis,
  VisionAnalysis
} from './enhanced-chat-responses';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  timestamp: Date;
  agent?: string;
  confidence?: number;
  metadata?: any;
  attachments?: File[];
  coordinates?: { lat: number; lng: number };
  processing?: boolean;
}

interface Props {
  onCoordinateSelect?: (coordinates: { lat: number; lng: number }) => void;
}

export default function EnhancedUltimateChat({ onCoordinateSelect }: Props) {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: `## 🏛️ Welcome to the Archaeological Discovery System

I'm your AI archaeological assistant, powered by multiple specialized agents:

**Available Commands:**
• \`/vision [coordinates]\` - Satellite imagery analysis
• \`/analyze [location]\` - Comprehensive site analysis  
• \`/discover [region]\` - Find potential archaeological sites
• \`/research [topic]\` - Historical and cultural research

**Quick Start:**
1. Enter coordinates (e.g., "37.4419, -122.1430")
2. Upload satellite images for analysis
3. Ask questions about archaeological sites

Ready to discover ancient civilizations? 🔍`,
      role: 'assistant',
      timestamp: new Date(),
      agent: 'NIS Protocol',
      confidence: 1.0
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<string>('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Backend connectivity check
  const checkBackendHealth = useCallback(async () => {
    try {
      const healthResponse = await fetch('http://localhost:8000/system/health');
      if (healthResponse.ok) {
        setIsBackendOnline(true);
        
        // Get detailed agent information
        try {
          const agentsResponse = await fetch('http://localhost:8000/agents/agents');
          if (agentsResponse.ok) {
            const agents = await agentsResponse.json();
            setActiveAgents(agents.map((agent: any) => agent.name));
          } else {
            setActiveAgents(['Archaeological AI']);
          }
        } catch (agentError) {
          console.warn('Could not fetch agents:', agentError);
          setActiveAgents(['Archaeological AI']);
        }
      } else {
        setIsBackendOnline(false);
        setActiveAgents([]);
      }
    } catch (error) {
      console.warn('Backend health check failed:', error);
      setIsBackendOnline(false);
      setActiveAgents([]);
    }
  }, []);

  // Initialize backend check
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced message sending with real backend integration
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const messageId = `msg_${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsProcessing(true);

    // Add processing indicator
    const processingMessage: Message = {
      id: `processing_${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      processing: true
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      let response;
      
      if (isBackendOnline) {
        // Get coordinates as object
        let coordinatesObj: { lat: number; lng: number } | null = null;
        
        if (selectedCoordinates) {
          coordinatesObj = parseCoordinates(selectedCoordinates);
        } else {
          const extractedCoords = extractCoordinatesFromMessage(inputValue);
          if (extractedCoords) {
            coordinatesObj = parseCoordinates(extractedCoords);
          }
        }

        // Real backend integration
        if (inputValue.includes('/vision')) {
          // Vision analysis request
          let requestBody: any = {
            query: inputValue,
            include_analysis: true
          };
          
          if (coordinatesObj) {
            requestBody.lat = coordinatesObj.lat;
            requestBody.lon = coordinatesObj.lng;
          }
          
          response = await fetch('http://localhost:8000/vision/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
        } else {
          // General archaeological analysis
          let requestBody: any = {
            query: inputValue,
            attachments: attachments.length > 0 ? attachments.map(f => f.name) : undefined
          };
          
          if (coordinatesObj) {
            requestBody.lat = coordinatesObj.lat;
            requestBody.lon = coordinatesObj.lng;
          }
          
          response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
        }

        if (response.ok) {
          const data = await response.json();
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            content: formatBackendResponse(data),
            role: 'assistant',
            timestamp: new Date(),
            confidence: data.confidence || 0.85,
            agent: data.agent || 'Archaeological AI',
            metadata: data
          };

          // Extract coordinates if present in response
          if (data.coordinates) {
            const coords = parseCoordinates(data.coordinates);
            if (coords && onCoordinateSelect) {
              onCoordinateSelect(coords);
            }
          }

          // Remove processing message and add real response
          setMessages(prev => prev.filter(msg => !msg.processing).concat([assistantMessage]));
        } else {
          throw new Error('Backend response failed');
        }
      } else {
        // Fallback to enhanced local responses
        const enhancedResponse = await generateRealTimeResponse(inputValue);
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          content: enhancedResponse,
          role: 'assistant',
          timestamp: new Date(),
          confidence: 0.75,
          agent: 'NIS Protocol (Offline)'
        };

        // Remove processing message and add fallback response
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => !msg.processing).concat([assistantMessage]));
        }, 1500);
      }
    } catch (error) {
      console.error('Message processing failed:', error);
      
      // Error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: '🚨 Connection Error: Unable to process your request. Please check the backend connection and try again.',
        role: 'system',
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => !msg.processing).concat([errorMessage]));
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, attachments, selectedCoordinates, isBackendOnline, onCoordinateSelect]);

  // Handle file uploads
  const handleFileUpload = useCallback((files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
  }, []);

  // Handle coordinate selection from map integration
  const handleCoordinateSelect = useCallback((coordinates: string) => {
    setSelectedCoordinates(coordinates);
    if (onCoordinateSelect) {
      const coords = parseCoordinates(coordinates);
      if (coords) {
        onCoordinateSelect(coords);
      }
    }
  }, [onCoordinateSelect]);

  // Handle key presses
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Message actions
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleRegenerateMessage = useCallback((messageId: string) => {
    console.log('Regenerating message:', messageId);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with backend status */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              {isBackendOnline && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">Archaeological AI Chat</h3>
              <p className="text-xs text-slate-400">
                {isBackendOnline ? `${activeAgents.length} agents online` : 'Offline mode'}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={checkBackendHealth}>
              <Network className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                <div className={cn(
                  "relative max-w-4xl rounded-2xl p-4 shadow-sm",
                  message.role === 'user'
                    ? "ml-auto bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
                    : "mr-auto bg-slate-800/40 border border-slate-700/30 text-white/90",
                  message.processing && "animate-pulse"
                )}>
                  <div className="space-y-3">
                    {/* Message header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        {message.processing && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full"
                          />
                        )}
                        
                        {message.role === 'assistant' && !message.processing && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <span className="text-emerald-400">🏛️</span>
                            <span>NIS Protocol</span>
                          </div>
                        )}
                        
                        {message.confidence && (
                          <span className="text-emerald-400">
                            {Math.round(message.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Message content */}
                    {message.processing ? (
                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 max-w-xs">
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
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* Confidence visualization */}
                        {message.confidence && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Confidence</span>
                              <span className="text-emerald-400">{Math.round(message.confidence * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1">
                              <motion.div
                                className="bg-emerald-400 h-1 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${message.confidence * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.attachments.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg text-xs">
                                <FileText className="w-3 h-3" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* File upload area */}
      {attachments.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg text-xs">
                    <FileText className="w-3 h-3" />
                    <span>{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="w-4 h-4 p-0 hover:bg-red-500/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          {/* File upload button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('file-input')?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,.txt,.pdf,.json"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleFileUpload(files);
            }}
            className="hidden"
          />

          {/* Input area */}
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about archaeological sites, analyze coordinates, or upload images for vision analysis..."
              className="min-h-[60px] max-h-[120px] bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 resize-none"
              disabled={isProcessing}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={isProcessing || (!inputValue.trim() && attachments.length === 0)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick command suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: <Eye className="w-3 h-3" />, text: "/vision", desc: "Satellite analysis" },
            { icon: <Target className="w-3 h-3" />, text: "/analyze", desc: "Site analysis" },
            { icon: <Search className="w-3 h-3" />, text: "/discover", desc: "Find sites" },
            { icon: <Globe className="w-3 h-3" />, text: "/research", desc: "Historical data" }
          ].map((cmd, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => setInputValue(cmd.text + ' ')}
              className="h-7 px-2 text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10"
            >
              {cmd.icon}
              <span className="ml-1">{cmd.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Utility functions
function formatBackendResponse(data: any): string {
  if (data.analysis) {
    return `## Archaeological Analysis Results

${data.analysis}

**Confidence**: ${Math.round((data.confidence || 0.8) * 100)}%
**Processing Time**: ${data.processing_time || 'N/A'}
**Agent**: ${data.agent || 'Archaeological AI'}

${data.recommendations ? '**Recommendations**:\n' + data.recommendations.map((r: string) => `• ${r}`).join('\n') : ''}`;
  }
  
  return data.response || data.message || JSON.stringify(data, null, 2);
}

function extractCoordinatesFromMessage(message: string): string {
  const coordRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
  const match = message.match(coordRegex);
  return match ? `${match[1]},${match[2]}` : '';
}

function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  const parts = coordString.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
} 