import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export interface DropdownItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
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

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 w-56 rounded-xl bg-white shadow-lake-lg border border-surface-border py-1.5 focus:outline-none animate-slide-down',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick()
                  setIsOpen(false)
                }
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left transition-colors select-none',
                item.danger
                  ? 'text-status-danger hover:bg-red-50'
                  : 'text-text-primary hover:bg-primary-50/70 hover:text-primary-600',
                item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
              )}
            >
              {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
