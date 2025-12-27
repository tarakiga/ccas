'use client'

import { Card, Badge, Button } from '@/components/ui'
import { StatCard } from '@/components/ui/StatCard'
import { StaggerChildren, StaggerItem } from '@/components/animations'

export function CustomsDashboard() {
  const metrics = [
    { title: 'Bayan Submissions', value: 24, change: 8, trend: 'up' as const, icon: '📄' },
    { title: 'Customs Payments Due', value: 6, change: -2, trend: 'down' as const, icon: '💵' },
    { title: 'Port Collections', value: 15, change: 5, trend: 'up' as const, icon: '🚢' },
    { title: 'Document Checks', value: 12, change: 3, trend: 'up' as const, icon: '✓' },
  ]

  const bayanStatus = [
    { id: 1, shipment: 'SH-002', principal: 'Toyota', status: 'submitted', submittedDate: '2025-01-20', daysAgo: 2 },
    { id: 2, shipment: 'SH-006', principal: 'Honda', status: 'pending', submittedDate: null, daysAgo: 0 },
    { id: 3, shipment: 'SH-009', principal: 'Nissan', status: 'approved', submittedDate: '2025-01-18', daysAgo: 4 },
  ]

  const customsPayments = [
    { id: 1, shipment: 'SH-004', principal: 'BMW', amount: '$12,500', dueDate: '2025-01-23', daysUntilDue: 1 },
    { id: 2, shipment: 'SH-010', principal: 'Mercedes', amount: '$15,800', dueDate: '2025-01-24', daysUntilDue: 2 },
    { id: 3, shipment: 'SH-013', principal: 'Audi', amount: '$11,200', dueDate: '2025-01-25', daysUntilDue: 3 },
  ]

  const portCollections = [
    { id: 1, shipment: 'SH-011', principal: 'Lexus', scheduled: '2025-01-22 10:00', status: 'scheduled' },
    { id: 2, shipment: 'SH-014', principal: 'Infiniti', scheduled: '2025-01-22 14:00', status: 'scheduled' },
    { id: 3, shipment: 'SH-016', principal: 'Acura', scheduled: '2025-01-23 09:00', status: 'pending' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'submitted':
        return <Badge variant="info">Submitted</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'scheduled':
        return <Badge variant="info">Scheduled</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customs & Clearance Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track Bayan submissions, customs payments, and port collections
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
        {/* Bayan Submission Status */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bayan Submission Status</h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {bayanStatus.map((bayan) => (
              <div key={bayan.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{bayan.shipment}</span>
                      {getStatusBadge(bayan.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{bayan.principal}</p>
                    {bayan.submittedDate && (
                      <p className="mt-1 text-xs text-gray-500">
                        Submitted {bayan.daysAgo} days ago
                      </p>
                    )}
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

        {/* Customs Payment Deadlines */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Customs Payment Deadlines</h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {customsPayments.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{payment.shipment}</span>
                      {payment.daysUntilDue <= 1 && <Badge variant="error">Urgent</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{payment.principal}</p>
                    <p className="mt-1 text-lg font-semibold text-primary-600">{payment.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due in</p>
                    <p className={`text-lg font-semibold ${payment.daysUntilDue <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                      {payment.daysUntilDue}d
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Port Collection Schedule */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Port Collection Schedule</h3>
        <div className="space-y-3">
          {portCollections.map((collection) => (
            <div key={collection.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{collection.shipment}</span>
                    {getStatusBadge(collection.status)}
                  </div>
                  <p className="text-sm text-gray-600">{collection.principal}</p>
                  <p className="text-sm text-gray-500">{collection.scheduled}</p>
                </div>
              </div>
              <Button size="sm">View Details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
