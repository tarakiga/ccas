import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { ShipmentTableNew } from '../ShipmentTableNew'
import { mockShipments } from '@/__tests__/fixtures/shipments'

describe('ShipmentTableNew', () => {
  const defaultProps = {
    shipments: mockShipments,
    loading: false,
    selectedIds: [],
    onSelectRow: jest.fn(),
    onSelectAll: jest.fn(),
    visibleColumns: ['shipmentNumber', 'principal', 'brand', 'eta', 'status', 'daysPostEta', 'riskLevel'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render shipments table', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      expect(screen.getByText('SH-2025-001')).toBeInTheDocument()
      expect(screen.getByText('SH-2025-002')).toBeInTheDocument()
      expect(screen.getByText('SH-2025-003')).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      expect(screen.getByText('Shipment #')).toBeInTheDocument()
      expect(screen.getByText('Principal')).toBeInTheDocument()
      expect(screen.getByText('Brand')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(<ShipmentTableNew {...defaultProps} loading={true} />)
      
      expect(screen.getByText('Loading shipments...')).toBeInTheDocument()
    })

    it('should show empty state when no shipments', () => {
      render(<ShipmentTableNew {...defaultProps} shipments={[]} />)
      
      expect(screen.getByText('No shipments found')).toBeInTheDocument()
    })
  })

  describe('Row Selection', () => {
    it('should call onSelectRow when checkbox is clicked', () => {
      const onSelectRow = jest.fn()
      render(<ShipmentTableNew {...defaultProps} onSelectRow={onSelectRow} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1]) // First data row checkbox
      
      expect(onSelectRow).toHaveBeenCalledWith('1')
    })

    it('should call onSelectAll when header checkbox is clicked', () => {
      const onSelectAll = jest.fn()
      render(<ShipmentTableNew {...defaultProps} onSelectAll={onSelectAll} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // Header checkbox
      
      expect(onSelectAll).toHaveBeenCalled()
    })

    it('should show selected rows', () => {
      render(<ShipmentTableNew {...defaultProps} selectedIds={['1', '2']} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[1]).toBeChecked() // First row
      expect(checkboxes[2]).toBeChecked() // Second row
    })
  })

  describe('Sorting', () => {
    it('should call onSortingChange when column header is clicked', () => {
      const onSortingChange = jest.fn()
      render(<ShipmentTableNew {...defaultProps} onSortingChange={onSortingChange} />)
      
      const shipmentHeader = screen.getByText('Shipment #')
      fireEvent.click(shipmentHeader)
      
      expect(onSortingChange).toHaveBeenCalled()
    })

    it('should display sort indicators', () => {
      render(<ShipmentTableNew 
        {...defaultProps} 
        sorting={[{ id: 'shipmentNumber', desc: false }]}
      />)
      
      // Check for sort indicator (↑ or ↓)
      const shipmentHeader = screen.getByText('Shipment #').parentElement
      expect(shipmentHeader?.textContent).toMatch(/[↑↓]/)
    })
  })

  describe('Data Display', () => {
    it('should display shipment numbers as links', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      const link = screen.getByText('SH-2025-001')
      expect(link).toHaveAttribute('href', '/shipments/1')
    })

    it('should display status badges', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      expect(screen.getByText('in progress')).toBeInTheDocument()
      expect(screen.getByText('at risk')).toBeInTheDocument()
      expect(screen.getByText('delayed')).toBeInTheDocument()
    })

    it('should display risk levels', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      expect(screen.getByText('LOW')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('CRITICAL')).toBeInTheDocument()
    })

    it('should display days post-ETA', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      expect(screen.getByText('2 days')).toBeInTheDocument()
      expect(screen.getByText('7 days')).toBeInTheDocument()
      expect(screen.getByText('9 days')).toBeInTheDocument()
    })
  })

  describe('Column Visibility', () => {
    it('should hide columns not in visibleColumns', () => {
      render(<ShipmentTableNew 
        {...defaultProps} 
        visibleColumns={['shipmentNumber', 'status']}
      />)
      
      expect(screen.getByText('Shipment #')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.queryByText('Principal')).not.toBeInTheDocument()
      expect(screen.queryByText('Brand')).not.toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('should render action buttons for each row', () => {
      render(<ShipmentTableNew {...defaultProps} />)
      
      const actionButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')
      )
      expect(actionButtons.length).toBeGreaterThan(0)
    })
  })
})
