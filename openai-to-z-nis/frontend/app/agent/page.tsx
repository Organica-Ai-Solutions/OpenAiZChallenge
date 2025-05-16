import NISAgentUI from "../../src/components/NISAgentUI"

export default function AgentPage() {
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
            <a href="/agent" className="border-b-2 border-emerald-200 pb-1 text-emerald-200">
              Agent
            </a>
            <a href="/chat" className="hover:text-emerald-200">
              Chat
            </a>
            <a href="/documentation" className="hover:text-emerald-200">
              Documentation
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">NIS Protocol V0 Agent</h1>
          <p className="mt-2 text-gray-600">
            Discover archaeological sites in the Amazon using our neural-inspired system
          </p>
        </div>

        <NISAgentUI />
      </div>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
