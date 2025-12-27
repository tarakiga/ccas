import { Shipment, ShipmentStatus, RiskLevel, PaginatedResponse } from '@/types'

/**
 * Mock shipment data for testing components
 */
export const mockShipments: Shipment[] = [
  {
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
  },
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
    principal: 'Nissan Motor Company',
    brand: 'Infiniti',
    lcNumber: 'LC-2025-003',
    eta: '2025-01-20',
    status: ShipmentStatus.COMPLETED,
    currentStep: 'Step 34: Delivery to Warehouse',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T16:45:00Z',
  },
  {
    id: '4',
    shipmentNumber: 'SH-2025-004',
    principal: 'BMW Group',
    brand: 'BMW',
    lcNumber: 'LC-2025-004',
    eta: '2025-01-08',
    status: ShipmentStatus.DELAYED,
    currentStep: 'Step 22: Port Collection',
    daysPostEta: 9,
    riskLevel: RiskLevel.CRITICAL,
    createdAt: '2025-01-03T11:00:00Z',
    updatedAt: '2025-01-17T09:00:00Z',
  },
  {
    id: '5',
    shipmentNumber: 'SH-2025-005',
    principal: 'Mercedes-Benz Group',
    brand: 'Mercedes-Benz',
    lcNumber: 'LC-2025-005',
    eta: '2025-01-12',
    status: ShipmentStatus.AT_RISK,
    currentStep: 'Step 15: Bayan Submission',
    daysPostEta: 5,
    riskLevel: RiskLevel.MEDIUM,
    createdAt: '2025-01-07T08:30:00Z',
    updatedAt: '2025-01-17T11:20:00Z',
  },
  {
    id: '6',
    shipmentNumber: 'SH-2025-006',
    principal: 'Volkswagen Group',
    brand: 'Audi',
    lcNumber: 'LC-2025-006',
    eta: '2025-01-18',
    status: ShipmentStatus.IN_PROGRESS,
    currentStep: 'Step 8: LC Opening',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-13T09:00:00Z',
    updatedAt: '2025-01-18T08:00:00Z',
  },
  {
    id: '7',
    shipmentNumber: 'SH-2025-007',
    principal: 'Hyundai Motor Company',
    brand: 'Genesis',
    lcNumber: 'LC-2025-007',
    eta: '2025-01-14',
    status: ShipmentStatus.IN_PROGRESS,
    currentStep: 'Step 20: Customs Inspection',
    daysPostEta: 3,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-09T10:00:00Z',
    updatedAt: '2025-01-17T13:00:00Z',
  },
  {
    id: '8',
    shipmentNumber: 'SH-2025-008',
    principal: 'Mazda Motor Corporation',
    brand: 'Mazda',
    lcNumber: 'LC-2025-008',
    eta: '2025-01-11',
    status: ShipmentStatus.AT_RISK,
    currentStep: 'Step 25: DAN Signing',
    daysPostEta: 6,
    riskLevel: RiskLevel.HIGH,
    createdAt: '2025-01-06T11:00:00Z',
    updatedAt: '2025-01-17T15:00:00Z',
  },
  {
    id: '9',
    shipmentNumber: 'SH-2025-009',
    principal: 'Subaru Corporation',
    brand: 'Subaru',
    lcNumber: 'LC-2025-009',
    eta: '2025-01-22',
    status: ShipmentStatus.PENDING,
    currentStep: 'Step 1: Shipment Registration',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-17T08:00:00Z',
    updatedAt: '2025-01-17T08:00:00Z',
  },
  {
    id: '10',
    shipmentNumber: 'SH-2025-010',
    principal: 'Mitsubishi Motors',
    brand: 'Mitsubishi',
    lcNumber: 'LC-2025-010',
    eta: '2025-01-16',
    status: ShipmentStatus.IN_PROGRESS,
    currentStep: 'Step 10: Pre-clearance Documentation',
    daysPostEta: 1,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-11T09:30:00Z',
    updatedAt: '2025-01-17T12:00:00Z',
  },
  {
    id: '11',
    shipmentNumber: 'SH-2025-011',
    principal: 'Porsche AG',
    brand: 'Porsche',
    lcNumber: 'LC-2025-011',
    eta: '2025-01-09',
    status: ShipmentStatus.DELAYED,
    currentStep: 'Step 28: Final Clearance',
    daysPostEta: 8,
    riskLevel: RiskLevel.CRITICAL,
    createdAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-17T16:00:00Z',
  },
  {
    id: '12',
    shipmentNumber: 'SH-2025-012',
    principal: 'Jaguar Land Rover',
    brand: 'Land Rover',
    lcNumber: 'LC-2025-012',
    eta: '2025-01-19',
    status: ShipmentStatus.IN_PROGRESS,
    currentStep: 'Step 14: Document Verification',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-14T11:00:00Z',
    updatedAt: '2025-01-19T09:00:00Z',
  },
  {
    id: '13',
    shipmentNumber: 'SH-2025-013',
    principal: 'Volvo Car Corporation',
    brand: 'Volvo',
    lcNumber: 'LC-2025-013',
    eta: '2025-01-13',
    status: ShipmentStatus.AT_RISK,
    currentStep: 'Step 19: Customs Release',
    daysPostEta: 4,
    riskLevel: RiskLevel.MEDIUM,
    createdAt: '2025-01-08T08:00:00Z',
    updatedAt: '2025-01-17T14:00:00Z',
  },
  {
    id: '14',
    shipmentNumber: 'SH-2025-014',
    principal: 'Tesla Inc.',
    brand: 'Tesla',
    lcNumber: 'LC-2025-014',
    eta: '2025-01-21',
    status: ShipmentStatus.PENDING,
    currentStep: 'Step 2: LC Application',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-16T12:00:00Z',
    updatedAt: '2025-01-16T12:00:00Z',
  },
  {
    id: '15',
    shipmentNumber: 'SH-2025-015',
    principal: 'Ford Motor Company',
    brand: 'Lincoln',
    lcNumber: 'LC-2025-015',
    eta: '2025-01-17',
    status: ShipmentStatus.IN_PROGRESS,
    currentStep: 'Step 16: Customs Payment Processing',
    daysPostEta: 0,
    riskLevel: RiskLevel.LOW,
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z',
  },
]

/**
 * Get paginated mock shipments
 */
export function getMockShipments(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: ShipmentStatus[]
    riskLevel?: RiskLevel[]
    search?: string
  }
): PaginatedResponse<Shipment> {
  let filtered = [...mockShipments]

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter((s) => filters.status!.includes(s.status))
  }

  if (filters?.riskLevel && filters.riskLevel.length > 0) {
    filtered = filtered.filter((s) => filters.riskLevel!.includes(s.riskLevel))
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.shipmentNumber.toLowerCase().includes(search) ||
        s.principal.toLowerCase().includes(search) ||
        s.brand.toLowerCase().includes(search) ||
        s.lcNumber.toLowerCase().includes(search)
    )
  }

  // Paginate
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = filtered.slice(start, end)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Get single mock shipment by ID
 */
export function getMockShipment(id: string): Shipment | undefined {
  return mockShipments.find((s) => s.id === id)
}

/**
 * Generate additional mock shipments for testing large datasets
 */
export function generateMockShipments(count: number): Shipment[] {
  const principals = [
    'Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Porsche', 'Volvo',
    'Jaguar', 'Land Rover', 'Tesla', 'Ford', 'Chevrolet', 'Lexus'
  ]
  
  const brands = [
    'Lexus', 'Acura', 'Infiniti', 'Genesis', 'Cadillac', 'Lincoln',
    'Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Volvo', 'Tesla'
  ]

  const statuses = Object.values(ShipmentStatus)

  const generated: Shipment[] = []

  for (let i = 0; i < count; i++) {
    const daysPostEta = Math.floor(Math.random() * 10)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    let riskLevel: RiskLevel
    if (daysPostEta >= 7) riskLevel = RiskLevel.CRITICAL
    else if (daysPostEta >= 5) riskLevel = RiskLevel.HIGH
    else if (daysPostEta >= 3) riskLevel = RiskLevel.MEDIUM
    else riskLevel = RiskLevel.LOW

    const etaDate = new Date()
    etaDate.setDate(etaDate.getDate() - daysPostEta)

    generated.push({
      id: `mock-${i + 100}`,
      shipmentNumber: `SH-2025-${String(i + 100).padStart(3, '0')}`,
      principal: principals[Math.floor(Math.random() * principals.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      lcNumber: `LC-2025-${String(i + 100).padStart(3, '0')}`,
      eta: etaDate.toISOString().split('T')[0],
      status,
      currentStep: `Step ${Math.floor(Math.random() * 34) + 1}: Processing`,
      daysPostEta,
      riskLevel,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return generated
}

/**
 * Mock API delay simulation
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock paginated response
 */
export async function mockGetShipments(
  page: number = 1,
  pageSize: number = 20,
  filters?: any
): Promise<PaginatedResponse<Shipment>> {
  await delay(300) // Simulate network delay
  return getMockShipments(page, pageSize, filters)
}

/**
 * Mock single shipment response
 */
export async function mockGetShipment(id: string): Promise<Shipment | null> {
  await delay(200)
  return getMockShipment(id) || null
}
