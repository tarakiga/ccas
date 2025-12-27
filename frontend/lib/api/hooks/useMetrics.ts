import { useQuery } from '@tanstack/react-query'
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'

export const metricsKeys = {
  all: ['metrics'] as const,
  dashboard: () => [...metricsKeys.all, 'dashboard'] as const,
  departments: () => [...metricsKeys.all, 'departments'] as const,
  trends: () => [...metricsKeys.all, 'trends'] as const,
  shipmentTrend: (days: number) => [...metricsKeys.trends(), 'shipments', days] as const,
  clearanceTrend: (days: number) => [...metricsKeys.trends(), 'clearance', days] as const,
  distributions: () => [...metricsKeys.all, 'distributions'] as const,
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: metricsKeys.dashboard(),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📊 Using mock data for dashboard metrics')
        return MockApiService.getDashboardMetrics()
      }
      // TODO: Replace with real API call
      return MockApiService.getDashboardMetrics()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDepartmentMetrics() {
  return useQuery({
    queryKey: metricsKeys.departments(),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📊 Using mock data for department metrics')
        return MockApiService.getDepartmentMetrics()
      }
      // TODO: Replace with real API call
      return MockApiService.getDepartmentMetrics()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useShipmentTrend(days: number = 30) {
  return useQuery({
    queryKey: metricsKeys.shipmentTrend(days),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📈 Using mock data for shipment trend')
        return MockApiService.getShipmentTrend(days)
      }
      // TODO: Replace with real API call
      return MockApiService.getShipmentTrend(days)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useClearanceTimeTrend(days: number = 30) {
  return useQuery({
    queryKey: metricsKeys.clearanceTrend(days),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📈 Using mock data for clearance time trend')
        return MockApiService.getClearanceTimeTrend(days)
      }
      // TODO: Replace with real API call
      return MockApiService.getClearanceTimeTrend(days)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: [...metricsKeys.distributions(), 'status'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📊 Using mock data for status distribution')
        return MockApiService.getStatusDistribution()
      }
      // TODO: Replace with real API call
      return MockApiService.getStatusDistribution()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRiskDistribution() {
  return useQuery({
    queryKey: [...metricsKeys.distributions(), 'risk'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📊 Using mock data for risk distribution')
        return MockApiService.getRiskDistribution()
      }
      // TODO: Replace with real API call
      return MockApiService.getRiskDistribution()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
