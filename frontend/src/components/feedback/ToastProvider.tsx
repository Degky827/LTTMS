import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'> | string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options: Omit<ToastItem, 'id'> | string) => {
      const id = Math.random().toString(36).substring(2, 9)
      const toastData: ToastItem =
        typeof options === 'string'
          ? { id, message: options, type: 'info', duration: 4000 }
          : { ...options, id, duration: options.duration || 4000 }

      setToasts((prev) => [...prev, toastData])

      if (toastData.duration && toastData.duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, toastData.duration)
      }
    },
    [dismiss]
  )

  const success = useCallback((message: string, title?: string) => {
    toast({ message, title, type: 'success' })
  }, [toast])

  const error = useCallback((message: string, title?: string) => {
    toast({ message, title, type: 'error' })
  }, [toast])

  const warning = useCallback((message: string, title?: string) => {
    toast({ message, title, type: 'warning' })
  }, [toast])

  const info = useCallback((message: string, title?: string) => {
    toast({ message, title, type: 'info' })
  }, [toast])

  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const borderColors = {
    success: 'border-emerald-300 bg-white',
    error: 'border-red-300 bg-white',
    warning: 'border-amber-300 bg-white',
    info: 'border-sky-300 bg-white',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Portal Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lake-lg backdrop-blur-sm transition-all duration-300 animate-slide-up',
              borderColors[t.type]
            )}
          >
            <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              {t.title && <h5 className="text-xs font-bold text-text-primary mb-0.5">{t.title}</h5>}
              <p className="text-xs text-text-secondary leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Close notification"
              className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
