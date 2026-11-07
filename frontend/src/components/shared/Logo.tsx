import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface LogoProps {
  variant?: 'full' | 'compact' | 'icon'
  theme?: 'dark' | 'light' | 'auto'
  className?: string
  href?: string
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className,
  href = '/',
}) => {
  const isDark = theme === 'dark'

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      {/* Lake Tana Monogram Icon / Shield */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500 via-teal-500 to-gold-500 p-0.5 shadow-lake-sm group-hover:shadow-lake-md transition-shadow">
        <div className="w-full h-full bg-white dark:bg-surface-dark rounded-[10px] flex items-center justify-center overflow-hidden">
          {/* Stylized Lake Waves + Ancient Monastery Dome */}
          <svg
            className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Monastery Dome / Sun */}
            <circle cx="12" cy="7" r="3.5" fill="#D9A441" />
            {/* Cross on Dome */}
            <path d="M12 2.5V4.5M11 3.5H13" stroke="#145B46" strokeWidth="1.2" strokeLinecap="round" />
            {/* Lake Waves */}
            <path
              d="M3 15C5 13.5 7 13.5 9 15C11 16.5 13 16.5 15 15C17 13.5 19 13.5 21 15"
              stroke="#1B8A83"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 19C5 17.5 7 17.5 9 19C11 20.5 13 20.5 15 19C17 17.5 19 17.5 21 19"
              stroke="#145B46"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                'text-lg sm:text-xl font-extrabold tracking-tight font-heading',
                isDark ? 'text-white' : 'text-primary-700 dark:text-white'
              )}
            >
              LTTMS
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gold-100 dark:bg-gold-900/40 text-gold-800 dark:text-gold-300 rounded">
              v2
            </span>
          </div>
          {variant === 'full' && (
            <span
              className={cn(
                'text-[10px] sm:text-[11px] font-medium tracking-wide uppercase',
                isDark ? 'text-gray-300' : 'text-text-secondary dark:text-gray-300'
              )}
            >
              Lake Tana Eco-Tourism
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    )
  }

  return content
}
