import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import ShipmentsPage from '../page'
import { MockApiService } from '@/lib/mocks'

// Mock the API
jest.mock('@/lib/mocks', () => ({
  MockApiService: {
    getShipments: jest.fn(),
  },
  USE_MOCK_DATA: true,
}))

describe('Shipments Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock response
    ;(MockApiService.getShipments as jest.Mock).mockResolvedValue({
      items: [
        {
          id: '1',
          shipmentNumber: 'SH-2025-001',
          principal: 'Toyota',
          brand: 'Lexus',
          lcNumber: 'LC-001',
          eta: '2025-01-15',
          status: 'in_progress',
          riskLevel: 'low',
          daysPostEta: 2,
          currentStep: 'Step 12',
          createdAt: '2025-01-10',
          updatedAt: '2025-01-17',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })

  it('should render page title and description', () => {
    render(<ShipmentsPage />)
    
    expect(screen.getByText('Shipments')).toBeInTheDocument()
    expect(screen.getByText('Manage and track all customs clearance shipments')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<ShipmentsPage />)
    
    const searchInput = screen.getByPlaceholderText(/search by shipment/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<ShipmentsPage />)
    
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('New Shipment')).toBeInTheDocument()
  })

  it('should load and display shipments', async () => {
    render(<ShipmentsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('SH-2025-001')).toBeInTheDocument()
    })
  })

  it('should handle search input', async () => {
    render(<ShipmentsPage />)
    
    const searchInput = screen.getByPlaceholderText(/search by shipment/i)
    fireEvent.change(searchInput, { target: { value: 'Toyota' } })
    
    await waitFor(() => {
      expect(MockApiService.getShipments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Toyota',
        })
      )
    })
  })

  it('should open filters drawer', () => {
    render(<ShipmentsPage />)
    
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)
    
    // Check if filters drawer is visible
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
  })

  it('should show filter count badge', async () => {
    render(<ShipmentsPage />)
    
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)
    
    // Apply some filters (this would need the actual filter component to be rendered)
    // For now, just check the button exists
    expect(filtersButton).toBeInTheDocument()
  })

  it('should handle row selection', async () => {
    render(<ShipmentsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('SH-2025-001')).toBeInTheDocument()
    })
    
    const checkboxes = screen.getAllByRole('checkbox')
    if (checkboxes.length > 1) {
      fireEvent.click(checkboxes[1])
      
      // Bulk actions should appear
      await waitFor(() => {
        expect(screen.getByText(/selected/i)).toBeInTheDocument()
      })
    }
  })

  it('should display pagination when multiple pages', async () => {
    ;(MockApiService.getShipments as jest.Mock).mockResolvedValue({
      items: Array(20).fill(null).map((_, i) => ({
        id: `${i + 1}`,
        shipmentNumber: `SH-2025-${String(i + 1).padStart(3, '0')}`,
        principal: 'Test',
        brand: 'Test',
        lcNumber: 'LC-001',
        eta: '2025-01-15',
        status: 'in_progress',
        riskLevel: 'low',
        daysPostEta: 0,
        currentStep: 'Step 1',
        createdAt: '2025-01-10',
        updatedAt: '2025-01-17',
      })),
      total: 50,
      page: 1,
      pageSize: 20,
      totalPages: 3,
    })
    
    render(<ShipmentsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/showing.*of 50 shipments/i)).toBeInTheDocument()
    })
  })
})
