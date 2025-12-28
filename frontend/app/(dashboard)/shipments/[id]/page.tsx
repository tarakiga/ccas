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
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ShipmentStatus, RiskLevel } from '@/types'

// Custom Icons for a premium look
const Icons = {
  Ship: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2.5a.5.5 0 01-1 0V16zm-1.121-5.121a3 3 0 00-4.242 0L5 12.636V6h7v4.636l-1.121 1.243z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Activity: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const { data: shipment, isLoading } = useShipment(params.id)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showETAModal, setShowETAModal] = useState(false)
  const [formStep, setFormStep] = useState(1) // 1: Identification, 2: Financials
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
            setFormStep(1)
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
          title="Edit Shipment Details"
          size="lg"
        >
          <div className="space-y-6 py-2">
            {/* Step Indicator */}
            <div className="mb-8 flex items-center justify-between px-2">
              <div className="flex flex-1 items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  formStep >= 1 ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-gray-100 text-gray-400"
                )}>1</div>
                <div className={cn("mx-2 h-1 flex-1 rounded-full", formStep >= 2 ? "bg-primary-600" : "bg-gray-100")} />
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  formStep >= 2 ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-gray-100 text-gray-400"
                )}>2</div>
              </div>
              <div className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Step {formStep} of 2
              </div>
            </div>

            {formStep === 1 ? (
              <FadeIn>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                      <Icons.Ship />
                      Basic Identification
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shipment Number</label>
                    <input
                      type="text"
                      value={editFormData.shipmentNumber || mockShipment.shipmentNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, shipmentNumber: e.target.value })}
                      className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">LC Number (Step 1.6)</label>
                    <input
                      type="text"
                      value={editFormData.lcNumber || mockShipment.lcNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, lcNumber: e.target.value })}
                      className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Principal (Step 1.1)</label>
                    <input
                      type="text"
                      value={editFormData.principal || mockShipment.principal}
                      onChange={(e) => setEditFormData({ ...editFormData, principal: e.target.value })}
                      className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Brand (Step 1.2)</label>
                    <input
                      type="text"
                      value={editFormData.brand || mockShipment.brand}
                      onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                      className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              </FadeIn>
            ) : (
              <FadeIn>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                        <Icons.Dollar />
                        Financial Records
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Invoice Number (Step 1.3)</label>
                      <input
                        type="text"
                        value={editFormData.invoiceNumber}
                        onChange={(e) => setEditFormData({ ...editFormData, invoiceNumber: e.target.value })}
                        placeholder="INV-2025-XXX"
                        className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Invoice Amount (OMR) (Step 1.4)</label>
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
                        className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Funds Required (11% of Invoice) (Step 1.5)</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={editFormData.fundsRequired ? `${editFormData.fundsRequired} OMR` : ''}
                          disabled
                          className="block w-full rounded-xl border-none bg-primary-50 px-4 py-4 text-primary-700 font-black shadow-inner"
                          placeholder="Calculated automatically..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Icons.Shield />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Notice */}
                  <div className="rounded-2xl bg-blue-50/50 p-6 ring-1 ring-blue-100">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Icons.Activity />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-blue-900">Dynamic Workflow Impact</h5>
                        <p className="mt-1 text-sm font-medium text-blue-700 leading-relaxed shadow-sm">
                          Saving these changes will automatically reconcile and complete associated workflow milestones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-4">
              <Button
                variant="ghost"
                className="rounded-xl px-6 font-bold text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  if (formStep > 1) {
                    setFormStep(formStep - 1)
                  } else {
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
                  }
                }}
              >
                {formStep > 1 ? 'Back' : 'Cancel'}
              </Button>

              <div className="flex gap-3">
                {formStep === 1 ? (
                  <Button
                    className="rounded-xl bg-primary-600 px-10 py-6 font-bold shadow-lg shadow-primary-200"
                    onClick={() => setFormStep(2)}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl bg-primary-600 px-10 py-6 font-bold shadow-lg shadow-primary-200"
                    onClick={async () => {
                      setIsUpdating(true)
                      try {
                        const { autoCompleteOnUpdate } = await import('@/lib/workflow/workflow-automation')
                        const updatedFields: string[] = []
                        if (editFormData.invoiceNumber) updatedFields.push('invoiceNumber')
                        if (editFormData.invoiceAmount) updatedFields.push('invoiceAmount')
                        if (editFormData.fundsRequired) updatedFields.push('fundsRequired')

                        const completedSteps = updatedFields.length > 0
                          ? await autoCompleteOnUpdate(updatedFields, {
                            invoiceNumber: editFormData.invoiceNumber,
                            invoiceAmount: editFormData.invoiceAmount,
                            fundsRequired: editFormData.fundsRequired,
                          })
                          : []

                        await new Promise(resolve => setTimeout(resolve, 1000))
                        alert(`✅ Shipment Updated Successfully!${completedSteps.length > 0 ? `\n\nAutomated: ${completedSteps.join(', ')}` : ''}`)
                        setShowEditModal(false)
                        setFormStep(1)
                        window.location.reload()
                      } catch (error) {
                        alert('Update failed. Please try again.')
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                    loading={isUpdating}
                    disabled={isUpdating}
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>

        {/* Update ETA Modal */}
        <Modal
          open={showETAModal}
          onClose={() => setShowETAModal(false)}
          title="Schedule Adjustment"
          size="md"
        >
          <div className="space-y-6 py-2">
            <div className="rounded-2xl bg-warning-50/50 p-6 ring-1 ring-warning-100">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
                  <Icons.Clock />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-warning-900">Critical Schedule Change</h5>
                  <p className="mt-1 text-sm font-medium text-warning-700 leading-relaxed">
                    Adjusting the ETA will trigger a cascading update for all dependent logistics and clearance milestones.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target ETA</label>
                <input
                  type="date"
                  value={newETA}
                  onChange={(e) => setNewETA(e.target.value)}
                  className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Adjustment Rationale</label>
                <textarea
                  rows={4}
                  value={etaReason}
                  onChange={(e) => setETAReason(e.target.value)}
                  placeholder="Provide a detailed explanation for this schedule shift..."
                  className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-5 ring-1 ring-gray-100">
              <h6 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Downstream Impact</h6>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  12 Pending Milestones will be rescheduled
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  Assigned stakeholders will be alerted
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                className="rounded-xl px-8 font-bold text-gray-500 hover:bg-gray-100"
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
                className="rounded-xl bg-primary-600 px-8 py-6 font-bold shadow-lg shadow-primary-200"
                onClick={async () => {
                  if (!newETA || !etaReason.trim()) return
                  setIsUpdating(true)
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    alert(`✅ ETA Updated Successfully!\nTarget dates have been recalculated.`)
                    setShowETAModal(false)
                    window.location.reload()
                  } catch (error) {
                    alert('Update failed.')
                  } finally {
                    setIsUpdating(false)
                  }
                }}
                disabled={isUpdating || !newETA || !etaReason.trim()}
                loading={isUpdating}
              >
                Confirm Adjustment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FadeIn >
  )
}
