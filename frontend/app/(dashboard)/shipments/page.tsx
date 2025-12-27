'use client'

import { useState, useMemo } from 'react'
import { Card, Button, Input, Pagination, Badge, Modal } from '@/components/ui'
import { ShipmentTableNew } from '@/components/features/shipments/ShipmentTableNew'
import { ShipmentFilters } from '@/components/features/shipments/ShipmentFilters'
import { BulkActions } from '@/components/features/shipments/BulkActions'
import { ColumnVisibility, ColumnConfig } from '@/components/features/shipments/ColumnVisibility'
import { CreateShipmentForm } from '@/components/features/shipments/CreateShipmentForm'
import { useShipments } from '@/lib/api/hooks/useShipments'
import { ShipmentFilters as Filters, Shipment } from '@/types'
import { FadeIn } from '@/components/animations'
import { exportShipmentsToCSV } from '@/lib/utils'

export default function ShipmentsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: 'shipmentNumber', desc: false }
  ])
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'shipmentNumber', label: 'Shipment #', visible: true },
    { id: 'principal', label: 'Principal', visible: true },
    { id: 'brand', label: 'Brand', visible: true },
    { id: 'lcNumber', label: 'LC Number', visible: false },
    { id: 'eta', label: 'ETA', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'daysPostEta', label: 'Days Post-ETA', visible: true },
    { id: 'riskLevel', label: 'Risk Level', visible: true },
  ])

  // Fetch shipments with filters
  const { data, isLoading } = useShipments({
    page: currentPage,
    pageSize,
    ...filters,
    search: searchQuery,
  })

  // Sort shipments
  const sortedShipments = useMemo(() => {
    if (!data?.items) return []
    
    if (sorting.length === 0) return data.items
    
    const sorted = [...data.items].sort((a, b) => {
      const sort = sorting[0]
      let aValue: any = a[sort.id as keyof Shipment]
      let bValue: any = b[sort.id as keyof Shipment]
      
      if (sort.id === 'daysPostEta') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (aValue < bValue) return sort.desc ? 1 : -1
      if (aValue > bValue) return sort.desc ? -1 : 1
      return 0
    })
    
    return sorted
  }, [data?.items, sorting])

  const handleSortingChange = (newSorting: Array<{ id: string; desc: boolean }>) => {
    setSorting(newSorting)
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.items) {
      setSelectedIds(data.items.map((s) => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleExport = () => {
    const shipmentsToExport = selectedIds.length > 0
      ? sortedShipments.filter((s) => selectedIds.includes(s.id))
      : sortedShipments
    exportShipmentsToCSV(shipmentsToExport)
  }

  const handleBulkUpdate = () => {
    // TODO: Implement bulk update modal
    console.log('Bulk update:', selectedIds)
  }

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true)
  ).length

  const visibleColumnIds = columns.filter((col) => col.visible).map((col) => col.id)

  return (
    <FadeIn>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
          <p className="mt-2 text-gray-600">
            Manage and track all customs clearance shipments
          </p>
        </div>

        {/* Actions Bar - Premium Style */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              {/* Premium Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <Input
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-xl shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
              
              {/* Premium Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="group relative overflow-hidden border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge variant="info" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
              </Button>
              
              {/* Premium Columns Button */}
              <ColumnVisibility 
                columns={columns} 
                onColumnsChange={setColumns}
              />
            </div>
            
            <div className="flex gap-3">
              {/* Premium Export Button */}
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="group relative overflow-hidden border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </div>
              </Button>
              
              {/* Premium New Shipment Button */}
              <Button 
                onClick={() => setShowNewShipmentModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Shipment
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <BulkActions
            selectedCount={selectedIds.length}
            onExport={handleExport}
            onBulkUpdate={handleBulkUpdate}
            onClear={() => setSelectedIds([])}
          />
        )}

        {/* Shipments Table */}
        <Card padding="none">
          <ShipmentTableNew
            shipments={sortedShipments}
            loading={isLoading}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            visibleColumns={visibleColumnIds}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, data.total)} of {data.total} shipments
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Filters Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl">
              <ShipmentFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </div>
        )}

        {/* New Shipment Modal */}
        <Modal
          open={showNewShipmentModal}
          onClose={() => setShowNewShipmentModal(false)}
          title="Create New Shipment"
          size="lg"
        >
          <CreateShipmentForm
            onSuccess={() => {
              setShowNewShipmentModal(false)
              // Refresh the shipments list
              window.location.reload()
            }}
            onCancel={() => setShowNewShipmentModal(false)}
          />
        </Modal>
      </div>
    </FadeIn>
  )
}
