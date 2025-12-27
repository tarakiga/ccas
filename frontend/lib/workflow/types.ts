/**
 * Workflow Type Definitions
 */

import { Department, Division } from './definitions'

export type StepStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'blocked'
  | 'skipped'

export interface WorkflowStep {
  id: string
  shipmentId: string
  stepNumber: number
  name: string
  description: string
  explanation: string
  department: Department

  // Responsibility
  ppr: string // Primary Person Responsible
  apr: string // Alternate Person Responsible

  // Timeline
  etaOffset: number
  targetDate: string // ISO date string
  actualDate?: string // ISO date string

  // Status
  status: StepStatus
  isOptional: boolean
  isCritical: boolean
  isBlocked: boolean
  blockedBy?: number[] // Step numbers that must be completed first

  // Data
  dataFields: StepDataField[]

  // Completion
  completedBy?: string
  completedAt?: string
  notes?: string

  // Validation
  validationErrors: string[]
}

export interface StepDataField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  value: any
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface CompleteStepData {
  actualDate?: string
  notes?: string
  fields: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface WorkflowProgress {
  totalSteps: number
  completedSteps: number
  pendingSteps: number
  overdueSteps: number
  completionPercentage: number
  estimatedCompletionDate?: string
}

export interface DepartmentProgress {
  department: Department
  totalSteps: number
  completedSteps: number
  completionPercentage: number
  overdueSteps: number
}

export interface WorkflowSummary {
  shipmentId: string
  overallProgress: WorkflowProgress
  departmentProgress: DepartmentProgress[]
  criticalSteps: WorkflowStep[]
  overdueSteps: WorkflowStep[]
  upcomingSteps: WorkflowStep[]
  demurrageRisk: 'none' | 'low' | 'medium' | 'high' | 'critical'
  daysPostETA: number
}

export interface ETAChange {
  id: string
  previousETA: string
  newETA: string
  reason: string
  changedBy: string
  changedAt: string
  impactedSteps: number[]
}

export interface WorkflowFilter {
  department?: Department
  status?: StepStatus[]
  assignedTo?: string
  overdue?: boolean
  critical?: boolean
}
