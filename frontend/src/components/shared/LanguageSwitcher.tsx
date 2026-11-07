import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils/cn'

export interface LanguageSwitcherProps {
  className?: string
  variant?: 'dropdown' | 'buttons'
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = 'dropdown',
}) => {
  const { language, setLanguage, languages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  if (variant === 'buttons') {
    return (
      <div className={cn('inline-flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-surface-border', className)}>
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
              language === l.code
                ? 'bg-white text-primary-600 shadow-lake-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <span className="mr-1">{l.flag}</span>
            <span>{l.nativeName}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 border border-surface-border rounded-lg shadow-lake-sm transition-colors"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="hidden sm:inline-block">{currentLang.nativeName}</span>
        <svg
          className="w-3.5 h-3.5 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl bg-surface shadow-lake-lg border border-surface-border py-1.5 focus:outline-none animate-slide-down">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors',
                language === l.code
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.nativeName}</span>
              </div>
              {language === l.code && (
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
