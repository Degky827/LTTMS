import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface TabItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'underline' | 'pills' | 'enclosed'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar select-none',
        variant === 'underline' && 'border-b border-surface-border',
        variant === 'pills' && 'bg-surface-muted p-1 rounded-xl border border-surface-border',
        variant === 'enclosed' && 'border-b border-surface-border',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all',
                isActive
                  ? 'bg-white text-primary-600 shadow-lake-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/50',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span>{tab.badge}</span>}
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all relative border-b-2 -mb-[2px]',
              isActive
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span>{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
