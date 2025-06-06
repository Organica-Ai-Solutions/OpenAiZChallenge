"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Zap,
  MessageSquare,
  FileText,
  Code2,
  Search,
  Eye,
  Map,
  Layers,
  Download,
  Share,
  Bookmark,
  History,
  Settings,
  ChevronRight,
  Copy,
  ExternalLink,
  Sparkles,
  Workflow,
  GitBranch,
  Database,
  Globe,
  Terminal,
  Cpu,
  Activity,
  BarChart3,
  Target,
  Lightbulb,
  Filter,
  SortAsc,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  ParallelToolExecutor, 
  IntelligentContextAwareness, 
  AdvancedCodeBlock, 
  TaskProgressTracker 
} from './ai-assistant-features';

// ========== CONVERSATION MANAGEMENT ==========
interface ConversationManagerProps {
  conversations: Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
    messageCount: number;
    topics: string[];
  }>;
  currentConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationManager({ 
  conversations, 
  currentConversationId, 
  onConversationSelect,
  onNewConversation,
  onDeleteConversation 
}: ConversationManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'messageCount' | 'title'>('timestamp');
  
  const filteredAndSortedConversations = conversations
    .filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'messageCount':
          return b.messageCount - a.messageCount;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">💬 Conversations</h3>
        </div>
        <button
          onClick={onNewConversation}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:border-emerald-500/50 focus:outline-none"
        >
          <option value="timestamp">Latest</option>
          <option value="messageCount">Most Active</option>
          <option value="title">Alphabetical</option>
        </select>
      </div>

      {/* Conversation List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAndSortedConversations.map((conversation) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all group",
              conversation.id === currentConversationId 
                ? "bg-emerald-500/20 border border-emerald-500/30"
                : "bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/30"
            )}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{conversation.title}</div>
                <div className="text-sm text-slate-400 truncate mt-1">{conversation.preview}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {conversation.timestamp.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MessageSquare className="w-3 h-3" />
                    {conversation.messageCount}
                  </div>
                </div>
                {conversation.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.topics.slice(0, 3).map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ========== SMART CITATIONS & REFERENCES ==========
interface CitationManagerProps {
  citations: Array<{
    id: string;
    text: string;
    source: string;
    url?: string;
    confidence: number;
    timestamp: Date;
  }>;
  onCitationClick: (citation: any) => void;
  onAddCitation: (text: string, source: string, url?: string) => void;
}

export function CitationManager({ citations, onCitationClick, onAddCitation }: CitationManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCitation, setNewCitation] = useState({ text: '', source: '', url: '' });

  const handleAddCitation = () => {
    if (newCitation.text && newCitation.source) {
      onAddCitation(newCitation.text, newCitation.source, newCitation.url || undefined);
      setNewCitation({ text: '', source: '', url: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">📖 Citations & References</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Add Citation Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
        >
          <div className="space-y-3">
            <textarea
              value={newCitation.text}
              onChange={(e) => setNewCitation(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Citation text..."
              className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded text-sm text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:outline-none"
              rows={2}
            />
            <input
              type="text"
              value={newCitation.source}
              onChange={(e) => setNewCitation(prev => ({ ...prev, source: e.target.value }))}
              placeholder="Source (e.g., Academic Paper, Book, Website)"
              className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded text-sm text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:outline-none"
            />
            <input
              type="url"
              value={newCitation.url}
              onChange={(e) => setNewCitation(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL (optional)"
              className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded text-sm text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCitation}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                Add Citation
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Citations List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {citations.map((citation, index) => (
          <motion.div
            key={citation.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors group"
            onClick={() => onCitationClick(citation)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-300 leading-relaxed mb-2">
                  "{citation.text}"
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 font-medium">{citation.source}</span>
                  {citation.url && (
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-slate-500">
                    Confidence: {Math.round(citation.confidence * 100)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {citation.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`"${citation.text}" - ${citation.source}`);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-400 transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ========== MESSAGE OPTIMIZATION SUGGESTIONS ==========
interface MessageOptimizerProps {
  currentMessage: string;
  onOptimizedMessage: (optimizedMessage: string) => void;
  onSuggestionApply: (suggestion: string) => void;
}

export function MessageOptimizer({ currentMessage, onOptimizedMessage, onSuggestionApply }: MessageOptimizerProps) {
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'clarity' | 'specificity' | 'context' | 'tool';
    text: string;
    improvement: string;
  }>>([]);

  useEffect(() => {
    if (currentMessage.length > 10) {
      analyzeMessage(currentMessage);
    } else {
      setSuggestions([]);
    }
  }, [currentMessage]);

  const analyzeMessage = useCallback((message: string) => {
    const newSuggestions = [];
    
    // Check for clarity
    if (message.includes('thing') || message.includes('stuff') || message.includes('something')) {
      newSuggestions.push({
        type: 'clarity' as const,
        text: 'Consider being more specific than "thing" or "something"',
        improvement: 'Use precise terms to improve clarity'
      });
    }

    // Check for coordinate patterns
    const coordPattern = /-?\d+\.?\d*,?\s*-?\d+\.?\d*/;
    if (coordPattern.test(message) && !message.includes('/analyze') && !message.includes('/vision')) {
      newSuggestions.push({
        type: 'tool' as const,
        text: 'Add /analyze or /vision command for coordinate analysis',
        improvement: 'Use tools for better coordinate analysis'
      });
    }

    // Check for vague archaeological terms
    if (message.includes('site') && !message.includes('archaeological') && !message.includes('ceremonial')) {
      newSuggestions.push({
        type: 'specificity' as const,
        text: 'Specify the type of archaeological site',
        improvement: 'Add context like "ceremonial site" or "settlement site"'
      });
    }

    // Check for missing context
    if (message.length < 20 && !message.startsWith('/')) {
      newSuggestions.push({
        type: 'context' as const,
        text: 'Consider adding more context to your query',
        improvement: 'Provide background information for better assistance'
      });
    }

    setSuggestions(newSuggestions.slice(0, 3)); // Limit to 3 suggestions
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-medium text-orange-300">💡 Message Suggestions</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 bg-orange-500/5 rounded border border-orange-500/10"
          >
            <div className="flex-1">
              <div className="text-sm text-orange-200">{suggestion.text}</div>
              <div className="text-xs text-orange-400 mt-1">{suggestion.improvement}</div>
            </div>
            <button
              onClick={() => onSuggestionApply(suggestion.improvement)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ========== EXPORT MANAGEMENT ==========
interface ExportManagerProps {
  conversationId: string;
  messages: Array<{ content: string; role: string; timestamp: Date }>;
  onExport: (format: 'markdown' | 'json' | 'pdf') => void;
}

export function ExportManager({ conversationId, messages, onExport }: ExportManagerProps) {
  const [showOptions, setShowOptions] = useState(false);

  const exportFormats = [
    { type: 'markdown' as const, label: 'Markdown', description: 'Human-readable format', icon: <FileText className="w-4 h-4" /> },
    { type: 'json' as const, label: 'JSON', description: 'Machine-readable format', icon: <Code2 className="w-4 h-4" /> },
    { type: 'pdf' as const, label: 'PDF', description: 'Professional document', icon: <Download className="w-4 h-4" /> }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export Chat
        <ChevronRight className={cn("w-3 h-3 transition-transform", showOptions && "rotate-90")} />
      </button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-lg p-2 min-w-48 z-50"
        >
          {exportFormats.map((format) => (
            <button
              key={format.type}
              onClick={() => {
                onExport(format.type);
                setShowOptions(false);
              }}
              className="flex items-center gap-3 w-full p-2 hover:bg-slate-700/50 rounded text-left transition-colors"
            >
              <div className="text-emerald-400">{format.icon}</div>
              <div>
                <div className="text-sm font-medium text-white">{format.label}</div>
                <div className="text-xs text-slate-400">{format.description}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Export all components already exported above 