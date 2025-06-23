import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          404
        </div>
        <h1 className="text-3xl font-bold text-white">Archaeological Site Not Found</h1>
        <p className="text-gray-300 max-w-md mx-auto">
          The archaeological site you're looking for has been lost to time. 
          Let's help you discover something new instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
          >
            🏛️ Return to Discovery Hub
          </Link>
          <Link 
            href="/map"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium"
          >
            🗺️ Explore Archaeological Map
          </Link>
        </div>
        <div className="mt-8 text-sm text-gray-400">
          <p>🔍 Continue your archaeological journey with NIS Protocol</p>
        </div>
      </div>
    </div>
  )
} 