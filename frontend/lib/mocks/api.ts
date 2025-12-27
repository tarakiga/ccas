/**
 * Mock API service for testing components without backend
 * Provides realistic API responses with simulated delays
 */

import { PaginatedResponse, Shipment } from '@/types'
import {
  mockShipments,
  getMockShipments as _getMockShipments,
  getMockShipment as _getMockShipment,
  generateMockShipments,
  delay,
} from './shipments'
import {
  mockDocuments,
  getMockDocumentsByShipment,
  getMockDocument,
  generateMockDocuments,
  type Document,
} from './documents'
import {
  mockAlerts,
  getMockAlertsByShipment,
  getMockUnacknowledgedAlerts as _getMockUnacknowledgedAlerts,
  getMockAlertsBySeverity as _getMockAlertsBySeverity,
  type MockAlert,
} from './alerts'
import {
  getMockWorkflowSteps,
  getMockUserTasks,
  type MockWorkflowStep,
} from './workflow'
import { AlertType, AlertSeverity } from '@/types'
import {
  mockDashboardMetrics,
  mockDepartmentMetrics,
  mockShipmentTrend,
  mockClearanceTimeTrend,
  mockStatusDistribution,
  mockRiskDistribution,
  type DashboardMetrics,
  type DepartmentMetrics,
  type TimeSeriesData,
} from './metrics'

/**
 * Mock API Service
 * Simulates backend API with realistic delays and responses
 */
export class MockApiService {
  private static allShipments = [...mockShipments, ...generateMockShipments(100)]

  // ==================== Shipments ====================

  static async getShipments(params?: {
    page?: number
    pageSize?: number
    status?: string[]
    riskLevel?: string[]
    search?: string
  }): Promise<PaginatedResponse<Shipment>> {
    await delay(300)
    
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    let filtered = [...this.allShipments]

    // Apply filters
    if (params?.status && params.status.length > 0) {
      filtered = filtered.filter((s) => params.status!.includes(s.status))
    }

    if (params?.riskLevel && params.riskLevel.length > 0) {
      filtered = filtered.filter((s) => params.riskLevel!.includes(s.riskLevel))
    }

    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(search) ||
          s.principal.toLowerCase().includes(search) ||
          s.brand.toLowerCase().includes(search) ||
          s.lcNumber.toLowerCase().includes(search) ||
          s.currentStep?.toLowerCase().includes(search)
      )
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  static async getShipment(id: string): Promise<Shipment | null> {
    await delay(200)
    return this.allShipments.find((s) => s.id === id) || null
  }

  static async createShipment(data: Partial<Shipment>): Promise<Shipment> {
    await delay(400)
    const { ShipmentStatus, RiskLevel } = await import('@/types')
    const newShipment: Shipment = {
      id: `ship-${Date.now()}`,
      shipmentNumber: `SH-2025-${String(this.allShipments.length + 1).padStart(3, '0')}`,
      principal: data.principal || '',
      brand: data.brand || '',
      lcNumber: data.lcNumber || '',
      eta: data.eta || new Date().toISOString().split('T')[0],
      status: data.status || ShipmentStatus.PENDING,
      riskLevel: data.riskLevel || RiskLevel.LOW,
      daysPostEta: 0,
      currentStep: data.currentStep || 'Step 1: Shipment Registration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.allShipments.push(newShipment)
    return newShipment
  }

  static async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment | null> {
    await delay(300)
    const index = this.allShipments.findIndex((s) => s.id === id)
    if (index === -1) return null

    this.allShipments[index] = {
      ...this.allShipments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.allShipments[index]
  }

  static async deleteShipment(id: string): Promise<boolean> {
    await delay(300)
    const index = this.allShipments.findIndex((s) => s.id === id)
    if (index === -1) return false

    this.allShipments.splice(index, 1)
    return true
  }

  // ==================== Documents ====================

  static async getDocuments(shipmentId: string): Promise<Document[]> {
    await delay(200)
    const existing = getMockDocumentsByShipment(shipmentId)
    if (existing.length > 0) return existing
    return generateMockDocuments(shipmentId, 5)
  }

  static async getDocument(id: string): Promise<Document | null> {
    await delay(150)
    return getMockDocument(id) || null
  }

  static async uploadDocument(shipmentId: string, file: File): Promise<Document> {
    await delay(800) // Simulate upload time
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      shipmentId,
      name: file.name,
      type: file.type,
      category: 'other',
      status: 'uploaded',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      size: file.size,
    }
    mockDocuments.push(newDoc)
    return newDoc
  }

  static async deleteDocument(id: string): Promise<boolean> {
    await delay(200)
    const index = mockDocuments.findIndex((d) => d.id === id)
    if (index === -1) return false

    mockDocuments.splice(index, 1)
    return true
  }

  // ==================== Alerts ====================

  static async getAlerts(params?: {
    shipmentId?: string
    type?: AlertType
    severity?: AlertSeverity
    acknowledged?: boolean
  }): Promise<MockAlert[]> {
    await delay(200)
    let filtered = [...mockAlerts]

    if (params?.shipmentId) {
      filtered = getMockAlertsByShipment(params.shipmentId)
    }

    if (params?.type) {
      filtered = filtered.filter((a) => a.type === params.type)
    }

    if (params?.severity) {
      filtered = filtered.filter((a) => a.severity === params.severity)
    }

    if (params?.acknowledged !== undefined) {
      filtered = filtered.filter((a) => a.acknowledged === params.acknowledged)
    }

    return filtered
  }

  static async acknowledgeAlert(id: string): Promise<MockAlert | null> {
    await delay(200)
    const alert = mockAlerts.find((a) => a.id === id)
    if (!alert) return null

    alert.acknowledged = true
    alert.acknowledgedBy = 'Current User'
    alert.acknowledgedAt = new Date().toISOString()
    return alert
  }

  // ==================== Workflow ====================

  static async getWorkflowSteps(shipmentId: string): Promise<MockWorkflowStep[]> {
    await delay(200)
    const shipment = this.allShipments.find((s) => s.id === shipmentId)
    if (!shipment) return []

    return getMockWorkflowSteps(shipmentId, shipment.currentStep || 'Step 1')
  }

  static async getUserTasks(): Promise<MockWorkflowStep[]> {
    await delay(200)
    return getMockUserTasks()
  }

  static async completeWorkflowStep(
    shipmentId: string,
    stepId: string,
    notes?: string
  ): Promise<MockWorkflowStep | null> {
    await delay(300)
    const { Department, StepStatus } = await import('@/types')
    // In a real implementation, this would update the step status
    return {
      id: stepId,
      shipmentId,
      stepNumber: 1,
      name: 'Mock Step',
      department: Department.BUSINESS_UNIT,
      status: StepStatus.COMPLETED,
      completedAt: new Date().toISOString(),
      notes,
    }
  }

  // ==================== Metrics & Dashboard ====================

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay(300)
    return mockDashboardMetrics
  }

  static async getDepartmentMetrics(): Promise<DepartmentMetrics[]> {
    await delay(250)
    return mockDepartmentMetrics
  }

  static async getShipmentTrend(_days: number = 30): Promise<TimeSeriesData[]> {
    await delay(200)
    return mockShipmentTrend
  }

  static async getClearanceTimeTrend(_days: number = 30): Promise<TimeSeriesData[]> {
    await delay(200)
    return mockClearanceTimeTrend
  }

  static async getStatusDistribution() {
    await delay(150)
    return mockStatusDistribution
  }

  static async getRiskDistribution() {
    await delay(150)
    return mockRiskDistribution
  }
}

/**
 * Environment flag to use mock data
 * Set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local to enable
 */
export const USE_MOCK_DATA =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

/**
 * Helper to determine if we should use mock data
 * Can be used in API hooks to fallback to mock data
 */
export function shouldUseMockData(): boolean {
  return USE_MOCK_DATA
}
