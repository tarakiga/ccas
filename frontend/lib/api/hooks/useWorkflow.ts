import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'

export const workflowKeys = {
  all: ['workflow'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (shipmentId: string) => [...workflowKeys.lists(), shipmentId] as const,
  userTasks: () => [...workflowKeys.all, 'userTasks'] as const,
}

export function useWorkflowSteps(shipmentId: string) {
  return useQuery({
    queryKey: workflowKeys.list(shipmentId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('🔄 Using mock data for workflow steps')
        return MockApiService.getWorkflowSteps(shipmentId)
      }
      // TODO: Replace with real API call
      return MockApiService.getWorkflowSteps(shipmentId)
    },
    enabled: !!shipmentId,
  })
}

export function useUserTasks() {
  return useQuery({
    queryKey: workflowKeys.userTasks(),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📋 Using mock data for user tasks')
        return MockApiService.getUserTasks()
      }
      // TODO: Replace with real API call
      return MockApiService.getUserTasks()
    },
  })
}

export function useCompleteWorkflowStep(shipmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ stepId, notes }: { stepId: string; notes?: string }) => {
      if (USE_MOCK_DATA) {
        console.log('✅ Completing workflow step (mock):', stepId)
        return MockApiService.completeWorkflowStep(shipmentId, stepId, notes)
      }
      // TODO: Replace with real API call
      return MockApiService.completeWorkflowStep(shipmentId, stepId, notes)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.list(shipmentId) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.userTasks() })
    },
  })
}
