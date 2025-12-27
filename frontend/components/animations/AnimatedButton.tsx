'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { scaleUp } from '@/lib/animations'

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: ReactNode
  ripple?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ripple = true, className, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        const rippleElement = document.createElement('span')
        rippleElement.style.width = rippleElement.style.height = `${size}px`
        rippleElement.style.left = `${x}px`
        rippleElement.style.top = `${y}px`
        rippleElement.className =
          'absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_0.6s_ease-out]'

        button.appendChild(rippleElement)

        setTimeout(() => rippleElement.remove(), 600)
      }

      onClick?.(e)
    }

    return (
      <motion.button
        ref={ref}
        variants={scaleUp}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={handleClick}
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'
