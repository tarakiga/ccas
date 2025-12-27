import { Shipment, ShipmentStatus, RiskLevel } from '@/types'

export const mockShipment: Shipment = {
  id: '1',
  shipmentNumber: 'SH-2025-001',
  principal: 'Toyota Motor Corporation',
  brand: 'Lexus',
  lcNumber: 'LC-2025-001',
  eta: '2025-01-15',
  status: ShipmentStatus.IN_PROGRESS,
  currentStep: 'Step 12: Customs Declaration Submission',
  daysPostEta: 2,
  riskLevel: RiskLevel.LOW,
  createdAt: '2025-01-10T08:00:00Z',
  updatedAt: '2025-01-17T14:30:00Z',
}

export const mockShipments: Shipment[] = [
  mockShipment,
  {
    id: '2',
    shipmentNumber: 'SH-2025-002',
    principal: 'Honda Motor Co.',
    brand: 'Acura',
    lcNumber: 'LC-2025-002',
    eta: '2025-01-10',
    status: ShipmentStatus.AT_RISK,
    currentStep: 'Step 18: Customs Payment',
    daysPostEta: 7,
    riskLevel: RiskLevel.HIGH,
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-17T10:15:00Z',
  },
  {
    id: '3',
    shipmentNumber: 'SH-2025-003',
    principal: 'BMW Group',
    brand: 'BMW',
    lcNumber: 'LC-2025-003',
    eta: '2025-01-08',
    status: ShipmentStatus.DELAYED,
    currentStep: 'Step 22: Port Collection',
    daysPostEta: 9,
    riskLevel: RiskLevel.CRITICAL,
    createdAt: '2025-01-03T11:00:00Z',
    updatedAt: '2025-01-17T09:00:00Z',
  },
]
