'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Input } from '@/components/ui'
import { motion } from 'framer-motion'
import { FadeIn, StaggerChildren } from '@/components/animations'
import { cn } from '@/lib/utils'

interface DeliverySectionProps {
  shipmentId: string
}

const Icons = {
  Truck: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2.5a.5.5 0 01-1 0V16zm-1.121-5.121a3 3 0 00-4.242 0L5 12.636V6h7v4.636l-1.121 1.243z" />
    </svg>
  ),
  Box: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Checklist: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
    </svg>
  ),
}

export function DeliverySection({ shipmentId }: DeliverySectionProps) {
  // Modal states
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [showGoodsReceiptModal, setShowGoodsReceiptModal] = useState(false)
  const [showInspectionModal, setShowInspectionModal] = useState(false)

  return (
    <div className="space-y-8 pb-12">
      <FadeIn>
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">Final Fulfillment</h3>
          <p className="text-sm text-gray-500">Coordinate inland logistics and terminal receipt verification</p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid gap-6">
        <MilestoneCard
          step="16.0"
          title="Transport Dispatch"
          description="Mobilize land transport for final delivery to the designated distribution center"
          icon={<Icons.Truck />}
          actionLabel="Assign Carrier"
          onAction={() => setShowTransportModal(true)}
        />
        <MilestoneCard
          step="17.0"
          title="Consignee Receipt"
          description="Formal acknowledgment of physical goods transfer at the warehouse"
          icon={<Icons.Box />}
          actionLabel="Log Receipt"
          onAction={() => setShowGoodsReceiptModal(true)}
        />
        <MilestoneCard
          step="18.0"
          title="Quality Assurance"
          description="Execute final condition check and post-delivery quality inspection"
          icon={<Icons.Checklist />}
          actionLabel="Submit QA Report"
          onAction={() => setShowInspectionModal(true)}
        />
      </StaggerChildren>

      {/* Modals */}
      <Modal open={showTransportModal} onClose={() => setShowTransportModal(false)} title="Transport Arrangement">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Carrier Entity</label>
            <Input placeholder="Transport provider name" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Vehicle Registry</label>
              <Input placeholder="Plate number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expected ETA</label>
              <Input type="date" />
            </div>
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('transport-arrangement', {})
            setShowTransportModal(false)
          }}>Confirm Dispatch</Button>
        </div>
      </Modal>

      <Modal open={showGoodsReceiptModal} onClose={() => setShowGoodsReceiptModal(false)} title="Goods Receipt Verification">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Receipt Custodian</label>
            <Input placeholder="Authorized receiver name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Arrival Condition</label>
            <select className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold">
              <option value="perfect">Perfect - No Damage</option>
              <option value="minor">Minor Packaging Scuffs</option>
              <option value="discrepancy">Quantity Discrepancy</option>
              <option value="damaged">Damaged - Raise Claim</option>
            </select>
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('goods-received', {})
            setShowGoodsReceiptModal(false)
          }}>Confirm Arrival</Button>
        </div>
      </Modal>

      <Modal open={showInspectionModal} onClose={() => setShowInspectionModal(false)} title="QA Inspection Report">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Inspector Identification</label>
            <Input placeholder="Lead QA inspector" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">QA Outcome</label>
            <select className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold">
              <option value="passed">QA Passed - Tier 1</option>
              <option value="conditional">QA Passed - Conditional</option>
              <option value="rejected">QA Rejected</option>
            </select>
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('quality-inspection', {})
            setShowInspectionModal(false)
          }}>Archive QA Report</Button>
        </div>
      </Modal>
    </div>
  )
}

function MilestoneCard({ step, title, description, icon, statusBadge, actionLabel, onAction }: {
  step: string,
  title: string,
  description: string,
  icon: React.ReactNode,
  statusBadge?: React.ReactNode,
  actionLabel: string,
  onAction: () => void
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="group">
      <Card className="overflow-hidden border-none bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-xl hover:ring-primary-100">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-6 w-10 items-center justify-center rounded-lg bg-gray-900 text-[10px] font-black text-white">
                S {step}
              </span>
              <h4 className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h4>
              {statusBadge}
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">{description}</p>
          </div>
          <div className="shrink-0">
            <Button
              onClick={onAction}
              className="rounded-xl bg-white text-gray-900 ring-1 ring-gray-200 hover:bg-gray-900 hover:text-white transition-all font-bold group-hover:shadow-lg"
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
