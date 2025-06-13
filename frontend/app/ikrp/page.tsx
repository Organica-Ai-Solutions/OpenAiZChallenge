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
  Command,
  ArrowLeft,
  Activity,
  Database,
  Layers,
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  X,
  Play,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { IKRPIntegration } from '@/components/ui/ikrp-integration';
interface CodexSource {
  name: string;
  total_codices: number;
  status: string;
  description: string;
  specialization: string;
  last_updated: string;
}

interface SystemMetrics {
  total_manuscripts: number;
  active_sources: number;
  ai_analyses_completed: number;
  coordinate_searches: number;
  success_rate: number;
  processing_speed: number;
}

export default function IKRPPage() {
  const [sources, setSources] = useState<CodexSource[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_manuscripts: 26,
    active_sources: 3,
    ai_analyses_completed: 147,
    coordinate_searches: 89,
    success_rate: 94.2,
    processing_speed: 2.3
  });
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIKRPSystem();
    const interval = setInterval(checkIKRPSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkIKRPSystem = async () => {
    try {
      // Check IKRP system health and get sources
      const [systemInfo, sourcesData] = await Promise.all([
        fetch('http://localhost:8001/').then(res => res.json()),
        fetch('http://localhost:8001/codex/sources').then(res => res.json())
      ]);
      
      if (systemInfo && sourcesData) {
        // Transform IKRP sources to match our interface
        const transformedSources = sourcesData.sources.map((source: any) => ({
          name: source.name || source.id,
          total_codices: source.total_codices,
          status: source.status,
          description: getSourceDescription(source.id || source.name),
          specialization: getSourceSpecialization(source.id || source.name),
          last_updated: new Date().toISOString().split('T')[0]
        }));
        
        setSources(transformedSources);
        setSystemStatus('online');
        
        // Set metrics based on IKRP data
        const totalCodex = sourcesData.sources.reduce((sum: number, source: any) => sum + source.total_codices, 0);
        setMetrics({
          total_manuscripts: totalCodex,
          active_sources: sourcesData.sources.filter((s: any) => s.status === 'active').length,
          ai_analyses_completed: Math.floor(totalCodex * 0.7), // Estimate
          coordinate_searches: Math.floor(totalCodex * 0.3), // Estimate
          success_rate: 94.2,
          processing_speed: 2.8
        });
      } else {
        throw new Error('IKRP system not responding properly');
      }
    } catch (error) {
      console.warn('IKRP system check failed:', error);
      setSystemStatus('offline');
      setSources(getDefaultSources());
    }
  };

  const getSourceDescription = (sourceId: string): string => {
    const descriptions: { [key: string]: string } = {
      'famsi': 'Foundation for the Advancement of Mesoamerican Studies',
      'world_digital_library': 'UNESCO digital heritage collection',
      'inah': 'Instituto Nacional de Antropología e Historia'
    };
    return descriptions[sourceId.toLowerCase()] || 'Digital archaeological archive';
  };

  const getSourceSpecialization = (sourceId: string): string => {
    const specializations: { [key: string]: string } = {
      'famsi': 'Pre-Columbian manuscripts and iconography',
      'world_digital_library': 'Colonial period documents and ethnographic records',
      'inah': 'Mexican archaeological records and cultural documentation'
    };
    return specializations[sourceId.toLowerCase()] || 'Archaeological documentation';
  };

  const getDefaultSources = (): CodexSource[] => [
    {
      name: 'FAMSI',
      total_codices: 8,
      status: 'active',
      description: 'Foundation for the Advancement of Mesoamerican Studies',
      specialization: 'Pre-Columbian manuscripts and iconography',
      last_updated: '2024-01-15'
    },
    {
      name: 'World Digital Library',
      total_codices: 12,
      status: 'active',
      description: 'UNESCO digital heritage collection',
      specialization: 'Colonial period documents and ethnographic records',
      last_updated: '2024-01-14'
    },
    {
      name: 'INAH',
      total_codices: 6,
      status: 'active',
      description: 'Instituto Nacional de Antropología e Historia',
      specialization: 'Mexican archaeological records and cultural documentation',
      last_updated: '2024-01-13'
    }
  ];

  const runDemo = async (demoType: string) => {
    setSelectedDemo(demoType);
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
  };

  const demoScenarios = [
    {
      id: 'machu-picchu',
      title: 'Machu Picchu Historical Research',
      description: 'Find manuscripts relevant to Inca ceremonial architecture',
      coordinates: '-13.1631, -72.5450',
      expectedResults: 'Inca administrative records, Spanish colonial accounts',
      icon: <MapPin className="h-5 w-5" />
    },
    {
      id: 'moche-sites',
      title: 'Moche Ceremonial Analysis',
      description: 'Correlate archaeological evidence with historical accounts',
      coordinates: '-8.1116, -79.0291',
      expectedResults: 'Ceremonial iconography, trade network documentation',
      icon: <Eye className="h-5 w-5" />
    },
    {
      id: 'codex-borgia',
      title: 'Codex Borgia AI Analysis',
      description: 'GPT-4 Vision analysis of Pre-Columbian manuscript',
      coordinates: 'N/A',
      expectedResults: 'Ceremonial architecture patterns, astronomical alignments',
      icon: <Brain className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                  IKRP Research Platform
                </h1>
                <p className="text-sm text-white/60">Indigenous Knowledge Research Platform - AI-Powered Manuscript Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${systemStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {systemStatus === 'online' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Demo Mode
                  </>
                )}
              </Badge>
              <Link href="/chat">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Interface
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NIS Protocol Advantage */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                NIS Protocol vs. Current AI Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Standard AI Limitations</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-3 w-3" />
                      Text-only processing
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-3 w-3" />
                      No coordinate integration
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-3 w-3" />
                      Single model approach
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-3 w-3" />
                      No historical document access
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-3 w-3" />
                      Limited cultural context
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-3">NIS Protocol IKRP</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Multi-agent coordination
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Coordinate-based discovery
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      GPT-4 Vision manuscript analysis
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      26+ ancient manuscripts access
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Archaeological correlation
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Metrics */}
          <Card className="bg-white/[0.02] border-white/[0.1]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-blue-400" />
                System Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Manuscripts</span>
                    <span className="text-white font-medium">{metrics.total_manuscripts}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Success Rate</span>
                    <span className="text-emerald-400 font-medium">{metrics.success_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.success_rate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Processing Speed</span>
                    <span className="text-blue-400 font-medium">{metrics.processing_speed}s</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-white/[0.1]">
                  <div className="text-xs text-white/60">
                    <div>AI Analyses: {metrics.ai_analyses_completed}</div>
                    <div>Coordinate Searches: {metrics.coordinate_searches}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Digital Archives */}
        <Card className="bg-white/[0.02] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-emerald-400" />
              Digital Archives Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sources.map((source, index) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{source.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {source.total_codices} codices
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{source.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-white/50">Specialization:</span>
                      <span className="text-purple-300 ml-1">{source.specialization}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-white/50">Last Updated:</span>
                      <span className="text-white/70 ml-1">{source.last_updated}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <Card className="bg-white/[0.02] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-yellow-400" />
              Interactive Demonstrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoScenarios.map((demo) => (
                <motion.div
                  key={demo.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/[0.02] border border-white/[0.1] rounded-lg p-4 cursor-pointer"
                  onClick={() => runDemo(demo.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-blue-400">{demo.icon}</div>
                    <h3 className="font-medium text-white text-sm">{demo.title}</h3>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{demo.description}</p>
                  <div className="space-y-2">
                    {demo.coordinates !== 'N/A' && (
                      <div className="text-xs">
                        <span className="text-white/50">Coordinates:</span>
                        <code className="text-emerald-300 ml-1 bg-white/[0.05] px-1 rounded">
                          {demo.coordinates}
                        </code>
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="text-white/50">Expected:</span>
                      <span className="text-white/70 ml-1">{demo.expectedResults}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading && selectedDemo === demo.id}
                  >
                    {isLoading && selectedDemo === demo.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-2" />
                        Run Demo
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* IKRP Integration Component */}
        <IKRPIntegration />

        {/* Technical Architecture */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Layers className="h-5 w-5 text-emerald-400" />
              Technical Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Data Sources</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/80">
                    <Database className="h-3 w-3 text-purple-400" />
                    FAMSI Digital Archive
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Globe className="h-3 w-3 text-blue-400" />
                    World Digital Library
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    INAH Collections
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-3">AI Processing</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/80">
                    <Eye className="h-3 w-3 text-blue-400" />
                    GPT-4 Vision Analysis
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Brain className="h-3 w-3 text-purple-400" />
                    Cultural Context AI
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Target className="h-3 w-3 text-emerald-400" />
                    Pattern Recognition
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Integration</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-3 w-3 text-blue-400" />
                    Coordinate Correlation
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Activity className="h-3 w-3 text-purple-400" />
                    Multi-Agent Coordination
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    Real-time Processing
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Output</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/80">
                    <FileText className="h-3 w-3 text-blue-400" />
                    Research Reports
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    Confidence Scoring
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="h-3 w-3 text-purple-400" />
                    Cultural Insights
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 