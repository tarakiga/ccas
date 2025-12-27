'use client'

import { useEffect, useState, useRef } from 'react'
import { useAnimation, useInView } from 'framer-motion'

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to animate elements when they come into view
 */
export function useScrollAnimation() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}

/**
 * Hook for stagger animation with custom delay
 */
export function useStaggerAnimation(delayPerItem: number = 0.1) {
  const controls = useAnimation()
  const [hasAnimated, setHasAnimated] = useState(false)

  const startAnimation = async () => {
    if (!hasAnimated) {
      await controls.start((i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * delayPerItem },
      }))
      setHasAnimated(true)
    }
  }

  return { controls, startAnimation, hasAnimated }
}

/**
 * Hook for sequential animations
 */
export function useSequentialAnimation() {
  const controls = useAnimation()

  const sequence = async (animations: Array<{ target: string; animation: any }>) => {
    for (const { target, animation } of animations) {
      await controls.start(target, animation)
    }
  }

  return { controls, sequence }
}

/**
 * Hook to create a count-up animation for numbers
 */
export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0
): number {
  const [count, setCount] = useState(start)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)

      setCount(Math.floor(start + (end - start) * percentage))

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])

  return count
}

/**
 * Hook for gesture-based animations
 */
export function useGestureAnimation() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleDragStart = () => setIsDragging(true)
  const handleDragEnd = () => setIsDragging(false)
  const handleDrag = (_: any, info: { offset: { x: number; y: number } }) => {
    setPosition(info.offset)
  }

  return {
    isDragging,
    position,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDrag: handleDrag,
    },
  }
}
