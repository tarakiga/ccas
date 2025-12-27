'use client'

import { useState } from 'react'
import { Button, Badge, Tabs, Modal } from '@/components/ui'
import { ShipmentOverview } from '@/components/features/shipments/ShipmentOverview'
import { WorkflowTimeline } from '@/components/features/shipments/WorkflowTimeline'
import { DocumentManager } from '@/components/features/shipments/DocumentManager'
import { FinanceSection } from '@/components/features/shipments/FinanceSection'
import { CustomsSection } from '@/components/features/shipments/CustomsSection'
import { DeliverySection } from '@/components/features/shipments/DeliverySection'
import { useShipment } from '@/lib/api/hooks/useShipments'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { FadeIn } from '@/components/animations'
import Link from 'next/link'
import { ShipmentStatus, RiskLevel } from '@/types'

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const { data: shipment, isLoading } = useShipment(params.id)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showETAModal, setShowETAModal] = useState(false)
  const [newETA, setNewETA] = useState('')
  const [etaReason, setETAReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    shipmentNumber: '',
    principal: '',
    brand: '',
    lcNumber: '',
    invoiceNumber: '',
    invoiceAmount: '',
    fundsRequired: '',
  })

  // Mock shipment for development
  const mockShipment = shipment || {
    id: params.id,
    shipmentNumber: 'SH-001',
    principal: 'Toyota',
    brand: 'Camry',
    lcNumber: 'LC-2025-001',
    eta: '2025-01-15',
    status: ShipmentStatus.IN_PROGRESS,
    daysPostEta: 7,
    riskLevel: RiskLevel.MEDIUM,
    currentStep: 'Bayan Submission',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-20',
  }

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

  // Get user permissions
  const permissions = usePermissions()
  
  // Build tabs based on user permissions
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <ShipmentOverview shipment={mockShipment} />,
    },
    {
      id: 'workflow',
      label: 'Workflow',
      content: <WorkflowTimeline shipmentId={params.id} />,
    },
    {
      id: 'documents',
      label: 'Documents',
      content: <DocumentManager shipmentId={params.id} />,
    },
    // Finance tab - only for Finance department and Admins
    ...(permissions.user?.department === 'Finance' || permissions.user?.role === 'Admin'
      ? [{
          id: 'finance',
          label: 'Finance',
          content: <FinanceSection shipmentId={params.id} />,
        }]
      : []),
    // Customs tab - only for C&C department and Admins
    ...(permissions.user?.department === 'C&C' || permissions.user?.role === 'Admin'
      ? [{
          id: 'customs',
          label: 'Customs',
          content: <CustomsSection shipmentId={params.id} />,
        }]
      : []),
    // Delivery tab - only for Stores department and Admins
    ...(permissions.user?.department === 'Business Unit - Stores' || permissions.user?.role === 'Admin'
      ? [{
          id: 'delivery',
          label: 'Delivery',
          content: <DeliverySection shipmentId={params.id} />,
        }]
      : []),
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    )
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-primary-600">Dashboard</Link>
              <span>/</span>
              <Link href="/shipments" className="hover:text-primary-600">Shipments</Link>
              <span>/</span>
              <span className="text-gray-900">{mockShipment.shipmentNumber}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Shipment {mockShipment.shipmentNumber}
              </h1>
              <Badge variant={getStatusVariant(mockShipment.status)}>
                {mockShipment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="mt-1 text-gray-600">{mockShipment.principal} - {mockShipment.brand}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button onClick={() => setShowETAModal(true)}>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Update ETA
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} />

        {/* Edit Shipment Modal */}
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditFormData({
              shipmentNumber: '',
              principal: '',
              brand: '',
              lcNumber: '',
              invoiceNumber: '',
              invoiceAmount: '',
              fundsRequired: '',
            })
          }}
          title="Edit Shipment"
        >
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipment Number</label>
                  <input
                    type="text"
                    value={editFormData.shipmentNumber || mockShipment.shipmentNumber}
                    onChange={(e) => setEditFormData({...editFormData, shipmentNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Principal <span className="text-xs text-gray-500">(Step 1.1)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.principal || mockShipment.principal}
                    onChange={(e) => setEditFormData({...editFormData, principal: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand <span className="text-xs text-gray-500">(Step 1.2)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.brand || mockShipment.brand}
                    onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LC Number <span className="text-xs text-gray-500">(Step 1.6)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.lcNumber || mockShipment.lcNumber}
                    onChange={(e) => setEditFormData({...editFormData, lcNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Financial Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Invoice Number <span className="text-xs text-gray-500">(Step 1.3)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.invoiceNumber}
                    onChange={(e) => setEditFormData({...editFormData, invoiceNumber: e.target.value})}
                    placeholder="INV-2025-XXX"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Invoice Amount (OMR) <span className="text-xs text-gray-500">(Step 1.4)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.invoiceAmount}
                    onChange={(e) => {
                      const amount = e.target.value
                      const fundsRequired = amount ? (parseFloat(amount) * 0.11).toFixed(2) : ''
                      setEditFormData({
                        ...editFormData, 
                        invoiceAmount: amount,
                        fundsRequired
                      })
                    }}
                    placeholder="0.00"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Funds Required (11% of Invoice) <span className="text-xs text-gray-500">(Step 1.5)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.fundsRequired}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
                    placeholder="Calculated automatically"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Automatically calculated as 11% of invoice amount for customs duty, VAT & insurance
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Workflow Auto-Completion
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Updating these fields will automatically complete the corresponding workflow steps.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditModal(false)
                  setEditFormData({
                    shipmentNumber: '',
                    principal: '',
                    brand: '',
                    lcNumber: '',
                    invoiceNumber: '',
                    invoiceAmount: '',
                    fundsRequired: '',
                  })
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  setIsUpdating(true)
                  
                  try {
                    // Determine which fields were updated
                    const updatedFields: string[] = []
                    if (editFormData.invoiceNumber) updatedFields.push('invoiceNumber')
                    if (editFormData.invoiceAmount) updatedFields.push('invoiceAmount')
                    if (editFormData.fundsRequired) updatedFields.push('fundsRequired')
                    
                    // Get auto-completed steps
                    const completedSteps = updatedFields.length > 0 
                      ? await import('@/lib/workflow/workflow-automation').then(mod => 
                          mod.autoCompleteOnUpdate(updatedFields, {
                            invoiceNumber: editFormData.invoiceNumber,
                            invoiceAmount: editFormData.invoiceAmount,
                            fundsRequired: editFormData.fundsRequired,
                          })
                        )
                      : []
                    
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    // Show success message
                    const stepsMessage = completedSteps.length > 0 
                      ? `\n\nWorkflow steps auto-completed: ${completedSteps.join(', ')}`
                      : ''
                    
                    alert(`✅ Shipment Updated Successfully!${stepsMessage}`)
                    
                    setShowEditModal(false)
                    setEditFormData({
                      shipmentNumber: '',
                      principal: '',
                      brand: '',
                      lcNumber: '',
                      invoiceNumber: '',
                      invoiceAmount: '',
                      fundsRequired: '',
                    })
                    
                    // Refresh the page
                    window.location.reload()
                  } catch (error) {
                    alert('Failed to update shipment. Please try again.')
                  } finally {
                    setIsUpdating(false)
                  }
                }}
                loading={isUpdating}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Update ETA Modal */}
        <Modal
          open={showETAModal}
          onClose={() => setShowETAModal(false)}
          title="Update ETA"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ETA Change Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Changing the ETA will recalculate target dates for all pending workflow steps. Maximum 3 ETA changes allowed per shipment.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current ETA</label>
              <input
                type="text"
                value={mockShipment.eta}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New ETA</label>
              <input
                type="date"
                value={newETA}
                onChange={(e) => setNewETA(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Change <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                value={etaReason}
                onChange={(e) => setETAReason(e.target.value)}
                placeholder="Explain why the ETA is changing..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="text-sm font-medium text-blue-900">Impact Summary</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• 12 pending workflow steps will be affected</li>
                <li>• Target dates will be recalculated</li>
                <li>• Assigned users will be notified</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowETAModal(false)
                  setNewETA('')
                  setETAReason('')
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!newETA) {
                    alert('Please select a new ETA date')
                    return
                  }
                  if (!etaReason.trim()) {
                    alert('Please provide a reason for the ETA change')
                    return
                  }
                  
                  setIsUpdating(true)
                  
                  try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    // Show success message
                    alert(`✅ ETA Updated Successfully!\n\nOld ETA: ${mockShipment.eta}\nNew ETA: ${newETA}\n\nWorkflow steps have been recalculated and assigned users have been notified.`)
                    
                    // Close modal and reset form
                    setShowETAModal(false)
                    setNewETA('')
                    setETAReason('')
                    
                    // Refresh the page to show updated data
                    window.location.reload()
                  } catch (error) {
                    alert('Failed to update ETA. Please try again.')
                  } finally {
                    setIsUpdating(false)
                  }
                }}
                disabled={isUpdating || !newETA || !etaReason.trim()}
                loading={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm ETA Change'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FadeIn>
  )
}
