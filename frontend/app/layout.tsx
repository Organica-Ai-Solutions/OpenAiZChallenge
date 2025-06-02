import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ClientProviders } from "../components/client-providers"

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
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
