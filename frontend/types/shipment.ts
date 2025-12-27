export interface Shipment {
  id: string
  shipmentNumber: string
  principal: string
  brand: string
  lcNumber: string
  eta: string
  status: ShipmentStatus
  currentStep?: string
  daysPostEta: number
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ShipmentFilters {
  status?: ShipmentStatus[]
  riskLevel?: RiskLevel[]
  department?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}
