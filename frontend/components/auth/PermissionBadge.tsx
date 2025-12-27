/**
 * Permission Badge Component
 * Displays user permission level and workbook access
 */

'use client'

import { Badge } from '@/components/ui/Badge'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface PermissionBadgeProps {
  type?: 'permission' | 'workbook' | 'both'
  showIcon?: boolean
}

export function PermissionBadge({ 
  type = 'permission', 
  showIcon = true 
}: PermissionBadgeProps) {
  const permissions = usePermissions()

  if (!permissions.isAuthenticated) {
    return null
  }



  const getIcon = (level: number | null) => {
    switch (level) {
      case 1:
        return '👁️' // Read Only
      case 2:
        return '✏️' // Read & Edit
      case 3:
        return '🔓' // Full Access
      default:
        return '🔒'
    }
  }

  const getVariant = (level: number | null): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (level) {
      case 1:
        return 'default' // Read Only
      case 2:
        return 'info' // Read & Edit
      case 3:
        return 'success' // Full Access
      default:
        return 'default'
    }
  }

  if (type === 'both') {
    return (
      <div className="flex gap-2">
        <Badge variant={getVariant(permissions.permissionLevel)}>
          {showIcon && <span className="mr-1">{getIcon(permissions.permissionLevel)}</span>}
          {permissions.permissionDescription}
        </Badge>
        <Badge variant="info">
          {permissions.workbookAccess?.toUpperCase()}
        </Badge>
      </div>
    )
  }

  if (type === 'workbook') {
    return (
      <Badge variant="info">
        {permissions.workbookAccess?.toUpperCase()} Access
      </Badge>
    )
  }

  return (
    <Badge variant={getVariant(permissions.permissionLevel)}>
      {showIcon && <span className="mr-1">{getIcon(permissions.permissionLevel)}</span>}
      {permissions.permissionDescription}
    </Badge>
  )
}
