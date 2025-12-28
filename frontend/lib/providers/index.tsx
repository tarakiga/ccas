'use client'

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

// TEMPORARY: Minimal providers to debug blank screen
export function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}

