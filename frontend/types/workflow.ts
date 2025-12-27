export interface WorkflowStep {
  id: string
  stepNumber: number
  name: string
  department: Department
  targetDate: string
  actualDate?: string
  status: StepStatus
  assignedUsers: User[]
  notes?: string
}

export enum Department {
  BUSINESS_UNIT = 'business_unit',
  FINANCE = 'finance',
  CUSTOMS_CLEARANCE = 'customs_clearance',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  BLOCKED = 'blocked',
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}
