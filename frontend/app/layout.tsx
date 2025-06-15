import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientProviders } from "@/components/client-providers"
import { EnhancedNavigation } from "@/components/ui/enhanced-navigation"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata: Metadata = {
  title: "NIS Protocol - Neural Intelligence System",
  description: "Advanced Archaeological Discovery through AI",
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
        
        {/* Google Maps will be loaded by GoogleMapsLoader component */}
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>
            <div className="flex min-h-screen">
              {/* Enhanced Navigation Sidebar */}
              <EnhancedNavigation className="hidden lg:flex flex-col" />
              
              {/* Main Content Area */}
              <main className="flex-1 lg:ml-0">
                {/* Mobile Navigation */}
                <div className="lg:hidden">
                  <EnhancedNavigation />
                </div>
                
                {/* Page Content */}
                <div className="p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
