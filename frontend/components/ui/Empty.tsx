import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function Empty({ title, description, icon, action, className }: EmptyProps) {
  const defaultIcon = (
    <svg
      className="h-16 w-16 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  )

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center',
        'animate-fadeIn',
        className
      )}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      {title && <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>}
      {description && <p className="mb-6 max-w-sm text-sm text-gray-600">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
