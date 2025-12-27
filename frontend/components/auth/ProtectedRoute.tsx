'use client'

import { ReactNode } from 'react'
import { useRequireAuth } from '@/lib/auth'
import { Loading } from '@/components/ui'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Authenticating..." />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useRequireAuth
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
