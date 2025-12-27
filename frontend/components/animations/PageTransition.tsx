'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { pageTransition } from '@/lib/animations'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
