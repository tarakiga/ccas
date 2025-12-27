/**
 * Audit Logs API Route
 * Only accessible to users with audit permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  requireAudit,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/middleware/auth'
import { getAuditLogs } from '@/lib/utils/audit-log'

// GET /api/audit-logs - Get audit logs (requires audit permission)
export async function GET(request: NextRequest) {
  const authResult = await requireAudit(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') as any || undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      permissionLevel: searchParams.get('permissionLevel')
        ? parseInt(searchParams.get('permissionLevel')!) as 1 | 2 | 3
        : undefined,
    }

    // Get audit logs
    const logs = getAuditLogs(filters)

    return createSuccessResponse({
      logs,
      total: logs.length,
      filters,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return createErrorResponse('Failed to fetch audit logs', 500)
  }
}

// POST /api/audit-logs - Create audit log entry (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In production, validate and store the audit log
    // For now, just acknowledge receipt
    console.log('[AUDIT LOG RECEIVED]', body)

    return createSuccessResponse({ received: true })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return createErrorResponse('Failed to create audit log', 500)
  }
}
