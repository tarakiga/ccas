'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  delayChildren?: number
  className?: string
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className,
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        ...staggerContainer,
        visible: {
          ...staggerContainer.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
