/**
 * Authentication and Permission Middleware
 * For use in API routes and server components
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  TestUser, 
  validateCredentials, 
  canUserEdit, 
  canUserDelete,
  canUserAccessStep,
  getUserByUsername,
} from '@/lib/mocks/test-users'

export interface AuthContext {
  user: TestUser
  isAuthenticated: boolean
}

/**
 * Get user from request (from session/token)
 */
export async function getUserFromRequest(request: NextRequest): Promise<TestUser | null> {
  // In a real app, get from JWT token or session
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }

  // For demo, parse Basic Auth
  if (authHeader.startsWith('Basic ')) {
    const base64 = authHeader.substring(6)
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const [username, password] = decoded.split(':')
    
    return validateCredentials(username, password)
  }

  // For demo, parse Bearer token (username)
  if (authHeader.startsWith('Bearer ')) {
    const username = authHeader.substring(7)
    return getUserByUsername(username) || null
  }

  return null
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: TestUser } | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  return { user }
}

/**
 * Require edit permission middleware
 */
export async function requireEditPermission(
  request: NextRequest
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!canUserEdit(user)) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: 'You do not have permission to edit. Required: Level 2 or higher',
        userPermissionLevel: user.permissionLevel,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Require delete permission middleware
 */
export async function requireDeletePermission(
  request: NextRequest
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!canUserDelete(user)) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: 'You do not have permission to delete. Required: Level 3 (Full Access)',
        userPermissionLevel: user.permissionLevel,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Require step access middleware
 */
export async function requireStepAccess(
  request: NextRequest,
  stepNumber: string
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!canUserAccessStep(user, stepNumber)) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: `You do not have access to step ${stepNumber}`,
        userDepartment: user.department,
        userRole: user.role,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Require specific permission middleware
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!user.permissions.includes(permission)) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: `You do not have the required permission: ${permission}`,
        userPermissions: user.permissions,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Require management role middleware
 */
export async function requireManagement(
  request: NextRequest
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (user.department !== 'Management') {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: 'This resource is only accessible to Management users',
        userDepartment: user.department,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Require audit role middleware
 */
export async function requireAudit(
  request: NextRequest
): Promise<{ user: TestUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!user.permissions.includes('audit')) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: 'This resource is only accessible to users with audit permissions',
        userRole: user.role,
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Helper to create error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
      ...details,
    },
    { status }
  )
}

/**
 * Helper to create success responses
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
  })
}
