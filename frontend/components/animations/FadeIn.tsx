'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeIn } from '@/lib/animations'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.3, className }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
