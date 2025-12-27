import { apiClient } from '../client'
import { Shipment, ShipmentFilters, PaginatedResponse, ApiResponse } from '@/types'

export const shipmentsService = {
  getAll: async (filters?: ShipmentFilters) => {
    const { data } = await apiClient.get<PaginatedResponse<Shipment>>('/shipments', {
      params: filters,
    })
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Shipment>(`/shipments/${id}`)
    return data
  },

  create: async (shipment: Partial<Shipment>) => {
    const { data } = await apiClient.post<Shipment>('/shipments', shipment)
    return data
  },

  update: async (id: string, shipment: Partial<Shipment>) => {
    const { data } = await apiClient.put<Shipment>(`/shipments/${id}`, shipment)
    return data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/shipments/${id}`)
    return data
  },

  updateETA: async (id: string, eta: string) => {
    const { data } = await apiClient.patch<Shipment>(`/shipments/${id}/eta`, { eta })
    return data
  },
}
