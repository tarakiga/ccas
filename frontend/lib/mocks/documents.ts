/**
 * Mock document data for testing components
 */

export interface Document {
  id: string
  shipmentId: string
  name: string
  type: string
  category: 'lc' | 'customs' | 'shipping' | 'payment' | 'other'
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedBy: string
  uploadedAt: string
  size: number
  url?: string
  notes?: string
}

export const mockDocuments: Document[] = [
  // Documents for shipment 1
  {
    id: 'doc-001',
    shipmentId: '1',
    name: 'Letter of Credit.pdf',
    type: 'application/pdf',
    category: 'lc',
    status: 'verified',
    uploadedBy: 'John Doe',
    uploadedAt: '2025-01-10T09:00:00Z',
    size: 245678,
    url: '/documents/lc-001.pdf',
  },
  {
    id: 'doc-002',
    shipmentId: '1',
    name: 'Commercial Invoice.pdf',
    type: 'application/pdf',
    category: 'customs',
    status: 'verified',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2025-01-12T10:30:00Z',
    size: 189234,
  },
  {
    id: 'doc-003',
    shipmentId: '1',
    name: 'Bill of Lading.pdf',
    type: 'application/pdf',
    category: 'shipping',
    status: 'uploaded',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2025-01-15T14:20:00Z',
    size: 156789,
  },
  {
    id: 'doc-004',
    shipmentId: '1',
    name: 'Packing List.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'shipping',
    status: 'verified',
    uploadedBy: 'Sarah Williams',
    uploadedAt: '2025-01-13T11:45:00Z',
    size: 98765,
  },
  // Documents for shipment 2
  {
    id: 'doc-005',
    shipmentId: '2',
    name: 'LC Amendment.pdf',
    type: 'application/pdf',
    category: 'lc',
    status: 'pending',
    uploadedBy: 'Tom Brown',
    uploadedAt: '2025-01-08T08:15:00Z',
    size: 134567,
    notes: 'Waiting for bank approval',
  },
  {
    id: 'doc-006',
    shipmentId: '2',
    name: 'Customs Declaration.pdf',
    type: 'application/pdf',
    category: 'customs',
    status: 'rejected',
    uploadedBy: 'Emily Davis',
    uploadedAt: '2025-01-10T13:00:00Z',
    size: 223456,
    notes: 'Missing HS codes',
  },
  {
    id: 'doc-007',
    shipmentId: '2',
    name: 'Certificate of Origin.pdf',
    type: 'application/pdf',
    category: 'customs',
    status: 'uploaded',
    uploadedBy: 'David Wilson',
    uploadedAt: '2025-01-11T09:30:00Z',
    size: 167890,
  },
  // Documents for shipment 3
  {
    id: 'doc-008',
    shipmentId: '3',
    name: 'Final Invoice.pdf',
    type: 'application/pdf',
    category: 'payment',
    status: 'verified',
    uploadedBy: 'Lisa Anderson',
    uploadedAt: '2025-01-16T10:00:00Z',
    size: 198765,
  },
  {
    id: 'doc-009',
    shipmentId: '3',
    name: 'Delivery Receipt.pdf',
    type: 'application/pdf',
    category: 'shipping',
    status: 'verified',
    uploadedBy: 'Robert Taylor',
    uploadedAt: '2025-01-20T15:30:00Z',
    size: 145678,
  },
  // Documents for shipment 4
  {
    id: 'doc-010',
    shipmentId: '4',
    name: 'Insurance Certificate.pdf',
    type: 'application/pdf',
    category: 'other',
    status: 'verified',
    uploadedBy: 'Jennifer Martinez',
    uploadedAt: '2025-01-05T11:20:00Z',
    size: 178901,
  },
  {
    id: 'doc-011',
    shipmentId: '4',
    name: 'Inspection Report.pdf',
    type: 'application/pdf',
    category: 'customs',
    status: 'uploaded',
    uploadedBy: 'Michael Garcia',
    uploadedAt: '2025-01-09T14:45:00Z',
    size: 234567,
  },
]

/**
 * Get documents for a specific shipment
 */
export function getMockDocumentsByShipment(shipmentId: string): Document[] {
  return mockDocuments.filter((doc) => doc.shipmentId === shipmentId)
}

/**
 * Get single document by ID
 */
export function getMockDocument(id: string): Document | undefined {
  return mockDocuments.find((doc) => doc.id === id)
}

/**
 * Generate mock documents for a shipment
 */
export function generateMockDocuments(shipmentId: string, count: number = 5): Document[] {
  const categories: Document['category'][] = ['lc', 'customs', 'shipping', 'payment', 'other']
  const statuses: Document['status'][] = ['pending', 'uploaded', 'verified', 'rejected']
  const names = [
    'Letter of Credit.pdf',
    'Commercial Invoice.pdf',
    'Bill of Lading.pdf',
    'Packing List.xlsx',
    'Certificate of Origin.pdf',
    'Customs Declaration.pdf',
    'Insurance Certificate.pdf',
    'Inspection Report.pdf',
    'Payment Receipt.pdf',
    'Delivery Note.pdf',
  ]

  const generated: Document[] = []

  for (let i = 0; i < count; i++) {
    generated.push({
      id: `doc-gen-${shipmentId}-${i}`,
      shipmentId,
      name: names[Math.floor(Math.random() * names.length)],
      type: 'application/pdf',
      category: categories[Math.floor(Math.random() * categories.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      uploadedBy: 'Test User',
      uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      size: Math.floor(Math.random() * 500000) + 50000,
    })
  }

  return generated
}
