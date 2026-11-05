import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  error?: string
  helperText?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, id, name, className, disabled, ...props }, ref) => {
    const inputId = id || name || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1">
        <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            disabled={disabled}
            className={cn(
              'w-4 h-4 mt-0.5 rounded border-surface-border text-primary-500 focus:ring-primary-500/30 focus:ring-2 focus:ring-offset-1 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer accent-primary-500',
              error && 'border-status-danger',
              className
            )}
            {...props}
          />
          {label && (
            <span className={cn('text-sm text-text-primary', disabled && 'opacity-60 cursor-not-allowed')}>
              {label}
            </span>
          )}
        </label>
        {error ? (
          <p className="text-xs text-status-danger pl-6">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-secondary pl-6">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: string
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, checked, id, name, disabled, onChange, className, ...props }, ref) => {
    const inputId = id || name || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <label htmlFor={inputId} className="flex items-center justify-between gap-4 cursor-pointer select-none">
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
            {description && <span className="text-xs text-text-secondary">{description}</span>}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500",
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          />
        </div>
      </label>
    )
  }
)

Switch.displayName = 'Switch'
