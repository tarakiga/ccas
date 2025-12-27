/**
 * Shipment API Route with Permission Checks
 * Example implementation showing how to use auth middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  requireAuth,
  requireEditPermission,
  requireDeletePermission,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/middleware/auth'
import { logAuditEvent, logLevel3Operation } from '@/lib/utils/audit-log'

// GET /api/shipments/[id] - View shipment (requires authentication)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  try {
    // Get shipment from database/mock
    const shipment = await getShipmentById(params.id)

    if (!shipment) {
      return createErrorResponse('Shipment not found', 404)
    }

    // Log audit event
    logAuditEvent(user, 'VIEW', 'shipment', params.id)

    return createSuccessResponse(shipment)
  } catch (error) {
    console.error('Error fetching shipment:', error)
    return createErrorResponse('Failed to fetch shipment', 500)
  }
}

// PUT /api/shipments/[id] - Update shipment (requires edit permission)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireEditPermission(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  try {
    const body = await request.json()

    // Validate request body
    if (!body) {
      return createErrorResponse('Request body is required', 400)
    }

    // Update shipment
    const updatedShipment = await updateShipment(params.id, body)

    if (!updatedShipment) {
      return createErrorResponse('Shipment not found', 404)
    }

    // Log audit event
    logAuditEvent(user, 'UPDATE', 'shipment', params.id, {
      changes: body,
    })

    return createSuccessResponse(updatedShipment, 'Shipment updated successfully')
  } catch (error) {
    console.error('Error updating shipment:', error)
    return createErrorResponse('Failed to update shipment', 500)
  }
}

// DELETE /api/shipments/[id] - Delete shipment (requires Level 3 permission)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireDeletePermission(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  try {
    // Get shipment before deletion for audit log
    const shipment = await getShipmentById(params.id)

    if (!shipment) {
      return createErrorResponse('Shipment not found', 404)
    }

    // Delete shipment
    await deleteShipment(params.id)

    // Log Level 3 operation
    logLevel3Operation(user, 'DELETE', 'shipment', params.id, {
      shipmentNumber: shipment.shipmentNumber,
      deletedData: shipment,
    })

    return createSuccessResponse(
      { id: params.id, deleted: true },
      'Shipment deleted successfully'
    )
  } catch (error) {
    console.error('Error deleting shipment:', error)
    return createErrorResponse('Failed to delete shipment', 500)
  }
}

// Mock database functions (replace with real implementation)
async function getShipmentById(id: string) {
  // TODO: Implement actual database query
  return {
    id: id,
    shipmentNumber: 'SH-2024-001',
    status: 'in_progress',
    // ... other fields
  }
}

async function updateShipment(id: string, data: any) {
  // TODO: Implement actual database update
  return {
    id: id,
    ...data,
    updatedAt: new Date(),
  }
}

async function deleteShipment(_id: string) {
  // TODO: Implement actual database deletion
  return true
}
