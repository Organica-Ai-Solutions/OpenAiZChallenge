import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Home, 
  Book, 
  MapPin, 
  MessageCircle, 
  Compass 
} from 'lucide-react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IKRP - Indigenous Knowledge Research Platform',
  description: 'Discover archaeological sites in the Amazon using AI-powered analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/agent', label: 'NIS Protocol Agent', icon: Compass },
    { href: '/analysis', label: 'Site Analysis', icon: MapPin },
    { href: '/documentation', label: 'Documentation', icon: Book }
  ]

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} flex min-h-screen`} suppressHydrationWarning>
        <nav className="w-64 bg-emerald-50 border-r p-6 space-y-2">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-emerald-800">IKRP</h1>
            <p className="text-sm text-muted-foreground">Indigenous Knowledge Research Platform</p>
          </div>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center p-3 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <item.icon className="mr-3 text-emerald-600" />
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t text-xs text-muted-foreground">
            © 2025 Organica-Ai-Solutions
          </div>
        </nav>
        <main className="flex-1 bg-white overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
} 