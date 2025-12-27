'use client'

import { Card, Badge, Button } from '@/components/ui'
import { StatCard } from '@/components/ui/StatCard'
import { StaggerChildren, StaggerItem } from '@/components/animations'

export function FinanceDashboard() {
  const metrics = [
    { title: 'Pending LC Approvals', value: 12, change: 3, trend: 'up' as const, icon: '📋' },
    { title: 'Fund Requirements', value: '$2.4M', change: 15, trend: 'up' as const, icon: '💰' },
    { title: 'DAN Signing Delays', value: 5, change: -2, trend: 'down' as const, icon: '⏰' },
    { title: 'Payment Processing', value: 18, change: 4, trend: 'up' as const, icon: '💳' },
  ]

  const lcStatus = [
    { id: 1, shipment: 'SH-001', principal: 'Toyota', amount: '$450,000', status: 'pending_approval', daysWaiting: 2 },
    { id: 2, shipment: 'SH-005', principal: 'Honda', amount: '$380,000', status: 'approved', daysWaiting: 0 },
    { id: 3, shipment: 'SH-008', principal: 'Nissan', amount: '$520,000', status: 'pending_funds', daysWaiting: 4 },
  ]

  const danDelays = [
    { id: 1, shipment: 'SH-003', principal: 'BMW', daysDelayed: 3, reason: 'Missing signatures' },
    { id: 2, shipment: 'SH-007', principal: 'Mercedes', daysDelayed: 5, reason: 'Document review' },
    { id: 3, shipment: 'SH-012', principal: 'Audi', daysDelayed: 2, reason: 'Approval pending' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>
      case 'pending_funds':
        return <Badge variant="info">Pending Funds</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor LC status, fund requirements, and payment processing
        </p>
      </div>

      {/* Metrics */}
      <StaggerChildren>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <StaggerItem key={index}>
              <StatCard
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={<span className="text-2xl">{metric.icon}</span>}
              />
            </StaggerItem>
          ))}
        </div>
      </StaggerChildren>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LC Status Overview */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">LC Status Overview</h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {lcStatus.map((lc) => (
              <div key={lc.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{lc.shipment}</span>
                      {getStatusBadge(lc.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{lc.principal}</p>
                    <p className="mt-1 text-lg font-semibold text-primary-600">{lc.amount}</p>
                  </div>
                  {lc.daysWaiting > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Waiting</p>
                      <p className="text-lg font-semibold text-orange-600">{lc.daysWaiting}d</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* DAN Signing Delays */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">DAN Signing Delays</h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {danDelays.map((delay) => (
              <div key={delay.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{delay.shipment}</span>
                      <Badge variant="error">{delay.daysDelayed}d delay</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{delay.principal}</p>
                    <p className="mt-2 text-sm text-gray-500">{delay.reason}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fund Requirements Widget */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Fund Requirements</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">$1.2M</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">8 Shipments</p>
              <Button size="sm" className="mt-2">Review</Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
            <div>
              <p className="text-sm text-gray-600">Next Week</p>
              <p className="text-2xl font-bold text-gray-900">$850K</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">5 Shipments</p>
              <Button size="sm" variant="outline">Plan</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
