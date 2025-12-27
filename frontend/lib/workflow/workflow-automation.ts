/**
 * Workflow Automation Service
 * Automatically triggers and completes workflow steps based on user actions
 */

import { WORKFLOW_STEPS } from './definitions'

export interface WorkflowTrigger {
  stepNumber: string
  action: 'create' | 'update' | 'upload' | 'submit' | 'approve' | 'calculate'
  requiredFields?: string[]
  condition?: (data: any) => boolean
}

export interface WorkflowActionLog {
  stepNumber: string
  action: string
  performedBy: string
  performedAt: string
  data?: any
}

/**
 * Log a workflow action with user information and timestamp
 */
export function logWorkflowAction(
  stepNumber: string,
  action: string,
  user: any,
  data?: any
): WorkflowActionLog {
  const log: WorkflowActionLog = {
    stepNumber,
    action,
    performedBy: user?.name || user?.email || 'Unknown User',
    performedAt: new Date().toISOString(),
    data,
  }
  
  // TODO: Send to API endpoint
  // await fetch('/api/workflow/actions/log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(log),
  // })
  
  console.log('Workflow action logged:', log)
  
  return log
}

/**
 * Mapping of workflow steps to their triggering actions
 * This defines when each step should be automatically completed
 */
export const WORKFLOW_TRIGGERS: WorkflowTrigger[] = [
  // ========== Business Unit Steps (1.1-1.6) ==========
  {
    stepNumber: '1.1',
    action: 'create',
    requiredFields: ['principal'],
  },
  {
    stepNumber: '1.2',
    action: 'create',
    requiredFields: ['brand'],
  },
  {
    stepNumber: '1.3',
    action: 'update',
    requiredFields: ['invoiceNumber'],
  },
  {
    stepNumber: '1.4',
    action: 'update',
    requiredFields: ['invoiceAmount'],
  },
  {
    stepNumber: '1.5',
    action: 'calculate',
    requiredFields: ['invoiceAmount'],
    condition: (data) => data.fundsRequired > 0,
  },
  {
    stepNumber: '1.6',
    action: 'update',
    requiredFields: ['lcNumber'],
  },

  // ========== Business Unit Steps (2.1-2.6) ==========
  {
    stepNumber: '2.1',
    action: 'upload',
    requiredFields: ['commercialInvoice'],
  },
  {
    stepNumber: '2.2',
    action: 'upload',
    requiredFields: ['packingList'],
  },
  {
    stepNumber: '2.3',
    action: 'upload',
    requiredFields: ['billOfLading'],
  },
  {
    stepNumber: '2.4',
    action: 'upload',
    requiredFields: ['certificateOfOrigin'],
  },
  {
    stepNumber: '2.5',
    action: 'upload',
    requiredFields: ['insuranceCertificate'],
  },
  {
    stepNumber: '2.6',
    action: 'submit',
    requiredFields: ['allDocuments'],
    condition: (data) => {
      // All documents from 2.1-2.5 must be uploaded
      return data.commercialInvoice && 
             data.packingList && 
             data.billOfLading && 
             data.certificateOfOrigin && 
             data.insuranceCertificate
    },
  },

  // ========== Finance Steps (3.1-3.5) ==========
  {
    stepNumber: '3.1',
    action: 'submit',
    requiredFields: ['lcApplication'],
  },
  {
    stepNumber: '3.2',
    action: 'approve',
    requiredFields: ['lcApproval'],
  },
  {
    stepNumber: '3.3',
    action: 'upload',
    requiredFields: ['lcCopy'],
  },
  {
    stepNumber: '3.4',
    action: 'submit',
    requiredFields: ['documentsToBank'],
  },
  {
    stepNumber: '3.5',
    action: 'approve',
    requiredFields: ['bankAcceptance'],
  },

  // ========== Finance Payment Steps (4.0-6.1) ==========
  {
    stepNumber: '4.0',
    action: 'submit',
    requiredFields: ['paymentRequest'],
  },
  {
    stepNumber: '5.0',
    action: 'approve',
    requiredFields: ['paymentApproval'],
  },
  {
    stepNumber: '6.1',
    action: 'submit',
    requiredFields: ['paymentConfirmation'],
  },

  // ========== C&C Steps (6.2-15.0) ==========
  {
    stepNumber: '6.2',
    action: 'upload',
    requiredFields: ['originalDocuments'],
  },
  {
    stepNumber: '7.0',
    action: 'submit',
    requiredFields: ['arrivalNotice'],
  },
  {
    stepNumber: '8.0',
    action: 'submit',
    requiredFields: ['customsDeclaration'],
  },
  {
    stepNumber: '9.0',
    action: 'submit',
    requiredFields: ['bayanSubmission'],
  },
  {
    stepNumber: '10.0',
    action: 'approve',
    requiredFields: ['customsApproval'],
  },
  {
    stepNumber: '11.0',
    action: 'submit',
    requiredFields: ['dutyPayment'],
  },
  {
    stepNumber: '12.0',
    action: 'approve',
    requiredFields: ['releaseOrder'],
  },
  {
    stepNumber: '13.0',
    action: 'submit',
    requiredFields: ['portChargesPayment'],
  },
  {
    stepNumber: '14.0',
    action: 'submit',
    requiredFields: ['deliveryOrder'],
  },
  {
    stepNumber: '15.0',
    action: 'submit',
    requiredFields: ['containerRelease'],
  },

  // ========== Stores Steps (16.0-18.0) ==========
  {
    stepNumber: '16.0',
    action: 'submit',
    requiredFields: ['transportArrangement'],
  },
  {
    stepNumber: '17.0',
    action: 'submit',
    requiredFields: ['goodsReceived'],
  },
  {
    stepNumber: '18.0',
    action: 'submit',
    requiredFields: ['qualityInspection'],
  },
]

/**
 * Get workflow steps that should be triggered by a specific action
 */
export function getTriggeredSteps(
  action: WorkflowTrigger['action'],
  data: Record<string, any>
): string[] {
  const triggeredSteps: string[] = []

  for (const trigger of WORKFLOW_TRIGGERS) {
    if (trigger.action !== action) continue

    // Check if all required fields are present
    const hasRequiredFields = trigger.requiredFields?.every(
      (field) => data[field] !== undefined && data[field] !== null && data[field] !== ''
    )

    if (!hasRequiredFields) continue

    // Check additional condition if present
    if (trigger.condition && !trigger.condition(data)) continue

    triggeredSteps.push(trigger.stepNumber)
  }

  return triggeredSteps
}

/**
 * Auto-complete workflow steps based on shipment creation
 */
export function autoCompleteOnCreate(shipmentData: any, user?: any): string[] {
  const completedSteps: string[] = []

  // Step 1.1: Principal Name Entry
  if (shipmentData.principal) {
    completedSteps.push('1.1')
    if (user) {
      logWorkflowAction('1.1', 'Principal Name Entry', user, { principal: shipmentData.principal })
    }
  }

  // Step 1.2: Brand Entry
  if (shipmentData.brand) {
    completedSteps.push('1.2')
    if (user) {
      logWorkflowAction('1.2', 'Brand Entry', user, { brand: shipmentData.brand })
    }
  }

  // Step 1.6: LC Number Entry (if provided during creation)
  if (shipmentData.lcNumber) {
    completedSteps.push('1.6')
    if (user) {
      logWorkflowAction('1.6', 'LC Number Entry', user, { lcNumber: shipmentData.lcNumber })
    }
  }

  return completedSteps
}

/**
 * Auto-complete workflow steps based on document upload
 */
export function autoCompleteOnDocumentUpload(
  documentType: string,
  shipmentData: any,
  user?: any
): string[] {
  const completedSteps: string[] = []

  const documentStepMap: Record<string, string> = {
    'commercial-invoice': '2.1',
    'packing-list': '2.2',
    'bill-of-lading': '2.3',
    'certificate-of-origin': '2.4',
    'insurance-certificate': '2.5',
    'lc-copy': '3.3',
    'original-documents': '6.2',
  }

  const documentActionMap: Record<string, string> = {
    'commercial-invoice': 'Commercial Invoice Upload',
    'packing-list': 'Packing List Upload',
    'bill-of-lading': 'Bill of Lading Upload',
    'certificate-of-origin': 'Certificate of Origin Upload',
    'insurance-certificate': 'Insurance Certificate Upload',
    'lc-copy': 'LC Copy Upload',
    'original-documents': 'Original Documents Collection',
  }

  const stepNumber = documentStepMap[documentType]
  if (stepNumber) {
    completedSteps.push(stepNumber)
    if (user) {
      logWorkflowAction(stepNumber, documentActionMap[documentType] || 'Document Upload', user, { documentType })
    }
  }

  // Check if all documents are uploaded for step 2.6
  if (
    shipmentData.commercialInvoice &&
    shipmentData.packingList &&
    shipmentData.billOfLading &&
    shipmentData.certificateOfOrigin &&
    shipmentData.insuranceCertificate
  ) {
    completedSteps.push('2.6')
    if (user) {
      logWorkflowAction('2.6', 'Submit Documents to Finance', user, { allDocumentsUploaded: true })
    }
  }

  return completedSteps
}

/**
 * Auto-complete workflow steps based on data update
 */
export function autoCompleteOnUpdate(
  updatedFields: string[],
  shipmentData: any,
  user?: any
): string[] {
  const completedSteps: string[] = []

  // Step 1.3: Invoice Number Entry
  if (updatedFields.includes('invoiceNumber') && shipmentData.invoiceNumber) {
    completedSteps.push('1.3')
    if (user) {
      logWorkflowAction('1.3', 'Invoice Number Entry', user, { invoiceNumber: shipmentData.invoiceNumber })
    }
  }

  // Step 1.4: Invoice Amount Entry
  if (updatedFields.includes('invoiceAmount') && shipmentData.invoiceAmount) {
    completedSteps.push('1.4')
    if (user) {
      logWorkflowAction('1.4', 'Invoice Amount Entry', user, { invoiceAmount: shipmentData.invoiceAmount })
    }
  }

  // Step 1.5: Funds Required Calculation
  if (updatedFields.includes('fundsRequired') && shipmentData.fundsRequired) {
    completedSteps.push('1.5')
    if (user) {
      logWorkflowAction('1.5', 'Funds Required Calculation', user, { fundsRequired: shipmentData.fundsRequired })
    }
  }

  // Step 1.6: LC Number Entry
  if (updatedFields.includes('lcNumber') && shipmentData.lcNumber) {
    completedSteps.push('1.6')
    if (user) {
      logWorkflowAction('1.6', 'LC Number Entry', user, { lcNumber: shipmentData.lcNumber })
    }
  }

  return completedSteps
}

/**
 * Auto-complete workflow steps based on payment
 */
export function autoCompleteOnPayment(
  paymentType: string,
  shipmentData: any,
  user?: any
): string[] {
  const completedSteps: string[] = []

  const paymentStepMap: Record<string, string> = {
    'duty-payment': '11.0',
    'port-charges': '13.0',
  }

  const paymentActionMap: Record<string, string> = {
    'duty-payment': 'Duty Payment',
    'port-charges': 'Port Charges Payment',
  }

  const stepNumber = paymentStepMap[paymentType]
  if (stepNumber) {
    completedSteps.push(stepNumber)
    if (user) {
      logWorkflowAction(stepNumber, paymentActionMap[paymentType] || 'Payment', user, shipmentData)
    }
  }

  return completedSteps
}

/**
 * Auto-complete workflow steps based on approval
 */
export function autoCompleteOnApproval(
  approvalType: string,
  shipmentData: any,
  user?: any
): string[] {
  const completedSteps: string[] = []

  const approvalStepMap: Record<string, string> = {
    'lc-approval': '3.2',
    'bank-acceptance': '3.5',
    'payment-approval': '5.0',
    'customs-approval': '10.0',
    'release-order': '12.0',
  }

  const approvalActionMap: Record<string, string> = {
    'lc-approval': 'LC Approval',
    'bank-acceptance': 'Bank Acceptance',
    'payment-approval': 'Payment Approval',
    'customs-approval': 'Customs Approval',
    'release-order': 'Release Order',
  }

  const stepNumber = approvalStepMap[approvalType]
  if (stepNumber) {
    completedSteps.push(stepNumber)
    if (user) {
      logWorkflowAction(stepNumber, approvalActionMap[approvalType] || 'Approval', user, shipmentData)
    }
  }

  return completedSteps
}

/**
 * Auto-complete workflow steps based on submission
 */
export function autoCompleteOnSubmission(
  submissionType: string,
  shipmentData: any,
  user?: any
): string[] {
  const completedSteps: string[] = []

  const submissionStepMap: Record<string, string> = {
    'lc-application': '3.1',
    'documents-to-bank': '3.4',
    'documents-to-finance': '2.6',
    'payment-request': '4.0',
    'payment-confirmation': '6.1',
    'arrival-notice': '7.0',
    'customs-declaration': '8.0',
    'bayan-submission': '9.0',
    'delivery-order': '14.0',
    'container-release': '15.0',
    'transport-arrangement': '16.0',
    'goods-received': '17.0',
    'quality-inspection': '18.0',
  }

  const submissionActionMap: Record<string, string> = {
    'lc-application': 'LC Application Submission',
    'documents-to-bank': 'Submit Documents to Bank',
    'documents-to-finance': 'Submit Documents to Finance',
    'payment-request': 'Payment Request',
    'payment-confirmation': 'Payment Confirmation',
    'arrival-notice': 'Arrival Notice',
    'customs-declaration': 'Customs Declaration',
    'bayan-submission': 'Bayan Submission',
    'delivery-order': 'Delivery Order',
    'container-release': 'Container Release',
    'transport-arrangement': 'Transport Arrangement',
    'goods-received': 'Goods Received',
    'quality-inspection': 'Quality Inspection',
  }

  const stepNumber = submissionStepMap[submissionType]
  if (stepNumber) {
    completedSteps.push(stepNumber)
    if (user) {
      logWorkflowAction(stepNumber, submissionActionMap[submissionType] || 'Submission', user, shipmentData)
    }
  }

  return completedSteps
}

/**
 * Get step information by step number
 */
export function getStepInfo(stepNumber: string) {
  return WORKFLOW_STEPS.find((step) => step.stepNumber === stepNumber)
}

/**
 * Check if a step can be auto-completed based on current data
 */
export function canAutoComplete(stepNumber: string, shipmentData: any): boolean {
  const trigger = WORKFLOW_TRIGGERS.find((t) => t.stepNumber === stepNumber)
  if (!trigger) return false

  // Check required fields
  const hasRequiredFields = trigger.requiredFields?.every(
    (field) => shipmentData[field] !== undefined && shipmentData[field] !== null && shipmentData[field] !== ''
  )

  if (!hasRequiredFields) return false

  // Check condition
  if (trigger.condition && !trigger.condition(shipmentData)) return false

  return true
}

/**
 * Get all steps that can be auto-completed for current shipment data
 */
export function getAutoCompletableSteps(shipmentData: any): string[] {
  return WORKFLOW_TRIGGERS
    .filter((trigger) => canAutoComplete(trigger.stepNumber, shipmentData))
    .map((trigger) => trigger.stepNumber)
}

/**
 * Get human-readable description of what triggers a step
 */
export function getStepTriggerDescription(stepNumber: string): string {
  const trigger = WORKFLOW_TRIGGERS.find((t) => t.stepNumber === stepNumber)
  if (!trigger) return 'Manual completion required'

  const actionMap: Record<string, string> = {
    create: 'Automatically completed when shipment is created',
    update: 'Automatically completed when data is updated',
    upload: 'Automatically completed when document is uploaded',
    submit: 'Automatically completed when submitted',
    approve: 'Automatically completed when approved',
    calculate: 'Automatically completed when calculated',
  }

  let description = actionMap[trigger.action] || 'Manual completion required'

  if (trigger.requiredFields && trigger.requiredFields.length > 0) {
    const fields = trigger.requiredFields.join(', ')
    description += ` (requires: ${fields})`
  }

  return description
}
