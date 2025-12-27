'use client'

import { PageHeader } from '@/components/layouts'
import { Card, Button, Alert } from '@/components/ui'

export default function AlertsPage() {
  const mockAlerts = [
    { id: '1', shipment: 'SH-001', message: 'Demurrage risk - Day 6 approaching', severity: 'warning', time: '2 hours ago' },
    { id: '2', shipment: 'SH-002', message: 'Document missing - LC not received', severity: 'error', time: '5 hours ago' },
    { id: '3', shipment: 'SH-003', message: 'Step overdue - Customs payment pending', severity: 'critical', time: '1 day ago' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Monitor and manage system alerts"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Alerts' }]}
        actions={<Button variant="outline">Mark All Read</Button>}
      />

      <Card>
        <div className="space-y-4">
          {mockAlerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.severity as any}
              title={`Shipment ${alert.shipment}`}
              message={alert.message}
              onClose={() => {}}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
