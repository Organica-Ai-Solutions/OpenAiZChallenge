"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Lightbulb,
  Search,
  Target,
  GitBranch,
  Database,
  Zap,
  Eye,
  Code2,
  FileText,
  Map,
  Activity,
  BarChart3,
  Workflow,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Share,
  Bookmark,
  RefreshCw,
  Sparkles,
  Terminal,
  Globe,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ========== THINKING PROCESS VISUALIZATION ==========
interface ThinkingStep {
  id: string;
  type: 'analyze' | 'consider' | 'synthesize' | 'conclude' | 'verify';
  content: string;
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  timestamp: Date;
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isThinking: boolean;
  onStepClick?: (step: ThinkingStep) => void;
}

export function ThinkingProcess({ steps, isThinking, onStepClick }: ThinkingProcessProps) {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (isThinking && visibleSteps < steps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isThinking, visibleSteps, steps.length]);

  const getStepIcon = (type: ThinkingStep['type']) => {
    const icons = {
      analyze: <Search className="w-4 h-4" />,
      consider: <Lightbulb className="w-4 h-4" />,
      synthesize: <GitBranch className="w-4 h-4" />,
      conclude: <Target className="w-4 h-4" />,
      verify: <CheckCircle className="w-4 h-4" />
    };
    return icons[type];
  };

  const getStepColor = (type: ThinkingStep['type']) => {
    const colors = {
      analyze: 'blue',
      consider: 'amber',
      synthesize: 'emerald',
      conclude: 'purple',
      verify: 'green'
    };
    return colors[type];
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-white">🤔 Thinking Process</h3>
        {isThinking && (
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400">Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {steps.slice(0, visibleSteps).map((step, index) => {
          const isExpanded = expandedStep === step.id;
          const color = getStepColor(step.type);
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={cn(
                "border rounded-lg p-3 transition-all cursor-pointer",
                `border-${color}-500/30 bg-${color}-500/5 hover:bg-${color}-500/10`
              )}
              onClick={() => {
                setExpandedStep(isExpanded ? null : step.id);
                onStepClick?.(step);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`text-${color}-400 mt-0.5`}>
                  {getStepIcon(step.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-${color}-400 text-xs font-medium uppercase tracking-wide`}>
                      {step.type}
                    </span>
                    <div className="text-xs text-slate-500">
                      {step.confidence}% confidence
                    </div>
                    <div className="text-xs text-slate-500">
                      {step.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm text-white mb-2">
                    {step.content}
                  </div>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="p-2 bg-slate-800/50 rounded border border-slate-600/30">
                        <div className="text-xs text-slate-400 mb-1">Reasoning:</div>
                        <div className="text-sm text-slate-300">{step.reasoning}</div>
                      </div>
                      
                      {step.alternatives && step.alternatives.length > 0 && (
                        <div className="p-2 bg-slate-800/50 rounded border border-slate-600/30">
                          <div className="text-xs text-slate-400 mb-1">Alternatives considered:</div>
                          <div className="space-y-1">
                            {step.alternatives.map((alt, idx) => (
                              <div key={idx} className="text-xs text-slate-300">• {alt}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          );
        })}
        
        {isThinking && visibleSteps < steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-sm text-emerald-300">Analyzing next step...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ========== STRUCTURED ANALYSIS FRAMEWORK ==========
interface AnalysisSection {
  id: string;
  title: string;
  type: 'context' | 'evidence' | 'interpretation' | 'implications' | 'confidence';
  content: string;
  confidence: number;
  sources: string[];
  relatedSections: string[];
}

interface StructuredAnalysisProps {
  title: string;
  sections: AnalysisSection[];
  onSectionUpdate?: (sectionId: string, updates: Partial<AnalysisSection>) => void;
  onExport?: (format: 'markdown' | 'pdf' | 'json') => void;
}

export function StructuredAnalysis({ title, sections, onSectionUpdate, onExport }: StructuredAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionIcon = (type: AnalysisSection['type']) => {
    const icons = {
      context: <Info className="w-4 h-4" />,
      evidence: <Database className="w-4 h-4" />,
      interpretation: <Brain className="w-4 h-4" />,
      implications: <ArrowRight className="w-4 h-4" />,
      confidence: <BarChart3 className="w-4 h-4" />
    };
    return icons[type];
  };

  const getSectionColor = (type: AnalysisSection['type']) => {
    const colors = {
      context: 'blue',
      evidence: 'emerald',
      interpretation: 'purple',
      implications: 'amber',
      confidence: 'green'
    };
    return colors[type];
  };

  const getOverallConfidence = () => {
    if (sections.length === 0) return 0;
    return Math.round(sections.reduce((sum, section) => sum + section.confidence, 0) / sections.length);
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{title}</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-slate-400">{sections.length} sections</span>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{getOverallConfidence()}% confidence</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport?.('markdown')}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Export as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onExport?.('json')}
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
            title="Export as JSON"
          >
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const color = getSectionColor(section.type);
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "border rounded-lg transition-all",
                `border-${color}-500/30 bg-${color}-500/5`
              )}
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/20"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-${color}-400`}>
                    {getSectionIcon(section.type)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{section.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="capitalize">{section.type}</span>
                      <span>•</span>
                      <span>{section.confidence}% confidence</span>
                      {section.sources.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{section.sources.length} sources</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-3 pb-3 border-t border-slate-600/30"
                >
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-slate-800/50 rounded border border-slate-600/30">
                      <div className="text-sm text-white whitespace-pre-wrap">{section.content}</div>
                    </div>
                    
                    {section.sources.length > 0 && (
                      <div className="p-3 bg-slate-800/50 rounded border border-slate-600/30">
                        <div className="text-xs text-slate-400 mb-2">Sources:</div>
                        <div className="flex flex-wrap gap-1">
                          {section.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {section.relatedSections.length > 0 && (
                      <div className="p-3 bg-slate-800/50 rounded border border-slate-600/30">
                        <div className="text-xs text-slate-400 mb-2">Related sections:</div>
                        <div className="flex flex-wrap gap-1">
                          {section.relatedSections.map((relatedId, idx) => {
                            const relatedSection = sections.find(s => s.id === relatedId);
                            return relatedSection ? (
                              <button
                                key={idx}
                                onClick={() => toggleSection(relatedId)}
                                className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300 hover:bg-purple-500/30 transition-colors"
                              >
                                {relatedSection.title}
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ========== INTELLIGENT QUESTION GENERATOR ==========
interface QuestionSuggestion {
  id: string;
  category: 'clarification' | 'exploration' | 'validation' | 'extension';
  question: string;
  reasoning: string;
  priority: number;
}

interface IntelligentQuestionGeneratorProps {
  context: string;
  onQuestionSelect: (question: string) => void;
  maxSuggestions?: number;
}

export function IntelligentQuestionGenerator({ 
  context, 
  onQuestionSelect, 
  maxSuggestions = 6 
}: IntelligentQuestionGeneratorProps) {
  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (context.trim()) {
      generateQuestions(context);
    }
  }, [context]);

  const generateQuestions = async (inputContext: string) => {
    setIsGenerating(true);
    
    // Simulate intelligent question generation based on context
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedQuestions: QuestionSuggestion[] = [
      {
        id: 'q1',
        category: 'clarification',
        question: 'What specific time period are you most interested in?',
        reasoning: 'Archaeological analysis often depends on chronological context',
        priority: 95
      },
      {
        id: 'q2',
        category: 'exploration',
        question: 'What geographical region should we focus on?',
        reasoning: 'Spatial constraints help narrow down search parameters',
        priority: 90
      },
      {
        id: 'q3',
        category: 'validation',
        question: 'What level of confidence do you need for the analysis?',
        reasoning: 'Different applications require different confidence thresholds',
        priority: 85
      },
      {
        id: 'q4',
        category: 'extension',
        question: 'Would you like to explore related archaeological sites?',
        reasoning: 'Site clustering often reveals cultural patterns',
        priority: 80
      }
    ].sort((a, b) => b.priority - a.priority).slice(0, maxSuggestions);
    
    setSuggestions(generatedQuestions);
    setIsGenerating(false);
  };

  const getCategoryIcon = (category: QuestionSuggestion['category']) => {
    const icons = {
      clarification: <Search className="w-4 h-4" />,
      exploration: <Eye className="w-4 h-4" />,
      validation: <CheckCircle className="w-4 h-4" />,
      extension: <ArrowRight className="w-4 h-4" />
    };
    return icons[category];
  };

  const getCategoryColor = (category: QuestionSuggestion['category']) => {
    const colors = {
      clarification: 'blue',
      exploration: 'emerald',
      validation: 'amber',
      extension: 'purple'
    };
    return colors[category];
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-white">💡 Suggested Questions</h3>
        {isGenerating && (
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin ml-auto" />
        )}
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => {
            const color = getCategoryColor(suggestion.category);
            
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all group",
                  `border-${color}-500/30 bg-${color}-500/5 hover:bg-${color}-500/10`
                )}
                onClick={() => onQuestionSelect(suggestion.question)}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-${color}-400 mt-0.5`}>
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-${color}-400 text-xs font-medium uppercase tracking-wide`}>
                        {suggestion.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {suggestion.priority}% relevance
                      </span>
                    </div>
                    <div className="text-sm text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      {suggestion.question}
                    </div>
                    <div className="text-xs text-slate-400">
                      {suggestion.reasoning}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Ask a question to generate intelligent suggestions</p>
        </div>
      )}
    </div>
  );
}

// ========== EXPORT ALL CLAUDE-INSPIRED FEATURES ==========
export const ClaudeInspiredFeatures = {
  ThinkingProcess,
  StructuredAnalysis,
  IntelligentQuestionGenerator
}; 