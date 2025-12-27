'use client'

import { useState, useEffect } from 'react'
import { Input, Select, Button, Toast } from '@/components/ui'
import { useCreateShipment } from '@/lib/api/hooks/useShipments'
import { ShipmentStatus, RiskLevel } from '@/types'
import { autoCompleteOnCreate } from '@/lib/workflow/workflow-automation'

interface CreateShipmentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface Brand {
  id: string
  name: string
  category: string
  active: boolean
}

export function CreateShipmentForm({ onSuccess, onCancel }: CreateShipmentFormProps) {
  const [formData, setFormData] = useState({
    shipmentNumber: '',
    principal: '',
    brand: '',
    lcNumber: '',
    origin: '',
    destination: '',
    eta: '',
    value: '',
    containerNumber: '',
    vesselName: '',
    billOfLading: '',
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)

  const createMutation = useCreateShipment()

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/brands')
        // const data = await response.json()
        
        // Mock data for now - matches the brands management page
        const mockBrands: Brand[] = [
          { id: '1', name: 'Toyota', category: 'Automotive', active: true },
          { id: '2', name: 'Honda', category: 'Automotive', active: true },
          { id: '3', name: 'Nissan', category: 'Automotive', active: true },
          { id: '4', name: 'Mazda', category: 'Automotive', active: true },
        ]
        
        setBrands(mockBrands.filter(b => b.active))
      } catch (error) {
        console.error('Failed to fetch brands:', error)
        setToast({ message: 'Failed to load brands', type: 'error' })
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.shipmentNumber || !formData.principal || !formData.eta) {
      setToast({ message: 'Please fill in all required fields', type: 'error' })
      return
    }

    try {
      // Determine which workflow steps will be auto-completed
      const completedSteps = autoCompleteOnCreate({
        principal: formData.principal,
        brand: formData.brand,
        lcNumber: formData.lcNumber,
      })

      // Create shipment with auto-completed steps
      await createMutation.mutateAsync({
        shipmentNumber: formData.shipmentNumber,
        principal: formData.principal,
        brand: formData.brand,
        lcNumber: formData.lcNumber,
        origin: formData.origin,
        destination: formData.destination,
        eta: formData.eta,
        status: ShipmentStatus.IN_TRANSIT,
        riskLevel: RiskLevel.LOW,
        value: parseFloat(formData.value) || 0,
        containerNumber: formData.containerNumber,
        vesselName: formData.vesselName,
        billOfLading: formData.billOfLading,
        currentStep: 'Pre-clearance Documentation',
        daysPostEta: 0,
        completedSteps, // Pass auto-completed steps
      })

      // Show success message with completed steps info
      const stepsMessage = completedSteps.length > 0 
        ? `\n\nWorkflow steps auto-completed: ${completedSteps.join(', ')}`
        : ''
      
      setToast({ 
        message: `Shipment created successfully!${stepsMessage}`, 
        type: 'success' 
      })
      
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      setToast({ message: 'Failed to create shipment. Please try again.', type: 'error' })
    }
  }

  return (
    <>
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipmentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="shipmentNumber"
                value={formData.shipmentNumber}
                onChange={(e) => handleChange('shipmentNumber', e.target.value)}
                placeholder="SH-2025-XXX"
                required
              />
            </div>

            <div>
              <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
                Principal <span className="text-red-500">*</span>
              </label>
              <Input
                id="principal"
                value={formData.principal}
                onChange={(e) => handleChange('principal', e.target.value)}
                placeholder="Company name"
                required
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-xs text-gray-500">(Step 1.2)</span>
              </label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                disabled={loadingBrands}
              >
                <option value="">
                  {loadingBrands ? 'Loading brands...' : 'Select brand...'}
                </option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Brands can be managed in Settings → Brands (Admin only)
              </p>
            </div>

            <div>
              <label htmlFor="lcNumber" className="block text-sm font-medium text-gray-700 mb-1">
                LC Number
              </label>
              <Input
                id="lcNumber"
                value={formData.lcNumber}
                onChange={(e) => handleChange('lcNumber', e.target.value)}
                placeholder="LC-XXXX-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipping Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => handleChange('origin', e.target.value)}
                placeholder="Country/Port"
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="Country/Port"
              />
            </div>

            <div>
              <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-1">
                ETA <span className="text-red-500">*</span>
              </label>
              <Input
                id="eta"
                type="date"
                value={formData.eta}
                onChange={(e) => handleChange('eta', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Value (USD)
              </label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Container & Vessel Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Container & Vessel Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="containerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Container Number
              </label>
              <Input
                id="containerNumber"
                value={formData.containerNumber}
                onChange={(e) => handleChange('containerNumber', e.target.value)}
                placeholder="XXXX1234567"
              />
            </div>

            <div>
              <label htmlFor="vesselName" className="block text-sm font-medium text-gray-700 mb-1">
                Vessel Name
              </label>
              <Input
                id="vesselName"
                value={formData.vesselName}
                onChange={(e) => handleChange('vesselName', e.target.value)}
                placeholder="Vessel name"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="billOfLading" className="block text-sm font-medium text-gray-700 mb-1">
                Bill of Lading
              </label>
              <Input
                id="billOfLading"
                value={formData.billOfLading}
                onChange={(e) => handleChange('billOfLading', e.target.value)}
                placeholder="BL-XXXX-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </>
  )
}
