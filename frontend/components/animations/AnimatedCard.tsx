'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { cardHover } from '@/lib/animations'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: ReactNode
  hoverable?: boolean
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hoverable = true, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={hoverable ? cardHover : undefined}
        initial="initial"
        whileHover={hoverable ? 'hover' : undefined}
        className={cn('rounded-lg bg-white', className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'
