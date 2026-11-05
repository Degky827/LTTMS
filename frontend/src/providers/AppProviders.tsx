import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { GlobalErrorBoundary } from '@/components/feedback/GlobalErrorBoundary'

export interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // Ensure QueryClient is instantiated once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Do not retry 401, 403, 404
              if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
                return false
              }
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default AppProviders
