'use client'

import { useUserStore } from '@/store'
import { useEffect } from 'react'

export function useAuth() {
  const { user } = useUserStore()

  // Mock auth for development - will be replaced with Auth0
  const isLoading = false
  const error = null

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  }
}

export function useRequireAuth() {
  const { user } = useAuth()
  const isLoading = false

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      // window.location.href = '/api/auth/login'
    }
  }, [user, isLoading])

  return { user, isLoading }
}
