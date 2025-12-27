import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  loading?: boolean
  header?: ReactNode
  footer?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      loading = false,
      header,
      footer,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg bg-white transition-all duration-200'

    const variantStyles = {
      default: 'border border-gray-200',
      elevated: 'shadow-md',
      bordered: 'border-2 border-gray-300',
      interactive: 'border border-gray-200 cursor-pointer',
    }

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    }

    const hoverStyles = hoverable
      ? 'hover:shadow-lg hover:scale-[1.01] hover:border-primary-300'
      : ''

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
        ) : (
          <>
            {header && (
              <div className="mb-4 border-b border-gray-200 pb-4">{header}</div>
            )}
            {children}
            {footer && (
              <div className="mt-4 border-t border-gray-200 pt-4">{footer}</div>
            )}
          </>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'
