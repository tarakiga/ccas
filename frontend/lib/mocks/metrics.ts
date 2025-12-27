/**
 * Mock metrics data for testing dashboard components
 */

export interface DashboardMetrics {
  totalShipments: number
  activeShipments: number
  completedShipments: number
  delayedShipments: number
  atRiskShipments: number
  avgClearanceTime: number
  onTimeDeliveryRate: number
  totalValue: number
  // Change indicators (vs previous period)
  shipmentsChange?: number
  atRiskChange?: number
  clearanceTimeChange?: number
  onTimeRate?: number
  onTimeRateChange?: number
  costAvoidance?: number
}

export interface DepartmentMetrics {
  department: string
  pendingTasks: number
  completedTasks: number
  avgCompletionTime: number
  efficiency: number
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export const mockDashboardMetrics: DashboardMetrics = {
  totalShipments: 156,
  activeShipments: 89,
  completedShipments: 67,
  delayedShipments: 12,
  atRiskShipments: 18,
  avgClearanceTime: 4.2,
  onTimeDeliveryRate: 87.5,
  totalValue: 45678900,
  // Change indicators
  shipmentsChange: 12,
  atRiskChange: -3,
  clearanceTimeChange: -0.5,
  onTimeRate: 94,
  onTimeRateChange: 2,
  costAvoidance: 125000,
}

export const mockDepartmentMetrics: DepartmentMetrics[] = [
  {
    department: 'Business Unit',
    pendingTasks: 23,
    completedTasks: 145,
    avgCompletionTime: 2.3,
    efficiency: 92.5,
  },
  {
    department: 'Finance',
    pendingTasks: 15,
    completedTasks: 178,
    avgCompletionTime: 1.8,
    efficiency: 95.2,
  },
  {
    department: 'Customs & Clearance',
    pendingTasks: 34,
    completedTasks: 201,
    avgCompletionTime: 3.1,
    efficiency: 88.7,
  },
]

export const mockShipmentTrend: TimeSeriesData[] = [
  { date: '2025-01-01', value: 12 },
  { date: '2025-01-02', value: 15 },
  { date: '2025-01-03', value: 18 },
  { date: '2025-01-04', value: 14 },
  { date: '2025-01-05', value: 20 },
  { date: '2025-01-06', value: 22 },
  { date: '2025-01-07', value: 19 },
  { date: '2025-01-08', value: 25 },
  { date: '2025-01-09', value: 23 },
  { date: '2025-01-10', value: 28 },
  { date: '2025-01-11', value: 26 },
  { date: '2025-01-12', value: 30 },
  { date: '2025-01-13', value: 27 },
  { date: '2025-01-14', value: 32 },
  { date: '2025-01-15', value: 29 },
  { date: '2025-01-16', value: 35 },
  { date: '2025-01-17', value: 33 },
]

export const mockClearanceTimeTrend: TimeSeriesData[] = [
  { date: '2025-01-01', value: 5.2 },
  { date: '2025-01-02', value: 4.8 },
  { date: '2025-01-03', value: 4.5 },
  { date: '2025-01-04', value: 4.9 },
  { date: '2025-01-05', value: 4.3 },
  { date: '2025-01-06', value: 4.1 },
  { date: '2025-01-07', value: 4.6 },
  { date: '2025-01-08', value: 4.2 },
  { date: '2025-01-09', value: 3.9 },
  { date: '2025-01-10', value: 4.0 },
  { date: '2025-01-11', value: 3.8 },
  { date: '2025-01-12', value: 4.2 },
  { date: '2025-01-13', value: 4.0 },
  { date: '2025-01-14', value: 3.7 },
  { date: '2025-01-15', value: 4.1 },
  { date: '2025-01-16', value: 3.9 },
  { date: '2025-01-17', value: 4.2 },
]

export const mockStatusDistribution = [
  { status: 'Completed', count: 67, percentage: 42.9 },
  { status: 'In Progress', count: 59, percentage: 37.8 },
  { status: 'At Risk', count: 18, percentage: 11.5 },
  { status: 'Delayed', count: 12, percentage: 7.7 },
]

export const mockRiskDistribution = [
  { level: 'Low', count: 98, percentage: 62.8 },
  { level: 'Medium', count: 28, percentage: 17.9 },
  { level: 'High', count: 18, percentage: 11.5 },
  { level: 'Critical', count: 12, percentage: 7.7 },
]

export const mockDepartmentWorkload = [
  { department: 'Business Unit', workload: 23 },
  { department: 'Finance', workload: 15 },
  { department: 'Customs & Clearance', workload: 34 },
]

/**
 * Generate mock time series data
 */
export function generateMockTimeSeries(
  days: number,
  minValue: number,
  maxValue: number
): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const value = Math.random() * (maxValue - minValue) + minValue

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 10) / 10,
    })
  }

  return data
}
