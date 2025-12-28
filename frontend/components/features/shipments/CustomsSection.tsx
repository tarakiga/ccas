'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Input } from '@/components/ui'
import { motion } from 'framer-motion'
import { FadeIn, StaggerChildren } from '@/components/animations'
import { cn } from '@/lib/utils'

interface CustomsSectionProps {
  shipmentId: string
}

const Icons = {
  Ship: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2.5a.5.5 0 01-1 0V16zm-1.121-5.121a3 3 0 00-4.242 0L5 12.636V6h7v4.636l-1.121 1.243z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Search: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
}

export function CustomsSection({ shipmentId }: CustomsSectionProps) {
  // Modal states
  const [showArrivalNoticeModal, setShowArrivalNoticeModal] = useState(false)
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)
  const [showBayanModal, setShowBayanModal] = useState(false)
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [showReleaseOrderModal, setShowReleaseOrderModal] = useState(false)
  const [showFasakalModal, setShowFasakalModal] = useState(false)
  const [showGatePassModal, setShowGatePassModal] = useState(false)

  const [declarationData, setDeclarationData] = useState({ declNo: '', declDate: '' })
  const [bayanData, setBayanData] = useState({ bayanNo: '', bayanDate: '' })

  return (
    <div className="space-y-8 pb-12">
      <FadeIn>
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">Customs Operations</h3>
          <p className="text-sm text-gray-500">Manage regulatory compliance and port clearance sequences</p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid gap-6">
        <MilestoneCard
          step="7.0"
          title="Arrival Notification"
          description="Receive and verify the formal vessel arrival notice from the shipping line"
          icon={<Icons.Ship />}
          actionLabel="Log Notification"
          onAction={() => setShowArrivalNoticeModal(true)}
        />
        <MilestoneCard
          step="8.0"
          title="Customs Declaration"
          description="Submit formal shipment declaration to the customs authority portal"
          icon={<Icons.Clipboard />}
          statusBadge={!declarationData.declNo ? <Badge variant="warning">Awaiting Submission</Badge> : null}
          actionLabel="File Declaration"
          onAction={() => setShowDeclarationModal(true)}
        />
        <MilestoneCard
          step="9.0"
          title="Bayan Generation"
          description="Generate and verify the official Bayan document for clearing"
          icon={<Icons.Clipboard />}
          actionLabel="Retrieve Bayan"
          onAction={() => setShowBayanModal(true)}
        />
        <MilestoneCard
          step="10.0"
          title="Physical Inspection"
          description="Coordinate mandatory customs inspection and container scanning"
          icon={<Icons.Search />}
          actionLabel="Log Findings"
          onAction={() => setShowInspectionModal(true)}
        />
        <MilestoneCard
          step="12.0"
          title="Release Authorization"
          description="Official release order granted by customs after duty settlement"
          icon={<Icons.Check />}
          actionLabel="Authorize Release"
          onAction={() => setShowReleaseOrderModal(true)}
        />
        <MilestoneCard
          step="14.0"
          title="Fasakal Issuance"
          description="Final clearance document required for port exit"
          icon={<Icons.Check />}
          actionLabel="Log Fasakal"
          onAction={() => setShowFasakalModal(true)}
        />
        <MilestoneCard
          step="15.0"
          title="Gate Pass Activation"
          description="Secure terminal gate pass for container pick-up"
          icon={<Icons.Check />}
          actionLabel="Issue Gate Pass"
          onAction={() => setShowGatePassModal(true)}
        />
      </StaggerChildren>

      {/* Modals */}
      <Modal open={showArrivalNoticeModal} onClose={() => setShowArrivalNoticeModal(false)} title="Arrival Notice Verification">
        <div className="space-y-4 py-2">
          <div className="rounded-xl bg-blue-50/50 p-4 ring-1 ring-blue-100">
            <p className="text-sm font-medium text-blue-800">Ensure vessel name and ETA match voyage documentation.</p>
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('arrival-notice', {})
            setShowArrivalNoticeModal(false)
          }}>Confirm Arrival</Button>
        </div>
      </Modal>

      <Modal open={showDeclarationModal} onClose={() => setShowDeclarationModal(false)} title="Customs Declaration Filing">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Declaration Number</label>
            <Input value={declarationData.declNo} onChange={(e) => setDeclarationData({ ...declarationData, declNo: e.target.value })} placeholder="D-XXXXX-XXXX" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Submission Date</label>
            <Input type="date" value={declarationData.declDate} onChange={(e) => setDeclarationData({ ...declarationData, declDate: e.target.value })} />
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('customs-declaration', declarationData)
            setShowDeclarationModal(false)
          }}>Submit Filing</Button>
        </div>
      </Modal>

      <Modal open={showBayanModal} onClose={() => setShowBayanModal(false)} title="Bayan Document Sync">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bayan Identification</label>
            <Input value={bayanData.bayanNo} onChange={(e) => setBayanData({ ...bayanData, bayanNo: e.target.value })} placeholder="B-XXXXX" />
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnSubmission('bayan-generation', bayanData)
            setShowBayanModal(false)
          }}>Log Bayan</Button>
        </div>
      </Modal>

      <Modal open={showInspectionModal} onClose={() => setShowInspectionModal(false)} title="Inspection Report">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Inspection Outcome</label>
            <select className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold">
              <option value="passed">Passed - No Discrepancies</option>
              <option value="manual">Passed - Manual Check</option>
              <option value="failed">Failed - Held for Review</option>
            </select>
          </div>
          <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
            const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
            autoCompleteOnApproval('customs-inspection', {})
            setShowInspectionModal(false)
          }}>Submit Report</Button>
        </div>
      </Modal>

      <Modal open={showReleaseOrderModal} onClose={() => setShowReleaseOrderModal(false)} title="Customs Release Authorization">
        <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
          const { autoCompleteOnApproval } = await import('@/lib/workflow/workflow-automation')
          autoCompleteOnApproval('release-order', {})
          setShowReleaseOrderModal(false)
        }}>Authorize Release</Button>
      </Modal>

      <Modal open={showFasakalModal} onClose={() => setShowFasakalModal(false)} title="Fasakal Verification">
        <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
          const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
          autoCompleteOnSubmission('fasakal-issuance', {})
          setShowFasakalModal(false)
        }}>Issue Fasakal</Button>
      </Modal>

      <Modal open={showGatePassModal} onClose={() => setShowGatePassModal(false)} title="Terminal Gate Pass">
        <Button className="w-full py-6 rounded-xl bg-primary-600 font-bold" onClick={async () => {
          const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
          autoCompleteOnSubmission('gate-pass', {})
          setShowGatePassModal(false)
        }}>Activate Pass</Button>
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
