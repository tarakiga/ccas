'use client'

import Lottie, { LottieComponentProps } from 'lottie-react'
import { cn } from '@/lib/utils'

interface LottieAnimationProps extends Omit<LottieComponentProps, 'animationData'> {
  animationData: any
  className?: string
}

export function LottieAnimation({
  animationData,
  className,
  ...props
}: LottieAnimationProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Lottie animationData={animationData} {...props} />
    </div>
  )
}

// Placeholder animation data (to be replaced with actual Lottie files)
export const loadingAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Loading',
  ddd: 0,
  assets: [],
  layers: [],
}

export const successAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Success',
  ddd: 0,
  assets: [],
  layers: [],
}

export const errorAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Error',
  ddd: 0,
  assets: [],
  layers: [],
}

export const emptyStateAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Empty',
  ddd: 0,
  assets: [],
  layers: [],
}
