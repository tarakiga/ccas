'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInProps {
  children: ReactNode
  from?: 'left' | 'right' | 'top' | 'bottom'
  duration?: number
  delay?: number
  className?: string
}

export function SlideIn({
  children,
  from = 'left',
  duration = 0.3,
  delay = 0,
  className,
}: SlideInProps) {
  const variants = {
    left: {
      hidden: { x: '-100%', opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    right: {
      hidden: { x: '100%', opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    top: {
      hidden: { y: '-100%', opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    bottom: {
      hidden: { y: '100%', opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants[from]}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
