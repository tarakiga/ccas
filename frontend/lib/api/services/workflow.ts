import { apiClient } from '../client'
import { WorkflowStep } from '@/types'

export const workflowService = {
  getSteps: async (shipmentId: string) => {
    const { data } = await apiClient.get<WorkflowStep[]>(`/shipments/${shipmentId}/workflow`)
    return data
  },

  completeStep: async (shipmentId: string, stepId: string, actualDate: string, notes?: string) => {
    const { data } = await apiClient.post<WorkflowStep>(
      `/shipments/${shipmentId}/workflow/${stepId}/complete`,
      { actualDate, notes }
    )
    return data
  },

  updateStep: async (shipmentId: string, stepId: string, updates: Partial<WorkflowStep>) => {
    const { data } = await apiClient.patch<WorkflowStep>(
      `/shipments/${shipmentId}/workflow/${stepId}`,
      updates
    )
    return data
  },
}
