'use client'

import { useEffect } from 'react'

export default function MetaMaskErrorSuppressor() {
  useEffect(() => {
    // Specific handler for MetaMask inpage.js errors
    const handleMetaMaskErrors = () => {
      // Override the window.onerror handler to catch MetaMask errors
      const originalOnError = window.onerror
      
      window.onerror = function(message, source, lineno, colno, error) {
        // Check if this is a MetaMask error
        if (typeof message === 'string' && 
            (message.includes('MetaMask extension not found') ||
             source?.includes('chrome-extension://') ||
             source?.includes('inpage.js') ||
             message.includes('ChromeTransport') ||
             message.includes('connectChrome error'))) {
          
          // Suppress the error - don't show it in console
          return true
        }
        
        // For all other errors, use the original handler
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error)
        }
        
        return false
      }
      
      // Handle promise rejections from MetaMask
      const handlePromiseRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason
        const reasonString = typeof reason === 'string' ? reason : reason?.toString?.() || ''
        
        if (reasonString.includes('MetaMask') ||
            reasonString.includes('chrome-extension') ||
            reasonString.includes('ChromeTransport') ||
            reasonString.includes('connectChrome error')) {
          
          // Prevent the unhandled rejection from showing
          event.preventDefault()
          return
        }
      }
      
      window.addEventListener('unhandledrejection', handlePromiseRejection)
      
      // Clean up function
      return () => {
        window.onerror = originalOnError
        window.removeEventListener('unhandledrejection', handlePromiseRejection)
      }
    }
    
    // Apply the error handling
    const cleanup = handleMetaMaskErrors()
    
    // Also override console methods to catch the specific error format
    const originalConsoleError = console.error
    console.error = function(...args) {
      const message = args.join(' ')
      
      // Specifically target the MetaMask error format you're seeing
      if (message.includes('[ChromeTransport] connectChrome error: Error: MetaMask extension not found') ||
          message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
          message.includes('inpage.js:1:16512') ||
          message.includes('MetaMask extension not found')) {
        
        // Don't log this error
        return
      }
      
      // Log all other errors normally
      originalConsoleError.apply(console, args)
    }
    
    return () => {
      cleanup?.()
      console.error = originalConsoleError
    }
  }, [])
  
  return null
} 