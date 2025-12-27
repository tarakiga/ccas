# Mock Data for Testing

This directory contains comprehensive mock data for testing all components without a backend.

## Quick Start

### 1. Enable Mock Data

Add to your `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. Use in Components

```typescript
import { MockApiService } from '@/lib/mocks'

// In your component or hook
const shipments = await MockApiService.getShipments({
  page: 1,
  pageSize: 20,
  status: ['in_progress', 'at_risk']
})
```

## Available Mock Data

### 📦 Shipments
- **115+ shipments** with realistic data
- Various statuses: Pending, In Progress, At Risk, Delayed, Completed
- All risk levels: Low, Medium, High, Critical
- Realistic ETAs and workflow steps

```typescript
import { mockShipments, getMockShipment } from '@/lib/mocks'

// Get all shipments
const allShipments = mockShipments

// Get single shipment
const shipment = getMockShipment('1')

// Get paginated with filters
const result = await MockApiService.getShipments({
  page: 1,
  pageSize: 20,
  status: ['at_risk'],
  search: 'Toyota'
})
```

### 📄 Documents
- Multiple documents per shipment
- Categories: LC, Customs, Shipping, Payment, Other
- Statuses: Pending, Uploaded, Verified, Rejected

```typescript
import { getMockDocumentsByShipment } from '@/lib/mocks'

// Get documents for a shipment
const docs = await MockApiService.getDocuments('1')
```

### 🚨 Alerts
- Critical, Warning, and Info alerts
- Categories: Delay, Document, Payment, Customs, System
- Acknowledged/unacknowledged states

```typescript
import { getMockUnacknowledgedAlerts } from '@/lib/mocks'

// Get all alerts
const alerts = await MockApiService.getAlerts()

// Get unacknowledged only
const unacked = await MockApiService.getAlerts({ acknowledged: false })

// Acknowledge an alert
await MockApiService.acknowledgeAlert('alert-001')
```

### 🔄 Workflow Steps
- 34 workflow steps across 3 departments
- Business Unit (Steps 1-11)
- Customs & Clearance (Steps 12-28)
- Finance (Steps 29-34)

```typescript
import { getMockWorkflowSteps, getMockUserTasks } from '@/lib/mocks'

// Get workflow for a shipment
const steps = await MockApiService.getWorkflowSteps('1')

// Get current user's tasks
const myTasks = await MockApiService.getUserTasks()
```

### 📊 Metrics & Dashboard
- Dashboard metrics (totals, averages, rates)
- Department metrics (workload, efficiency)
- Time series data (trends)
- Distribution charts (status, risk)

```typescript
import { mockDashboardMetrics, mockDepartmentMetrics } from '@/lib/mocks'

// Get dashboard metrics
const metrics = await MockApiService.getDashboardMetrics()

// Get department metrics
const deptMetrics = await MockApiService.getDepartmentMetrics()

// Get trends
const shipmentTrend = await MockApiService.getShipmentTrend(30)
const clearanceTrend = await MockApiService.getClearanceTimeTrend(30)
```

## MockApiService Methods

### Shipments
- `getShipments(params)` - Get paginated shipments with filters
- `getShipment(id)` - Get single shipment
- `createShipment(data)` - Create new shipment
- `updateShipment(id, data)` - Update shipment
- `deleteShipment(id)` - Delete shipment

### Documents
- `getDocuments(shipmentId)` - Get all documents for a shipment
- `getDocument(id)` - Get single document
- `uploadDocument(shipmentId, file)` - Upload new document
- `deleteDocument(id)` - Delete document

### Alerts
- `getAlerts(params)` - Get alerts with filters
- `acknowledgeAlert(id)` - Acknowledge an alert

### Workflow
- `getWorkflowSteps(shipmentId)` - Get workflow steps for shipment
- `getUserTasks()` - Get current user's tasks
- `completeWorkflowStep(shipmentId, stepId, notes)` - Complete a step

### Metrics
- `getDashboardMetrics()` - Get dashboard overview metrics
- `getDepartmentMetrics()` - Get department performance metrics
- `getShipmentTrend(days)` - Get shipment volume trend
- `getClearanceTimeTrend(days)` - Get clearance time trend
- `getStatusDistribution()` - Get shipment status distribution
- `getRiskDistribution()` - Get risk level distribution

## Integration with API Hooks

Update your API hooks to use mock data as fallback:

```typescript
import { MockApiService, USE_MOCK_DATA } from '@/lib/mocks'
import { apiClient } from '../client'

export function useShipments(params) {
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: async () => {
      // Use mock data if enabled or if backend fails
      if (USE_MOCK_DATA) {
        return MockApiService.getShipments(params)
      }
      
      try {
        const { data } = await apiClient.get('/shipments', { params })
        return data
      } catch (error) {
        console.warn('Backend unavailable, using mock data')
        return MockApiService.getShipments(params)
      }
    },
  })
}
```

## Features

✅ **Realistic Data** - All mock data follows real-world patterns
✅ **Simulated Delays** - API calls include realistic network delays
✅ **Full CRUD** - Create, read, update, delete operations
✅ **Filtering & Search** - All list endpoints support filtering
✅ **Pagination** - Proper pagination with page info
✅ **Relationships** - Documents, alerts, and workflow linked to shipments
✅ **State Management** - Mock data persists during session

## Testing Scenarios

### Test Filtering
```typescript
// Filter by status
await MockApiService.getShipments({ status: ['at_risk', 'delayed'] })

// Filter by risk level
await MockApiService.getShipments({ riskLevel: ['high', 'critical'] })

// Search
await MockApiService.getShipments({ search: 'Toyota' })
```

### Test Pagination
```typescript
// Page 1
await MockApiService.getShipments({ page: 1, pageSize: 20 })

// Page 2
await MockApiService.getShipments({ page: 2, pageSize: 20 })
```

### Test Alerts
```typescript
// Get critical alerts only
await MockApiService.getAlerts({ type: 'critical' })

// Get unacknowledged alerts
await MockApiService.getAlerts({ acknowledged: false })
```

### Test Workflow
```typescript
// Get workflow for delayed shipment
const steps = await MockApiService.getWorkflowSteps('4')

// Get my pending tasks
const tasks = await MockApiService.getUserTasks()
```

## Notes

- Mock data is generated on import and persists during the session
- All API methods include simulated network delays (150-800ms)
- Data can be modified during testing (changes persist in memory)
- Refresh the page to reset mock data to initial state
