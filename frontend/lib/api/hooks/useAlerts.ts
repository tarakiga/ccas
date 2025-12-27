import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'
import { AlertType, AlertSeverity } from '@/types'

export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (filters?: any) => [...alertKeys.lists(), filters] as const,
  shipment: (shipmentId: string) => [...alertKeys.all, 'shipment', shipmentId] as const,
}

interface UseAlertsParams {
  shipmentId?: string
  type?: AlertType
  severity?: AlertSeverity
  acknowledged?: boolean
}

export function useAlerts(params?: UseAlertsParams) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('🚨 Using mock data for alerts')
        return MockApiService.getAlerts(params)
      }
      // TODO: Replace with real API call
      return MockApiService.getAlerts(params)
    },
  })
}

export function useShipmentAlerts(shipmentId: string) {
  return useQuery({
    queryKey: alertKeys.shipment(shipmentId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('🚨 Using mock data for shipment alerts:', shipmentId)
        return MockApiService.getAlerts({ shipmentId })
      }
      // TODO: Replace with real API call
      return MockApiService.getAlerts({ shipmentId })
    },
    enabled: !!shipmentId,
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (USE_MOCK_DATA) {
        console.log('✅ Acknowledging alert (mock):', alertId)
        return MockApiService.acknowledgeAlert(alertId)
      }
      // TODO: Replace with real API call
      return MockApiService.acknowledgeAlert(alertId)
    },
    onSuccess: () => {
      // Invalidate all alert queries
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
  })
}

export function useBulkAcknowledgeAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alertIds: string[]) => {
      if (USE_MOCK_DATA) {
        console.log('✅ Bulk acknowledging alerts (mock):', alertIds.length)
        // Acknowledge each alert
        const results = await Promise.all(
          alertIds.map(id => MockApiService.acknowledgeAlert(id))
        )
        return results.filter(Boolean)
      }
      // TODO: Replace with real API call
      const results = await Promise.all(
        alertIds.map(id => MockApiService.acknowledgeAlert(id))
      )
      return results.filter(Boolean)
    },
    onSuccess: () => {
      // Invalidate all alert queries
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
  })
}
