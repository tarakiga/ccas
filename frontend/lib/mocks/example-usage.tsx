/**
 * Example usage of mock data in components
 * This file demonstrates how to integrate mock data into your components
 */

'use client'

import { useEffect, useState } from 'react'
import { MockApiService } from './api'
import type { Shipment } from '@/types'
import type { MockAlert } from './alerts'
import type { MockWorkflowStep } from './workflow'

/**
 * Example 1: Fetching shipments with filters
 */
export function ShipmentsExample() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadShipments() {
      setLoading(true)
      try {
        const result = await MockApiService.getShipments({
          page: 1,
          pageSize: 10,
          status: ['at_risk', 'delayed'],
        })
        setShipments(result.items)
      } catch (error) {
        console.error('Failed to load shipments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShipments()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>At Risk & Delayed Shipments</h2>
      <ul>
        {shipments.map((shipment) => (
          <li key={shipment.id}>
            {shipment.shipmentNumber} - {shipment.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 2: Fetching alerts
 */
export function AlertsExample() {
  const [alerts, setAlerts] = useState<MockAlert[]>([])

  useEffect(() => {
    async function loadAlerts() {
      const { AlertSeverity } = await import('@/types')
      const data = await MockApiService.getAlerts({
        acknowledged: false,
        severity: AlertSeverity.CRITICAL,
      })
      setAlerts(data)
    }

    loadAlerts()
  }, [])

  return (
    <div>
      <h2>Critical Unacknowledged Alerts</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            {alert.shipmentNumber}: {alert.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 3: Fetching workflow steps
 */
export function WorkflowExample({ shipmentId }: { shipmentId: string }) {
  const [steps, setSteps] = useState<MockWorkflowStep[]>([])

  useEffect(() => {
    async function loadWorkflow() {
      const data = await MockApiService.getWorkflowSteps(shipmentId)
      setSteps(data)
    }

    loadWorkflow()
  }, [shipmentId])

  return (
    <div>
      <h2>Workflow Steps</h2>
      <ul>
        {steps.map((step) => (
          <li key={step.id}>
            Step {step.stepNumber}: {step.name} - {step.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 4: Using with React Query
 */
import { useQuery } from '@tanstack/react-query'

export function useShipmentsWithMock(params?: any) {
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: () => MockApiService.getShipments(params),
  })
}

export function ShipmentsWithReactQuery() {
  const { data, isLoading, error } = useShipmentsWithMock({
    page: 1,
    pageSize: 20,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading shipments</div>

  return (
    <div>
      <h2>Shipments (React Query)</h2>
      <p>Total: {data?.total}</p>
      <ul>
        {data?.items.map((shipment) => (
          <li key={shipment.id}>{shipment.shipmentNumber}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 5: Dashboard metrics
 */
export function DashboardExample() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    async function loadMetrics() {
      const data = await MockApiService.getDashboardMetrics()
      setMetrics(data)
    }

    loadMetrics()
  }, [])

  if (!metrics) return <div>Loading...</div>

  return (
    <div>
      <h2>Dashboard Metrics</h2>
      <div>Total Shipments: {metrics.totalShipments}</div>
      <div>Active: {metrics.activeShipments}</div>
      <div>Delayed: {metrics.delayedShipments}</div>
      <div>On-Time Rate: {metrics.onTimeDeliveryRate}%</div>
    </div>
  )
}
