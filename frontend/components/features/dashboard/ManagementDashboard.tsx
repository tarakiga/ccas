'use client'

import { Card, Badge, Button } from '@/components/ui'
import { StatCard } from '@/components/ui/StatCard'
import { StaggerChildren, StaggerItem } from '@/components/animations'

export function ManagementDashboard() {
  const metrics = [
    { title: 'Avg Cycle Time', value: '4.2d', change: -0.5, trend: 'down' as const, icon: '⏱️' },
    { title: 'Cost Avoidance', value: '$125K', change: 18, trend: 'up' as const, icon: '💰' },
    { title: 'SLA Compliance', value: '94%', change: 3, trend: 'up' as const, icon: '✓' },
    { title: 'Active Shipments', value: 156, change: 12, trend: 'up' as const, icon: '📦' },
  ]

  const departmentPerformance = [
    { department: 'Business Unit', onTime: 92, delayed: 8, avgTime: '4.5d', trend: 'stable' },
    { department: 'Finance', onTime: 95, delayed: 5, avgTime: '3.8d', trend: 'improving' },
    { department: 'Customs & Clearance', onTime: 89, delayed: 11, avgTime: '5.2d', trend: 'declining' },
  ]

  const recentAlerts = [
    { id: 1, shipment: 'SH-003', type: 'critical', message: 'Approaching demurrage deadline', daysLeft: 1 },
    { id: 2, shipment: 'SH-007', type: 'warning', message: 'Document verification pending', daysLeft: 2 },
    { id: 3, shipment: 'SH-012', type: 'info', message: 'Customs payment scheduled', daysLeft: 3 },
  ]

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <Badge variant="success">↑ Improving</Badge>
      case 'declining':
        return <Badge variant="error">↓ Declining</Badge>
      case 'stable':
        return <Badge variant="info">→ Stable</Badge>
      default:
        return <Badge variant="default">{trend}</Badge>
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      case 'info':
        return <Badge variant="info">Info</Badge>
      default:
        return <Badge variant="default">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor end-to-end performance, cost avoidance, and SLA compliance
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

      {/* Department Performance Comparison */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
        <div className="space-y-4">
          {departmentPerformance.map((dept, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{dept.department}</h4>
                    {getTrendBadge(dept.trend)}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">On Time</p>
                      <p className="text-2xl font-bold text-green-600">{dept.onTime}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delayed</p>
                      <p className="text-2xl font-bold text-red-600">{dept.delayed}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Time</p>
                      <p className="text-2xl font-bold text-gray-900">{dept.avgTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${dept.onTime}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost Avoidance Breakdown */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Cost Avoidance This Month</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Demurrage Avoided</p>
                <p className="text-2xl font-bold text-green-600">$85K</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">15 Shipments</p>
                <p className="text-xs text-gray-500">Cleared on time</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Storage Fees Saved</p>
                <p className="text-2xl font-bold text-blue-600">$28K</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">8 Shipments</p>
                <p className="text-xs text-gray-500">Early collection</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Penalty Avoidance</p>
                <p className="text-2xl font-bold text-purple-600">$12K</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">4 Shipments</p>
                <p className="text-xs text-gray-500">Compliance met</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Critical Alerts */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Critical Alerts</h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{alert.shipment}</span>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due in</p>
                    <p className={`text-lg font-semibold ${alert.daysLeft <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                      {alert.daysLeft}d
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SLA Compliance Chart */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">SLA Compliance Trend</h3>
        <div className="flex h-64 items-end justify-around gap-2">
          {[95, 92, 94, 96, 93, 94, 94].map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div className="relative w-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    value >= 95 ? 'bg-green-500' : value >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${(value / 100) * 200}px` }}
                />
                <p className="mt-2 text-center text-xs font-medium text-gray-600">{value}%</p>
              </div>
              <p className="mt-1 text-xs text-gray-500">W{index + 1}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
