import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  clearable?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue = '',
  onChange,
  onSearch,
  debounceMs = 300,
  clearable = true,
  placeholder = 'Search...',
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue)

  useEffect(() => {
    setInternalValue(controlledValue)
  }, [controlledValue])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [internalValue, debounceMs, onChange])

  const handleClear = () => {
    setInternalValue('')
    if (onChange) onChange('')
    if (onSearch) onSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue)
    }
  }

  return (
    <div className={cn('relative w-full flex items-center', className)}>
      <div className="absolute left-3.5 pointer-events-none text-text-secondary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-surface-border bg-white text-text-primary placeholder:text-text-muted transition-all duration-150 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        {...props}
      />
      {clearable && internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
