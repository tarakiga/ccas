import { apiClient } from '../client'

export interface MetricsData {
  averageClearanceTime: number
  onTimeRate: number
  demurrageSavings: number
  totalShipments: number
  atRiskShipments: number
}

export const metricsService = {
  getDashboard: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get<MetricsData>('/metrics/dashboard', {
      params: { startDate, endDate },
    })
    return data
  },

  getClearanceTime: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get('/metrics/clearance-time', {
      params: { startDate, endDate },
    })
    return data
  },

  getOnTimeRate: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get('/metrics/on-time-rate', {
      params: { startDate, endDate },
    })
    return data
  },
}
