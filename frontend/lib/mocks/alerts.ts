/**
 * Mock alert data for testing components
 */

import { Alert, AlertType, AlertSeverity } from '@/types'

// Extended alert interface for mock data with additional fields
export interface MockAlert extends Alert {
  category?: 'delay' | 'document' | 'payment' | 'customs' | 'system'
  description?: string
  acknowledged?: boolean
}

export const mockAlerts: MockAlert[] = [
  {
    id: 'alert-001',
    shipmentId: '4',
    shipmentNumber: 'SH-2025-004',
    type: AlertType.DEMURRAGE_RISK,
    severity: AlertSeverity.CRITICAL,
    category: 'delay',
    message: 'Shipment critically delayed',
    description: 'Shipment is 9 days post-ETA. Immediate action required to avoid additional demurrage charges.',
    createdAt: '2025-01-17T09:00:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    shipmentId: '11',
    shipmentNumber: 'SH-2025-011',
    type: AlertType.STEP_OVERDUE,
    severity: AlertSeverity.CRITICAL,
    category: 'delay',
    message: 'Shipment critically delayed',
    description: 'Shipment is 8 days post-ETA. Final clearance pending.',
    createdAt: '2025-01-17T10:30:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    shipmentId: '2',
    shipmentNumber: 'SH-2025-002',
    type: AlertType.ETA_APPROACHING,
    severity: AlertSeverity.WARNING,
    category: 'delay',
    message: 'Shipment at risk of delay',
    description: 'Shipment is 7 days post-ETA. Customs payment pending.',
    createdAt: '2025-01-17T11:15:00Z',
    acknowledged: true,
    acknowledgedBy: 'John Doe',
    acknowledgedAt: '2025-01-17T14:00:00Z',
  },
  {
    id: 'alert-004',
    shipmentId: '8',
    shipmentNumber: 'SH-2025-008',
    type: AlertType.STEP_OVERDUE,
    severity: AlertSeverity.WARNING,
    category: 'delay',
    message: 'Shipment at risk of delay',
    description: 'Shipment is 6 days post-ETA. DAN signing in progress.',
    createdAt: '2025-01-17T12:00:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-005',
    shipmentId: '5',
    shipmentNumber: 'SH-2025-005',
    type: AlertType.DOCUMENT_MISSING,
    severity: AlertSeverity.WARNING,
    category: 'document',
    message: 'Missing required documents',
    description: 'Certificate of Origin not yet uploaded. Required for Bayan submission.',
    createdAt: '2025-01-17T08:30:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-006',
    shipmentId: '2',
    shipmentNumber: 'SH-2025-002',
    type: AlertType.DOCUMENT_MISSING,
    severity: AlertSeverity.CRITICAL,
    category: 'document',
    message: 'Document rejected',
    description: 'Customs Declaration rejected due to missing HS codes. Resubmission required.',
    createdAt: '2025-01-16T15:45:00Z',
    acknowledged: true,
    acknowledgedBy: 'Emily Davis',
    acknowledgedAt: '2025-01-16T16:30:00Z',
  },
  {
    id: 'alert-007',
    shipmentId: '13',
    shipmentNumber: 'SH-2025-013',
    type: AlertType.ETA_APPROACHING,
    severity: AlertSeverity.WARNING,
    category: 'customs',
    message: 'Customs inspection scheduled',
    description: 'Physical inspection scheduled for tomorrow at 10:00 AM.',
    createdAt: '2025-01-17T13:20:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-008',
    shipmentId: '7',
    shipmentNumber: 'SH-2025-007',
    type: AlertType.ETA_APPROACHING,
    severity: AlertSeverity.INFO,
    category: 'customs',
    message: 'Customs inspection completed',
    description: 'Inspection completed successfully. Awaiting final release.',
    createdAt: '2025-01-17T14:00:00Z',
    acknowledged: true,
    acknowledgedBy: 'Mike Johnson',
    acknowledgedAt: '2025-01-17T14:15:00Z',
  },
  {
    id: 'alert-009',
    shipmentId: '4',
    shipmentNumber: 'SH-2025-004',
    type: AlertType.PAYMENT_DUE,
    severity: AlertSeverity.CRITICAL,
    category: 'payment',
    message: 'Demurrage charges accruing',
    description: 'Container has exceeded free time. Demurrage charges: $450/day.',
    createdAt: '2025-01-15T09:00:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-010',
    shipmentId: '1',
    shipmentNumber: 'SH-2025-001',
    type: AlertType.ETA_APPROACHING,
    severity: AlertSeverity.INFO,
    category: 'system',
    message: 'Workflow step completed',
    description: 'Customs Declaration Submission completed successfully.',
    createdAt: '2025-01-17T16:30:00Z',
    acknowledged: true,
    acknowledgedBy: 'System',
    acknowledgedAt: '2025-01-17T16:30:00Z',
  },
]

/**
 * Get alerts for a specific shipment
 */
export function getMockAlertsByShipment(shipmentId: string): MockAlert[] {
  return mockAlerts.filter((alert) => alert.shipmentId === shipmentId)
}

/**
 * Get unacknowledged alerts
 */
export function getMockUnacknowledgedAlerts(): MockAlert[] {
  return mockAlerts.filter((alert) => !alert.acknowledged)
}

/**
 * Get alerts by type
 */
export function getMockAlertsByType(type: AlertType): MockAlert[] {
  return mockAlerts.filter((alert) => alert.type === type)
}

/**
 * Get alerts by severity
 */
export function getMockAlertsBySeverity(severity: AlertSeverity): MockAlert[] {
  return mockAlerts.filter((alert) => alert.severity === severity)
}

/**
 * Get alerts by category
 */
export function getMockAlertsByCategory(category: 'delay' | 'document' | 'payment' | 'customs' | 'system'): MockAlert[] {
  return mockAlerts.filter((alert) => alert.category === category)
}

/**
 * Generate mock alerts
 */
export function generateMockAlerts(count: number): MockAlert[] {
  const types = Object.values(AlertType)
  const severities = Object.values(AlertSeverity)
  const categories: Array<'delay' | 'document' | 'payment' | 'customs' | 'system'> = ['delay', 'document', 'payment', 'customs', 'system']
  const messages: Record<'delay' | 'document' | 'payment' | 'customs' | 'system', string[]> = {
    delay: ['Shipment critically delayed', 'Shipment at risk of delay', 'ETA approaching'],
    document: ['Missing required documents', 'Document rejected', 'Document verification pending'],
    payment: ['Payment overdue', 'Demurrage charges accruing', 'Payment processed'],
    customs: ['Customs inspection scheduled', 'Customs hold', 'Customs release approved'],
    system: ['Workflow step completed', 'System maintenance scheduled', 'Update available'],
  }

  const generated: MockAlert[] = []

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const categoryMessages = messages[category]
    const message = categoryMessages[Math.floor(Math.random() * categoryMessages.length)]

    const alert: MockAlert = {
      id: `alert-gen-${i}`,
      shipmentId: `${Math.floor(Math.random() * 15) + 1}`,
      shipmentNumber: `SH-2025-${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}`,
      type,
      severity,
      message,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      category,
      description: `Generated alert description for ${message}`,
      acknowledged: Math.random() > 0.5,
    }

    generated.push(alert)
  }

  return generated
}
