import React from 'react'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { cn } from '@/lib/utils/cn'

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-3 pb-6 border-b border-surface-border mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-1" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary font-heading">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
