'use client'

import { Button } from '@/components/ui'
import { SlideIn } from '@/components/animations'
import { EditGuard } from '@/components/auth/PermissionGuard'

interface BulkActionsProps {
  selectedCount: number
  onExport: () => void
  onBulkUpdate: () => void
  onClear: () => void
}

export function BulkActions({
  selectedCount,
  onExport,
  onBulkUpdate,
  onClear,
}: BulkActionsProps) {
  return (
    <SlideIn from="top">
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {selectedCount} shipment{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onExport}>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </Button>

              <EditGuard>
                <Button size="sm" variant="outline" onClick={onBulkUpdate}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bulk Update
                </Button>
              </EditGuard>

              <Button size="sm" variant="ghost" onClick={onClear}>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SlideIn>
  )
}
