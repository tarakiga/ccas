'use client'

import { ReactNode } from 'react'
import { useRequireAuth } from '@/lib/auth'
import { Loading } from '@/components/ui'
import { UserRole } from '@/types'
import Link from 'next/link'

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
    // Show login prompt instead of returning null (which causes blank page)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CCAS</h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the Customs Clearance Automation System.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
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
