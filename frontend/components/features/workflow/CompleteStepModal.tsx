'use client'

import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { formatDateForInput } from '@/lib/utils'

interface CompleteStepModalProps {
  open: boolean
  onClose: () => void
  stepName: string
  onComplete: (data: { actualDate: string; notes: string }) => void
}

export function CompleteStepModal({
  open,
  onClose,
  stepName,
  onComplete,
}: CompleteStepModalProps) {
  const [actualDate, setActualDate] = useState(formatDateForInput(new Date()))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    // Validate date is not in the future
    const selectedDate = new Date(actualDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      setError('Actual date cannot be in the future')
      return
    }

    onComplete({ actualDate, notes })
    handleClose()
  }

  const handleClose = () => {
    setActualDate(formatDateForInput(new Date()))
    setNotes('')
    setError('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Complete Workflow Step"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Complete Step
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Step Name
          </label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{stepName}</p>
        </div>

        <div>
          <label htmlFor="actualDate" className="block text-sm font-medium text-gray-700">
            Actual Completion Date *
          </label>
          <Input
            id="actualDate"
            type="date"
            value={actualDate}
            onChange={(e) => {
              setActualDate(e.target.value)
              setError('')
            }}
            max={formatDateForInput(new Date())}
            error={error}
            className="mt-1"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Date cannot be in the future
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Add any notes or comments about this step..."
          />
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Completing this step will update the workflow timeline and notify relevant team members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
