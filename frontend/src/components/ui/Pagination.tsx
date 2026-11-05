import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5 select-none', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous Page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-border text-text-secondary hover:text-text-primary hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {getPages().map((page, index) => {
        if (page === '...') {
          return (
            <span key={index} className="px-2 text-text-muted text-xs">
              ...
            </span>
          )
        }

        const isCurrent = page === currentPage

        return (
          <button
            key={index}
            onClick={() => onPageChange(page as number)}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'w-9 h-9 text-xs font-semibold rounded-lg transition-all',
              isCurrent
                ? 'bg-primary-500 text-white shadow-lake-sm'
                : 'border border-surface-border text-text-secondary hover:text-text-primary hover:bg-gray-50'
            )}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next Page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-border text-text-secondary hover:text-text-primary hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
