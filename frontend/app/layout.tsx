import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "../components/client-providers"
import OptimizedNavigation from "../components/shared/OptimizedNavigation"
import PageLoader from "../components/ui/page-loader"
import { Suspense } from "react"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata: Metadata = {
  title: "NIS Protocol - Indigenous Knowledge Research Platform",
  description: "Advanced AI-powered archaeological site discovery and satellite monitoring system",
  keywords: "archaeological discovery, AI, satellite monitoring, indigenous knowledge",
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
        
        {/* Google Maps will be loaded by GoogleMapsLoader component */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
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
        </ClientProviders>
      </body>
    </html>
  )
}
