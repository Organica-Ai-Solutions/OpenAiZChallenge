"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  Command,
  MapPin,
  Eye,
  Search,
  BookOpen,
  Zap,
  ArrowUp,
  ArrowDown,
  CornerDownLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CommandSuggestion {
  command: string;
  description: string;
  example: string;
  category: 'analysis' | 'navigation' | 'research' | 'system';
  icon: React.ReactNode;
  shortcut?: string;
}

const COMMANDS: CommandSuggestion[] = [
  {
    command: '/analyze',
    description: 'Complete archaeological analysis of coordinates',
    example: '/analyze -8.1116, -79.0291',
    category: 'analysis',
    icon: <Search className="w-4 h-4" />,
    shortcut: 'Ctrl+A'
  },
  {
    command: '/vision',
    description: 'AI-powered satellite imagery analysis',
    example: '/vision -8.1116, -79.0291',
    category: 'analysis',
    icon: <Eye className="w-4 h-4" />,
    shortcut: 'Ctrl+V'
  },
  {
    command: '/eldorado',
    description: 'El Dorado specialized search system',
    example: '/eldorado guatavita',
    category: 'research',
    icon: <BookOpen className="w-4 h-4" />,
    shortcut: 'Ctrl+E'
  },
  {
    command: '/regional',
    description: 'South American regional analysis',
    example: '/regional andes',
    category: 'research',
    icon: <BookOpen className="w-4 h-4" />,
    shortcut: 'Ctrl+R'
  },
  {
    command: '/legendary',
    description: 'Historical legendary site analysis',
    example: '/legendary paititi',
    category: 'research',
    icon: <BookOpen className="w-4 h-4" />,
    shortcut: 'Ctrl+L'
  },
  {
    command: '/discover',
    description: 'Site discovery and pattern matching',
    example: '/discover ceremonial complexes',
    category: 'analysis',
    icon: <Zap className="w-4 h-4" />,
    shortcut: 'Ctrl+D'
  },
  {
    command: '/map',
    description: 'Interactive map visualization',
    example: '/map -8.1116, -79.0291',
    category: 'navigation',
    icon: <MapPin className="w-4 h-4" />,
    shortcut: 'Ctrl+M'
  },
  {
    command: '/help',
    description: 'Show available commands and help',
    example: '/help',
    category: 'system',
    icon: <Command className="w-4 h-4" />,
    shortcut: 'Ctrl+?'
  }
];

interface AdvancedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onAttachFile?: () => void;
  onVoiceRecord?: () => void;
  isRecording?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function AdvancedChatInput({
  value,
  onChange,
  onSend,
  onAttachFile,
  onVoiceRecord,
  isRecording = false,
  isLoading = false,
  placeholder = "Ask about archaeological sites, analyze coordinates, or use / for commands...",
  disabled = false
}: AdvancedChatInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [filteredCommands, setFilteredCommands] = useState<CommandSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Handle command suggestions
  useEffect(() => {
    if (value.startsWith('/')) {
      const command = value.toLowerCase();
      const filtered = COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().startsWith(command) ||
        cmd.description.toLowerCase().includes(command.slice(1))
      );
      setFilteredCommands(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  }, [value]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            onChange('/analyze ');
            textareaRef.current?.focus();
            break;
          case 'v':
            e.preventDefault();
            onChange('/vision ');
            textareaRef.current?.focus();
            break;
          case 'e':
            e.preventDefault();
            onChange('/eldorado ');
            textareaRef.current?.focus();
            break;
          case 'r':
            e.preventDefault();
            onChange('/regional ');
            textareaRef.current?.focus();
            break;
          case 'l':
            e.preventDefault();
            onChange('/legendary ');
            textareaRef.current?.focus();
            break;
          case 'd':
            e.preventDefault();
            onChange('/discover ');
            textareaRef.current?.focus();
            break;
          case 'm':
            e.preventDefault();
            onChange('/map ');
            textareaRef.current?.focus();
            break;
          case '/':
          case '?':
            e.preventDefault();
            onChange('/help');
            textareaRef.current?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredCommands.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestion >= 0) {
            const selected = filteredCommands[selectedSuggestion];
            onChange(selected.command + ' ');
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSend(value);
      }
    }
  };

  const handleSuggestionClick = (command: CommandSuggestion) => {
    onChange(command.command + ' ');
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const detectCoordinates = (text: string) => {
    const coordRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
    return coordRegex.test(text);
  };

  const hasCoordinates = detectCoordinates(value);

  const EMOJIS = ['🏛️', '🗺️', '🔍', '📍', '⚡', '🌟', '🎯', '💎', '🏺', '📚', '🌿', '🔬'];

  return (
    <div className="relative">
      {/* Command Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 w-full bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-xs text-slate-400 mb-2 px-2">
                Commands • Use ↑↓ to navigate, Tab/Enter to select
              </div>
              {filteredCommands.map((cmd, index) => (
                <motion.div
                  key={cmd.command}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors",
                    index === selectedSuggestion 
                      ? "bg-emerald-600/20 border border-emerald-500/30" 
                      : "hover:bg-slate-700/50"
                  )}
                  onClick={() => handleSuggestionClick(cmd)}
                >
                  <div className="text-blue-400 mt-0.5">{cmd.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-400">{cmd.command}</span>
                      {cmd.shortcut && (
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-1 py-0.5 rounded">
                          {cmd.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{cmd.description}</p>
                    <p className="text-xs text-slate-500 font-mono">{cmd.example}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl p-3 z-50"
          >
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(value + emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                  className="text-lg hover:bg-slate-700/50 rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className={cn(
        "relative bg-white/[0.02] border rounded-2xl transition-all duration-200",
        isFocused 
          ? "border-emerald-500/50 bg-white/[0.04] shadow-lg shadow-emerald-500/10" 
          : "border-white/[0.1] hover:border-white/[0.2]",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        {/* Coordinate Detection Indicator */}
        {hasCoordinates && (
          <div className="absolute -top-8 left-0 flex items-center gap-1 text-xs text-emerald-400">
            <MapPin className="w-3 h-3" />
            <span>Coordinates detected</span>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attach File Button */}
          <button
            onClick={onAttachFile}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors disabled:cursor-not-allowed"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full bg-transparent text-white placeholder-slate-400",
                "border-none outline-none resize-none",
                "min-h-[20px] max-h-[120px] leading-5",
                "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600"
              )}
              rows={1}
            />
            
            {/* Input Helper Text */}
            {isFocused && !value && (
              <div className="absolute -bottom-6 left-0 text-xs text-slate-500">
                Type / for commands • Ctrl+A for analysis • Ctrl+V for vision
              </div>
            )}
          </div>

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors disabled:cursor-not-allowed"
            title="Add emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Voice Record Button */}
          <button
            onClick={onVoiceRecord}
            disabled={disabled}
            className={cn(
              "p-2 transition-colors disabled:cursor-not-allowed",
              isRecording 
                ? "text-red-400 hover:text-red-300 animate-pulse" 
                : "text-slate-400 hover:text-emerald-400"
            )}
            title={isRecording ? "Stop recording" : "Voice message"}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => onSend(value)}
            disabled={!value.trim() || disabled || isLoading}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              value.trim() && !disabled && !isLoading
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg hover:shadow-emerald-500/25" 
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
            title="Send message (Enter)"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border border-white border-t-transparent rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {isFocused && (
          <div className="absolute -bottom-8 right-0 flex items-center gap-1 text-xs text-slate-500">
            <CornerDownLeft className="w-3 h-3" />
            <span>Enter to send</span>
            <span className="mx-1">•</span>
            <span>Shift+Enter for new line</span>
          </div>
        )}
      </div>
    </div>
  );
} 