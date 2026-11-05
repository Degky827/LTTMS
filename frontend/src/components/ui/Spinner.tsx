import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current'
  className?: string
  label?: string
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
}

const variantClasses = {
  primary: 'border-primary-500/20 border-t-primary-500',
  secondary: 'border-teal-500/20 border-t-teal-500',
  accent: 'border-gold-500/20 border-t-gold-500',
  white: 'border-white/20 border-t-white',
  current: 'border-current/20 border-t-current',
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...',
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full shrink-0',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}
