/**
 * Mock data exports for testing components
 * 
 * Usage:
 * 1. Set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local
 * 2. Import mock data or MockApiService in your components
 * 3. Use MockApiService methods to simulate API calls
 */

// Main API Service
export { MockApiService, USE_MOCK_DATA, shouldUseMockData } from './api'

// Shipments
export {
  mockShipments,
  getMockShipments,
  getMockShipment,
  generateMockShipments,
  mockGetShipments,
  mockGetShipment,
  delay,
} from './shipments'

// Documents
export {
  mockDocuments,
  getMockDocumentsByShipment,
  getMockDocument,
  generateMockDocuments,
  type Document,
} from './documents'

// Alerts
export {
  mockAlerts,
  getMockAlertsByShipment,
  getMockUnacknowledgedAlerts,
  getMockAlertsBySeverity,
  getMockAlertsByCategory,
  generateMockAlerts,
  type MockAlert,
} from './alerts'

// Workflow
export {
  workflowSteps,
  generateMockWorkflowSteps,
  getMockWorkflowSteps,
  getMockUserTasks,
  type MockWorkflowStep,
} from './workflow'

// Metrics
export {
  mockDashboardMetrics,
  mockDepartmentMetrics,
  mockShipmentTrend,
  mockClearanceTimeTrend,
  mockStatusDistribution,
  mockRiskDistribution,
  mockDepartmentWorkload,
  generateMockTimeSeries,
  type DashboardMetrics,
  type DepartmentMetrics,
  type TimeSeriesData,
} from './metrics'
