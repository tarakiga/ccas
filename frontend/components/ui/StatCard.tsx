'use client'

import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  animate?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  loading = false,
  animate = true,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)

  useEffect(() => {
    if (animate && typeof value === 'number') {
      const duration = 1000
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value, animate])

  const trendStyles = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-gray-600',
  }

  const trendIcons = {
    up: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    down: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    neutral: null,
  }

  if (loading) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200',
        'hover:shadow-md hover:border-primary-300',
        'animate-fadeIn',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </p>
          {(change !== undefined || changeLabel) && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {trend && trendIcons[trend] && (
                <span className={trendStyles[trend]}>{trendIcons[trend]}</span>
              )}
              {change !== undefined && (
                <span className={trend ? trendStyles[trend] : 'text-gray-600'}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              )}
              {changeLabel && <span className="text-gray-600">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
