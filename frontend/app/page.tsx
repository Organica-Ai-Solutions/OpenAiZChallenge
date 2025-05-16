import Link from "next/link"
import { ArrowRight, Brain, Compass, Database, Globe, Layers, Lightbulb, Zap, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="block">NIS Protocol</span>
                  <span className="block text-emerald-300">Neural-Inspired System</span>
                </h1>
                <p className="mt-6 max-w-lg text-xl text-emerald-50">
                  A universal meta-protocol for AI agent communication, powering the next generation of archaeological
                  discovery.
                </p>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" asChild>
                  <Link href="/agent">
                    Try the Agent
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/chat">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chat with NIS
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-emerald-700/30 p-8">
                    <div className="h-full w-full rounded-full bg-emerald-600/40 p-8">
                      <div className="h-full w-full rounded-full bg-emerald-500/50 p-8">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                          <Brain className="h-16 w-16 text-emerald-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powering the OpenAI to Z Challenge
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Discover archaeological sites in the Amazon using our neural-inspired system for agent communication and
              cognitive processing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Compass className="h-10 w-10 text-emerald-600" />
                <CardTitle className="mt-4">Archaeological Discovery</CardTitle>
                <CardDescription>
                  Analyze geographical data to identify potential archaeological sites in the Amazon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI-powered system uses satellite imagery, LIDAR data, and historical records to identify patterns
                  consistent with ancient settlements and structures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-emerald-600" />
                <CardTitle className="mt-4">Neural Architecture</CardTitle>
                <CardDescription>Layered cognitive processing inspired by human neural systems.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  From sensory input to executive decision-making, our system processes information through layers that
                  mimic human cognition for more intuitive and effective analysis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-emerald-600" />
                <CardTitle className="mt-4">Conversational Interface</CardTitle>
                <CardDescription>Communicate directly with our AI agents through natural language.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our chat interface allows you to discuss potential discoveries, ask questions about archaeological
                  sites, and receive guidance on your research in natural language.
                </p>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/chat">
                      Chat with NIS
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Protocol Details */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">NIS Protocol Architecture</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              A comprehensive system designed for advanced AI agent communication and cognitive processing.
            </p>
          </div>

          <Tabs defaultValue="architecture" className="mx-auto max-w-4xl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="memory">Memory System</TabsTrigger>
              <TabsTrigger value="protocols">Protocol Support</TabsTrigger>
              <TabsTrigger value="cognitive">Cognitive Processing</TabsTrigger>
            </TabsList>
            <TabsContent value="architecture" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Protocol Architecture</CardTitle>
                  <CardDescription>Universal translation layer between different AI protocols</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Universal Translation</h4>
                      <p className="text-sm text-gray-600">
                        Seamless integration of MCP, ACP, and A2A protocols with context preservation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Real-time Monitoring</h4>
                      <p className="text-sm text-gray-600">
                        Performance tracking with automatic scaling and load balancing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cognitive Context</h4>
                      <p className="text-sm text-gray-600">
                        Preservation of context and emotional states across protocol boundaries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="memory" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Memory System</CardTitle>
                  <CardDescription>Advanced memory management with semantic search capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Working Memory</h4>
                      <p className="text-sm text-gray-600">
                        Miller's Law implementation (7±2 items) for efficient processing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Semantic Search</h4>
                      <p className="text-sm text-gray-600">Enhanced memory retrieval with contextual understanding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Neuroplasticity</h4>
                      <p className="text-sm text-gray-600">
                        Adaptive learning mechanisms for improved performance over time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="protocols" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Support</CardTitle>
                  <CardDescription>Comprehensive support for multiple agent communication protocols</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Universal Meta Protocol</h4>
                      <p className="text-sm text-gray-600">
                        Core layer for translating between different protocol standards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Protocol Integration</h4>
                      <p className="text-sm text-gray-600">
                        Support for A2A, ACP, and MCP protocols with seamless translation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cross-Protocol Preservation</h4>
                      <p className="text-sm text-gray-600">
                        Emotional state and memory context maintained across protocol boundaries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cognitive" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Processing</CardTitle>
                  <CardDescription>Advanced pattern recognition and decision-making capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pattern Recognition</h4>
                      <p className="text-sm text-gray-600">
                        Transformer-based models for identifying complex patterns in data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Emotional Processing</h4>
                      <p className="text-sm text-gray-600">Sentiment analysis for understanding emotional context</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Executive Control</h4>
                      <p className="text-sm text-gray-600">
                        Advanced decision-making capabilities for complex problem solving
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* OpenAI to Z Challenge Section */}
      <section className="bg-emerald-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">OpenAI to Z Challenge</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              Join the quest to discover previously unknown archaeological sites in the Amazon using our NIS Protocol.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" asChild>
                <Link href="/agent">
                  Launch Discovery Agent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="https://kaggle.com/competitions/openai-to-z-challenge" target="_blank">
                  Learn About the Challenge
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Our neural-inspired system processes multiple data sources to identify potential archaeological sites.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 bg-emerald-100"></div>
              <div className="space-y-12">
                <div className="relative">
                  <div className="absolute left-1/2 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white">
                    1
                  </div>
                  <div className="ml-12 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-xl font-bold text-gray-900">Data Collection</h3>
                    <p className="mt-2 text-gray-600">
                      The system ingests multiple data sources including satellite imagery, LIDAR data, historical
                      texts, and indigenous oral maps.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white">
                    2
                  </div>
                  <div className="ml-12 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-xl font-bold text-gray-900">Neural Processing</h3>
                    <p className="mt-2 text-gray-600">
                      Our layered cognitive architecture processes the data through sensory, perception, memory,
                      emotional, and executive layers.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white">
                    3
                  </div>
                  <div className="ml-12 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-xl font-bold text-gray-900">Pattern Recognition</h3>
                    <p className="mt-2 text-gray-600">
                      Advanced transformer models identify patterns consistent with archaeological sites, comparing them
                      with known settlements.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white">
                    4
                  </div>
                  <div className="ml-12 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-xl font-bold text-gray-900">Analysis & Verification</h3>
                    <p className="mt-2 text-gray-600">
                      The system provides confidence scores, site classification, and comparison with known sites,
                      suggesting next steps for verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 p-8 text-center text-white shadow-xl sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Discover?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              Start using our NIS Protocol-powered agent to identify potential archaeological sites in the Amazon.
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" asChild>
                <Link href="/agent">
                  Launch Discovery Agent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-white">NIS Protocol</h3>
              <p className="mt-4 text-sm">A neural-inspired system for agent communication and cognitive processing.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Whitepaper
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Community</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
