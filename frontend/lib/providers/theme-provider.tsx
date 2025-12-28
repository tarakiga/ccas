'use client'

import { useEffect } from 'react'
import { useThemeStore } from '../store/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setHydrated } = useThemeStore()

  // Call setHydrated on initial client mount to apply theme
  useEffect(() => {
    setHydrated()
  }, [setHydrated])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (useThemeStore.getState().theme === 'system') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <>{children}</>
}
