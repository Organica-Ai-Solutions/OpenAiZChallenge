import ChatInterface from "../../src/components/ChatInterface"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900">NIS</span>
            Protocol
          </a>
          <nav className="hidden space-x-6 md:flex">
            <a href="/" className="hover:text-emerald-200">
              Home
            </a>
            <a href="/agent" className="hover:text-emerald-200">
              Agent
            </a>
            <a href="/chat" className="text-emerald-200 border-b-2 border-emerald-200 pb-1">
              Chat
            </a>
            <a href="#" className="hover:text-emerald-200">
              Documentation
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">NIS Protocol Chat</h1>
          <p className="mt-2 text-gray-600">
            Communicate directly with our neural-inspired AI system for archaeological discovery
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <ChatInterface />

          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Chat Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">General Mode</h3>
                <p className="text-sm text-gray-600">
                  Ask general questions about archaeology, the Amazon region, or the NIS Protocol itself.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Discovery Mode</h3>
                <p className="text-sm text-gray-600">
                  Discuss potential archaeological sites and get recommendations for areas to investigate.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Analysis Mode</h3>
                <p className="text-sm text-gray-600">
                  Get detailed analysis of specific coordinates or patterns identified in your research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600 mt-12">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
