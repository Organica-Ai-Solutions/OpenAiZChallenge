"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  customToast: {
    success: (message: string, description?: string) => void
    error: (message: string, description?: string) => void
    info: (message: string, description?: string) => void
    warning: (message: string, description?: string) => void
  }
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const customToast = React.useMemo(() => ({
    success: (message: string, description?: string) => {
      sonnerToast.success(message, { description })
    },
    error: (message: string, description?: string) => {
      sonnerToast.error(message, { description })
    },
    info: (message: string, description?: string) => {
      sonnerToast.info(message, { description })
    },
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, { description })
    }
  }), [])

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    customToast
  }), [toasts, addToast, removeToast, customToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useCustomToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useCustomToast must be used within a ToastProvider")
  }
  return context
} 