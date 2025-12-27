'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Input } from '@/components/ui'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface FinanceSectionProps {
  shipmentId: string
}

export function FinanceSection({ shipmentId }: FinanceSectionProps) {
  const permissions = usePermissions()
  const [activeSection, setActiveSection] = useState<'lc' | 'payment' | 'duty' | 'port'>('lc')
  
  // LC Application (Step 3.1)
  const [showLCApplicationModal, setShowLCApplicationModal] = useState(false)
  const [lcApplicationData, setLcApplicationData] = useState({
    lcAmount: '',
    lcType: 'sight',
    beneficiary: '',
    expiryDate: '',
  })
  
  // LC Approval (Step 3.2)
  const [showLCApprovalModal, setShowLCApprovalModal] = useState(false)
  
  // Submit to Bank (Step 3.4)
  const [showSubmitToBankModal, setShowSubmitToBankModal] = useState(false)
  
  // Bank Acceptance (Step 3.5)
  const [showBankAcceptanceModal, setShowBankAcceptanceModal] = useState(false)
  
  // Payment Request (Step 4.0)
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false)
  const [paymentRequestData, setPaymentRequestData] = useState({
    amount: '',
    purpose: '',
    urgency: 'normal',
  })
  
  // Payment Approval (Step 5.0)
  const [showPaymentApprovalModal, setShowPaymentApprovalModal] = useState(false)
  
  // Payment Confirmation (Step 6.1)
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false)
  
  // Duty Payment (Step 11.0)
  const [showDutyPaymentModal, setShowDutyPaymentModal] = useState(false)
  
  // Port Charges (Step 13.0)
  const [showPortChargesModal, setShowPortChargesModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('lc')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'lc'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          LC Processing
        </button>
        <button
          onClick={() => setActiveSection('payment')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'payment'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveSection('duty')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'duty'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Duty & Charges
        </button>
      </div>

      {/* LC Processing Section */}
      {activeSection === 'lc' && (
        <div className="space-y-6">
          {/* Step 3.1: LC Application */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">LC Application</h3>
                  <Badge variant="default">Step 3.1</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Submit Letter of Credit application to bank
                </p>
              </div>
              <Button onClick={() => setShowLCApplicationModal(true)}>
                Submit LC Application
              </Button>
            </div>
          </Card>

          {/* Step 3.2: LC Approval */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">LC Approval</h3>
                  <Badge variant="default">Step 3.2</Badge>
                  {(permissions.user?.role === 'Finance Manager' || 
                    permissions.user?.role === 'Admin' ||
                    permissions.user?.department === 'Finance') && (
                    <Badge variant="info">Action Required</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Finance Manager approval required
                </p>
              </div>
              {(permissions.user?.role === 'Finance Manager' || 
                permissions.user?.role === 'Admin' ||
                permissions.user?.department === 'Finance') && (
                <Button onClick={() => setShowLCApprovalModal(true)}>
                  Review & Approve
                </Button>
              )}
            </div>
          </Card>

          {/* Step 3.3: LC Copy Upload - Handled in Documents tab */}
          <Card className="bg-gray-50">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Step 3.3: LC Copy Upload</p>
                <p className="text-sm text-gray-600">Upload LC copy in the Documents tab</p>
              </div>
            </div>
          </Card>

          {/* Step 3.4: Submit Documents to Bank */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Submit to Bank</h3>
                  <Badge variant="default">Step 3.4</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Submit documents to bank for processing
                </p>
              </div>
              <Button onClick={() => setShowSubmitToBankModal(true)}>
                Submit to Bank
              </Button>
            </div>
          </Card>

          {/* Step 3.5: Bank Acceptance */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Bank Acceptance</h3>
                  <Badge variant="default">Step 3.5</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Confirm bank has accepted the documents
                </p>
              </div>
              <Button onClick={() => setShowBankAcceptanceModal(true)}>
                Confirm Bank Acceptance
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Section */}
      {activeSection === 'payment' && (
        <div className="space-y-6">
          {/* Step 4.0: Payment Request */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Request</h3>
                  <Badge variant="default">Step 4.0</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Submit payment request for approval
                </p>
              </div>
              <Button onClick={() => setShowPaymentRequestModal(true)}>
                Submit Payment Request
              </Button>
            </div>
          </Card>

          {/* Step 5.0: Payment Approval */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Approval</h3>
                  <Badge variant="default">Step 5.0</Badge>
                  {permissions.user?.role === 'Finance Manager' && (
                    <Badge variant="warning">Pending Approval</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Finance Manager approval required
                </p>
              </div>
              {permissions.user?.role === 'Finance Manager' && (
                <Button onClick={() => setShowPaymentApprovalModal(true)}>
                  Review & Approve
                </Button>
              )}
            </div>
          </Card>

          {/* Step 6.1: Payment Confirmation */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Confirmation</h3>
                  <Badge variant="default">Step 6.1</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Upload payment receipt and confirm payment made
                </p>
              </div>
              <Button onClick={() => setShowPaymentConfirmationModal(true)}>
                Confirm Payment
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Duty & Charges Section */}
      {activeSection === 'duty' && (
        <div className="space-y-6">
          {/* Step 11.0: Duty Payment */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Customs Duty Payment</h3>
                  <Badge variant="default">Step 11.0</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Pay customs duty and upload receipt
                </p>
              </div>
              <Button onClick={() => setShowDutyPaymentModal(true)}>
                Submit Duty Payment
              </Button>
            </div>
          </Card>

          {/* Step 13.0: Port Charges */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Port Charges Payment</h3>
                  <Badge variant="default">Step 13.0</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Pay port charges and upload receipt
                </p>
              </div>
              <Button onClick={() => setShowPortChargesModal(true)}>
                Submit Port Charges
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* LC Application Modal (Step 3.1) */}
      <Modal
        open={showLCApplicationModal}
        onClose={() => setShowLCApplicationModal(false)}
        title="Submit LC Application (Step 3.1)"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">LC Amount (OMR)</label>
            <Input
              type="number"
              value={lcApplicationData.lcAmount}
              onChange={(e) => setLcApplicationData({...lcApplicationData, lcAmount: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LC Type</label>
            <select
              value={lcApplicationData.lcType}
              onChange={(e) => setLcApplicationData({...lcApplicationData, lcType: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="sight">Sight LC</option>
              <option value="usance">Usance LC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Beneficiary</label>
            <Input
              value={lcApplicationData.beneficiary}
              onChange={(e) => setLcApplicationData({...lcApplicationData, beneficiary: e.target.value})}
              placeholder="Beneficiary name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <Input
              type="date"
              value={lcApplicationData.expiryDate}
              onChange={(e) => setLcApplicationData({...lcApplicationData, expiryDate: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowLCApplicationModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('lc-application', lcApplicationData)
              alert('✅ LC Application submitted! Step 3.1 completed.')
              setShowLCApplicationModal(false)
            }}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Submit to Bank Modal (Step 3.4) */}
      <Modal
        open={showSubmitToBankModal}
        onClose={() => setShowSubmitToBankModal(false)}
        title="Submit Documents to Bank (Step 3.4)"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Submit all required documents to the bank for LC processing.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <Input 
              id="bankName"
              placeholder="Bank name" 
              onChange={(e) => {
                const modal = document.getElementById('bankName') as HTMLInputElement
                if (modal) modal.dataset.value = e.target.value
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference Number</label>
            <Input 
              id="referenceNumber"
              placeholder="Bank reference number" 
              onChange={(e) => {
                const modal = document.getElementById('referenceNumber') as HTMLInputElement
                if (modal) modal.dataset.value = e.target.value
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSubmitToBankModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const timestamp = new Date().toISOString()
              const bankNameInput = document.getElementById('bankName') as HTMLInputElement
              const referenceNumberInput = document.getElementById('referenceNumber') as HTMLInputElement
              
              const actionLog = {
                stepNumber: '3.4',
                action: 'Submit to Bank',
                performedBy: permissions.user?.name || 'Unknown User',
                performedAt: timestamp,
                data: {
                  bankName: bankNameInput?.dataset.value || bankNameInput?.value || '',
                  referenceNumber: referenceNumberInput?.dataset.value || referenceNumberInput?.value || '',
                }
              }
              
              // TODO: Send to API endpoint
              console.log('Action logged:', actionLog)
              
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('documents-to-bank', actionLog.data)
              
              alert(`✅ Documents submitted to bank! Step 3.4 completed.\n\nTimestamp: ${new Date(timestamp).toLocaleString()}\nPerformed by: ${actionLog.performedBy}`)
              setShowSubmitToBankModal(false)
            }}>
              Submit to Bank
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bank Acceptance Modal (Step 3.5) */}
      <Modal
        open={showBankAcceptanceModal}
        onClose={() => setShowBankAcceptanceModal(false)}
        title="Confirm Bank Acceptance (Step 3.5)"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              Confirm that the bank has accepted the submitted documents.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Acceptance Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Confirmation Number</label>
            <Input placeholder="Confirmation number" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowBankAcceptanceModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnApproval('bank-acceptance', {})
              alert('✅ Bank acceptance confirmed! Step 3.5 completed.')
              setShowBankAcceptanceModal(false)
            }}>
              Confirm Acceptance
            </Button>
          </div>
        </div>
      </Modal>

      {/* LC Approval Modal (Step 3.2) */}
      <Modal
        open={showLCApprovalModal}
        onClose={() => setShowLCApprovalModal(false)}
        title="Approve LC Application (Step 3.2)"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Review the LC application details and approve or reject.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowLCApprovalModal(false)}>Cancel</Button>
            <Button variant="outline" className="text-red-600">Reject</Button>
            <Button onClick={async () => {
              const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnApproval('lc-approval', {})
              alert('✅ LC Application approved! Step 3.2 completed.')
              setShowLCApprovalModal(false)
            }}>
              Approve LC
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Request Modal (Step 4.0) */}
      <Modal
        open={showPaymentRequestModal}
        onClose={() => setShowPaymentRequestModal(false)}
        title="Submit Payment Request (Step 4.0)"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (OMR)</label>
            <Input
              type="number"
              value={paymentRequestData.amount}
              onChange={(e) => setPaymentRequestData({...paymentRequestData, amount: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <textarea
              value={paymentRequestData.purpose}
              onChange={(e) => setPaymentRequestData({...paymentRequestData, purpose: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="Describe the payment purpose..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Urgency</label>
            <select
              value={paymentRequestData.urgency}
              onChange={(e) => setPaymentRequestData({...paymentRequestData, urgency: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentRequestModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('payment-request', paymentRequestData)
              alert('✅ Payment Request submitted! Step 4.0 completed.')
              setShowPaymentRequestModal(false)
            }}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Confirmation Modal (Step 6.1) */}
      <Modal
        open={showPaymentConfirmationModal}
        onClose={() => setShowPaymentConfirmationModal(false)}
        title="Confirm Payment (Step 6.1)"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Reference</label>
            <Input placeholder="Payment reference number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Receipt</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentConfirmationModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnSubmission('payment-confirmation', {})
              alert('✅ Payment confirmed! Step 6.1 completed.')
              setShowPaymentConfirmationModal(false)
            }}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Approval Modal (Step 5.0) */}
      <Modal
        open={showPaymentApprovalModal}
        onClose={() => setShowPaymentApprovalModal(false)}
        title="Approve Payment Request (Step 5.0)"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Review payment request carefully before approving.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentApprovalModal(false)}>Cancel</Button>
            <Button variant="outline" className="text-red-600">Reject</Button>
            <Button onClick={async () => {
              const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnApproval('payment-approval', {})
              alert('✅ Payment approved! Step 5.0 completed.')
              setShowPaymentApprovalModal(false)
            }}>
              Approve Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Duty Payment Modal (Step 11.0) */}
      <Modal
        open={showDutyPaymentModal}
        onClose={() => setShowDutyPaymentModal(false)}
        title="Submit Duty Payment (Step 11.0)"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duty Amount (OMR)</label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Receipt</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDutyPaymentModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnPayment } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnPayment('duty-payment', {})
              alert('✅ Duty payment confirmed! Step 11.0 completed.')
              setShowDutyPaymentModal(false)
            }}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Port Charges Modal (Step 13.0) */}
      <Modal
        open={showPortChargesModal}
        onClose={() => setShowPortChargesModal(false)}
        title="Submit Port Charges (Step 13.0)"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Port Charges Amount (OMR)</label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Receipt</label>
            <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPortChargesModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const { autoCompleteOnPayment } = await import('@/lib/workflow/workflow-automation')
              autoCompleteOnPayment('port-charges', {})
              alert('✅ Port charges confirmed! Step 13.0 completed.')
              setShowPortChargesModal(false)
            }}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
