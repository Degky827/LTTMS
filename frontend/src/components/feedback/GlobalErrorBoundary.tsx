import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/shared/Logo'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught unhandled frontend exception:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-surface-muted select-none">
          <div className="max-w-md w-full bg-white rounded-2xl border border-surface-border p-8 shadow-lake-xl flex flex-col items-center text-center animate-slide-up">
            <Logo variant="compact" href="" className="mb-6" />

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-status-danger flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Application Error
            </h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              An unexpected client error occurred in the LTTMS application interface. Our telemetry has recorded this occurrence.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="w-full text-left bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 overflow-x-auto text-[11px] font-mono text-red-600">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
              <Button variant="primary" size="sm" fullWidth onClick={this.handleReset}>
                Reload Platform
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
