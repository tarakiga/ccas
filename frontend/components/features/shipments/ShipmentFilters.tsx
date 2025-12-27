'use client'

import { useState } from 'react'
import { ShipmentFilters as Filters, ShipmentStatus, RiskLevel } from '@/types'
import { Button, Badge } from '@/components/ui'
import { SlideIn } from '@/components/animations'

interface ShipmentFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClose?: () => void
}

export function ShipmentFilters({ filters, onFiltersChange, onClose }: ShipmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  const statusOptions = [
    { value: ShipmentStatus.PENDING, label: 'Pending' },
    { value: ShipmentStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ShipmentStatus.AT_RISK, label: 'At Risk' },
    { value: ShipmentStatus.DELAYED, label: 'Delayed' },
    { value: ShipmentStatus.COMPLETED, label: 'Completed' },
  ]

  const riskOptions = [
    { value: RiskLevel.LOW, label: 'Low' },
    { value: RiskLevel.MEDIUM, label: 'Medium' },
    { value: RiskLevel.HIGH, label: 'High' },
    { value: RiskLevel.CRITICAL, label: 'Critical' },
  ]

  const departmentOptions = [
    { value: 'business_unit', label: 'Business Unit' },
    { value: 'finance', label: 'Finance' },
    { value: 'customs_clearance', label: 'Customs & Clearance' },
    { value: 'management', label: 'Management' },
  ]

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose?.()
  }

  const handleReset = () => {
    const emptyFilters: Filters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const activeFilterCount = Object.values(localFilters).filter(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <SlideIn from="left">
      <div className="flex h-full flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <Badge variant="info">{activeFilterCount} active</Badge>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.status?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = localFilters.status || []
                        const updated = e.target.checked
                          ? [...current, option.value]
                          : current.filter((s) => s !== option.value)
                        setLocalFilters({ ...localFilters, status: updated })
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Risk Level
              </label>
              <div className="space-y-2">
                {riskOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.riskLevel?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = localFilters.riskLevel || []
                        const updated = e.target.checked
                          ? [...current, option.value]
                          : current.filter((r) => r !== option.value)
                        setLocalFilters({ ...localFilters, riskLevel: updated })
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="space-y-2">
                {departmentOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.department?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = localFilters.department || []
                        const updated = e.target.checked
                          ? [...current, option.value]
                          : current.filter((d) => d !== option.value)
                        setLocalFilters({ ...localFilters, department: updated })
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ETA Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={localFilters.dateRange?.start || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateRange: {
                        start: e.target.value,
                        end: localFilters.dateRange?.end || '',
                      },
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={localFilters.dateRange?.end || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateRange: {
                        start: localFilters.dateRange?.start || '',
                        end: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} fullWidth>
              Reset
            </Button>
            <Button onClick={handleApply} fullWidth>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </SlideIn>
  )
}
