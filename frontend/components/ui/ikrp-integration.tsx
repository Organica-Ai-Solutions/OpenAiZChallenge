"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  MapPin, 
  Eye, 
  Brain, 
  Zap, 
  Target, 
  FileText,
  Globe,
  Clock,
  Star,
  ChevronRight,
  Download,
  ExternalLink,
  Sparkles,
  Command
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CodexSource {
  name: string;
  total_codices: number;
  status: string;
  description: string;
  specialization: string;
}

interface CodexResult {
  title: string;
  source: string;
  period: string;
  relevance_score: number;
  geographic_relevance: string;
  analysis?: {
    geographic_references?: Array<{ relevance: string }>;
    cultural_significance?: string;
  };
}

interface IKRPIntegrationProps {
  onCoordinateAnalysis?: (coordinates: string) => void;
  onCodexAnalysis?: (codexId: string) => void;
}

export function IKRPIntegration({ onCoordinateAnalysis, onCodexAnalysis }: IKRPIntegrationProps) {
  const [sources, setSources] = useState<CodexSource[]>([]);
  const [searchResults, setSearchResults] = useState<CodexResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCoordinates, setSearchCoordinates] = useState('');
  const [selectedCodex, setSelectedCodex] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check IKRP system status and load sources
  useEffect(() => {
    const checkIKRPStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/ikrp/sources');
        if (response.ok) {
          const data = await response.json();
          setSources(data.sources || [
            {
              name: 'FAMSI',
              total_codices: 8,
              status: 'active',
              description: 'Foundation for the Advancement of Mesoamerican Studies',
              specialization: 'Pre-Columbian manuscripts'
            },
            {
              name: 'World Digital Library',
              total_codices: 12,
              status: 'active',
              description: 'UNESCO digital heritage collection',
              specialization: 'Colonial period documents'
            },
            {
              name: 'INAH',
              total_codices: 6,
              status: 'active',
              description: 'Instituto Nacional de Antropología e Historia',
              specialization: 'Mexican archaeological records'
            }
          ]);
          setSystemStatus('online');
        } else {
          setSystemStatus('offline');
        }
      } catch (error) {
        console.warn('IKRP system check failed:', error);
        setSystemStatus('offline');
        // Set demo data
        setSources([
          {
            name: 'FAMSI',
            total_codices: 8,
            status: 'active',
            description: 'Foundation for the Advancement of Mesoamerican Studies',
            specialization: 'Pre-Columbian manuscripts'
          },
          {
            name: 'World Digital Library',
            total_codices: 12,
            status: 'active',
            description: 'UNESCO digital heritage collection',
            specialization: 'Colonial period documents'
          },
          {
            name: 'INAH',
            total_codices: 6,
            status: 'active',
            description: 'Instituto Nacional de Antropología e Historia',
            specialization: 'Mexican archaeological records'
          }
        ]);
      }
    };

    checkIKRPStatus();
  }, []);

  const handleCoordinateSearch = async () => {
    if (!searchCoordinates.trim()) return;
    
    setIsLoading(true);
    try {
      const [lat, lon] = searchCoordinates.split(',').map(c => parseFloat(c.trim()));
      
      if (systemStatus === 'online') {
        const response = await fetch('http://localhost:8000/ikrp/search_codices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: { lat, lon },
            radius_km: 100.0,
            period: "all",
            sources: ["famsi", "world_digital_library", "inah"],
            max_results: 5
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.codices || []);
        }
      } else {
        // Demo results for offline mode
        setSearchResults([
          {
            title: 'Codex Borgia',
            source: 'FAMSI',
            period: 'Pre-Columbian',
            relevance_score: 0.92,
            geographic_relevance: 'Central Mexico highlands',
            analysis: {
              geographic_references: [{ relevance: 'Settlement patterns match satellite analysis' }],
              cultural_significance: 'Ceremonial architecture depictions'
            }
          },
          {
            title: 'Florentine Codex',
            source: 'World Digital Library',
            period: 'Colonial',
            relevance_score: 0.85,
            geographic_relevance: 'Comprehensive ethnographic record',
            analysis: {
              geographic_references: [{ relevance: 'Cultural practices align with archaeological findings' }],
              cultural_significance: 'Detailed cultural descriptions'
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Coordinate search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodexAnalysis = async (codexId: string) => {
    setSelectedCodex(codexId);
    if (onCodexAnalysis) {
      onCodexAnalysis(codexId);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      {/* IKRP System Overview */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 text-white mb-4">
          <BookOpen className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">IKRP Codex Research System</h2>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${systemStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {systemStatus === 'online' ? 'Online' : 'Demo Mode'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {sources.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{source.name}</h3>
                <span className="text-xs border border-white/20 px-2 py-1 rounded">
                  {source.total_codices} codices
                </span>
              </div>
              <p className="text-xs text-white/60 mb-2">{source.description}</p>
              <p className="text-xs text-purple-300">{source.specialization}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            NIS Protocol Advantage Over Current AI
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="text-white/80 font-medium mb-2">Standard AI (ChatGPT/Claude)</h5>
              <ul className="space-y-1 text-white/60">
                <li>• Text-only processing</li>
                <li>• No coordinate integration</li>
                <li>• Single model approach</li>
                <li>• No historical document access</li>
                <li>• Limited cultural context</li>
              </ul>
            </div>
            <div>
              <h5 className="text-emerald-400 font-medium mb-2">NIS Protocol IKRP</h5>
              <ul className="space-y-1 text-emerald-300">
                <li>• Multi-agent coordination</li>
                <li>• Coordinate-based discovery</li>
                <li>• GPT-4 Vision manuscript analysis</li>
                <li>• 26+ ancient manuscripts access</li>
                <li>• Archaeological correlation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinate-Based Codex Discovery */}
      <div className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-white mb-4">
          <Search className="h-5 w-5 text-blue-400" />
          Coordinate-Based Codex Discovery
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Enter coordinates (lat, lon) e.g., -13.1631, -72.5450"
            value={searchCoordinates}
            onChange={(e) => setSearchCoordinates(e.target.value)}
            className="flex-1 bg-white/[0.03] border border-white/[0.1] rounded px-3 py-2 text-white placeholder:text-white/40"
          />
          <button 
            onClick={handleCoordinateSearch}
            disabled={isLoading || !searchCoordinates.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-white"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Search className="h-4 w-4" />
              </motion.div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Relevant Historical Documents Found
              </h4>
              {searchResults.map((codex, index) => (
                <motion.div
                  key={`${codex.title}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-white">{codex.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs border border-white/20 px-2 py-1 rounded">
                          {codex.source}
                        </span>
                        <span className="text-xs border border-white/20 px-2 py-1 rounded">
                          {codex.period}
                        </span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                          {Math.round(codex.relevance_score * 100)}% relevance
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCodexAnalysis(codex.title)}
                      className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm border border-blue-400/30 rounded"
                    >
                      <Eye className="h-4 w-4 mr-1 inline" />
                      Analyze
                    </button>
                  </div>
                  
                  <p className="text-xs text-white/60 mb-2">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {codex.geographic_relevance}
                  </p>
                  
                  {codex.analysis?.geographic_references?.[0] && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                      <p className="text-xs text-blue-300">
                        <Brain className="h-3 w-3 inline mr-1" />
                        AI Analysis: {codex.analysis.geographic_references[0].relevance}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/[0.02] border-white/[0.1]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-yellow-400" />
            IKRP Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="ghost"
              className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
              onClick={() => setSearchCoordinates('-13.1631, -72.5450')}
            >
              <MapPin className="h-6 w-6 text-purple-400" />
              <span className="text-xs">Machu Picchu</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
              onClick={() => setSearchCoordinates('-8.1116, -79.0291')}
            >
              <Globe className="h-6 w-6 text-blue-400" />
              <span className="text-xs">Moche Sites</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
              onClick={() => handleCodexAnalysis('famsi_borgia')}
            >
              <FileText className="h-6 w-6 text-emerald-400" />
              <span className="text-xs">Analyze Borgia</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-20 flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.1]"
              onClick={() => window.open('http://localhost:8000/ikrp/status', '_blank')}
            >
              <ExternalLink className="h-6 w-6 text-yellow-400" />
              <span className="text-xs">IKRP Status</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Capabilities */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Command className="h-5 w-5 text-emerald-400" />
            Advanced IKRP Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Multi-Agent Integration</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/80">
                  <Eye className="h-3 w-3 text-blue-400" />
                  Vision Agent analyzes manuscript imagery
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Brain className="h-3 w-3 text-purple-400" />
                  Memory Agent correlates with archaeological sites
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Target className="h-3 w-3 text-emerald-400" />
                  Reasoning Agent interprets cultural context
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Action Agent generates research strategies
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Research Capabilities</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/80">
                  <Search className="h-3 w-3 text-blue-400" />
                  Coordinate-based manuscript discovery
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <FileText className="h-3 w-3 text-purple-400" />
                  AI-powered document analysis
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Globe className="h-3 w-3 text-emerald-400" />
                  Cross-cultural pattern recognition
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-3 w-3 text-yellow-400" />
                  Temporal correlation analysis
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 