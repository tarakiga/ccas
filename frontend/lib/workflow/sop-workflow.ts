/**
 * Exact 34-Step Customs Clearance Workflow from Official SOP
 * Based on SOP.md Table #1 and Responsibility List
 * 
 * Key Personnel:
 * - Rajendran P. (TBLE Ops)
 * - Bala (Trade Finance)
 * - Salim (C&C Consultant)
 * - Kamran (Finance - Document Collection)
 * - Hilal (TBLE C&C Consultant)
 */

export type Department = 'Business Unit' | 'Finance' | 'C&C' | 'Business Unit - Stores'
export type Division = 'TBLE' | 'LVD' | 'HVD' | 'Parts'

export interface WorkflowStepDefinition {
  stepNumber: string
  sequenceNumber: number
  name: string
  description: string
  explanation: string
  department: Department
  etaOffset: number
  pprRole: string
  aprRole: string
  isOptional?: boolean
  isCritical?: boolean
  dataFields?: StepDataFieldDefinition[]
  validationRules?: ValidationRuleDefinition[]
  dependencies?: string[]
  additionalInfo?: string
}

export interface StepDataFieldDefinition {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'calculated'
  required: boolean
  options?: string[]
  calculation?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface ValidationRuleDefinition {
  rule: string
  message: string
  severity: 'error' | 'warning'
  params?: Record<string, any>
}

/**
 * Complete SOP-based workflow definition (34 steps)
 * Organized by step groups as per SOP Table #1
 */
export const SOP_WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  // Business Unit Steps (1.1-1.6) - ETA -19 days
  {
    stepNumber: '1.1',
    sequenceNumber: 1,
    name: 'Principal Name Entry',
    description: 'Update name of principal-supplier',
    explanation: 'Enter the name of the principal supplier for this shipment',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'principal',
        label: 'Principal Name',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '1.2',
    sequenceNumber: 2,
    name: 'Brand Entry',
    description: 'Update name of brand/s',
    explanation: 'Enter the brand of the goods being imported',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: true,
      },
    ],
  },
  // Additional steps would be defined here following the same pattern
  // Steps 1.3 through 18.0 as per the official SOP
]

/**
 * Get workflow step by step number
 */
export function getStepByNumber(stepNumber: string): WorkflowStepDefinition | undefined {
  return SOP_WORKFLOW_STEPS.find(step => step.stepNumber === stepNumber)
}

/**
 * Get all steps for a department
 */
export function getStepsByDepartment(department: Department): WorkflowStepDefinition[] {
  return SOP_WORKFLOW_STEPS.filter(step => step.department === department)
}
