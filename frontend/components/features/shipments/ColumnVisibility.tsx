'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
}

interface ColumnVisibilityProps {
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
}

export function ColumnVisibility({ columns, onColumnsChange }: ColumnVisibilityProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (columnId: string) => {
    const updated = columns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(updated)
  }

  const visibleCount = columns.filter((col) => col.visible).length

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Columns ({visibleCount}/{columns.length})
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-700">Toggle Columns</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => handleToggle(column.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-gray-200 px-4 py-2">
              <Button
                size="sm"
                variant="ghost"
                fullWidth
                onClick={() => {
                  const allVisible = columns.map((col) => ({ ...col, visible: true }))
                  onColumnsChange(allVisible)
                }}
              >
                Show All
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
