'use client'

import { useMemo } from 'react'
import { Shipment } from '@/types'
import { Card, Badge, StatCard } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { FadeIn, StaggerChildren } from '@/components/animations'
import { getMockWorkflowSteps } from '@/lib/mocks/workflow'

interface ShipmentOverviewProps {
  shipment: Shipment
}

// Custom Icons for a premium look
const Icons = {
  Ship: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Calendar: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Activity: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Shield: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
}

export function ShipmentOverview({ shipment }: ShipmentOverviewProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'at_risk': return 'warning'
      case 'delayed': return 'error'
      case 'in_progress': return 'info'
      default: return 'default'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  // Get workflow steps and calculate progress dynamically
  const workflowProgress = useMemo(() => {
    const steps = getMockWorkflowSteps(shipment.id)
    const total = steps.length
    const completed = steps.filter(s => s.status === 'completed').length
    const inProgress = steps.filter(s => s.status === 'in_progress' || s.status === 'ready').length
    const overdue = steps.filter(s => s.status === 'overdue' || s.status === 'blocked').length
    const pending = steps.filter(s => s.status === 'pending').length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, overdue, pending, percentage }
  }, [shipment.id])

  // Calculate demurrage dynamically based on days past ETA
  // Demurrage typically starts after 7 days of free time at port
  const DAILY_DEMURRAGE_RATE = 320 // OMR per day
  const FREE_TIME_DAYS = 7

  const daysPostEta = shipment.daysPostEta || 0
  const demurrageDays = Math.max(0, daysPostEta - FREE_TIME_DAYS)
  const demurrageRisk = demurrageDays * DAILY_DEMURRAGE_RATE

  // Calculate financial data dynamically
  const financialData = {
    lcAmount: 450000,
    customsDuty: 12500,
    portCharges: 3200,
    demurrageRisk,
    totalCost: 450000 + 12500 + 3200 + demurrageRisk,
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Shipment Information Section */}
      <FadeIn>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-gray-900">Shipment Details</h3>
            <Badge variant="default" className="px-3 py-1 font-medium">Updated 5 min ago</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Shipment Number', value: shipment.shipmentNumber, icon: <Icons.Ship /> },
              { label: 'Principal', value: shipment.principal, icon: <Icons.Shield /> },
              { label: 'Brand', value: shipment.brand, icon: <Icons.Activity /> },
              { label: 'LC Number', value: shipment.lcNumber, icon: <Icons.Dollar /> },
              { label: 'ETA', value: formatDate(shipment.eta), icon: <Icons.Calendar /> },
              { label: 'Current Step', value: shipment.currentStep || 'N/A', icon: <Icons.Clock /> },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="group relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                  <p className="mt-1 text-base font-bold text-gray-900">{item.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Status and Risk cards with custom styling */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                <Icons.Activity />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</p>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(shipment.status)} className="px-3 py-1 rounded-full text-xs font-bold ring-2 ring-white">
                    {shipment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                <Icons.Shield />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Risk Level</p>
                <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-4 tracking-tighter ${getRiskColor(shipment.riskLevel)}`}>
                  {shipment.riskLevel.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Financial Summary Section */}
      <section>
        <div className="mb-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">Financial Summary</h3>
          <p className="text-sm text-gray-500">Real-time overview of shipment costs and liabilities</p>
        </div>
        <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="LC Amount"
            value={financialData.lcAmount}
            className="border-none bg-gradient-to-br from-blue-50 to-white shadow-sm ring-1 ring-blue-100"
            icon={<Icons.Dollar />}
            animate
          />
          <StatCard
            title="Customs Duty"
            value={financialData.customsDuty}
            className="border-none bg-gradient-to-br from-emerald-50 to-white shadow-sm ring-1 ring-emerald-100"
            icon={<Icons.Shield />}
            animate
          />
          <StatCard
            title="Port Charges"
            value={financialData.portCharges}
            className="border-none bg-gradient-to-br from-purple-50 to-white shadow-sm ring-1 ring-purple-100"
            icon={<Icons.Activity />}
            animate
          />
          <StatCard
            title="Days Post-ETA"
            value={`${daysPostEta} days`}
            className={`border-none ${daysPostEta > 0 ? 'bg-orange-50 ring-orange-100' : 'bg-gray-50 ring-gray-100'}`}
            trend={daysPostEta > 0 ? 'up' : 'neutral'}
            icon={<Icons.Clock />}
            animate={false}
          />
          <StatCard
            title="Demurrage Risk"
            value={demurrageRisk > 0 ? `${demurrageRisk.toLocaleString()} OMR` : '0 OMR'}
            className={`border-none ${demurrageRisk > 0 ? 'bg-gradient-to-br from-rose-50 to-white shadow-sm ring-1 ring-rose-100' : 'bg-gray-50 ring-gray-100'}`}
            changeLabel={demurrageRisk > 0 ? `${demurrageDays}d × ${DAILY_DEMURRAGE_RATE} OMR/day` : 'Free time remaining'}
            trend={demurrageRisk > 0 ? 'up' : 'neutral'}
            icon={<Icons.Clock />}
            animate={false}
          />
          <StatCard
            title="Estimated Total"
            value={financialData.totalCost}
            dark={true}
            className="border-none shadow-xl"
            icon={<Icons.Dollar />}
            animate
          />
        </StaggerChildren>
      </section>

      {/* Progress and Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline Summary */}
        <Card className="flex flex-col justify-between overflow-hidden border-none bg-white p-6 shadow-xl ring-1 ring-gray-100">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Progress Tracking</h3>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Operational Milestone</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary-600">{workflowProgress.percentage}%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">of {workflowProgress.total} steps</p>
              </div>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100 p-1 ring-1 ring-inset ring-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${workflowProgress.percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 shadow-sm"
              />
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
              {[
                { label: 'Completed', value: workflowProgress.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Active', value: workflowProgress.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'At Risk', value: workflowProgress.overdue, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Pending', value: workflowProgress.pending, color: 'text-gray-400', bg: 'bg-gray-50' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color} font-bold`}>
                    {stat.value}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none bg-white p-6 shadow-xl ring-1 ring-gray-100">
          <div className="mb-6 flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-xs font-bold text-primary-600 hover:underline">View Journal</button>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Bayan submitted', user: 'John Doe', time: '2 hours ago', type: 'success' },
              { action: 'Customs payment completed', user: 'Jane Smith', time: '5 hours ago', type: 'success' },
              { action: 'Document uploaded', user: 'Mike Johnson', time: '1 day ago', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="group relative flex items-start gap-4">
                {index !== 2 && (
                  <div className="absolute left-2 top-8 h-8 w-[2px] bg-gray-100" />
                )}
                <div className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-white transition-transform group-hover:scale-125 ${activity.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  }`} />
                <div className="flex-1 rounded-xl border border-transparent p-2 transition-all hover:bg-gray-50 hover:border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                  <p className="text-xs font-medium text-gray-400">
                    {activity.user} <span className="mx-1 text-gray-300">•</span> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
