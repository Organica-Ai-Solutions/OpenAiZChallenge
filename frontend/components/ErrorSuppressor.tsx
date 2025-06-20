'use client'

import { useEffect } from 'react'

export default function ErrorSuppressor() {
  useEffect(() => {
    // Suppress browser extension errors that don't affect our app
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filter out known browser extension errors
      const extensionErrors = [
        'MetaMask extension not found',
        'chrome-extension://',
        'ChromeTransport',
        'Extension context invalidated',
        'Could not establish connection',
        'connectChrome error',
        'provider-injection'
      ]
      
      // Only suppress if it's a browser extension error
      if (extensionErrors.some(error => message.includes(error))) {
        return // Suppress the error
      }
      
      // Allow all other errors to show
      originalError.apply(console, args)
    }
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filter out known browser extension warnings
      const extensionWarnings = [
        'MetaMask',
        'chrome-extension://',
        'Extension',
        'provider-injection'
      ]
      
      // Only suppress if it's a browser extension warning
      if (extensionWarnings.some(warning => message.includes(warning))) {
        return // Suppress the warning
      }
      
      // Allow all other warnings to show
      originalWarn.apply(console, args)
    }
    
    // Handle unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      
      if (reason.includes('MetaMask') || 
          reason.includes('chrome-extension') || 
          reason.includes('Extension context invalidated')) {
        event.preventDefault() // Prevent the error from showing
      }
    }
    
    // Handle general window errors from extensions
    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message || ''
      const source = event.filename || ''
      
      if (message.includes('MetaMask') || 
          source.includes('chrome-extension') ||
          message.includes('Extension context invalidated')) {
        event.preventDefault() // Prevent the error from showing
        return true
      }
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleWindowError)
    
    // Cleanup function
    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleWindowError)
    }
  }, [])
  
  return null // This component doesn't render anything
} 