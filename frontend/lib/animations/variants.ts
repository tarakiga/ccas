/**
 * Framer Motion animation variants library
 * Reusable animation configurations for consistent motion design
 */

import { Variants } from 'framer-motion'

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// Slide animations
export const slideInFromRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const slideInFromLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const slideInFromTop: Variants = {
  hidden: { y: '-100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const slideInFromBottom: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// Scale animations
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const scaleUp: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

// Card hover effect
export const cardHover: Variants = {
  initial: { scale: 1, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2 },
  },
}

// Page transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

// Modal backdrop
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// Drawer slide
export const drawerSlide: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// Collapse/Expand
export const collapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}
