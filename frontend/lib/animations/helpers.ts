/**
 * Animation helper utilities
 */

import { Transition } from 'framer-motion'

/**
 * Easing functions
 */
export const easings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.46, 0.45, 0.94],
} as const

/**
 * Duration presets (in seconds)
 */
export const durations = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const

/**
 * Create a spring transition
 */
export function createSpringTransition(
  stiffness: number = 300,
  damping: number = 24
): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  }
}

/**
 * Create a tween transition with custom easing
 */
export function createTweenTransition(
  duration: number = durations.base,
  ease: keyof typeof easings = 'easeOut'
): Transition {
  return {
    type: 'tween',
    duration,
    ease: easings[ease] as any,
  }
}

/**
 * Create a stagger transition
 */
export function createStaggerTransition(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Transition {
  return {
    staggerChildren,
    delayChildren,
  }
}

/**
 * Calculate stagger delay for an item
 */
export function getStaggerDelay(index: number, delayPerItem: number = 0.1): number {
  return index * delayPerItem
}

/**
 * Create a parallax effect value
 */
export function createParallaxValue(scrollY: number, speed: number = 0.5): number {
  return scrollY * speed
}

/**
 * Interpolate between two values
 */
export function interpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  const [inputMin, inputMax] = inputRange
  const [outputMin, outputMax] = outputRange

  const clampedValue = Math.max(inputMin, Math.min(inputMax, value))
  const inputProgress = (clampedValue - inputMin) / (inputMax - inputMin)

  return outputMin + inputProgress * (outputMax - outputMin)
}

/**
 * Create a ripple effect animation
 */
export function createRippleEffect(
  x: number,
  y: number,
  element: HTMLElement
): Animation | null {
  const ripple = document.createElement('span')
  const rect = element.getBoundingClientRect()

  const size = Math.max(rect.width, rect.height)
  const left = x - rect.left - size / 2
  const top = y - rect.top - size / 2

  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${left}px`
  ripple.style.top = `${top}px`
  ripple.className = 'ripple'

  element.appendChild(ripple)

  const animation = ripple.animate(
    [
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(2)', opacity: 0 },
    ],
    {
      duration: 600,
      easing: 'ease-out',
    }
  )

  animation.onfinish = () => ripple.remove()

  return animation
}

/**
 * Check if animations should be reduced
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation config based on reduced motion preference
 */
export function getAnimationConfig<T>(
  normalConfig: T,
  reducedConfig: T
): T {
  return shouldReduceMotion() ? reducedConfig : normalConfig
}
