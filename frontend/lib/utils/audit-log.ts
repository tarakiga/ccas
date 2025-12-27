/**
 * Audit Logging Utility
 * Logs Level 3 operations and permission-related actions
 */

import { TestUser } from '@/lib/mocks/test-users'

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userEmail: string
  permissionLevel: 1 | 2 | 3
  action: AuditAction
  resource: string
  resourceId: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'COMPLETE_STEP'
  | 'UPLOAD_DOCUMENT'
  | 'DELETE_DOCUMENT'
  | 'APPROVE_PAYMENT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'

// In-memory storage for demo (replace with API call in production)
const auditLogs: AuditLogEntry[] = []

/**
 * Log an audit event
 */
export function logAuditEvent(
  user: TestUser,
  action: AuditAction,
  resource: string,
  resourceId: string,
  details?: Record<string, any>
): void {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    permissionLevel: user.permissionLevel,
    action,
    resource,
    resourceId,
    details,
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
  }

  auditLogs.push(entry)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', {
      user: user.name,
      action,
      resource,
      resourceId,
      permissionLevel: user.permissionLevel,
      timestamp: entry.timestamp.toISOString(),
    })
  }

  // In production, send to API
  if (process.env.NODE_ENV === 'production') {
    sendAuditLogToAPI(entry).catch(error => {
      console.error('Failed to send audit log:', error)
    })
  }
}

/**
 * Log Level 3 operations (delete, bulk operations)
 */
export function logLevel3Operation(
  user: TestUser,
  action: AuditAction,
  resource: string,
  resourceId: string,
  details?: Record<string, any>
): void {
  if (user.permissionLevel !== 3) {
    console.warn('Attempted Level 3 operation without proper permissions:', {
      user: user.name,
      action,
      resource,
    })
    return
  }

  logAuditEvent(user, action, resource, resourceId, {
    ...details,
    level3Operation: true,
    requiresReview: true,
  })
}

/**
 * Get all audit logs (for audit users)
 */
export function getAuditLogs(filters?: {
  userId?: string
  action?: AuditAction
  resource?: string
  startDate?: Date
  endDate?: Date
  permissionLevel?: 1 | 2 | 3
}): AuditLogEntry[] {
  let filtered = [...auditLogs]

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId)
  }

  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action)
  }

  if (filters?.resource) {
    filtered = filtered.filter(log => log.resource === filters.resource)
  }

  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!)
  }

  if (filters?.permissionLevel) {
    filtered = filtered.filter(log => log.permissionLevel === filters.permissionLevel)
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get audit logs for a specific resource
 */
export function getResourceAuditTrail(
  resource: string,
  resourceId: string
): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.resource === resource && log.resourceId === resourceId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get Level 3 operations for review
 */
export function getLevel3Operations(startDate?: Date): AuditLogEntry[] {
  let filtered = auditLogs.filter(log => log.permissionLevel === 3)

  if (startDate) {
    filtered = filtered.filter(log => log.timestamp >= startDate)
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = [
    'Timestamp',
    'User',
    'Email',
    'Permission Level',
    'Action',
    'Resource',
    'Resource ID',
    'Details',
  ]

  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.userName,
    log.userEmail,
    log.permissionLevel.toString(),
    log.action,
    log.resource,
    log.resourceId,
    JSON.stringify(log.details || {}),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Helper functions
 */
function getClientIP(): string {
  // In a real app, get from request headers
  return 'unknown'
}

function getUserAgent(): string {
  if (typeof window !== 'undefined') {
    return window.navigator.userAgent
  }
  return 'unknown'
}

async function sendAuditLogToAPI(entry: AuditLogEntry): Promise<void> {
  // In production, send to your audit log API
  await fetch('/api/audit-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })
}

/**
 * Clear audit logs (admin only, for testing)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0
  console.log('[AUDIT] Logs cleared')
}
