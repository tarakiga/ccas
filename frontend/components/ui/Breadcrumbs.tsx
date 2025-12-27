'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-2 animate-fadeIn">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-600 transition-colors hover:text-primary-500"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? 'font-medium text-gray-900' : 'text-gray-600')}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <svg
                className="h-4 w-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )
      })}
    </nav>
  )
}
