import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "../components/client-providers"
import OptimizedNavigation from "../components/shared/OptimizedNavigation"
import PageLoader from "../components/ui/page-loader"
import { Suspense } from "react"
import CacheCleaner from "../components/CacheCleaner"
import { MapProvider } from "../src/contexts/MapContext"
import { UnifiedSystemProvider } from "../src/contexts/UnifiedSystemContext"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata: Metadata = {
  title: "NIS Protocol - Indigenous Knowledge Research Platform",
  description: "Advanced AI-powered archaeological site discovery and satellite monitoring system",
  keywords: "archaeological discovery, AI, satellite monitoring, indigenous knowledge",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/MainLogo.png" as="image" />
        <link rel="dns-prefetch" href="//localhost:8000" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Mapbox GL JS CSS */}
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
        
        {/* Google Maps will be loaded by GoogleMapsLoader component */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CacheCleaner />
        <ClientProviders>
          <UnifiedSystemProvider>
            <MapProvider>
          <OptimizedNavigation showBackendStatus={true} />
          <PageLoader>
            <Suspense fallback={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
              </div>
            }>
              {children}
            </Suspense>
          </PageLoader>
            </MapProvider>
          </UnifiedSystemProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
