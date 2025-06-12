"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wifi, WifiOff, Menu, X } from "lucide-react";

interface NavigationProps {
  showBackendStatus?: boolean;
  showChatButton?: boolean;
  onChatToggle?: () => void;
}

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/archaeological-discovery", label: "Discovery" },
  { href: "/analysis", label: "Analysis" },
  { href: "/vision", label: "Vision Agent" },
  { href: "/satellite", label: "Satellite" },
  { href: "/map", label: "Maps" },
  { href: "/analytics", label: "Analytics" },
  { href: "/codex-reader", label: "Codex Reader" },
  { href: "/chat", label: "Chat" },
  { href: "/documentation", label: "Docs" },
];

function NavigationLink({ href, label, isActive, onClick }: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative transition-colors duration-200 text-sm ${
        isActive 
          ? "text-emerald-400 font-medium" 
          : "text-slate-200 hover:text-emerald-400"
      }`}
      prefetch={true}
    >
      {label}
    </Link>
  );
}

export default function OptimizedNavigation({ 
  showBackendStatus = false, 
  showChatButton = false, 
  onChatToggle 
}: NavigationProps) {
  const pathname = usePathname();
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized backend status check with reduced frequency and timeout
  useEffect(() => {
    if (showBackendStatus && mounted) {
      const checkBackend = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000); // Reduced timeout
          
          const response = await fetch('http://localhost:8000/system/health', {
            signal: controller.signal,
            cache: 'force-cache', // Cache for faster subsequent loads
            next: { revalidate: 30 } // Cache for 30 seconds
          });
          
          clearTimeout(timeoutId);
          setIsBackendOnline(response.ok);
        } catch {
          setIsBackendOnline(false);
        }
      };
      
      checkBackend();
      const interval = setInterval(checkBackend, 60000); // Reduced to 1 minute
      return () => clearInterval(interval);
    }
  }, [showBackendStatus, mounted]);

  if (!mounted) {
    return (
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 py-3 text-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <div className="w-12 h-12 bg-slate-700 rounded animate-pulse" />
            <span className="text-white">NIS Protocol</span>
          </div>
          <div className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <div key={link.href} className="w-16 h-4 bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 py-3 text-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-3 text-xl font-semibold hover:opacity-90 transition-opacity"
          prefetch={true}
        >
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
              (link.href !== "/" && pathname.startsWith(link.href));
            
            return (
              <NavigationLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive}
              />
            );
          })}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Backend Status Badge */}
          {showBackendStatus && (
            <Suspense fallback={<div className="w-24 h-6 bg-slate-700 rounded animate-pulse" />}>
              <Badge 
                variant={isBackendOnline ? "default" : "secondary"}
                className={`transition-colors ${isBackendOnline ? "bg-green-600 hover:bg-green-700" : ""}`}
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
            </Suspense>
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
            className="md:hidden text-slate-300 hover:text-white p-2 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
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
                (link.href !== "/" && pathname.startsWith(link.href));
              
              return (
                <NavigationLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                  onClick={() => setMobileMenuOpen(false)}
                />
              );
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
                    onChatToggle();
                    setMobileMenuOpen(false);
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
  );
} 