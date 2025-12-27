'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Shipment, ShipmentStatus, RiskLevel } from '@/types'
import { Badge, Button, Dropdown, Loading, Empty } from '@/components/ui'
import { formatDate } from '@/lib/utils'

interface ShipmentTableProps {
  shipments: Shipment[]
  loading?: boolean
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  selectedIds?: string[]
  onSelectRow?: (id: string) => void
  onSelectAll?: (selected: boolean) => void
  visibleColumns?: string[]
}

export function ShipmentTableNew({
  shipments,
  loading,
  sorting = [],
  onSortingChange,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  visibleColumns = ['shipmentNumber', 'principal', 'brand', 'eta', 'status', 'daysPostEta', 'riskLevel'],
}: ShipmentTableProps) {
  
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

  const columns = useMemo<ColumnDef<Shipment>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={(e) => {
              table.getToggleAllRowsSelectedHandler()(e)
              if (onSelectAll) {
                onSelectAll(e.target.checked)
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler()(e)
              if (onSelectRow) {
                onSelectRow(row.original.id)
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        ),
        size: 40,
      },
      // Shipment Number
      {
        accessorKey: 'shipmentNumber',
        header: 'Shipment #',
        cell: ({ row }) => (
          <Link
            href={`/shipments/${row.original.id}`}
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {row.original.shipmentNumber}
          </Link>
        ),
        size: 140,
      },
      // Principal
      {
        accessorKey: 'principal',
        header: 'Principal',
        cell: ({ row }) => <span className="text-gray-900">{row.original.principal}</span>,
        size: 180,
      },
      // Brand
      {
        accessorKey: 'brand',
        header: 'Brand',
        cell: ({ row }) => <span className="text-gray-600">{row.original.brand}</span>,
        size: 120,
      },
      // LC Number
      {
        accessorKey: 'lcNumber',
        header: 'LC Number',
        cell: ({ row }) => <span className="text-gray-600">{row.original.lcNumber}</span>,
        size: 150,
      },
      // ETA
      {
        accessorKey: 'eta',
        header: 'ETA',
        cell: ({ row }) => <span className="text-gray-900">{formatDate(row.original.eta)}</span>,
        size: 120,
      },
      // Status
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)}>
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
        size: 120,
      },
      // Days Post-ETA
      {
        accessorKey: 'daysPostEta',
        header: 'Days Post-ETA',
        cell: ({ row }) => (
          <span className={getDaysColor(row.original.daysPostEta)}>
            {row.original.daysPostEta} days
          </span>
        ),
        size: 130,
      },
      // Risk Level
      {
        accessorKey: 'riskLevel',
        header: 'Risk Level',
        cell: ({ row }) => (
          <span className={`text-sm font-medium ${getRiskColor(row.original.riskLevel)}`}>
            {row.original.riskLevel.toUpperCase()}
          </span>
        ),
        size: 110,
      },
      // Actions
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const shipment = row.original
          return (
            <div className="relative">
              <Dropdown
                trigger={
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                }
                items={[
                  { 
                    id: 'view', 
                    label: 'View Details',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ),
                    onClick: () => window.location.href = `/shipments/${shipment.id}` 
                  },
                  { 
                    id: 'edit', 
                    label: 'Edit Shipment',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ),
                    onClick: () => alert(`Edit shipment ${shipment.shipmentNumber}`) 
                  },
                  { 
                    id: 'duplicate', 
                    label: 'Duplicate',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ),
                    onClick: () => alert(`Duplicate shipment ${shipment.shipmentNumber}`) 
                  },
                  { 
                    id: 'eta', 
                    label: 'Update ETA',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ),
                    onClick: () => alert(`Update ETA for ${shipment.shipmentNumber}`) 
                  },
                  { 
                    id: 'export', 
                    label: 'Export Data',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    onClick: () => alert(`Export data for ${shipment.shipmentNumber}`) 
                  },
                  { 
                    id: 'divider', 
                    label: '', 
                    divider: true 
                  },
                  { 
                    id: 'archive', 
                    label: 'Archive',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    ),
                    onClick: () => {
                      if (confirm(`Archive shipment ${shipment.shipmentNumber}?`)) {
                        alert(`Archived ${shipment.shipmentNumber}`)
                      }
                    }
                  },
                  { 
                    id: 'delete', 
                    label: 'Delete',
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ),
                    onClick: () => {
                      if (confirm(`Delete shipment ${shipment.shipmentNumber}? This action cannot be undone.`)) {
                        alert(`Deleted ${shipment.shipmentNumber}`)
                      }
                    },
                    className: 'text-red-600 hover:bg-red-50'
                  },
                ]}
                align="right"
                className="w-48"
              />
            </div>
          )
        },
        size: 80,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Filter columns based on visibility
  const visibleColumnsData = useMemo(
    () => columns.filter((col) => {
      if (col.id === 'select' || col.id === 'actions') return true
      const key = 'accessorKey' in col ? col.accessorKey as string : col.id
      return visibleColumns.includes(key || '')
    }),
    [columns, visibleColumns]
  )

  const table = useReactTable({
    data: shipments,
    columns: visibleColumnsData,
    state: {
      sorting,
      rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
    },
    onSortingChange: onSortingChange as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })

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
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'flex cursor-pointer select-none items-center hover:text-gray-900' : 'flex items-center'}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="ml-2">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-3 text-sm"
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
