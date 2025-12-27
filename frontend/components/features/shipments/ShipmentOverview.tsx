'use client'

import { Shipment } from '@/types'
import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'

interface ShipmentOverviewProps {
  shipment: Shipment
}

export function ShipmentOverview({ shipment }: ShipmentOverviewProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'at_risk':
        return 'warning'
      case 'delayed':
        return 'error'
      case 'in_progress':
        return 'info'
      default:
        return 'default'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-green-600'
    }
  }

  // Mock financial data - would come from API
  const financialData = {
    lcAmount: '$450,000',
    customsDuty: '$12,500',
    portCharges: '$3,200',
    totalCost: '$465,700',
    demurrageRisk: '$8,500/day',
  }

  return (
    <div className="space-y-6">
      {/* Shipment Information */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Shipment Information</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Shipment Number</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{shipment.shipmentNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Principal</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{shipment.principal}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Brand</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{shipment.brand}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">LC Number</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{shipment.lcNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">ETA</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(shipment.eta)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Days Post-ETA</label>
            <p className={`mt-1 text-lg font-semibold ${shipment.daysPostEta >= 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {shipment.daysPostEta} days
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={getStatusVariant(shipment.status)}>
                {shipment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Risk Level</label>
            <p className={`mt-1 text-lg font-semibold ${getRiskColor(shipment.riskLevel)}`}>
              {shipment.riskLevel.toUpperCase()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Current Step</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{shipment.currentStep || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Financial Summary</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">LC Amount</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{financialData.lcAmount}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-600">Customs Duty</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{financialData.customsDuty}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm text-gray-600">Port Charges</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">{financialData.portCharges}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{financialData.totalCost}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-gray-600">Demurrage Risk</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{financialData.demurrageRisk}</p>
            <p className="mt-1 text-xs text-gray-500">After day 7</p>
          </div>
        </div>
      </Card>

      {/* Timeline Summary */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Timeline Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">18 of 34 steps completed</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: '53%' }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">5</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-gray-500">At Risk</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">8</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Bayan submitted', user: 'John Doe', time: '2 hours ago', type: 'success' },
            { action: 'Customs payment completed', user: 'Jane Smith', time: '5 hours ago', type: 'success' },
            { action: 'Document uploaded', user: 'Mike Johnson', time: '1 day ago', type: 'info' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
              <div className={`mt-1 h-2 w-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  by {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
