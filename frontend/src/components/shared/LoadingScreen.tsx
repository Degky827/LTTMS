import React from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { Logo } from './Logo'
import { cn } from '@/lib/utils/cn'

export interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Lake Tana Experiences...',
  fullScreen = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center select-none bg-surface-muted/80 backdrop-blur-xs',
        fullScreen ? 'fixed inset-0 z-50 min-h-screen' : 'py-20 w-full',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Logo variant="compact" href="" />
        <Spinner size="lg" variant="primary" />
        <p className="text-xs font-semibold tracking-wide uppercase text-text-secondary animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )
}
