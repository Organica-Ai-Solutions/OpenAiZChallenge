import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Map, 
  MessageSquare, 
  BarChart3, 
  Download, 
  Bell,
  Satellite,
  Eye,
  Zap,
  Activity,
  Database,
  Globe,
  Shield,
  Smartphone
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-blue-900/90" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <span className="text-xl font-bold text-emerald-900">NIS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">Protocol</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100">
              Revolutionary AI-powered archaeological discovery platform combining neural networks, 
              satellite analysis, and indigenous knowledge systems
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/agent">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-gray-100">
                  <Brain className="mr-2 h-5 w-5" />
                  Start Discovery
                </Button>
              </Link>
              <Link href="/documentation">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="bg-emerald-800 text-emerald-100">
                <Activity className="mr-1 h-3 w-3" />
                15+ AI Models
              </Badge>
              <Badge variant="secondary" className="bg-emerald-800 text-emerald-100">
                <Database className="mr-1 h-3 w-3" />
                Real-time Analysis
              </Badge>
              <Badge variant="secondary" className="bg-emerald-800 text-emerald-100">
                <Globe className="mr-1 h-3 w-3" />
                Global Coverage
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Archaeological Discovery Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI capabilities meet intuitive interfaces for comprehensive archaeological research
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Agent Tab */}
          <Link href="/agent">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                  <Badge>Core</Badge>
                </div>
                <CardTitle>AI Agent Analysis</CardTitle>
                <CardDescription>
                  Coordinate-based discovery using GPT-4, YOLO8, and advanced reasoning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time coordinate analysis</li>
                  <li>• Multi-model AI ensemble</li>
                  <li>• Confidence scoring</li>
                  <li>• Cultural context integration</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Vision Agent */}
          <Link href="/agent">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Eye className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
                  <Badge variant="secondary">Enhanced</Badge>
                </div>
                <CardTitle>Vision Agent</CardTitle>
                <CardDescription>
                  Computer vision analysis with YOLO8, Waldo, and GPT-4 Vision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Satellite imagery analysis</li>
                  <li>• Pattern detection</li>
                  <li>• Layer visualization</li>
                  <li>• Model performance metrics</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* ReAct Chat */}
          <Link href="/chat">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <MessageSquare className="h-8 w-8 text-green-600 group-hover:text-green-700" />
                  <Badge variant="secondary">New</Badge>
                </div>
                <CardTitle>ReAct Chat Interface</CardTitle>
                <CardDescription>
                  Intelligent reasoning and action planning for archaeological discovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Reasoning + Acting framework</li>
                  <li>• Multi-mode chat system</li>
                  <li>• Site discovery workflows</li>
                  <li>• Research assistance</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Satellite Monitoring */}
          <Link href="/satellite">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Satellite className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                  <Badge className="bg-blue-100 text-blue-800">New</Badge>
                </div>
                <CardTitle>Satellite Monitoring</CardTitle>
                <CardDescription>
                  Real-time satellite feeds, change detection, and environmental analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live satellite imagery feeds</li>
                  <li>• Automated change detection</li>
                  <li>• Weather pattern correlation</li>
                  <li>• Soil composition analysis</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Interactive Map */}
          <Link href="/map">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Map className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
                  <Badge className="bg-orange-100 text-orange-800">Enhanced</Badge>
                </div>
                <CardTitle>Interactive Discovery Map</CardTitle>
                <CardDescription>
                  Real-time mapping with satellite overlays and discovery markers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Satellite imagery layers</li>
                  <li>• Real-time discovery markers</li>
                  <li>• Click-to-analyze functionality</li>
                  <li>• Filter and search capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Analytics Dashboard */}
          <Link href="/analytics">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700" />
                  <Badge className="bg-indigo-100 text-indigo-800">New</Badge>
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Comprehensive statistical analysis and interactive visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Interactive charts & graphs</li>
                  <li>• Regional performance analysis</li>
                  <li>• Model comparison metrics</li>
                  <li>• Temporal trend analysis</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Documentation */}
          <Link href="/documentation">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="h-8 w-8 text-gray-600 group-hover:text-gray-700" />
                  <Badge variant="outline">Guide</Badge>
                </div>
                <CardTitle>Documentation & API</CardTitle>
                <CardDescription>
                  Comprehensive guides, API reference, and implementation examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Quick start tutorials</li>
                  <li>• API documentation</li>
                  <li>• Implementation examples</li>
                  <li>• Development roadmap</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* New Features Highlight */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Enhancements
            </h2>
            <p className="text-xl text-gray-600">
              Cutting-edge features that transform archaeological discovery
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Notifications</h3>
                  <p className="text-gray-600">
                    WebSocket-powered live updates for analysis progress, discoveries, and system status. 
                    Never miss a breakthrough moment.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Satellite className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enhanced Mapping</h3>
                  <p className="text-gray-600">
                    Full-featured mapping with multiple satellite overlays, real-time discovery markers, 
                    and interactive analysis capabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Export & Reporting</h3>
                  <p className="text-gray-600">
                    Generate comprehensive PDF reports, CSV datasets, and GeoJSON exports 
                    for stakeholders and research purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Visualizations</h3>
                  <p className="text-gray-600">
                    Interactive charts, temporal analysis, confidence distributions, 
                    and model performance comparisons with real-time filtering.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Smartphone className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Mobile Optimized</h3>
                  <p className="text-gray-600">
                    Fully responsive design with mobile-first optimizations for 
                    field research and on-the-go analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enterprise Ready</h3>
                  <p className="text-gray-600">
                    Scalable architecture with Docker deployment, user authentication, 
                    and enterprise-grade security features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Stats */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">System Performance</h2>
            <p className="text-xl text-gray-600">Real-world metrics from archaeological discoveries</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">94%</div>
              <div className="text-gray-600">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2.3s</div>
              <div className="text-gray-600">Avg Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
              <div className="text-gray-600">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">1M+</div>
              <div className="text-gray-600">Data Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover the Past?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-emerald-100">
            Join researchers worldwide using AI to unlock archaeological secrets. 
            Start your discovery journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agent">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-gray-100">
                <Zap className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/documentation" className="text-gray-600 hover:text-gray-900">
              Documentation
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
              Analytics
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              GitHub
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Research Paper
            </a>
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} Organica-Ai-Solutions. NIS Protocol - Advancing archaeological discovery through AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
