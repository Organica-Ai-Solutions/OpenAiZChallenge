"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Wifi, WifiOff, Menu, X } from "lucide-react"

interface NavigationProps {
  showBackendStatus?: boolean
  showChatButton?: boolean
  onChatToggle?: () => void
}

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/archaeological-discovery", label: "Discovery" },
  { href: "/agent", label: "Agents" },
  { href: "/satellite", label: "Satellite" },
  { href: "/map", label: "Maps" },
  { href: "/analytics", label: "Analytics" },
  { href: "/chat", label: "Chat" },
  { href: "/documentation", label: "Docs" },
]

export default function Navigation({ 
  showBackendStatus = false, 
  showChatButton = false, 
  onChatToggle 
}: NavigationProps) {
  const pathname = usePathname()
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check backend status if needed
  useEffect(() => {
    if (showBackendStatus) {
      const checkBackend = async () => {
        try {
          const response = await fetch('http://localhost:8000/system/health')
          setIsBackendOnline(response.ok)
        } catch {
          setIsBackendOnline(false)
        }
      }
      
      checkBackend()
      const interval = setInterval(checkBackend, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [showBackendStatus])

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 py-3 text-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold hover:opacity-90 transition-opacity">
          <div className="relative w-12 h-12">
            <Image
              src="/MainLogo.png"
              alt="NIS Protocol Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-white">NIS Protocol</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-8 md:flex">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== "/" && pathname.startsWith(link.href))
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-emerald-400 transition-colors text-sm ${
                  isActive 
                    ? "text-emerald-400 font-medium" 
                    : "text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Backend Status Badge */}
          {showBackendStatus && (
            <Badge 
              variant={isBackendOnline ? "default" : "secondary"}
              className={isBackendOnline ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isBackendOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Backend Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Demo Mode
                </>
              )}
            </Badge>
          )}

          {/* Chat Toggle Button */}
          {showChatButton && onChatToggle && (
            <Button variant="outline" size="sm" onClick={onChatToggle}>
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50">
          <nav className="px-6 py-4 space-y-3">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== "/" && pathname.startsWith(link.href))
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    isActive 
                      ? "text-emerald-400 bg-slate-700 font-medium" 
                      : "text-slate-200 hover:text-emerald-400 hover:bg-slate-700/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            
            {/* Mobile Backend Status */}
            {showBackendStatus && (
              <div className="pt-3 border-t border-slate-700">
                <Badge 
                  variant={isBackendOnline ? "default" : "secondary"}
                  className={`${isBackendOnline ? "bg-green-600" : ""} w-full justify-center`}
                >
                  {isBackendOnline ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Backend Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1" />
                      Demo Mode
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Mobile Chat Button */}
            {showChatButton && onChatToggle && (
              <div className="pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onChatToggle()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
} 