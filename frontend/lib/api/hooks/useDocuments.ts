import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (shipmentId: string) => [...documentKeys.lists(), shipmentId] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
}

export function useDocuments(shipmentId: string) {
  return useQuery({
    queryKey: documentKeys.list(shipmentId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        console.log('📄 Using mock data for documents')
        return MockApiService.getDocuments(shipmentId)
      }
      // TODO: Replace with real API call
      return MockApiService.getDocuments(shipmentId)
    },
    enabled: !!shipmentId,
  })
}

export function useUploadDocument(shipmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (USE_MOCK_DATA) {
        console.log('📤 Uploading document (mock):', file.name)
        return MockApiService.uploadDocument(shipmentId, file)
      }
      // TODO: Replace with real API call
      return MockApiService.uploadDocument(shipmentId, file)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list(shipmentId) })
    },
  })
}

export function useDeleteDocument(shipmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (USE_MOCK_DATA) {
        console.log('🗑️ Deleting document (mock):', documentId)
        return MockApiService.deleteDocument(documentId)
      }
      // TODO: Replace with real API call
      return MockApiService.deleteDocument(documentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list(shipmentId) })
    },
  })
}
