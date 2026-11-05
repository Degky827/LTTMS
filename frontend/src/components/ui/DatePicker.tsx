import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-text-primary"
          >
            {label} {required && <span className="text-status-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="date"
            id={inputId}
            name={name}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
            className={cn(
              'w-full h-11 px-3.5 text-sm rounded-lg border bg-white text-text-primary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer',
              error
                ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/30'
                : 'border-surface-border focus:border-primary-500 focus:ring-primary-500/20 hover:border-primary-300',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-status-danger font-medium mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-desc`} className="text-xs text-text-secondary mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
