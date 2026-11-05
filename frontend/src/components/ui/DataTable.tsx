import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  key: string
  header: React.ReactNode
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  emptyMessage?: React.ReactNode
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records available',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-surface-border bg-white shadow-lake-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-muted border-b border-surface-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary select-none',
                    alignClasses[col.align || 'left'],
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <Skeleton variant="text" width={cIdx === 0 ? '60%' : '80%'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span className="text-xs font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'transition-colors hover:bg-surface-muted/60',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-4 text-xs font-medium text-text-primary',
                        alignClasses[col.align || 'left'],
                        col.className
                      )}
                    >
                      {col.render ? col.render(item, index) : ((item as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
