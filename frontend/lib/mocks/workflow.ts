/**
 * Mock workflow data for testing components
 * Updated to use the full 34-step workflow definitions
 */

import { addDays, subDays } from 'date-fns'
import { WORKFLOW_STEPS, getPPRForStep, getAPRForStep, Division } from '../workflow/definitions'
import { WorkflowStep, StepStatus } from '../workflow/types'
import { etaCalculator } from '../workflow/eta-calculator'

/**
 * Generate mock workflow steps for a shipment
 */
export function generateMockWorkflowSteps(
  shipmentId: string,
  eta: Date,
  division: Division = 'TBLE',
  completedUpToStep: number = 0
): WorkflowStep[] {
  return WORKFLOW_STEPS.map((stepDef) => {
    const targetDate = etaCalculator.calculateTargetDate(eta, stepDef.etaOffset)
    const isCompleted = stepDef.stepNumber <= completedUpToStep
    const actualDate = isCompleted
      ? addDays(targetDate, Math.floor(Math.random() * 2) - 1)
      : undefined

    // Determine status
    let status: StepStatus = 'pending'
    if (isCompleted) {
      status = 'completed'
    } else if (stepDef.stepNumber === completedUpToStep + 1) {
      status = 'in_progress'
    } else if (stepDef.stepNumber === completedUpToStep + 2) {
      status = etaCalculator.isOverdue(targetDate) ? 'overdue' : 'ready'
    } else {
      status = etaCalculator.getStepStatus(targetDate, actualDate)
    }

    // Check if blocked by dependencies
    const isBlocked =
      stepDef.dependencies?.some((depStep) => depStep > completedUpToStep) || false

    if (isBlocked && !isCompleted) {
      status = 'blocked'
    }

    return {
      id: `${shipmentId}-WF-${stepDef.stepNumber}`,
      shipmentId,
      stepNumber: stepDef.stepNumber,
      name: stepDef.name,
      description: stepDef.description,
      explanation: stepDef.explanation,
      department: stepDef.department,
      ppr: getPPRForStep(stepDef.stepNumber, division),
      apr: getAPRForStep(stepDef.stepNumber, division),
      etaOffset: stepDef.etaOffset,
      targetDate: targetDate.toISOString(),
      actualDate: actualDate?.toISOString(),
      status,
      isOptional: stepDef.isOptional || false,
      isCritical: stepDef.isCritical || false,
      isBlocked,
      blockedBy: stepDef.dependencies,
      dataFields:
        stepDef.dataFields?.map((field) => ({
          ...field,
          value: isCompleted ? getMockFieldValue(field.type) : undefined,
        })) || [],
      completedBy: isCompleted ? getPPRForStep(stepDef.stepNumber, division) : undefined,
      completedAt: actualDate?.toISOString(),
      notes: isCompleted && Math.random() > 0.7 ? 'Completed successfully' : undefined,
      validationErrors: [],
    }
  })
}

/**
 * Generate mock field value based on type
 */
function getMockFieldValue(type: string): any {
  switch (type) {
    case 'text':
      return 'Sample text value'
    case 'number':
      return Math.floor(Math.random() * 1000)
    case 'date':
      return new Date().toISOString()
    case 'boolean':
      return Math.random() > 0.5
    case 'select':
      return 'Option 1'
    default:
      return undefined
  }
}

/**
 * Mock workflow steps for different shipments
 */
export const mockWorkflowSteps: Record<string, WorkflowStep[]> = {
  SH001: generateMockWorkflowSteps('SH001', subDays(new Date(), 5), 'TBLE', 21),
  SH002: generateMockWorkflowSteps('SH002', addDays(new Date(), 3), 'LVD', 15),
  SH003: generateMockWorkflowSteps('SH003', subDays(new Date(), 10), 'HVD', 28),
  SH004: generateMockWorkflowSteps('SH004', addDays(new Date(), 7), 'Parts', 8),
  SH005: generateMockWorkflowSteps('SH005', new Date(), 'TBLE', 18),
}

/**
 * Get workflow steps for a specific shipment
 */
export function getMockWorkflowSteps(shipmentId: string): WorkflowStep[] {
  return mockWorkflowSteps[shipmentId] || generateMockWorkflowSteps(shipmentId, new Date(), 'TBLE', 10)
}

/**
 * Get current user's tasks across all shipments
 */
export function getMockUserTasks(userId: string = 'current-user'): WorkflowStep[] {
  const allSteps = Object.values(mockWorkflowSteps).flat()

  // Filter steps assigned to current user that are not completed
  return allSteps.filter(
    (step) =>
      (step.ppr === userId || step.apr === userId) &&
      step.status !== 'completed' &&
      step.status !== 'skipped'
  )
}

/**
 * Get overdue steps across all shipments
 */
export function getMockOverdueSteps(): WorkflowStep[] {
  const allSteps = Object.values(mockWorkflowSteps).flat()
  return allSteps.filter((step) => step.status === 'overdue')
}

/**
 * Get critical steps that are pending or in progress
 */
export function getMockCriticalSteps(): WorkflowStep[] {
  const allSteps = Object.values(mockWorkflowSteps).flat()
  return allSteps.filter(
    (step) =>
      step.isCritical && (step.status === 'in_progress' || step.status === 'ready' || step.status === 'overdue')
  )
}

/**
 * Complete a workflow step (mock mutation)
 */
export async function completeMockWorkflowStep(
  stepId: string,
  data: {
    actualDate?: string
    notes?: string
    fields?: Record<string, any>
  }
): Promise<WorkflowStep> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find and update the step
  for (const shipmentId in mockWorkflowSteps) {
    const stepIndex = mockWorkflowSteps[shipmentId].findIndex((s) => s.id === stepId)
    if (stepIndex !== -1) {
      const step = mockWorkflowSteps[shipmentId][stepIndex]
      const updatedStep: WorkflowStep = {
        ...step,
        status: 'completed',
        actualDate: data.actualDate || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completedBy: step.ppr,
        notes: data.notes,
        dataFields: step.dataFields.map((field) => ({
          ...field,
          value: data.fields?.[field.name] ?? field.value,
        })),
      }
      mockWorkflowSteps[shipmentId][stepIndex] = updatedStep
      return updatedStep
    }
  }

  throw new Error(`Step ${stepId} not found`)
}

// Export for backward compatibility
export { WORKFLOW_STEPS as workflowSteps }
