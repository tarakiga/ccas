'use client'

import { ReactNode } from 'react'
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui'
import { FadeIn } from '@/components/animations'

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <FadeIn>
      <div className="mb-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </FadeIn>
  )
}
