'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Input } from '@/components/ui'

interface DeliverySectionProps {
  shipmentId: string
}

export function DeliverySection({ shipmentId }: DeliverySectionProps) {
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [showGoodsReceiptModal, setShowGoodsReceiptModal] = useState(false)
  const [showInspectionModal, setShowInspectionModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Step 16.0: Transport Arrangement */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Transport Arrangement</h3>
              <Badge variant="default">Step 16.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Arrange transport from port to warehouse/destination
            </p>
          </div>
          <Button onClick={() => setShowTransportModal(true)}>
            Arrange Transport
          </Button>
        </div>
      </Card>

      {/* Step 17.0: Goods Receipt */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Goods Receipt</h3>
              <Badge variant="default">Step 17.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Confirm goods have been received at destination
            </p>
          </div>
          <Button onClick={() => setShowGoodsReceiptModal(true)}>
            Confirm Receipt
          </Button>
        </div>
      </Card>

      {/* Step 18.0: Quality Inspection */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Quality Inspection</h3>
              <Badge variant="default">Step 18.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Submit quality inspection report
            </p>
          </div>
          <Button onClick={() => setShowInspectionModal(true)}>
            Submit Inspection
          </Button>
        </div>
      </Card>

      {/* Transport Arrangement Modal (Step 16.0) */}
      <Modal open={showTransportModal} onClose={() => setShowTransportModal(false)} title="Arrange Transport (Step 16.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Transport Company</label>
            <Input placeholder="Company name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
            <Input placeholder="Vehicle registration" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver Name</label>
            <Input placeholder="Driver name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
            <Input type="date" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowTransportModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('transport-arrangement', {})
              alert('✅ Transport arranged! Step 16.0 completed.')
              setShowTransportModal(false)
            }}>Confirm Arrangement</Button>
          </div>
        </div>
      </Modal>

      {/* Goods Receipt Modal (Step 17.0) */}
      <Modal open={showGoodsReceiptModal} onClose={() => setShowGoodsReceiptModal(false)} title="Confirm Goods Receipt (Step 17.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Received By</label>
            <Input placeholder="Name of receiver" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="good">Good Condition</option>
              <option value="damaged">Damaged</option>
              <option value="partial">Partial Receipt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" rows={3} placeholder="Any additional notes..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowGoodsReceiptModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('goods-received', {})
              alert('✅ Goods receipt confirmed! Step 17.0 completed.')
              setShowGoodsReceiptModal(false)
            }}>Confirm Receipt</Button>
          </div>
        </div>
      </Modal>

      {/* Quality Inspection Modal (Step 18.0) */}
      <Modal open={showInspectionModal} onClose={() => setShowInspectionModal(false)} title="Submit Quality Inspection (Step 18.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspection Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspector Name</label>
            <Input placeholder="Name of inspector" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspection Result</label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="conditional">Conditional Pass</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspection Report</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" rows={3} placeholder="Inspection findings..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowInspectionModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('quality-inspection', {})
              alert('✅ Quality inspection submitted! Step 18.0 completed.')
              setShowInspectionModal(false)
            }}>Submit Inspection</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
