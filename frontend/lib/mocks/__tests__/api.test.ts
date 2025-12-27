import { MockApiService } from '../api'
import { ShipmentStatus, RiskLevel } from '@/types'

describe('MockApiService', () => {
  describe('getShipments', () => {
    it('should return paginated shipments', async () => {
      const result = await MockApiService.getShipments({ page: 1, pageSize: 20 })
      
      expect(result.items).toHaveLength(20)
      expect(result.total).toBeGreaterThan(100)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
      expect(result.totalPages).toBeGreaterThan(5)
    })

    it('should filter shipments by status', async () => {
      const result = await MockApiService.getShipments({
        status: ['at_risk', 'delayed'],
      })

      result.items.forEach((item) => {
        expect(['at_risk', 'delayed']).toContain(item.status)
      })
    })

    it('should filter shipments by risk level', async () => {
      const result = await MockApiService.getShipments({
        riskLevel: ['high', 'critical'],
      })

      result.items.forEach((item) => {
        expect(['high', 'critical']).toContain(item.riskLevel)
      })
    })

    it('should search shipments', async () => {
      const result = await MockApiService.getShipments({
        search: 'Toyota',
      })

      result.items.forEach((item) => {
        const searchableText = `${item.shipmentNumber} ${item.principal} ${item.brand} ${item.lcNumber}`.toLowerCase()
        expect(searchableText).toContain('toyota')
      })
    })

    it('should handle pagination correctly', async () => {
      const page1 = await MockApiService.getShipments({ page: 1, pageSize: 10 })
      const page2 = await MockApiService.getShipments({ page: 2, pageSize: 10 })

      expect(page1.items[0].id).not.toBe(page2.items[0].id)
      expect(page1.total).toBe(page2.total)
    })
  })

  describe('getShipment', () => {
    it('should return a single shipment', async () => {
      const shipment = await MockApiService.getShipment('1')
      
      expect(shipment).toBeDefined()
      expect(shipment?.id).toBe('1')
      expect(shipment?.shipmentNumber).toBeDefined()
    })

    it('should return null for non-existent shipment', async () => {
      const shipment = await MockApiService.getShipment('non-existent')
      
      expect(shipment).toBeNull()
    })
  })

  describe('createShipment', () => {
    it('should create a new shipment', async () => {
      const newShipment = await MockApiService.createShipment({
        principal: 'Test Principal',
        brand: 'Test Brand',
        lcNumber: 'LC-TEST-001',
        eta: '2025-02-01',
      })

      expect(newShipment.id).toBeDefined()
      expect(newShipment.principal).toBe('Test Principal')
      expect(newShipment.brand).toBe('Test Brand')
      expect(newShipment.status).toBe(ShipmentStatus.PENDING)
      expect(newShipment.riskLevel).toBe(RiskLevel.LOW)
    })
  })

  describe('updateShipment', () => {
    it('should update an existing shipment', async () => {
      const updated = await MockApiService.updateShipment('1', {
        status: ShipmentStatus.COMPLETED,
      })

      expect(updated).toBeDefined()
      expect(updated?.status).toBe(ShipmentStatus.COMPLETED)
    })

    it('should return null for non-existent shipment', async () => {
      const updated = await MockApiService.updateShipment('non-existent', {
        status: ShipmentStatus.COMPLETED,
      })

      expect(updated).toBeNull()
    })
  })

  describe('deleteShipment', () => {
    it('should delete a shipment', async () => {
      const result = await MockApiService.deleteShipment('1')
      expect(result).toBe(true)
    })

    it('should return false for non-existent shipment', async () => {
      const result = await MockApiService.deleteShipment('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const metrics = await MockApiService.getDashboardMetrics()

      expect(metrics.totalShipments).toBeGreaterThan(0)
      expect(metrics.activeShipments).toBeGreaterThan(0)
      expect(metrics.onTimeDeliveryRate).toBeGreaterThan(0)
    })
  })

  describe('getAlerts', () => {
    it('should return alerts', async () => {
      const alerts = await MockApiService.getAlerts()

      expect(Array.isArray(alerts)).toBe(true)
      expect(alerts.length).toBeGreaterThan(0)
    })

    it('should filter alerts by acknowledged status', async () => {
      const unacknowledged = await MockApiService.getAlerts({ acknowledged: false })

      unacknowledged.forEach((alert) => {
        expect(alert.acknowledged).toBe(false)
      })
    })
  })
})
