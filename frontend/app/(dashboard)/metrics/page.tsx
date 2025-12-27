'use client'

import { useState } from 'react'
import { Card, Button, Badge, Loading } from '@/components/ui'
import { LineChart } from '@/components/features/metrics/LineChart'
import { BarChart } from '@/components/features/metrics/BarChart'
import { PieChart } from '@/components/features/metrics/PieChart'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/animations'
import { 
  useDashboardMetrics,
  useShipmentTrend, 
  useClearanceTimeTrend, 
  useStatusDistribution,
  useDepartmentMetrics 
} from '@/lib/api/hooks'

export default function MetricsPage() {
  const [dateRange, setDateRange] = useState('30d')
  
  // Fetch metrics data
  const { data: dashboardMetrics, isLoading: loadingDashboard } = useDashboardMetrics()
  const { data: shipmentTrend, isLoading: loadingShipments } = useShipmentTrend(30)
  const { data: clearanceTime, isLoading: loadingClearance } = useClearanceTimeTrend(30)
  const { data: statusDistribution, isLoading: loadingStatus } = useStatusDistribution()
  const { data: departmentMetrics, isLoading: loadingDepartments } = useDepartmentMetrics()
  
  const isLoading = loadingDashboard || loadingShipments || loadingClearance || loadingStatus || loadingDepartments

  // Transform API data for charts
  const clearanceTimeData = clearanceTime?.map((item: any) => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.value,
  })) || []

  const departmentData = departmentMetrics?.map((dept: any) => ({
    label: dept.name,
    value: dept.avgClearanceTime,
    color: dept.name === 'Business Unit' ? '#3B82F6' : 
           dept.name === 'Finance' ? '#10B981' : '#F59E0B',
  })) || []

  const statusData = statusDistribution?.map((status: any) => ({
    label: status.name,
    value: status.value,
    color: status.color,
  })) || []

  const onTimeRateData = shipmentTrend?.slice(-6).map((item: any) => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    value: Math.round((item.value / (item.value + 5)) * 100), // Mock on-time calculation
  })) || []

  const handleExport = () => {
    // Export metrics data
    console.log('Exporting metrics...')
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Loading metrics..." />
      </div>
    )
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metrics & Reporting</h1>
            <p className="mt-2 text-gray-600">
              Performance insights and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <StaggerChildren>
          <div className="grid gap-6 md:grid-cols-4">
            <StaggerItem>
              <Card>
                <div className="text-sm text-gray-600">Avg Clearance Time</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboardMetrics?.avgClearanceTime || 0} days
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Badge variant={dashboardMetrics?.clearanceTimeChange && dashboardMetrics.clearanceTimeChange < 0 ? "success" : "warning"}>
                    {dashboardMetrics?.clearanceTimeChange && dashboardMetrics.clearanceTimeChange < 0 ? '↓' : '↑'} {Math.abs(dashboardMetrics?.clearanceTimeChange || 0)}d
                  </Badge>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <div className="text-sm text-gray-600">On-Time Rate</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboardMetrics?.onTimeRate || 0}%
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Badge variant={dashboardMetrics?.onTimeRateChange && dashboardMetrics.onTimeRateChange > 0 ? "success" : "warning"}>
                    {dashboardMetrics?.onTimeRateChange && dashboardMetrics.onTimeRateChange > 0 ? '↑' : '↓'} {Math.abs(dashboardMetrics?.onTimeRateChange || 0)}%
                  </Badge>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <div className="text-sm text-gray-600">Cost Avoidance</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  ${dashboardMetrics?.costAvoidance ? (dashboardMetrics.costAvoidance / 1000).toFixed(0) : 0}K
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Badge variant="success">↑ 18%</Badge>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <div className="text-sm text-gray-600">Total Shipments</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {dashboardMetrics?.totalShipments || 0}
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Badge variant="info">
                    {dashboardMetrics?.shipmentsChange && dashboardMetrics.shipmentsChange > 0 ? '↑' : '↓'} {Math.abs(dashboardMetrics?.shipmentsChange || 0)}
                  </Badge>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </Card>
            </StaggerItem>
          </div>
        </StaggerChildren>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Clearance Time Trend
            </h3>
            <LineChart data={clearanceTimeData} color="#0066FF" />
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              On-Time Rate Trend
            </h3>
            <LineChart data={onTimeRateData} color="#10B981" />
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Department Performance
            </h3>
            <BarChart data={departmentData} />
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Shipment Status Distribution
            </h3>
            <div className="flex justify-center">
              <PieChart data={statusData} />
            </div>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Demurrage Savings Calculator
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-sm text-gray-600">Demurrage Avoided</div>
              <div className="mt-2 text-2xl font-bold text-green-600">$85,000</div>
              <div className="mt-1 text-sm text-gray-500">15 shipments cleared on time</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-sm text-gray-600">Storage Fees Saved</div>
              <div className="mt-2 text-2xl font-bold text-blue-600">$28,000</div>
              <div className="mt-1 text-sm text-gray-500">8 shipments early collection</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <div className="text-sm text-gray-600">Penalty Avoidance</div>
              <div className="mt-2 text-2xl font-bold text-purple-600">$12,000</div>
              <div className="mt-1 text-sm text-gray-500">4 shipments compliance met</div>
            </div>
          </div>
        </Card>
      </div>
    </FadeIn>
  )
}
