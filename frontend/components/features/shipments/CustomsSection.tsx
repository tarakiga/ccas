'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Input } from '@/components/ui'

interface CustomsSectionProps {
  shipmentId: string
}

export function CustomsSection({ shipmentId }: CustomsSectionProps) {
  const [showArrivalNoticeModal, setShowArrivalNoticeModal] = useState(false)
  const [showCustomsDeclarationModal, setShowCustomsDeclarationModal] = useState(false)
  const [showBayanModal, setShowBayanModal] = useState(false)
  const [showCustomsApprovalModal, setShowCustomsApprovalModal] = useState(false)
  const [showReleaseOrderModal, setShowReleaseOrderModal] = useState(false)
  const [showDeliveryOrderModal, setShowDeliveryOrderModal] = useState(false)
  const [showContainerReleaseModal, setShowContainerReleaseModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Step 6.2: Original Documents - Handled in Documents tab */}
      <Card className="bg-gray-50">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">Step 6.2: Original Documents Collection</p>
            <p className="text-sm text-gray-600">Upload original documents in the Documents tab</p>
          </div>
        </div>
      </Card>

      {/* Step 7.0: Arrival Notice */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Arrival Notice</h3>
              <Badge variant="default">Step 7.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Upload vessel arrival notice from shipping line
            </p>
          </div>
          <Button onClick={() => setShowArrivalNoticeModal(true)}>
            Upload Arrival Notice
          </Button>
        </div>
      </Card>

      {/* Step 8.0: Customs Declaration */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Customs Declaration</h3>
              <Badge variant="default">Step 8.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Submit customs declaration form
            </p>
          </div>
          <Button onClick={() => setShowCustomsDeclarationModal(true)}>
            Submit Declaration
          </Button>
        </div>
      </Card>

      {/* Step 9.0: Bayan Submission */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Bayan Submission</h3>
              <Badge variant="default">Step 9.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Submit Bayan (customs manifest) to authorities
            </p>
          </div>
          <Button onClick={() => setShowBayanModal(true)}>
            Submit Bayan
          </Button>
        </div>
      </Card>

      {/* Step 10.0: Customs Approval */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Customs Approval</h3>
              <Badge variant="default">Step 10.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Confirm customs approval received
            </p>
          </div>
          <Button onClick={() => setShowCustomsApprovalModal(true)}>
            Confirm Approval
          </Button>
        </div>
      </Card>

      {/* Step 12.0: Release Order */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Release Order</h3>
              <Badge variant="default">Step 12.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Upload customs release order
            </p>
          </div>
          <Button onClick={() => setShowReleaseOrderModal(true)}>
            Upload Release Order
          </Button>
        </div>
      </Card>

      {/* Step 14.0: Delivery Order */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Order</h3>
              <Badge variant="default">Step 14.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Upload delivery order from shipping line
            </p>
          </div>
          <Button onClick={() => setShowDeliveryOrderModal(true)}>
            Upload Delivery Order
          </Button>
        </div>
      </Card>

      {/* Step 15.0: Container Release */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Container Release</h3>
              <Badge variant="default">Step 15.0</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Confirm container has been released from port
            </p>
          </div>
          <Button onClick={() => setShowContainerReleaseModal(true)}>
            Confirm Release
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <Modal open={showArrivalNoticeModal} onClose={() => setShowArrivalNoticeModal(false)} title="Upload Arrival Notice (Step 7.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Arrival Notice Document</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowArrivalNoticeModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('arrival-notice', {})
              alert('✅ Arrival notice uploaded! Step 7.0 completed.')
              setShowArrivalNoticeModal(false)
            }}>Upload</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showCustomsDeclarationModal} onClose={() => setShowCustomsDeclarationModal(false)} title="Submit Customs Declaration (Step 8.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Declaration Number</label>
            <Input placeholder="DEC-2025-XXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">HS Code</label>
            <Input placeholder="Enter HS code" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCustomsDeclarationModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('customs-declaration', {})
              alert('✅ Customs declaration submitted! Step 8.0 completed.')
              setShowCustomsDeclarationModal(false)
            }}>Submit</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showBayanModal} onClose={() => setShowBayanModal(false)} title="Submit Bayan (Step 9.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bayan Number</label>
            <Input placeholder="BAYAN-2025-XXX" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowBayanModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('bayan-submission', {})
              alert('✅ Bayan submitted! Step 9.0 completed.')
              setShowBayanModal(false)
            }}>Submit</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showCustomsApprovalModal} onClose={() => setShowCustomsApprovalModal(false)} title="Confirm Customs Approval (Step 10.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Approval Document</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCustomsApprovalModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnApproval('customs-approval', {})
              alert('✅ Customs approval confirmed! Step 10.0 completed.')
              setShowCustomsApprovalModal(false)
            }}>Confirm</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showReleaseOrderModal} onClose={() => setShowReleaseOrderModal(false)} title="Upload Release Order (Step 12.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Release Order Document</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowReleaseOrderModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnApproval('release-order', {})
              alert('✅ Release order uploaded! Step 12.0 completed.')
              setShowReleaseOrderModal(false)
            }}>Upload</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDeliveryOrderModal} onClose={() => setShowDeliveryOrderModal(false)} title="Upload Delivery Order (Step 14.0)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Order Document</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeliveryOrderModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('delivery-order', {})
              alert('✅ Delivery order uploaded! Step 14.0 completed.')
              setShowDeliveryOrderModal(false)
            }}>Upload</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showContainerReleaseModal} onClose={() => setShowContainerReleaseModal(false)} title="Confirm Container Release (Step 15.0)">
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              Confirm that the container has been released from the port and is ready for transport.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowContainerReleaseModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('container-release', {})
              alert('✅ Container release confirmed! Step 15.0 completed.')
              setShowContainerReleaseModal(false)
            }}>Confirm Release</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
