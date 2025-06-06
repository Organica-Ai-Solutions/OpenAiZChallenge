import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "../components/client-providers"
import OptimizedNavigation from "../components/shared/OptimizedNavigation"
import GoogleMapsLoader from "../components/GoogleMapsLoader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NIS Protocol - Indigenous Knowledge Research Platform",
  description: "Advanced AI-powered archaeological site discovery and satellite monitoring system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <OptimizedNavigation showBackendStatus={true} />
          {children}
        </ClientProviders>
        
        <GoogleMapsLoader />
      </body>
    </html>
  )
}
