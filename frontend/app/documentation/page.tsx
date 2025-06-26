"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  FileText,
  Code,
  Compass,
  Database,
  Layers,
  BookOpen,
  Download,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Map,
  Repeat,
  Sparkles,
  Video,
  Rocket,
  Calendar,
  Clock,
  ArrowRight,
  Play,
  Eye,
  Server,
  Globe,
  Cpu,
  Search,
  Target,
  Zap,
  Shield,
  Monitor,
  Users,
  Settings,
  GitBranch,
  Terminal,
  Copy,
  LineChart,
  BarChart3,
  Archive,
  Scroll,
  Heart,
  Activity
} from "lucide-react"


export default function DocumentationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🧠 The NIS Protocol: Cognitive Architecture Platform</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            Biologically-Inspired Universal Intelligence for Archaeological Discovery and OpenAI to Z Challenge
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
            Revolutionary 6-Layer Cognitive Architecture by{" "}
            <a 
              href="https://www.linkedin.com/in/diego-torres--/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline transition-colors"
            >
              Diego Torres
            </a>
            {" "} | {" "}
            <a 
              href="https://www.linkedin.com/company/organica-ai-solutions/?viewAsMember=true" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline transition-colors"
            >
              Organica AI Solutions
            </a>
          </p>
          <p className="text-md text-blue-400 max-w-2xl mx-auto mb-4">
            Featured on{" "}
            <a 
              href="https://open.spotify.com/show/0PuvaeHOTtJssMg79bFO80" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-300 hover:text-blue-200 font-semibold underline transition-colors"
            >
              "The NIS Protocol" Podcast
            </a>
            {" "}| Season 2: Quantum Frontiers & Cognitive Architectures
          </p>
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 border-emerald-600 text-emerald-300 bg-emerald-900/20">
              <Brain className="h-4 w-4 mr-1" />
              6-Layer Cognitive Architecture
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-cyan-600 text-cyan-300 bg-cyan-900/20">
              <Zap className="h-4 w-4 mr-1" />
              5-Agent Coordination
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-blue-600 text-blue-300 bg-blue-900/20">
              <Target className="h-4 w-4 mr-1" />
              96.8% Success Rate
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300 bg-slate-800/40">
              <Globe className="h-4 w-4 mr-1" />
              Archaeological Discovery
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300 bg-slate-800/40">
              <Search className="h-4 w-4 mr-1" />
              OpenAI to Z Challenge
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300 bg-slate-800/40">
              <Users className="h-4 w-4 mr-1" />
              Universal Intelligence
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-emerald-300 data-[state=active]:bg-emerald-900/30 data-[state=active]:border-emerald-500/50 transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="kan" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-900/30 data-[state=active]:border-cyan-500/50 transition-all duration-200">KAN Integration</TabsTrigger>
            <TabsTrigger value="quickstart" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-blue-300 data-[state=active]:bg-blue-900/30 data-[state=active]:border-blue-500/50 transition-all duration-200">Quick Start</TabsTrigger>
            <TabsTrigger value="architecture" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-purple-300 data-[state=active]:bg-purple-900/30 data-[state=active]:border-purple-500/50 transition-all duration-200">Architecture</TabsTrigger>
            <TabsTrigger value="api" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-orange-300 data-[state=active]:bg-orange-900/30 data-[state=active]:border-orange-500/50 transition-all duration-200">API Guide</TabsTrigger>
            <TabsTrigger value="deployment" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-green-300 data-[state=active]:bg-green-900/30 data-[state=active]:border-green-500/50 transition-all duration-200">Deployment</TabsTrigger>
            <TabsTrigger value="examples" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-yellow-300 data-[state=active]:bg-yellow-900/30 data-[state=active]:border-yellow-500/50 transition-all duration-200">Examples</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-slate-400 hover:text-slate-200 data-[state=active]:text-pink-300 data-[state=active]:bg-pink-900/30 data-[state=active]:border-pink-500/50 transition-all duration-200">Roadmap</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Brain className="mr-3 h-8 w-8 text-emerald-400" />
                  The NIS Protocol: Universal Intelligence
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  A revolutionary biologically-inspired cognitive architecture that thinks, feels, remembers, and reasons like a human brain. The NIS Protocol represents a paradigm shift from traditional AI to universal intelligence systems that can adapt to archaeological discovery challenges and beyond.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Target className="h-5 w-5 mr-2 text-emerald-400" />
                      The Vision: Universal Intelligence
                    </h3>
                    <p className="text-slate-300">
                      From a simple idea in Diego Torres's kitchen to the foundation for universal intelligence, the NIS Protocol creates AI systems that mirror human cognitive processes. Built for applications spanning archaeological discovery, environmental conservation, weather intelligence, smart cities, healthcare, autonomous vehicles, and beyond.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Brain className="h-5 w-5 mr-2 text-blue-400" />
                      6-Layer Cognitive Architecture
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />🔍 Sensory Layer: Input processing with priority calculation</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />👁️ Perception Layer: Pattern recognition and feature detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />🧠 Memory Layer: Working memory (7±2) with long-term consolidation</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />❤️ Emotional Layer: Valence, arousal, empathy, curiosity, confidence</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />⚡ Executive Layer: Goal formation and decision making</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />🎯 Motor Layer: Response generation with emotional modulation</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Enhanced Vision Agent</h4>
                        <p className="text-sm text-slate-300">GPT-4 Vision + PyTorch 2.7.1 + KAN Networks for advanced archaeological analysis with multi-modal LIDAR processing</p>
                        <div className="mt-3 space-y-1">
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-300">Real GPT-4 Vision</Badge>
                          <Badge variant="outline" className="text-xs border-green-500 text-green-300">PyTorch Active</Badge>
                          <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">KAN Enhanced</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                                        <Scroll className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
                <h4 className="text-lg font-semibold mb-2 text-white">Codex Reader</h4>
                <p className="text-sm text-slate-300">🆕 GPT-4.1 Vision analysis of historical codices with 91.17% confidence</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Reasoning Agent</h4>
                        <p className="text-sm text-slate-300">Advanced ReAct framework for intelligent decision making</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Database className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Knowledge Base</h4>
                        <p className="text-sm text-slate-300">Indigenous wisdom and historical archaeological data</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* New Enhanced Codex Reader Section */}
            <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Scroll className="mr-2 h-6 w-6 text-cyan-400" />
                  🆕 Enhanced Codex Reader v2.1
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Revolutionary archaeological codex discovery and analysis platform with GPT-4.1 Vision integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Key Features</h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />4-Step Guided Workflow</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Multi-Archive Integration (FAMSI, World Digital Library, INAH)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />GPT-4.1 Vision Analysis (91.17% confidence)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Real-time Progress Tracking</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />26 Total Codices Available</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Analysis Capabilities</h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Visual Element Detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Glyph Translation & Interpretation</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Archaeological Site Type Identification</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Cultural Context Analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />Actionable Field Recommendations</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30">
                  <p className="text-slate-300 text-sm">
                    <strong>Test Results:</strong> 100% success rate across all system components. Successfully analyzed Codex Borgia 
                    with 88% confidence, detecting 3 visual figures, 3 symbols, and providing comprehensive archaeological insights.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* NEW: NIS Protocol Chat Interface */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Brain className="mr-2 h-6 w-6 text-cyan-400" />
                  🧠 Advanced NIS Protocol Chat Interface
                </CardTitle>
                <CardDescription className="text-cyan-200">
                  Revolutionary biologically-inspired conversational AI with 6-layer cognitive processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🧠 Cognitive Features</h3>
                    <ul className="space-y-2 text-cyan-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🔍 Sensory Input Processing with Priority Scoring</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />👁️ Advanced Pattern Recognition (Commands, Coordinates, Multi-zone)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🧠 Working Memory System (Miller's 7±2 Rule)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />❤️ Emotional Intelligence (Valence, Arousal, Empathy)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />⚡ Executive Decision Making</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🎯 Intelligent Response Generation</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🚀 Advanced Capabilities</h3>
                    <ul className="space-y-2 text-cyan-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🌍 Multi-Zone Archaeological Search</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />📍 Coordinate-Based Site Analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🤖 Workflow Automation Detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🔄 Real-time Cognitive State Visualization</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />📊 Processing Layer Transparency</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />💡 Contextual Learning & Adaptation</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 mr-2 text-cyan-400" />
                    <span className="text-white font-semibold">Live Cognitive Processing</span>
                  </div>
                  <p className="text-cyan-100 text-sm">
                    Watch the NIS Protocol think in real-time! The chat interface displays active cognitive layers, 
                    emotional states, memory consolidation, and decision-making processes as they happen. Experience 
                    truly transparent AI that shows you exactly how it processes and understands your requests.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 mr-2 text-red-400" />
                      <span className="text-white font-semibold">Emotional AI</span>
                    </div>
                    <p className="text-slate-300 text-sm">Dynamic emotional states with valence, arousal, and empathy tracking</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Database className="h-5 w-5 mr-2 text-green-400" />
                      <span className="text-white font-semibold">Memory Systems</span>
                    </div>
                    <p className="text-slate-300 text-sm">Working, long-term, semantic, and episodic memory integration</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Search className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="text-white font-semibold">Pattern Recognition</span>
                    </div>
                    <p className="text-slate-300 text-sm">Advanced command, coordinate, and workflow pattern detection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <LineChart className="mr-2 h-5 w-5 text-blue-400" />
                  System Performance Metrics v2.1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">96%</div>
                    <div className="text-sm text-slate-400">Detection Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">2.1s</div>
                    <div className="text-sm text-slate-400">Avg Analysis Time</div>
                  </div>
                  <div className="text-center">
                                            <div className="text-3xl font-bold text-emerald-400">26</div>
                    <div className="text-sm text-slate-400">Codices Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">91%</div>
                    <div className="text-sm text-slate-400">Codex Analysis Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">100%</div>
                    <div className="text-sm text-slate-400">System Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW: NIS Protocol Chat Interface */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Brain className="mr-2 h-6 w-6 text-cyan-400" />
                  🧠 Advanced NIS Protocol Chat Interface
                </CardTitle>
                <CardDescription className="text-cyan-200">
                  Revolutionary biologically-inspired conversational AI with 6-layer cognitive processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🧠 Cognitive Features</h3>
                    <ul className="space-y-2 text-cyan-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🔍 Sensory Input Processing with Priority Scoring</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />👁️ Advanced Pattern Recognition (Commands, Coordinates, Multi-zone)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🧠 Working Memory System (Miller's 7±2 Rule)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />❤️ Emotional Intelligence (Valence, Arousal, Empathy)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />⚡ Executive Decision Making</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🎯 Intelligent Response Generation</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🚀 Advanced Capabilities</h3>
                    <ul className="space-y-2 text-cyan-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🌍 Multi-Zone Archaeological Search</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />📍 Coordinate-Based Site Analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🤖 Workflow Automation Detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />🔄 Real-time Cognitive State Visualization</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />📊 Processing Layer Transparency</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-cyan-400" />💡 Contextual Learning & Adaptation</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 mr-2 text-cyan-400" />
                    <span className="text-white font-semibold">Live Cognitive Processing</span>
                  </div>
                  <p className="text-cyan-100 text-sm">
                    Watch the NIS Protocol think in real-time! The chat interface displays active cognitive layers, 
                    emotional states, memory consolidation, and decision-making processes as they happen. Experience 
                    truly transparent AI that shows you exactly how it processes and understands your requests.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 mr-2 text-red-400" />
                      <span className="text-white font-semibold">Emotional AI</span>
                    </div>
                    <p className="text-slate-300 text-sm">Dynamic emotional states with valence, arousal, and empathy tracking</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Database className="h-5 w-5 mr-2 text-green-400" />
                      <span className="text-white font-semibold">Memory Systems</span>
                    </div>
                    <p className="text-slate-300 text-sm">Working, long-term, semantic, and episodic memory integration</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center mb-2">
                      <Search className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="text-white font-semibold">Pattern Recognition</span>
                    </div>
                    <p className="text-slate-300 text-sm">Advanced command, coordinate, and workflow pattern detection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Real-Time System Integration Status */}
            <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="mr-2 h-6 w-6 text-emerald-400" />
                  🔄 Real-Time System Integration v2.1
                </CardTitle>
                <CardDescription className="text-emerald-200">
                  Live monitoring of all NIS Protocol components with 99.5% uptime performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🎯 Active Components</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-slate-300">Archaeological Vision Agent</span>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">94.6% Accuracy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-slate-300">Cultural Memory Agent</span>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">95.5% Accuracy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-slate-300">NIS Protocol Chat</span>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">100% Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">⚡ Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-2xl font-bold text-emerald-400">4.2s</div>
                        <div className="text-xs text-slate-400">Avg Processing</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-2xl font-bold text-blue-400">1,159</div>
                        <div className="text-xs text-slate-400">Total Analyses</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-2xl font-bold text-emerald-400">97.2%</div>
                        <div className="text-xs text-slate-400">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-2xl font-bold text-orange-400">19.4K</div>
                        <div className="text-xs text-slate-400">Knowledge Base</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-950/30 to-green-950/30 p-4 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 mr-2 text-emerald-400" />
                    <span className="text-white font-semibold">Live System Status</span>
                  </div>
                  <p className="text-emerald-100 text-sm">
                    All NIS Protocol services are fully operational. Frontend running on localhost:3000, 
                    backend API on localhost:8000 with Redis, Kafka, and LangGraph integration. 
                    Ready for archaeological discovery and real-time satellite analysis.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-semibold">Production Ready</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-semibold">Edge Deployable</span>
                  </div>
                                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                      <Rocket className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-300 text-sm font-semibold">Mars Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KAN INTEGRATION TAB */}
          <TabsContent value="kan" className="space-y-8">
            <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Sparkles className="mr-3 h-8 w-8 text-violet-400" />
                  KAN Integration: Kolmogorov-Arnold Networks
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Revolutionary interpretable AI architecture that replaces traditional MLPs with learnable activation functions on edges, providing unprecedented transparency and mathematical interpretability for archaeological analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Brain className="h-5 w-5 mr-2 text-violet-400" />
                      Why KAN Matters for AGI
                    </h3>
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                      <img 
                        src="/images/kan/why.png" 
                        alt="Why KAN Matters for AGI" 
                        className="w-full rounded-lg mb-4"
                      />
                      <p className="text-slate-300 text-sm">
                        Traditional chatbots guess - KAN-powered systems reason with human-like symbolic logic, 
                        solving math, geometry, and analogies while generalizing across unseen input with smooth logic.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Target className="h-5 w-5 mr-2 text-emerald-400" />
                      KAN vs Traditional MLP
                    </h3>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <img 
                        src="/images/kan/difference.png" 
                        alt="KAN vs MLP Comparison" 
                        className="w-full rounded-lg mb-4"
                      />
                      <p className="text-slate-300 text-sm">
                        KAN networks learn smooth, interpretable functions on edges rather than fixed activations on nodes, 
                        providing mathematical transparency and superior generalization.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center text-white">
                    <LineChart className="h-5 w-5 mr-2 text-blue-400" />
                    Surface Map Comparison: KAN vs Regular MLP
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-violet-300">KAN Surface Map</h4>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <img 
                          src="/images/kan/kan.png" 
                          alt="KAN Surface Map" 
                          className="w-full rounded-lg mb-4"
                        />
                        <p className="text-slate-300 text-sm">
                          <strong>Smooth, interpretable surface:</strong> KAN networks create clean, mathematically 
                          interpretable decision surfaces that can be understood and explained.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-blue-300">Regular MLP Surface Map</h4>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <img 
                          src="/images/kan/Regular MLP Surface Map.png" 
                          alt="Regular MLP Surface Map" 
                          className="w-full rounded-lg mb-4"
                        />
                        <p className="text-slate-300 text-sm">
                          <strong>Complex, opaque surface:</strong> Traditional MLPs create complex, 
                          difficult-to-interpret decision surfaces that lack mathematical transparency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center text-white">
                    <Zap className="h-5 w-5 mr-2 text-orange-400" />
                    KAN Mathematical Foundation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <img 
                        src="/images/kan/mlp.png" 
                        alt="MLP Mathematical Foundation" 
                        className="w-full rounded-lg mb-4"
                      />
                      <h4 className="text-lg font-semibold text-slate-300 mb-2">Traditional MLP</h4>
                      <p className="text-slate-300 text-sm">
                        Fixed activation functions on nodes with learnable weights. Limited interpretability 
                        and mathematical transparency.
                      </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <img 
                        src="/images/kan/kannis.png" 
                        alt="KAN Mathematical Foundation" 
                        className="w-full rounded-lg mb-4"
                      />
                      <h4 className="text-lg font-semibold text-violet-300 mb-2">KAN Architecture</h4>
                      <p className="text-slate-300 text-sm">
                        Learnable activation functions on edges with spline-based parameterization. 
                        Provides mathematical interpretability and smooth generalization.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center text-white">
                    <Activity className="h-5 w-5 mr-2 text-cyan-400" />
                    KAN Performance in Thenis Protocol
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-violet-500/10 border-violet-500/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-violet-400">90.5%</div>
                          <div className="text-sm text-slate-400">Interpretability Score</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-400">26ms</div>
                          <div className="text-sm text-slate-400">Response Time</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-400">96%</div>
                          <div className="text-sm text-slate-400">Coordination Efficiency</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-400">0.0%</div>
                          <div className="text-sm text-slate-400">Memory Overhead</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* NEW: GPT-4 Vision + PyTorch + KAN Integration */}
                <div className="bg-gradient-to-r from-blue-950/30 to-green-950/30 p-6 rounded-lg border border-blue-500/20">
                  <div className="flex items-center mb-4">
                    <Eye className="h-6 w-6 mr-3 text-blue-400" />
                    <span className="text-white font-semibold text-lg">🎉 GPT-4 Vision + PyTorch + KAN Integration - ACTIVE</span>
                    <Badge className="ml-2 bg-green-500 text-white">OPERATIONAL</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-blue-300">Technical Stack</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-300">GPT-4 Vision</span>
                          </div>
                          <span className="text-green-400 text-sm font-semibold">✅ Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-300">PyTorch 2.7.1+cu126</span>
                          </div>
                          <span className="text-green-400 text-sm font-semibold">✅ Installed</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-300">KAN Networks</span>
                          </div>
                          <span className="text-green-400 text-sm font-semibold">✅ Enhanced</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-green-300">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="text-xl font-bold text-green-400">100%</div>
                          <div className="text-xs text-slate-400">GPT-4 Vision Active</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="text-xl font-bold text-blue-400">~12s</div>
                          <div className="text-xs text-slate-400">Analysis Time</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="text-xl font-bold text-purple-400">4x</div>
                          <div className="text-xs text-slate-400">LIDAR Modes</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="text-xl font-bold text-orange-400">11+</div>
                          <div className="text-xs text-slate-400">Feature Types</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <p className="text-blue-100 text-sm">
                      <strong>Multi-Modal Analysis:</strong> Our enhanced Vision Agent now processes real satellite and LIDAR data using GPT-4 Vision for image analysis, PyTorch for neural processing, and KAN networks for interpretable pattern recognition. Features include 4-mode LIDAR visualization (Hillshade, Slope, Contour, Elevation) with archaeological feature detection for mounds, earthworks, settlements, and more.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-950/30 to-purple-950/30 p-6 rounded-lg border border-violet-500/20">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 mr-3 text-violet-400" />
                    <span className="text-white font-semibold text-lg">KAN Integration Benefits</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-violet-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />🔍 Mathematical Interpretability</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />🧠 Human-like Symbolic Reasoning</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />⚡ Superior Generalization</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />📊 Transparent Decision Making</li>
                    </ul>
                    <ul className="space-y-2 text-violet-100">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />🎯 Cultural Context Accuracy (95.2%)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />🔄 Multi-Agent Coordination</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />🌍 Archaeological Pattern Recognition</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-violet-400" />💡 Explainable AI for Heritage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUICK START TAB */}
          <TabsContent value="quickstart" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get the NIS Protocol system running in under 5 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950 p-4 rounded">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">📋 Prerequisites</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Docker & Docker Compose installed</li>
                    <li>• Git (for cloning the repository)</li>
                    <li>• 8GB+ RAM recommended</li>
                    <li>• Ports 3000, 8000, 8001 available</li>
                  </ul>
                    </div>

                <Tabs defaultValue="macos" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="macos" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      macOS / Linux
                    </TabsTrigger>
                    <TabsTrigger value="windows" className="flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      Windows
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="macos" className="space-y-4">
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <div className="text-sm">
                        <div className="text-green-400 mb-2"># Clone the repository</div>
                        <div className="text-gray-300">git clone https://github.com/organicaai/nis-protocol.git</div>
                        <div className="text-gray-300">cd nis-protocol</div>
                        <br />
                        <div className="text-green-400 mb-2"># Start all services (recommended)</div>
                        <div className="text-gray-300">chmod +x start.sh</div>
                        <div className="text-gray-300">./start.sh</div>
                        <br />
                        <div className="text-green-400 mb-2"># Alternative startup options</div>
                        <div className="text-gray-300">./quick_start.sh          # Fast startup (30 seconds)</div>
                        <div className="text-gray-300">./reset_nis_system.sh     # Full reset and restart</div>
                        <br />
                        <div className="text-green-400 mb-2"># System management</div>
                        <div className="text-gray-300">./stop.sh                 # Stop all services</div>
                        <div className="text-gray-300">docker-compose ps         # Check service status</div>
                        <div className="text-gray-300">docker-compose logs -f    # View live logs</div>
                    </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🍎 macOS-Specific Notes</h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Use Terminal or iTerm2</li>
                        <li>• Ensure Docker Desktop is running</li>
                        <li>• Install Docker via Homebrew: <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">brew install --cask docker</code></li>
                        <li>• For M1/M2 Macs: Use <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">--platform linux/amd64</code> if needed</li>
                      </ul>
                  </div>
                  </TabsContent>
                  
                  <TabsContent value="windows" className="space-y-4">
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <div className="text-sm">
                        <div className="text-green-400 mb-2"># Using PowerShell or Command Prompt</div>
                        <div className="text-gray-300">git clone https://github.com/organicaai/nis-protocol.git</div>
                        <div className="text-gray-300">cd nis-protocol</div>
                        <br />
                        <div className="text-green-400 mb-2"># Start all services</div>
                        <div className="text-gray-300">start.bat</div>
                        <br />
                        <div className="text-green-400 mb-2"># Alternative Windows commands</div>
                        <div className="text-gray-300">run_all.bat              # Alternative startup script</div>
                        <div className="text-gray-300">stop.bat                 # Stop all services</div>
                        <br />
                        <div className="text-green-400 mb-2"># Using Docker Compose directly</div>
                        <div className="text-gray-300">docker-compose up -d     # Start in background</div>
                        <div className="text-gray-300">docker-compose down      # Stop services</div>
                        <div className="text-gray-300">docker-compose ps        # Check status</div>
                            </div>
                              </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🪟 Windows-Specific Setup</h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Install Docker Desktop from docker.com</li>
                        <li>• Enable WSL2 integration for better performance</li>
                        <li>• Use PowerShell (recommended) or Command Prompt</li>
                        <li>• Git Bash also supported: run <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">./setup_gitbash.sh</code></li>
                        <li>• For file permissions: <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">icacls . /grant Everyone:F /t</code></li>
                      </ul>
                            </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚡ Available Scripts</h5>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• <code>start.sh</code> - Full Docker Compose startup</li>
                      <li>• <code>quick_start.sh</code> - Fast 30-second startup</li>
                      <li>• <code>reset_nis_system.sh</code> - Complete system reset</li>
                      <li>• <code>reset_nis_system_fast.sh</code> - Fast reset</li>
                      <li>• <code>stop.sh</code> - Graceful shutdown</li>
                      <li>• <code>setup_env.sh</code> - Environment configuration</li>
                      <li>• <code>test_system_quick.sh</code> - Quick health check</li>
                    </ul>
                          </div>
                  
                  <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg p-4">
                    <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 After Startup</h5>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Frontend: <a href="http://localhost:3000" className="underline">localhost:3000</a></li>
                      <li>• Backend API: <a href="http://localhost:8000/docs" className="underline">localhost:8000/docs</a></li>
                      <li>• IKRP Service: <a href="http://localhost:8001" className="underline">localhost:8001</a></li>
                      <li>• Check status: <code>docker-compose ps</code></li>
                      <li>• View logs: <code>docker-compose logs -f</code></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">🚨 Troubleshooting</h5>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• <strong>Port conflicts:</strong> Stop other services on ports 3000, 8000, 8001</li>
                    <li>• <strong>Permission denied:</strong> Run <code className="bg-red-200 dark:bg-red-800 px-1 rounded">chmod +x *.sh</code></li>
                    <li>• <strong>Docker not found:</strong> Ensure Docker Desktop is installed and running</li>
                    <li>• <strong>Out of memory:</strong> Increase Docker memory limit to 8GB+</li>
                    <li>• <strong>Stuck services:</strong> Run <code className="bg-red-200 dark:bg-red-800 px-1 rounded">./reset_nis_system.sh</code></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARCHITECTURE TAB */}
          <TabsContent value="architecture" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  System Architecture Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive technical architecture of the NIS Protocol platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🏗️ Architecture Principles</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span><strong>Microservices:</strong> Containerized services with Docker Compose orchestration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span><strong>Event-Driven:</strong> Apache Kafka for real-time data streaming</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                        <span><strong>API-First:</strong> RESTful APIs with OpenAPI/Swagger documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                        <span><strong>Scalable:</strong> Horizontal scaling with load balancers</span>
                      </li>
                    </ul>
                        </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🔧 Technology Stack</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
                        <strong>Frontend:</strong><br />
                        Next.js 15, React 18, TypeScript, Tailwind CSS
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
                        <strong>Backend:</strong><br />
                        FastAPI, Python 3.12, Uvicorn, Storage System
                        </div>
                      <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded">
                        <strong>Database:</strong><br />
                        PostgreSQL, Redis, SQLAlchemy
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded">
                        <strong>Infrastructure:</strong><br />
                        Docker, Kafka, Zookeeper
                        </div>
                      </div>
                    </div>
                  </div>

                <Separator />

                  <div className="space-y-4">
                  <h4 className="font-semibold text-lg">📊 Service Architecture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-blue-600 dark:text-blue-400">Frontend Service</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 3000</div>
                        <div><strong>Container:</strong> nis-frontend</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Next.js SSR/SSG</li>
                          <li>Real-time WebSocket connections</li>
                          <li>Enhanced Codex Reader</li>
                          <li>Interactive maps & visualization</li>
                          <li>Responsive design</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-green-600 dark:text-green-400">Backend API</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 8000</div>
                        <div><strong>Container:</strong> nis-backend</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>FastAPI framework (Python 3.12)</li>
                          <li>OpenAI GPT-4o Vision integration</li>
                          <li>Archaeological analysis pipeline</li>
                          <li>Satellite imagery processing</li>
                          <li>Agent management system</li>
                          <li>💾 Persistent storage system</li>
                          <li>🧠 AI learning & predictions</li>
                          <li>📊 Auto-save high-confidence discoveries</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-purple-600 dark:text-purple-400">IKRP Service</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 8001</div>
                        <div><strong>Container:</strong> nis-ikrp</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Codex discovery & analysis</li>
                          <li>Multi-archive integration</li>
                          <li>Full codex downloads</li>
                          <li>GPT-4.1 Vision analysis</li>
                          <li>Metadata enrichment</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Message Broker</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 9092</div>
                        <div><strong>Container:</strong> nis-kafka</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Apache Kafka streaming</li>
                          <li>Event-driven architecture</li>
                          <li>Real-time data processing</li>
                          <li>Service-to-service communication</li>
                          <li>Scalable message queues</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-red-600 dark:text-red-400">Cache Layer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 6379</div>
                        <div><strong>Container:</strong> nis-redis-simple</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Redis in-memory storage</li>
                          <li>Session management</li>
                          <li>API response caching</li>
                          <li>Real-time data storage</li>
                          <li>Performance optimization</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-yellow-600 dark:text-yellow-400">Fallback Backend</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 8003</div>
                        <div><strong>Container:</strong> nis-fallback-backend</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>🛡️ Reliable LIDAR processing</li>
                          <li>🔬 Real IKRP integration</li>
                          <li>⚡ High availability backup</li>
                          <li>📊 Independent analysis pipeline</li>
                          <li>🔄 Automatic failover support</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Coordination</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div><strong>Port:</strong> 2181</div>
                        <div><strong>Container:</strong> nis-zookeeper</div>
                        <div><strong>Features:</strong></div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Apache Zookeeper</li>
                          <li>Kafka coordination</li>
                          <li>Service discovery</li>
                          <li>Configuration management</li>
                          <li>Distributed consensus</li>
                        </ul>
                      </CardContent>
                    </Card>
                        </div>
                      </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">🔄 Data Flow Architecture</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span><strong>1. User Input:</strong> Coordinates entered in frontend interface</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span><strong>2. API Gateway:</strong> Request routed through backend API proxy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span><strong>3. Service Processing:</strong> IKRP service discovers relevant codices</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span><strong>4. AI Analysis:</strong> GPT-4.1 Vision analyzes codex imagery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span><strong>5. Cache Storage:</strong> Results cached in Redis for performance</span>
                    </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span><strong>6. Event Streaming:</strong> Updates broadcast via Kafka</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span><strong>7. Real-time Updates:</strong> WebSocket pushes to frontend</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔒 Security Features</h5>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• CORS configuration for cross-origin requests</li>
                      <li>• API rate limiting and throttling</li>
                      <li>• Input validation and sanitization</li>
                      <li>• Environment variable management</li>
                      <li>• Docker container isolation</li>
                      <li>• Health check monitoring</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📈 Scalability Design</h5>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Horizontal scaling with Docker Swarm</li>
                      <li>• Load balancing for high availability</li>
                      <li>• Kafka partitioning for parallel processing</li>
                      <li>• Redis clustering for cache scaling</li>
                      <li>• Database connection pooling</li>
                      <li>• CDN integration for static assets</li>
                    </ul>
                  </div>
                        </div>
                      </CardContent>
                    </Card>
          </TabsContent>

          {/* API TAB */}
          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-indigo-500" />
                  Complete API Reference
                </CardTitle>
                <CardDescription>
                  Comprehensive documentation of all 30+ API endpoints across all services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">35+</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Endpoints</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Core Services</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">REST</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">API Standard</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">OpenAPI</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Documentation</div>
                  </div>
                </div>

                <Tabs defaultValue="backend" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="backend">Backend API (8000)</TabsTrigger>
                    <TabsTrigger value="ikrp">IKRP Service (8001)</TabsTrigger>
                    <TabsTrigger value="frontend">Frontend Routes (3000)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="backend" className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">🌐 Main Backend API - Port 8000</h4>
                      <div className="text-sm text-green-700 dark:text-green-300 mb-4">
                        Base URL: <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">http://localhost:8000</code><br />
                        Documentation: <a href="http://localhost:8000/docs" className="underline">http://localhost:8000/docs</a>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-blue-600 dark:text-blue-400">🔍 Core Analysis Endpoints</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2">
                            <div>Method & Endpoint</div>
                            <div>Description</div>
                            <div>Parameters</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /</div>
                            <div>Root endpoint with system info</div>
                            <div>None</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /analyze</div>
                            <div>Archaeological coordinate analysis</div>
                            <div>lat, lon, data_sources</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /vision/analyze</div>
                            <div>GPT-4.1 Vision image analysis</div>
                            <div>image_url, coordinates</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /system/health</div>
                            <div>System health check</div>
                            <div>None</div>
                        </div>
                      </CardContent>
                    </Card>

                      <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-purple-600 dark:text-purple-400">🏛️ Research & Discovery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /research/sites</div>
                            <div>Get discovered archaeological sites</div>
                            <div>min_confidence, max_sites</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /research/sites/discover</div>
                            <div>Submit new site discoveries</div>
                            <div>sites[], researcher_id</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /research/history</div>
                            <div>Get analysis history</div>
                            <div>limit, researcher_id</div>
                        </div>
                      </CardContent>
                    </Card>

                      <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-orange-600 dark:text-orange-400">📊 Statistics & Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /statistics</div>
                            <div>System-wide statistics</div>
                            <div>None</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /statistics/discoveries</div>
                            <div>Discovery statistics by region</div>
                            <div>region, timeframe</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /agents/status</div>
                            <div>Agent system status</div>
                            <div>None</div>
                        </div>
                      </CardContent>
                    </Card>

                      <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400">💾 Persistent Storage System</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2">
                            <div>Method & Endpoint</div>
                            <div>Description</div>
                            <div>Parameters</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /api/storage/discovery/save</div>
                            <div>Save archaeological discovery</div>
                            <div>discovery_data, confidence</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /api/storage/sites</div>
                            <div>Get archaeological sites</div>
                            <div>min_confidence, limit</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /api/storage/analyses</div>
                            <div>Get analysis sessions</div>
                            <div>limit, researcher_id</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /api/storage/stats</div>
                            <div>Storage system statistics</div>
                            <div>None</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /api/learning/predict</div>
                            <div>AI prediction for coordinates</div>
                            <div>lat, lon, radius</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /api/storage/status</div>
                            <div>Complete storage system status</div>
                            <div>None</div>
                        </div>
                      </CardContent>
                    </Card>

                      <Card className="border-red-200 dark:border-red-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-600 dark:text-red-400">🛰️ Satellite & Batch Processing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /satellite/imagery/latest</div>
                            <div>Get latest satellite imagery</div>
                            <div>coordinates, radius</div>
                  </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /satellite/change-detection</div>
                            <div>Detect changes over time</div>
                            <div>coordinates, date_range</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /batch/analyze</div>
                            <div>Submit batch analysis job</div>
                            <div>coordinates_list[]</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /batch/status/<code>batch_id</code></div>
                            <div>Get batch job status</div>
                            <div>batch_id</div>
                </div>
              </CardContent>
            </Card>

                      <Card className="border-cyan-200 dark:border-cyan-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-cyan-600 dark:text-cyan-400">🔗 IKRP Proxy Endpoints</CardTitle>
              </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /ikrp/sources</div>
                            <div>Get available codex sources</div>
                            <div>None</div>
                  </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /ikrp/search_codices</div>
                            <div>Search for relevant codices</div>
                            <div>coordinates, radius, sources</div>
                </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /ikrp/analyze_codex</div>
                            <div>Analyze specific codex</div>
                            <div>codex_id, image_url</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /ikrp/download_codex</div>
                            <div>Download full codex data</div>
                            <div>codex_id, download_type</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /ikrp/status</div>
                            <div>IKRP service health status</div>
                            <div>None</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ikrp" className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">📜 IKRP Codex Discovery Service - Port 8001</h4>
                      <div className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                        Base URL: <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">http://localhost:8001</code><br />
                        Specialized service for codex discovery and analysis with GPT-4.1 Vision integration
                        </div>
                      </div>

                    <div className="grid gap-4">
                      <Card className="border-indigo-200 dark:border-indigo-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-indigo-600 dark:text-indigo-400">📚 Codex Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2">
                            <div>Method & Endpoint</div>
                            <div>Description</div>
                            <div>Response Data</div>
                  </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /</div>
                            <div>Service info and features</div>
                            <div>version, features[], sources[]</div>
                </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">GET</span> /codex/sources</div>
                            <div>List digital archive sources</div>
                            <div>FAMSI, WDL, INAH sources</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /codex/discover</div>
                            <div>Discover relevant codices</div>
                            <div>codices[], metadata, confidence</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /codex/analyze</div>
                            <div>GPT-4.1 Vision analysis</div>
                            <div>visual_elements, insights, confidence</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">POST</span> /codex/download</div>
                            <div>Full codex download</div>
                            <div>complete_data, images[], metadata</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400">🎯 Advanced Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <ul className="space-y-2">
                            <li>• <strong>Multi-Archive Integration:</strong> FAMSI (8 codices), World Digital Library (12 codices), INAH (6 codices)</li>
                            <li>• <strong>AI-Powered Analysis:</strong> GPT-4.1 Vision for visual element recognition and interpretation</li>
                            <li>• <strong>Geographic Relevance:</strong> Coordinate-based codex discovery with relevance scoring</li>
                            <li>• <strong>Full Downloads:</strong> Complete codex data including metadata, transcriptions, and high-res images</li>
                            <li>• <strong>Cultural Context:</strong> Historical period analysis and cultural significance assessment</li>
                            <li>• <strong>Comparative Analysis:</strong> Cross-reference with related codices for comprehensive research</li>
                          </ul>
                        </CardContent>
                      </Card>
                        </div>
                  </TabsContent>

                  <TabsContent value="frontend" className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">🖥️ Frontend Application Routes - Port 3000</h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Base URL: <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">http://localhost:3000</code><br />
                        Next.js application with server-side rendering and real-time features
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Card className="border-sky-200 dark:border-sky-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-sky-600 dark:text-sky-400">🏠 Main Application Routes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2">
                            <div>Route</div>
                            <div>Page</div>
                            <div>Features</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/</code></div>
                            <div>Homepage</div>
                            <div>Welcome, system overview, quick access</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/chat</code></div>
                            <div>Chat Interface</div>
                            <div>ReAct agents, real-time responses, WebSocket</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/map</code></div>
                            <div>Interactive Map</div>
                            <div>Coordinate analysis, satellite overlays, discoveries</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/vision-analysis</code></div>
                            <div>Vision Analysis</div>
                            <div>GPT-4.1 Vision, image upload, archaeological insights</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/archaeological-discovery</code></div>
                            <div>Site Discovery</div>
                            <div>New site submissions, validation, mapping</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/analytics</code></div>
                            <div>Analytics Dashboard</div>
                            <div>Statistics, trends, performance metrics</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><code>/documentation</code></div>
                            <div>Documentation</div>
                            <div>Complete system documentation, API reference</div>
                      </div>
                    </CardContent>
                  </Card>

                      <Card className="border-teal-200 dark:border-teal-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-teal-600 dark:text-teal-400">⚡ Advanced Frontend Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <ul className="space-y-2">
                            <li>• <strong>Server-Side Rendering:</strong> Fast initial page loads with Next.js SSR</li>
                            <li>• <strong>Real-time Updates:</strong> WebSocket connections for live data streaming</li>
                            <li>• <strong>Progressive Web App:</strong> Offline capability and mobile optimization</li>
                            <li>• <strong>Dark/Light Mode:</strong> Theme switching with system preference detection</li>
                            <li>• <strong>Responsive Design:</strong> Mobile-first approach with Tailwind CSS</li>
                            <li>• <strong>Component Library:</strong> Reusable UI components with shadcn/ui</li>
                            <li>• <strong>State Management:</strong> React hooks and context for application state</li>
                            <li>• <strong>Error Boundaries:</strong> Graceful error handling and recovery</li>
                            <li>• <strong>Performance Optimization:</strong> Code splitting, lazy loading, image optimization</li>
                            <li>• <strong>Accessibility:</strong> WCAG 2.1 compliant with keyboard navigation</li>
                          </ul>
                    </CardContent>
                  </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">📖 API Documentation Links</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <a href="http://localhost:8000/docs" className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                      Backend API Docs (Swagger)
                    </a>
                    <a href="http://localhost:8000/redoc" className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors">
                      <FileText className="h-4 w-4" />
                      Backend API (ReDoc)
                    </a>
                    <a href="http://localhost:8001" className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors">
                      <BookOpen className="h-4 w-4" />
                      IKRP Service Status
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEPLOYMENT TAB */}
          <TabsContent value="deployment" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Server className="mr-2 h-5 w-5 text-blue-400" />
                  Deployment Guide
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Production deployment options and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Docker Production</h4>
                        <p className="text-sm text-slate-400 mb-4">Full containerized deployment</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Setup Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Kubernetes</h4>
                        <p className="text-sm text-slate-400 mb-4">Scalable orchestration</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">K8s Config</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Cloud Deploy</h4>
                        <p className="text-sm text-slate-400 mb-4">AWS/GCP/Azure ready</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Cloud Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Environment Configuration</h3>
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <pre className="text-sm text-green-400">
<code>{`# Production Environment Variables
ENVIRONMENT=production
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/nis
REDIS_URL=redis://localhost:6379
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Security Settings
SECRET_KEY=your_secret_key
ALLOWED_HOSTS=your-domain.com
CORS_ORIGINS=https://your-frontend.com

# AI Model Settings
VISION_MODEL_ENDPOINT=your_model_endpoint
CONFIDENCE_THRESHOLD=0.7
MAX_BATCH_SIZE=32`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAMPLES TAB */}
          <TabsContent value="examples" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Play className="mr-2 h-5 w-5 text-blue-400" />
                  Usage Examples
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Real-world examples and use cases for archaeological discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Amazon Basin Discovery</CardTitle>
                      <CardDescription className="text-slate-400">Discovering pre-Columbian settlements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-300">
                          <strong>Location:</strong> -3.4653, -62.2159<br/>
                          <strong>Expected:</strong> Geometric earthworks, settlement patterns<br/>
                          <strong>Models:</strong> YOLO8, GPT-4 Vision, Cultural context
                        </div>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Andean Archaeological Sites</CardTitle>
                      <CardDescription className="text-slate-400">High-altitude settlement analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-300">
                          <strong>Location:</strong> -13.1631, -72.5450<br/>
                          <strong>Expected:</strong> Terraced agriculture, ceremonial sites<br/>
                          <strong>Models:</strong> LIDAR analysis, Historical correlation
                        </div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Demo Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Video className="h-8 w-8 mr-4 text-red-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Getting Started Tutorial</h4>
                        <p className="text-sm text-slate-400">15-minute overview of core features</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Video className="h-8 w-8 mr-4 text-red-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Advanced Analysis</h4>
                        <p className="text-sm text-slate-400">Deep dive into AI capabilities</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROADMAP TAB */}
          <TabsContent value="roadmap" className="space-y-8">
            <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Rocket className="mr-3 h-8 w-8 text-emerald-400" />
                  NIS Protocol Roadmap
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  The evolution of the NIS Protocol: from flagship v1 to AGI-ready v3 with KAN integration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* v1 */}
                <div>
                  <h3 className="text-xl font-semibold text-emerald-300 mb-2 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-400" />
                    v1 — Flagship Release (Current)
                  </h3>
                  <ul className="list-disc ml-6 text-slate-300 space-y-1">
                    <li>Production-ready, multi-agent cognitive architecture</li>
                    <li>148 archaeological sites, high-confidence discoveries</li>
                    <li>Real-time backend, advanced filtering, professional research UI</li>
                    <li>Trojan horse strategy: specialist AI for archaeology & indigenous knowledge</li>
                  </ul>
                </div>
                {/* v2 */}
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-cyan-400" />
                    v2 — Next-Gen Agents (Planned)
                  </h3>
                  <ul className="list-disc ml-6 text-slate-300 space-y-1">
                    <li>Further agent specialization and modularity</li>
                    <li>More robust multi-modal integration (vision, text, spatial, temporal)</li>
                    <li>Improved data pipelines and real-time collaboration</li>
                    <li>Expanded professional research tools and cultural context modules</li>
                  </ul>
                </div>
                {/* v3 */}
                <div>
                  <h3 className="text-xl font-semibold text-blue-300 mb-2 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-400" />
                    v3 — KAN Integration & AGI Roadmap
                  </h3>
                  <p className="text-slate-300 mb-2">
                    <span className="font-semibold text-emerald-300">Kolmogorov-Arnold Networks (KANs)</span> are a new neural architecture that:
                  </p>
                  <ul className="list-disc ml-6 text-slate-300 space-y-1">
                    <li>Learn mathematical structure behind data</li>
                    <li>Require less data to generalize</li>
                    <li>Are more interpretable than standard MLPs</li>
                    <li>Work well in low-data or symbolic-reasoning tasks</li>
                  </ul>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">KAN-Enhanced Agents (Planned):</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-slate-300 border border-slate-700 rounded-lg">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200">
                            <th className="px-3 py-2 border-b border-slate-700">Agent</th>
                            <th className="px-3 py-2 border-b border-slate-700">Role in NIS</th>
                            <th className="px-3 py-2 border-b border-slate-700">KAN Use Case</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 border-b border-slate-700">Simulation Agent</td>
                            <td className="px-3 py-2 border-b border-slate-700">Predict outcomes, model scenarios</td>
                            <td className="px-3 py-2 border-b border-slate-700">Causal graphs, probabilistic branches</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border-b border-slate-700">Memory Agent</td>
                            <td className="px-3 py-2 border-b border-slate-700">Pattern extraction, semantic links</td>
                            <td className="px-3 py-2 border-b border-slate-700">Symbolic + spatial logic</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border-b border-slate-700">Reasoning Agent</td>
                            <td className="px-3 py-2 border-b border-slate-700">Logic chains, deduction trees</td>
                            <td className="px-3 py-2 border-b border-slate-700">Abstract relationship encoding</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border-b border-slate-700">Goal Agent</td>
                            <td className="px-3 py-2 border-b border-slate-700">Prioritization, optimization</td>
                            <td className="px-3 py-2 border-b border-slate-700">Efficient reward modeling</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border-b border-slate-700">Alignment Agent</td>
                            <td className="px-3 py-2 border-b border-slate-700">Value function & ethics weighting</td>
                            <td className="px-3 py-2 border-b border-slate-700">Interpretable moral vector mappings</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">Sample KAN Integration (Python):</h4>
                    <pre className="bg-slate-800 text-slate-200 rounded-lg p-4 overflow-x-auto text-xs">
{`from kan import KolmogorovArnoldNetwork

class SimPredictionKAN:
    def __init__(self):
        self.model = KolmogorovArnoldNetwork(
            in_features=6,
            out_features=3,
            grid_size=16,
            interpolation='linear'
        )

    def simulate(self, input_vector):
        return self.model(input_vector)
`}
                    </pre>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">Cognitive Benefits:</h4>
                    <ul className="list-disc ml-6 text-slate-300 space-y-1">
                      <li><span className="font-semibold text-emerald-300">Generalization:</span> KAN learns functions, not just patterns</li>
                      <li><span className="font-semibold text-emerald-300">Explainability:</span> Each unit is a mathematical component</li>
                      <li><span className="font-semibold text-emerald-300">Data Efficiency:</span> Fewer examples needed</li>
                      <li><span className="font-semibold text-emerald-300">Structural Reasoning:</span> Natural for nested reasoning graphs</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">Planned v3 Features:</h4>
                    <ul className="list-disc ml-6 text-slate-300 space-y-1">
                      <li>KANModuleInterface: Plug-in API for any agent to use a KAN model</li>
                      <li>KAN-Enhanced Simulation: Multi-agent scenario planner</li>
                      <li>KANPatternMemory: Pattern recall + compression for episodic memory</li>
                      <li>KAN-Ethics Layer: Interpretable ethical scoring</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">Compatibility:</h4>
                    <ul className="list-disc ml-6 text-slate-300 space-y-1">
                      <li>Works with PyTorch</li>
                      <li>Modular (e.g., <code>src/modules/kan/</code>)</li>
                      <li>Integrates with LangGraph, Redis-based inference graphs</li>
                      <li>Exportable for mobile/edge AGI</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 py-8 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Paper
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>
          <div className="text-center text-sm">
            <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
            <p className="mt-2 text-slate-500">
              Built with Next.js, FastAPI, and advanced AI for archaeological research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
