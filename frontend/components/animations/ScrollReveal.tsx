'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useScrollAnimation } from '@/lib/animations'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const { ref, controls } = useScrollAnimation()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
