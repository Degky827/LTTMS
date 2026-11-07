import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none select-none'

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
    }

    const variantClasses = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500/50 shadow-lake-sm hover:shadow-lake-md',
      secondary:
        'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500/50 shadow-lake-sm hover:shadow-lake-md',
      accent:
        'bg-gold-500 text-text-primary hover:bg-gold-400 focus:ring-gold-500/50 shadow-lake-sm hover:shadow-lake-md font-semibold',
      outline:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-500/30',
      ghost:
        'text-text-primary bg-transparent hover:bg-primary-50/60 hover:text-primary-600 focus:ring-primary-500/20',
      danger:
        'bg-status-danger text-white hover:bg-red-700 focus:ring-red-500/50 shadow-sm',
      warning:
        'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500/50 shadow-sm',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            variant={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
