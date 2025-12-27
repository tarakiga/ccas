'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shipment, ShipmentStatus, RiskLevel } from '@/types'
import { Badge, Button, Dropdown, Loading, Empty } from '@/components/ui'
import { StaggerChildren, StaggerItem } from '@/components/animations'
import { formatDate } from '@/lib/utils'

interface ShipmentTableProps {
  shipments: Shipment[]
  loading?: boolean
  onSort?: (column: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  selectedIds?: string[]
  onSelectRow?: (id: string) => void
  onSelectAll?: (selected: boolean) => void
  visibleColumns?: string[]
  expandable?: boolean
}

export function ShipmentTable({
  shipments,
  loading,
  onSort,
  sortColumn,
  sortDirection,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  visibleColumns = ['shipmentNumber', 'principal', 'brand', 'eta', 'status', 'daysPostEta', 'riskLevel'],
  expandable = false,
}: ShipmentTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId)

  const getStatusVariant = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.COMPLETED:
        return 'success'
      case ShipmentStatus.AT_RISK:
        return 'warning'
      case ShipmentStatus.DELAYED:
        return 'error'
      case ShipmentStatus.IN_PROGRESS:
        return 'info'
      default:
        return 'default'
    }
  }

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.CRITICAL:
        return 'text-red-600 font-bold'
      case RiskLevel.HIGH:
        return 'text-orange-600 font-semibold'
      case RiskLevel.MEDIUM:
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDaysColor = (days: number) => {
    if (days >= 7) return 'text-red-600 font-bold'
    if (days >= 5) return 'text-orange-600 font-semibold'
    if (days >= 3) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column)
    }
  }

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="ml-1 h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading shipments..." />
      </div>
    )
  }

  if (shipments.length === 0) {
    return (
      <Empty
        title="No shipments found"
        description="Try adjusting your filters or create a new shipment"
        icon={
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {expandable && <th className="w-10 px-3 py-3"></th>}
            {onSelectAll && (
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === shipments.length && shipments.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {isColumnVisible('shipmentNumber') && (
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => handleSort('shipmentNumber')}
              >
                <div className="flex items-center">
                  Shipment #
                  {renderSortIcon('shipmentNumber')}
                </div>
              </th>
            )}
            {isColumnVisible('principal') && (
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => handleSort('principal')}
              >
                <div className="flex items-center">
                  Principal
                  {renderSortIcon('principal')}
                </div>
              </th>
            )}
            {isColumnVisible('brand') && (
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
            )}
            {isColumnVisible('lcNumber') && (
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">LC Number</th>
            )}
            {isColumnVisible('eta') && (
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => handleSort('eta')}
              >
                <div className="flex items-center">
                  ETA
                  {renderSortIcon('eta')}
                </div>
              </th>
            )}
            {isColumnVisible('status') && (
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            )}
            {isColumnVisible('daysPostEta') && (
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => handleSort('daysPostEta')}
              >
                <div className="flex items-center">
                  Days Post-ETA
                  {renderSortIcon('daysPostEta')}
                </div>
              </th>
            )}
            {isColumnVisible('riskLevel') && (
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">Risk Level</th>
            )}
            <th className="sticky right-0 bg-gray-50 whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <StaggerChildren>
            {shipments.map((shipment) => {
              const isExpanded = expandedRows.has(shipment.id)
              return (
                <StaggerItem key={shipment.id}>
                  <>
                    <tr
                      className={`
                        border-b border-gray-100 transition-colors duration-150
                        ${hoveredRow === shipment.id ? 'bg-gray-50' : 'hover:bg-gray-50'}
                        ${selectedIds.includes(shipment.id) ? 'bg-primary-50' : ''}
                      `}
                      onMouseEnter={() => setHoveredRow(shipment.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {expandable && (
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleExpand(shipment.id)}
                            className="rounded p-1 hover:bg-gray-200"
                          >
                            <svg
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      )}
                      {onSelectRow && (
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(shipment.id)}
                            onChange={() => onSelectRow(shipment.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                      )}
                      {isColumnVisible('shipmentNumber') && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link
                            href={`/shipments/${shipment.id}`}
                            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {shipment.shipmentNumber}
                          </Link>
                        </td>
                      )}
                      {isColumnVisible('principal') && (
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900">{shipment.principal}</td>
                      )}
                      {isColumnVisible('brand') && (
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{shipment.brand}</td>
                      )}
                      {isColumnVisible('lcNumber') && (
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{shipment.lcNumber}</td>
                      )}
                      {isColumnVisible('eta') && (
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900">{formatDate(shipment.eta)}</td>
                      )}
                      {isColumnVisible('status') && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge variant={getStatusVariant(shipment.status)}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      )}
                      {isColumnVisible('daysPostEta') && (
                        <td className={`whitespace-nowrap px-4 py-3 ${getDaysColor(shipment.daysPostEta)}`}>
                          {shipment.daysPostEta} days
                        </td>
                      )}
                      {isColumnVisible('riskLevel') && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`text-sm font-medium ${getRiskColor(shipment.riskLevel)}`}>
                            {shipment.riskLevel.toUpperCase()}
                          </span>
                        </td>
                      )}
                      <td className={`sticky right-0 whitespace-nowrap px-4 py-3 text-right shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] ${
                        hoveredRow === shipment.id ? 'bg-gray-50' : selectedIds.includes(shipment.id) ? 'bg-primary-50' : 'bg-white'
                      }`}>
                        <Dropdown
                          trigger={
                            <Button size="sm" variant="ghost">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          }
                          items={[
                            { id: 'view', label: 'View Details', onClick: () => {} },
                            { id: 'edit', label: 'Edit', onClick: () => {} },
                            { id: 'eta', label: 'Update ETA', onClick: () => {} },
                            { id: 'delete', label: 'Delete', onClick: () => {} },
                          ]}
                        />
                      </td>
                    </tr>
                    {expandable && isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={100} className="px-4 py-4">
                          <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">LC Number:</span>
                                <span className="ml-2 text-gray-900">{shipment.lcNumber}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Current Step:</span>
                                <span className="ml-2 text-gray-900">{shipment.currentStep || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span>
                                <span className="ml-2 text-gray-900">{formatDate(shipment.createdAt)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Last Updated:</span>
                                <span className="ml-2 text-gray-900">{formatDate(shipment.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                </StaggerItem>
              )
            })}
          </StaggerChildren>
        </tbody>
      </table>
    </div>
  )
}
