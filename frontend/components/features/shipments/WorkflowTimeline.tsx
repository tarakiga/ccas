'use client'

import { useState, useMemo } from 'react'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { formatDate } from '@/lib/utils/date'
import { getMockWorkflowSteps, completeMockWorkflowStep } from '@/lib/mocks/workflow'
import { getDepartmentColor } from '@/lib/workflow/definitions'
import type { WorkflowStep, Department } from '@/lib/workflow/types'

interface WorkflowTimelineProps {
  shipmentId: string
}

export function WorkflowTimeline({ shipmentId }: WorkflowTimelineProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(() => getMockWorkflowSteps(shipmentId))
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<Department | 'all'>('all')

  // Calculate progress
  const progress = useMemo(() => {
    const total = steps.length
    const completed = steps.filter((s) => s.status === 'completed').length
    const overdue = steps.filter((s) => s.status === 'overdue').length
    const percentage = Math.round((completed / total) * 100)

    return { total, completed, overdue, percentage }
  }, [steps])

  // Group steps by department
  const groupedSteps = useMemo(() => {
    const filtered = filterDepartment === 'all' 
      ? steps 
      : steps.filter((s) => s.department === filterDepartment)

    return filtered.reduce((acc, step) => {
      if (!acc[step.department]) {
        acc[step.department] = []
      }
      acc[step.department].push(step)
      return acc
    }, {} as Record<Department, WorkflowStep[]>)
  }, [steps, filterDepartment])

  // Department progress
  const departmentProgress = useMemo(() => {
    const departments: Department[] = ['Business Unit', 'Finance', 'C&C']
    return departments.map((dept) => {
      const deptSteps = steps.filter((s) => s.department === dept)
      const completed = deptSteps.filter((s) => s.status === 'completed').length
      return {
        department: dept,
        total: deptSteps.length,
        completed,
        percentage: Math.round((completed / deptSteps.length) * 100),
      }
    })
  }, [steps])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'ready':
        return 'bg-cyan-500'
      case 'overdue':
        return 'bg-red-500'
      case 'blocked':
        return 'bg-gray-400'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>
      case 'ready':
        return <Badge variant="info">Ready</Badge>
      case 'overdue':
        return <Badge variant="error">Overdue</Badge>
      case 'blocked':
        return <Badge variant="default">Blocked</Badge>
      default:
        return <Badge variant="default">Pending</Badge>
    }
  }

  const getDepartmentBadgeColor = (department: Department) => {
    const color = getDepartmentColor(department)
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700'
  }

  const toggleExpand = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const handleCompleteStep = (step: WorkflowStep) => {
    setSelectedStep(step)
    setShowCompleteModal(true)
  }

  const handleConfirmComplete = async () => {
    if (!selectedStep) return

    try {
      const updatedStep = await completeMockWorkflowStep(selectedStep.id, {
        actualDate: new Date().toISOString(),
        notes: 'Completed via workflow timeline',
      })

      // Update the steps list
      setSteps((prev) =>
        prev.map((s) => (s.id === updatedStep.id ? updatedStep : s))
      )

      setShowCompleteModal(false)
      setSelectedStep(null)
    } catch (error) {
      alert('Failed to complete step')
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
              <p className="text-sm text-gray-600">
                {progress.completed} of {progress.total} steps completed
                {progress.overdue > 0 && (
                  <span className="ml-2 text-red-600">• {progress.overdue} overdue</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{progress.percentage}%</p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Department Progress */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {departmentProgress.map((dept) => (
              <div key={dept.department} className="text-center">
                <p className="text-xs font-medium text-gray-600">{dept.department}</p>
                <p className="text-lg font-bold text-gray-900">{dept.percentage}%</p>
                <p className="text-xs text-gray-500">
                  {dept.completed}/{dept.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Department Filter */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filterDepartment === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilterDepartment('all')}
        >
          All Departments
        </Button>
        <Button
          size="sm"
          variant={filterDepartment === 'Business Unit' ? 'primary' : 'outline'}
          onClick={() => setFilterDepartment('Business Unit')}
        >
          Business Unit
        </Button>
        <Button
          size="sm"
          variant={filterDepartment === 'Finance' ? 'primary' : 'outline'}
          onClick={() => setFilterDepartment('Finance')}
        >
          Finance
        </Button>
        <Button
          size="sm"
          variant={filterDepartment === 'C&C' ? 'primary' : 'outline'}
          onClick={() => setFilterDepartment('C&C')}
        >
          C&C
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Department Sections */}
        {Object.entries(groupedSteps).map(([department, deptSteps]) => (
          <div key={department} className="mb-8">
            {/* Department Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-4 border-gray-200">
                <span className="text-lg">
                  {department === 'Business Unit' ? '🏢' : department === 'Finance' ? '💰' : '🚢'}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{department}</h4>
                <p className="text-sm text-gray-600">
                  {deptSteps.filter((s) => s.status === 'completed').length} of {deptSteps.length} completed
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {deptSteps.map((step) => {
                const isExpanded = expandedStep === step.id
                const isActionable = step.status === 'in_progress' || step.status === 'ready'

                return (
                  <div key={step.id} className="relative">
                    {/* Step Indicator */}
                    <div
                      className={`absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${getStatusColor(
                        step.status
                      )}`}
                    >
                      {step.status === 'completed' ? (
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold text-white">{step.stepNumber}</span>
                      )}
                    </div>

                    {/* Step Card */}
                    <div className="ml-20">
                      <Card className="hover:shadow-md transition-shadow">
                        <div className="cursor-pointer" onClick={() => toggleExpand(step.id)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-gray-900">
                                  {step.stepNumber}. {step.name}
                                </h4>
                                {getStatusBadge(step.status)}
                                {step.isCritical && (
                                  <Badge variant="error">Critical</Badge>
                                )}
                                {step.isOptional && (
                                  <Badge variant="default">Optional</Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDepartmentBadgeColor(step.department)}`}>
                                  {step.department}
                                </span>
                                <span>👤 PPR: {step.ppr}</span>
                                <span>👥 APR: {step.apr}</span>
                              </div>
                            </div>
                            <button className="rounded p-1 hover:bg-gray-100">
                              <svg
                                className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {/* Dates */}
                          <div className="mt-3 flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-gray-500">Target: </span>
                              <span className="font-medium text-gray-900">{formatDate(step.targetDate)}</span>
                            </div>
                            {step.actualDate && (
                              <div>
                                <span className="text-gray-500">Actual: </span>
                                <span className="font-medium text-green-600">{formatDate(step.actualDate)}</span>
                              </div>
                            )}
                            {step.status === 'overdue' && (
                              <div className="text-red-600 font-medium">
                                ⚠️ Overdue
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Explanation</label>
                                <p className="mt-1 text-sm text-gray-600">{step.explanation}</p>
                              </div>

                              {step.blockedBy && step.blockedBy.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Dependencies</label>
                                  <p className="mt-1 text-sm text-gray-600">
                                    Requires steps {step.blockedBy.join(', ')} to be completed first
                                  </p>
                                </div>
                              )}

                              {step.notes && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Notes</label>
                                  <p className="mt-1 text-sm text-gray-600">{step.notes}</p>
                                </div>
                              )}

                              {step.completedBy && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Completed By</label>
                                  <p className="mt-1 text-sm text-gray-600">{step.completedBy}</p>
                                </div>
                              )}

                              {isActionable && !step.isBlocked && (
                                <div className="flex gap-2 pt-2">
                                  <Button size="sm" onClick={() => handleCompleteStep(step)}>
                                    Complete Step
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Add Note
                                  </Button>
                                </div>
                              )}

                              {step.isBlocked && (
                                <div className="rounded-lg bg-yellow-50 p-3">
                                  <p className="text-sm text-yellow-800">
                                    ⚠️ This step is blocked. Complete the required dependencies first.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Step Modal */}
      <Modal
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false)
          setSelectedStep(null)
        }}
        title={`Complete Step ${selectedStep?.stepNumber}`}
      >
        {selectedStep && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{selectedStep.name}</h4>
              <p className="text-sm text-gray-600">{selectedStep.description}</p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                ✓ Marking this step as completed will update the workflow and notify relevant team members.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteModal(false)
                  setSelectedStep(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmComplete}>
                Confirm Completion
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
