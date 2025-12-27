'use client'

import { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    const inputStyles = cn(
      'h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
      error
        ? 'border-error-500 focus:ring-error-500'
        : 'border-gray-300 hover:border-gray-400',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    )

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none',
              isFocused || hasValue
                ? 'top-0 -translate-y-1/2 bg-white px-1 text-xs text-primary-500'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
            )}
          >
            {label}
          </label>
        )}

        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs text-error-500 animate-slideInDown">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
