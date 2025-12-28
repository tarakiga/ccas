'use client'

import { useAuth } from '@/lib/auth'
import { StatCard, Card, Badge, Empty, Loading } from '@/components/ui'
import { StaggerChildren, StaggerItem } from '@/components/animations'
import { FinanceDashboard, CustomsDashboard, ManagementDashboard } from '@/components/features/dashboard'
import { useDashboardMetrics, useShipments } from '@/lib/api/hooks'
import { UserRole, RiskLevel } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: metrics, isLoading, error } = useDashboardMetrics()

  // Fetch at-risk shipments for the dashboard section
  const { data: atRiskData } = useShipments({
    riskLevel: [RiskLevel.HIGH, RiskLevel.CRITICAL],
    pageSize: 5
  })

  // Role-based dashboard routing
  if (user?.role === UserRole.FINANCE || user?.department === 'finance') {
    return <FinanceDashboard />
  }

  if (user?.role === UserRole.CUSTOMS_CLEARANCE || user?.department === 'customs_clearance') {
    return <CustomsDashboard />
  }

  if (user?.role === UserRole.MANAGEMENT || user?.department === 'management') {
    return <ManagementDashboard />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  // Error state
  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-600">Failed to load dashboard metrics</p>
          </div>
        </Card>
      </div>
    )
  }

  // Default Business Unit Dashboard
  const dashboardMetrics = [
    {
      title: 'Total Shipments',
      value: metrics.totalShipments,
      change: metrics.shipmentsChange || 0,
      trend: (metrics.shipmentsChange || 0) >= 0 ? 'up' as const : 'down' as const,
      icon: '📦'
    },
    {
      title: 'At Risk',
      value: metrics.atRiskShipments,
      change: metrics.atRiskChange || 0,
      trend: (metrics.atRiskChange || 0) <= 0 ? 'up' as const : 'down' as const,
      icon: '⚠️'
    },
    {
      title: 'On Time Rate',
      value: `${metrics.onTimeRate || metrics.onTimeDeliveryRate}%`,
      change: metrics.onTimeRateChange || 0,
      trend: (metrics.onTimeRateChange || 0) >= 0 ? 'up' as const : 'down' as const,
      icon: '✅'
    },
    {
      title: 'Avg Clearance',
      value: `${metrics.avgClearanceTime}d`,
      change: metrics.clearanceTimeChange || 0,
      trend: (metrics.clearanceTimeChange || 0) <= 0 ? 'up' as const : 'down' as const,
      icon: '⏱️'
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your shipments today
        </p>
      </div>

      <StaggerChildren>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardMetrics.map((metric, index) => (
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
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">At-Risk Shipments</h3>
            {atRiskData && atRiskData.items.length > 0 && (
              <Link href="/shipments?risk=high,critical" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            )}
          </div>
          {atRiskData && atRiskData.items.length > 0 ? (
            <div className="space-y-3">
              {atRiskData.items.slice(0, 5).map((shipment) => (
                <Link
                  key={shipment.id}
                  href={`/shipments/${shipment.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                >
                  <Badge variant={shipment.riskLevel === RiskLevel.CRITICAL ? 'error' : 'warning'}>
                    {shipment.riskLevel}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{shipment.shipmentNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{shipment.principal} • {shipment.brand}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {shipment.daysPostEta > 0 ? `+${shipment.daysPostEta}d` : 'Due soon'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No at-risk shipments"
              description="All shipments are on track"
              icon={<span className="text-4xl">✅</span>}
            />
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Badge variant="success">Completed</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Shipment #{1000 + i} cleared</p>
                  <p className="text-xs text-gray-500">{i} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
