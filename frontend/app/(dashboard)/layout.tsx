'use client'

import { ReactNode } from 'react'
import { AppShell } from '@/components/layouts'
import { ProtectedRoute } from '@/components/auth'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
