/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  require?: 'edit' | 'delete' | 'management' | 'audit'
  requirePermission?: string | string[]
  requireStep?: string
  fallback?: ReactNode
  showFallback?: boolean
}

export function PermissionGuard({
  children,
  require,
  requirePermission,
  requireStep,
  fallback = null,
  showFallback = false,
}: PermissionGuardProps) {
  const permissions = usePermissions()

  // Check permission level requirements
  if (require === 'edit' && !permissions.canEdit) {
    return showFallback ? <>{fallback}</> : null
  }

  if (require === 'delete' && !permissions.canDelete) {
    return showFallback ? <>{fallback}</> : null
  }

  if (require === 'management' && !permissions.isManagement) {
    return showFallback ? <>{fallback}</> : null
  }

  if (require === 'audit' && !permissions.isAudit) {
    return showFallback ? <>{fallback}</> : null
  }

  // Check specific permission requirements
  if (requirePermission) {
    const permissions_to_check = Array.isArray(requirePermission) 
      ? requirePermission 
      : [requirePermission]
    
    const hasAllPermissions = permissions_to_check.every(perm => 
      permissions.hasPermission(perm)
    )

    if (!hasAllPermissions) {
      return showFallback ? <>{fallback}</> : null
    }
  }

  // Check step access requirement
  if (requireStep && !permissions.canAccessStep(requireStep)) {
    return showFallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function EditGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGuard require="edit" fallback={fallback}>{children}</PermissionGuard>
}

export function DeleteGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGuard require="delete" fallback={fallback}>{children}</PermissionGuard>
}

export function ManagementGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGuard require="management" fallback={fallback}>{children}</PermissionGuard>
}

export function AuditGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGuard require="audit" fallback={fallback}>{children}</PermissionGuard>
}
