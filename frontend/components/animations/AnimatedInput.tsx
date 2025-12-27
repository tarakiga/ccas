'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedInputProps extends Omit<HTMLMotionProps<'input'>, 'ref'> {
  label?: string
  error?: string
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="relative">
        <motion.input
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            borderColor: error
              ? '#EF4444'
              : isFocused
                ? '#0066FF'
                : '#D1D5DB',
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-full rounded-lg border-2 bg-white px-3 py-2 text-sm transition-all',
            'focus:outline-none',
            className
          )}
          {...props}
        />
        {label && (
          <motion.label
            animate={{
              top: isFocused || props.value ? '0' : '50%',
              fontSize: isFocused || props.value ? '0.75rem' : '0.875rem',
              color: error ? '#EF4444' : isFocused ? '#0066FF' : '#6B7280',
            }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-3 -translate-y-1/2 bg-white px-1"
          >
            {label}
          </motion.label>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-error-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'
