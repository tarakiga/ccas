/**
 * Theme Store
 * Manages light/dark mode theme state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  isHydrated: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setHydrated: () => void
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.toggle('dark', systemTheme === 'dark')
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isHydrated: false,

      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next = current === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },

      setHydrated: () => {
        set({ isHydrated: true })
        applyTheme(get().theme)
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Don't call applyTheme here - it runs on server
          // The setHydrated call will handle it on client
        }
      },
    }
  )
)

