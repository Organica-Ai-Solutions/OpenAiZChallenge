"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { Button } from "./button"

interface Toast {
  id: string
  title?: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[], dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, dismiss }: { toast: Toast, dismiss: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10',
    error: 'border-red-500/20 bg-red-500/10',
    warning: 'border-yellow-500/20 bg-yellow-500/10',
    info: 'border-blue-500/20 bg-blue-500/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.5 }}
      transition={{ type: "spring", duration: 0.4 }}
      className={`relative rounded-lg border backdrop-blur-sm p-4 shadow-lg ${colors[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1">
          {toast.title && (
            <h4 className="text-sm font-semibold text-white mb-1">
              {toast.title}
            </h4>
          )}
          {toast.description && (
            <p className="text-sm text-slate-300">
              {toast.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dismiss(toast.id)}
          className="h-auto p-1 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}
