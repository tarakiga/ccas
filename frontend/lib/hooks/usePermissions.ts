/**
 * Permission Hook
 * Provides easy access to permission-related functionality
 */

import { useAuth } from '@/lib/providers/auth-provider'

export function usePermissions() {
  const auth = useAuth()

  return {
    // User info
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    
    // Permission levels
    canEdit: auth.canEdit(),
    canDelete: auth.canDelete(),
    permissionLevel: auth.getPermissionLevel(),
    permissionDescription: auth.getPermissionDescription(),
    
    // Workbook access
    workbookAccess: auth.getWorkbookAccess(),
    workbookAccessDescription: auth.getWorkbookAccessDescription(),
    
    // Role checks
    isManagement: auth.isManagement(),
    isAudit: auth.isAudit(),
    
    // Permission checks
    hasPermission: auth.hasPermission,
    canAccessStep: auth.canAccessStep,
    getAccessibleSteps: auth.getAccessibleSteps,
    
    // Specific permission checks
    canCreateShipment: auth.hasPermission('view_shipments') && auth.hasPermission('edit_shipments'),
    canUploadDocuments: auth.hasPermission('upload_documents'),
    canManagePayments: auth.hasPermission('manage_payments'),
    canAccessReports: auth.hasPermission('reports'),
    canAccessAnalytics: auth.hasPermission('analytics'),
    canManageUsers: auth.hasPermission('user_management'),
    canConfigureSystem: auth.hasPermission('system_config'),
    
    // UI helpers
    shouldShowEditButton: auth.canEdit(),
    shouldShowDeleteButton: auth.canDelete(),
    shouldShowAdminMenu: auth.hasPermission('full_access'),
    shouldShowReportsMenu: auth.hasPermission('reports') || auth.hasPermission('analytics'),
  }
}
