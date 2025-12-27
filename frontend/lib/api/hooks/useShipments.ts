import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { Shipment, ShipmentFilters, PaginatedResponse } from '@/types'
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'

export const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (filters: ShipmentFilters) => [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
}

interface UseShipmentsParams extends ShipmentFilters {
  page?: number
  pageSize?: number
}

export function useShipments(params?: UseShipmentsParams) {
  return useQuery({
    queryKey: shipmentKeys.list(params || {}),
    queryFn: async () => {
      // Use mock data if enabled or if backend is unavailable
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for shipments')
        return MockApiService.getShipments(params)
      }

      try {
        const { data } = await apiClient.get<PaginatedResponse<Shipment>>('/shipments', {
          params,
        })
        return data
      } catch (_error) {
        console.warn('⚠️ Backend unavailable, falling back to mock data')
        return MockApiService.getShipments(params)
      }
    },
  })
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: async () => {
      // Use mock data if enabled or if backend is unavailable
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for shipment:', id)
        return MockApiService.getShipment(id)
      }

      try {
        const { data } = await apiClient.get<Shipment>(`/shipments/${id}`)
        return data
      } catch (_error) {
        console.warn('⚠️ Backend unavailable, falling back to mock data')
        return MockApiService.getShipment(id)
      }
    },
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (shipment: Partial<Shipment>) => {
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data to create shipment')
        return MockApiService.createShipment(shipment)
      }

      try {
        const { data } = await apiClient.post<Shipment>('/shipments', shipment)
        return data
      } catch (_error) {
        console.warn('⚠️ Backend unavailable, using mock data')
        return MockApiService.createShipment(shipment)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...shipment }: Partial<Shipment> & { id: string }) => {
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data to update shipment:', id)
        return MockApiService.updateShipment(id, shipment)
      }

      try {
        const { data } = await apiClient.put<Shipment>(`/shipments/${id}`, shipment)
        return data
      } catch (_error) {
        console.warn('⚠️ Backend unavailable, using mock data')
        return MockApiService.updateShipment(id, shipment)
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
      }
    },
  })
}

export function useDeleteShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data to delete shipment:', id)
        return MockApiService.deleteShipment(id)
      }

      try {
        await apiClient.delete(`/shipments/${id}`)
        return true
      } catch (_error) {
        console.warn('⚠️ Backend unavailable, using mock data')
        return MockApiService.deleteShipment(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
    },
  })
}
