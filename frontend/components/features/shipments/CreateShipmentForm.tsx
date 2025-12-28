'use client'

import { useState, useEffect } from 'react'
import { Input, Button, Toast } from '@/components/ui'
import { useCreateShipment } from '@/lib/api/hooks/useShipments'
import { ShipmentStatus, RiskLevel } from '@/types'
import { autoCompleteOnCreate } from '@/lib/workflow/workflow-automation'
import { cn } from '@/lib/utils'

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

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Company and shipment details' },
  { id: 2, title: 'Shipping Details', description: 'Route and schedule information' },
  { id: 3, title: 'Container & Vessel', description: 'Cargo and transport details' },
]

export function CreateShipmentForm({ onSuccess, onCancel }: CreateShipmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateShipment()

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const mockBrands: Brand[] = [
          { id: '1', name: 'Toyota', category: 'Automotive', active: true },
          { id: '2', name: 'Honda', category: 'Automotive', active: true },
          { id: '3', name: 'Nissan', category: 'Automotive', active: true },
          { id: '4', name: 'Mazda', category: 'Automotive', active: true },
          { id: '5', name: 'Lexus', category: 'Automotive', active: true },
          { id: '6', name: 'Acura', category: 'Automotive', active: true },
          { id: '7', name: 'Infiniti', category: 'Automotive', active: true },
          { id: '8', name: 'BMW', category: 'Automotive', active: true },
          { id: '9', name: 'Mercedes-Benz', category: 'Automotive', active: true },
          { id: '10', name: 'Audi', category: 'Automotive', active: true },
          { id: '11', name: 'Volkswagen', category: 'Automotive', active: true },
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
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.shipmentNumber.trim()) {
        newErrors.shipmentNumber = 'Shipment number is required'
      }
      if (!formData.principal.trim()) {
        newErrors.principal = 'Principal is required'
      }
    }

    if (step === 2) {
      if (!formData.eta) {
        newErrors.eta = 'ETA is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    try {
      const completedSteps = autoCompleteOnCreate({
        principal: formData.principal,
        brand: formData.brand,
        lcNumber: formData.lcNumber,
      })

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
        completedSteps,
      })

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

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-gray-100 text-gray-400'
                )}
              >
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  'text-xs font-medium transition-colors',
                  currentStep === step.id ? 'text-primary-600' : 'text-gray-500'
                )}>
                  {step.title}
                </p>
              </div>
            </div>
            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 mt-[-1rem]">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Shipment Number <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.shipmentNumber}
            onChange={(e) => handleChange('shipmentNumber', e.target.value)}
            placeholder="SH-2025-XXX"
            className={errors.shipmentNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          />
          {errors.shipmentNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.shipmentNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Principal <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.principal}
            onChange={(e) => handleChange('principal', e.target.value)}
            placeholder="Company name"
            className={errors.principal ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          />
          {errors.principal && (
            <p className="mt-1 text-xs text-red-500">{errors.principal}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Brand
          </label>
          <select
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            LC Number
          </label>
          <Input
            value={formData.lcNumber}
            onChange={(e) => handleChange('lcNumber', e.target.value)}
            placeholder="LC-XXXX-XXXX"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Origin
          </label>
          <Input
            value={formData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="Country/Port of origin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Destination
          </label>
          <Input
            value={formData.destination}
            onChange={(e) => handleChange('destination', e.target.value)}
            placeholder="Country/Port of destination"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ETA <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.eta}
            onChange={(e) => handleChange('eta', e.target.value)}
            className={errors.eta ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          />
          {errors.eta && (
            <p className="mt-1 text-xs text-red-500">{errors.eta}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Shipment Value (USD)
          </label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="0.00"
            step="0.01"
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Container Number
          </label>
          <Input
            value={formData.containerNumber}
            onChange={(e) => handleChange('containerNumber', e.target.value)}
            placeholder="XXXX1234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Vessel Name
          </label>
          <Input
            value={formData.vesselName}
            onChange={(e) => handleChange('vesselName', e.target.value)}
            placeholder="Vessel name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bill of Lading
          </label>
          <Input
            value={formData.billOfLading}
            onChange={(e) => handleChange('billOfLading', e.target.value)}
            placeholder="BL-XXXX-XXXX"
          />
        </div>
      </div>

      {/* Summary Preview */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Shipment Summary
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Shipment:</span>
            <span className="ml-2 font-medium text-gray-900">{formData.shipmentNumber || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Principal:</span>
            <span className="ml-2 font-medium text-gray-900">{formData.principal || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Brand:</span>
            <span className="ml-2 font-medium text-gray-900">{formData.brand || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">ETA:</span>
            <span className="ml-2 font-medium text-gray-900">{formData.eta || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )

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

      <div className="flex flex-col h-full max-h-[70vh]">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {createMutation.isPending ? 'Creating...' : 'Create Shipment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
