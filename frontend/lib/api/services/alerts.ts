import { apiClient } from '../client'
import { Alert, PaginatedResponse } from '@/types'

export const alertsService = {
  getAll: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await apiClient.get<PaginatedResponse<Alert>>('/alerts', {
      params: { page, pageSize },
    })
    return data
  },

  getUnacknowledged: async () => {
    const { data } = await apiClient.get<Alert[]>('/alerts/unacknowledged')
    return data
  },

  acknowledge: async (id: string) => {
    const { data } = await apiClient.post<Alert>(`/alerts/${id}/acknowledge`)
    return data
  },

  acknowledgeAll: async () => {
    const { data } = await apiClient.post('/alerts/acknowledge-all')
    return data
  },
}
