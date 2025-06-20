'use client'

import { useEffect, useState } from 'react'

export default function HydrationTest() {
  const [isClient, setIsClient] = useState(false)
  const [windowExists, setWindowExists] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setWindowExists(typeof window !== 'undefined')
  }, [])

  if (!isClient) {
    return (
      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300">🔄 Server-side rendering...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
      <p className="text-green-300">✅ Hydration successful!</p>
      <p className="text-sm text-green-400">
        Client: {isClient ? 'Yes' : 'No'} | 
        Window: {windowExists ? 'Available' : 'Not available'}
      </p>
    </div>
  )
} 