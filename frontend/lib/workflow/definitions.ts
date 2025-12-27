/**
 * Exact 34-Step Customs Clearance Workflow Definitions
 * Based on the official SOP document and Responsibility List
 * Matches Table #1 from SOP.md exactly
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
  stepNumber: string // e.g., "1.1", "1.2", "2.1", etc.
  sequenceNumber: number // 1-34 for ordering
  name: string
  description: string
  explanation: string
  department: Department
  etaOffset: number // Days from ETA (negative = before, positive = after)
  pprRole: string // Actual person name from responsibility list
  aprRole: string // Alternate person name
  isOptional?: boolean
  isCritical?: boolean
  dataFields?: StepDataFieldDefinition[]
  validationRules?: ValidationRuleDefinition[]
  dependencies?: string[] // Step numbers that must be completed first
  additionalInfo?: string
}

export interface StepDataFieldDefinition {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'calculated'
  required: boolean
  options?: string[]
  calculation?: string // For calculated fields like 11% of invoice
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
export const WORKFLOW_STEPS: WorkflowStepDefinition[] = [
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
  {
    stepNumber: '1.3',
    sequenceNumber: 3,
    name: 'Invoice Number Entry',
    description: 'Supplier invoice number',
    explanation: 'Enter the invoice number from the supplier',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'invoiceNumber',
        label: 'Invoice Number',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '1.4',
    sequenceNumber: 4,
    name: 'Invoice Amount Entry',
    description: 'Invoice amount - OMR equivalent',
    explanation: 'Enter the total invoice amount converted to OMR',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'invoiceAmount',
        label: 'Invoice Amount (OMR)',
        type: 'number',
        required: true,
        validation: {
          min: 0,
          message: 'Amount must be positive',
        },
      },
    ],
  },
  {
    stepNumber: '1.5',
    sequenceNumber: 5,
    name: 'Funds Required Calculation',
    description: 'Funds required for Customs Duty, VAT & Insurance',
    explanation: 'An OMR value based on 11% of invoice value, to cover customs etc',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Automated',
    aprRole: 'Automated',
    dataFields: [
      {
        name: 'fundsRequired',
        label: 'Funds Required (OMR)',
        type: 'calculated',
        required: true,
        calculation: 'invoiceAmount * 0.11',
      },
    ],
    dependencies: ['1.4'],
  },
  {
    stepNumber: '1.6',
    sequenceNumber: 6,
    name: 'Invoice Date Received',
    description: 'Date the supplier invoice was received',
    explanation: 'Record when the invoice from the supplier arrives',
    department: 'Business Unit',
    etaOffset: -19,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'invoiceDate',
        label: 'Invoice Date',
        type: 'date',
        required: true,
      },
    ],
    validationRules: [
      {
        rule: 'dateNotFuture',
        message: 'Invoice date cannot be in the future',
        severity: 'error',
      },
    ],
  },

  // Business Unit Steps (2.1-2.6) - ETA -17 days
  {
    stepNumber: '2.1',
    sequenceNumber: 7,
    name: 'B/L Number Entry',
    description: 'Bill of Lading number',
    explanation: 'Enter the BL number from shipping documents',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'blNumber',
        label: 'BL Number',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '2.2',
    sequenceNumber: 8,
    name: 'Port of Departure Entry',
    description: 'Date the ship sets sail from port of discharge',
    explanation: 'Enter the departure date from the origin port',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'sailDate',
        label: 'Ship Sail Date',
        type: 'date',
        required: true,
      },
      {
        name: 'portOfDeparture',
        label: 'Port of Departure',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '2.3',
    sequenceNumber: 9,
    name: 'Container Count Entry',
    description: 'Number of containers in the shipment',
    explanation: 'Enter the total number of containers',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'containerCount',
        label: 'Number of Containers',
        type: 'number',
        required: true,
        validation: {
          min: 1,
          message: 'Must have at least 1 container',
        },
      },
    ],
  },
  {
    stepNumber: '2.4',
    sequenceNumber: 10,
    name: 'Quantity Entry',
    description: 'Quantity per shipment e.g. 1,500 cars or tyres',
    explanation: 'Enter the total quantity of goods',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'number',
        required: true,
        validation: {
          min: 1,
          message: 'Quantity must be at least 1',
        },
      },
      {
        name: 'quantityUnit',
        label: 'Unit',
        type: 'select',
        required: true,
        options: ['vehicles', 'tyres', 'parts', 'units'],
      },
    ],
  },
  {
    stepNumber: '2.5',
    sequenceNumber: 11,
    name: 'Invoice Copy Forwarded to C&C',
    description: 'Date when copy of supplier invoice emailed by Rajendran to Hilal for Bayan system-product specification update',
    explanation: 'An important task so as to ensure ALL product descriptions are captured in Bayan system, BEFORE Bayan customs (import goods received) application submission date',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'forwardedToHilalDate',
        label: 'Date Forwarded to Hilal',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['1.6'],
  },
  {
    stepNumber: '2.6',
    sequenceNumber: 12,
    name: 'Invoice Date Received Confirmation',
    description: 'Date supplier invoice was received',
    explanation: 'Confirmation of invoice receipt date',
    department: 'Business Unit',
    etaOffset: -17,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dependencies: ['1.6'],
  },

  // Finance Steps (3.1-3.5) - ETA -16 days
  {
    stepNumber: '3.1',
    sequenceNumber: 13,
    name: 'LC Bank Issuer Entry',
    description: 'Name of Bank issuing LC',
    explanation: 'Enter the name of the bank that issued the Letter of Credit',
    department: 'Finance',
    etaOffset: -16,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    dataFields: [
      {
        name: 'lcBankIssuer',
        label: 'LC Bank Issuer',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '3.2',
    sequenceNumber: 14,
    name: 'LC Number Entry',
    description: 'LC number - a shipment may contain goods across multiple LCs',
    explanation: 'Enter all Letter of Credit numbers for this shipment',
    department: 'Finance',
    etaOffset: -16,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    dataFields: [
      {
        name: 'lcNumbers',
        label: 'LC Number(s)',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    stepNumber: '3.3',
    sequenceNumber: 15,
    name: 'Bank Document Collection Date',
    description: 'Latest date which Finance dept are to collect documents, could be earlier',
    explanation: 'The date when the business unit (TBLE) informs the Finance department that the documents are ready for collection',
    department: 'Business Unit',
    etaOffset: -16,
    pprRole: 'Rajendran P.',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'bankDocCollectionDate',
        label: 'Bank Document Collection Date',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    stepNumber: '3.4',
    sequenceNumber: 16,
    name: 'C&C Funds Requirements Notification',
    description: 'C&C to inform (oral and in writing) finance dept of funding requirement to settle customs, VAT and DO amounts',
    explanation: 'C&C informs Finance of funds requirements if funds required to be topped up',
    department: 'C&C',
    etaOffset: -16,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'fundsNotificationDate',
        label: 'Funds Notification Date',
        type: 'date',
        required: true,
      },
      {
        name: 'fundsAmount',
        label: 'Funds Amount Required (OMR)',
        type: 'number',
        required: true,
      },
    ],
  },
  {
    stepNumber: '3.5',
    sequenceNumber: 17,
    name: 'Bank Document Receipt Notification',
    description: 'Date the bank received the shipping documents (typically via airfreight courier) from supplier (Invoice, BL, Packing list etc)',
    explanation: 'Bank intimation date regarding receipt of shipment docs from principal-supplier',
    department: 'Finance',
    etaOffset: -16,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    dataFields: [
      {
        name: 'bankDocReceiptDate',
        label: 'Bank Document Receipt Date',
        type: 'date',
        required: true,
      },
    ],
  },

  // Finance Steps (4.0-6.2) - ETA -15 to -13 days
  {
    stepNumber: '4.0',
    sequenceNumber: 18,
    name: 'DAN to Authorized Signatories',
    description: 'Send the Bank Documentation Arrival Notice (DAN) to Authorised Signatories (AS) i.e. Chairman/GMD/CFO (2 from 3 required)',
    explanation: 'The DAN must be signed by Al Hashar authorised signatories in order for the banks to release the shipping docs to us',
    department: 'Finance',
    etaOffset: -15,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    isCritical: true,
    dataFields: [
      {
        name: 'danSentDate',
        label: 'DAN Sent Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['3.5'],
  },
  {
    stepNumber: '5.0',
    sequenceNumber: 19,
    name: 'Signed DAN Received',
    description: 'Finance to chase up signed DAN and get back from AS within a day',
    explanation: 'Date Finance received signed DAN back from authorised signatories',
    department: 'Finance',
    etaOffset: -14,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    isCritical: true,
    dataFields: [
      {
        name: 'danReceivedDate',
        label: 'Signed DAN Received Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['4.0'],
    validationRules: [
      {
        rule: 'withinTimeLimit',
        message: 'DAN must be received within 24 hours of sending',
        severity: 'error',
        params: { hours: 24, previousStep: '4.0' },
      },
    ],
    additionalInfo: 'Must happen within 24 hours of docs being submitted to AS for signing',
  },
  {
    stepNumber: '6.0',
    sequenceNumber: 20,
    name: 'Document Collection from Bank',
    description: 'Kamran (or alternate) to collect docs from banks and verify all is in order before taking ownership of the docs',
    explanation: 'Collection of docs from bank including checking accuracy of docs before Al Hashar accepts them',
    department: 'Finance',
    etaOffset: -13,
    pprRole: 'Kamran',
    aprRole: 'Bala',
    dataFields: [
      {
        name: 'docsCollectedDate',
        label: 'Documents Collected Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['5.0'],
  },
  {
    stepNumber: '6.1',
    sequenceNumber: 21,
    name: 'Document Handover to C&C',
    description: 'Finance dept to take copies of docs for their records then hand over originals to C&C',
    explanation: 'Handover of shipment docs from finance to C&C',
    department: 'Finance',
    etaOffset: -13,
    pprRole: 'Bala',
    aprRole: 'Shijith',
    dataFields: [
      {
        name: 'docsHandoverDate',
        label: 'Documents Handover Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['6.0'],
    additionalInfo: 'Finance to get C&C to sign receipt acknowledgement',
  },
  {
    stepNumber: '6.2',
    sequenceNumber: 22,
    name: 'Documents Received by C&C',
    description: 'C&C to take over ownership of shipping docs from finance dept',
    explanation: 'Shipment docs received by C&C from finance dept',
    department: 'C&C',
    etaOffset: -13,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'docsReceivedByCCDate',
        label: 'Documents Received by C&C Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['6.1'],
  },

  // Business Unit Step (7.0) - ETA -12 days
  {
    stepNumber: '7.0',
    sequenceNumber: 23,
    name: 'Ministry Approval Confirmation',
    description: 'Date when Hilal confirms to the TBLE team that Ministry approval to clear the goods has been approved',
    explanation: 'Hilal (TBLE C&C) confirms TBLE (Business Unit) that Ministry approval received date',
    department: 'Business Unit',
    etaOffset: -12,
    pprRole: 'Hilal',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'ministryApprovalDate',
        label: 'Ministry Approval Date',
        type: 'date',
        required: true,
      },
    ],
  },

  // C&C Step (8.0) - ETA -1 day
  {
    stepNumber: '8.0',
    sequenceNumber: 24,
    name: 'Funds Availability Confirmation',
    description: 'The absolute latest date when cleared funds should be available to pay Customs and DO amounts',
    explanation: 'Availability of funds - latest date (customs, DO amount)',
    department: 'C&C',
    etaOffset: -1,
    pprRole: 'Salim',
    aprRole: 'TBC',
    isCritical: true,
    dataFields: [
      {
        name: 'fundsAvailableDate',
        label: 'Funds Available Date',
        type: 'date',
        required: true,
      },
    ],
  },

  // C&C Steps (9.0-15.0) - ETA to ETA+10 days
  {
    stepNumber: '9.0',
    sequenceNumber: 25,
    name: 'Bayan Submission',
    description: 'Required by the Ministry of Commerce and Industry - DGSM dept',
    explanation: 'Bayan submission CANNOT happen prior to the goods arrival date i.e. at the destination port',
    department: 'C&C',
    etaOffset: 0, // ETA (actual arrival date)
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'bayanSubmissionDate',
        label: 'Bayan Submission Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['6.2', '2.5'],
    validationRules: [
      {
        rule: 'notBeforeETA',
        message: 'Cannot submit Bayan before goods arrive at port',
        severity: 'error',
      },
    ],
  },
  {
    stepNumber: '10.0',
    sequenceNumber: 26,
    name: 'Customs Duty Payment',
    description: 'Customs duty (and VAT?) to be paid PRIOR to Customs releasing approved Clearance Certificate',
    explanation: 'Ideally to be paid on goods arrival (port) date but NO LATER than 3 days after arrival',
    department: 'C&C',
    etaOffset: 3,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'customsDutyPaymentDate',
        label: 'Customs Duty Payment Date',
        type: 'date',
        required: true,
      },
      {
        name: 'customsDutyAmount',
        label: 'Customs Duty Amount (OMR)',
        type: 'number',
        required: true,
      },
    ],
    dependencies: ['9.0', '8.0'],
  },
  {
    stepNumber: '11.0',
    sequenceNumber: 27,
    name: 'Bayan Approval Received',
    description: 'Required by the Ministry of Commerce and Industry - DGSM dept',
    explanation: 'Bayan approval (includes completion of customs payment) date received',
    department: 'C&C',
    etaOffset: 4,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'bayanApprovalDate',
        label: 'Bayan Approval Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['10.0'],
  },
  {
    stepNumber: '12.0',
    sequenceNumber: 28,
    name: 'Original BL to Shipping Line',
    description: 'C&C to verify all related shipping document then share (scanned or original copies) with shipping line',
    explanation: 'Process: 1. original BL given by C&C to shipping line 2. payment to shipping line (DO charge) 3. C&C email payment confirmation 4. shipping line release DO to C&C',
    department: 'C&C',
    etaOffset: 5,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'blHandoverDate',
        label: 'BL Handover Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['11.0'],
  },
  {
    stepNumber: '13.0',
    sequenceNumber: 29,
    name: 'Shipping Line Payment',
    description: 'DO or Delivery Order will only be released after paying the shipping line costs',
    explanation: 'Funds transfer date – shipping line (to release DO) payment',
    department: 'Finance',
    etaOffset: 6,
    pprRole: 'Bala',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'shippingLinePaymentDate',
        label: 'Shipping Line Payment Date',
        type: 'date',
        required: true,
      },
      {
        name: 'shippingLineAmount',
        label: 'Shipping Line Amount (OMR)',
        type: 'number',
        required: true,
      },
    ],
    dependencies: ['12.0'],
  },
  {
    stepNumber: '14.0',
    sequenceNumber: 30,
    name: 'Goods Collection from Port',
    description: 'From the Port of Arrival',
    explanation: 'Goods collection date',
    department: 'C&C',
    etaOffset: 7,
    pprRole: 'Salim',
    aprRole: 'TBC',
    dataFields: [
      {
        name: 'goodsCollectionDate',
        label: 'Goods Collection Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['13.0'],
  },
  {
    stepNumber: '15.0',
    sequenceNumber: 31,
    name: 'Customs Police Random Check',
    description: 'A Yes or No is required for this field',
    explanation: 'Entirely at the discretion of the CP Dept. - random checks on average 50% of the time',
    department: 'C&C',
    etaOffset: 8, // 7 to 10 days
    pprRole: 'Salim',
    aprRole: 'TBC',
    isOptional: true,
    dataFields: [
      {
        name: 'customsPoliceCheck',
        label: 'Customs Police Check Required?',
        type: 'boolean',
        required: true,
      },
      {
        name: 'customsPoliceReleaseDate',
        label: 'Customs Police Release Date',
        type: 'date',
        required: false,
      },
    ],
    additionalInfo: 'Typically 1 to 3 days if inspection required',
  },

  // Business Unit - Stores Steps (16.0-18.0) - ETA+8 to ETA+11 days
  {
    stepNumber: '16.0',
    sequenceNumber: 32,
    name: 'Goods Received at Warehouse',
    description: 'Date on which goods received into the designated Al Hashar warehouse',
    explanation: 'Ideally same day or +1 after goods collected from Port of arrival',
    department: 'Business Unit - Stores',
    etaOffset: 8,
    pprRole: 'Warehouse Manager',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'warehouseReceiptDate',
        label: 'Warehouse Receipt Date',
        type: 'date',
        required: true,
      },
      {
        name: 'conditionOnReceipt',
        label: 'Condition on Receipt',
        type: 'select',
        required: true,
        options: ['Good', 'Damaged', 'Partial'],
      },
    ],
    dependencies: ['14.0'],
  },
  {
    stepNumber: '17.0',
    sequenceNumber: 33,
    name: 'Goods Received Confirmation to C&C',
    description: 'Business Unit (warehouse manager?) to email C&C confirmation goods received in good order',
    explanation: 'Informed (email and telcon) C&C goods received in good order',
    department: 'Business Unit - Stores',
    etaOffset: 9,
    pprRole: 'Warehouse Manager',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'ccNotificationDate',
        label: 'C&C Notification Date',
        type: 'date',
        required: true,
      },
    ],
    dependencies: ['16.0'],
  },
  {
    stepNumber: '18.0',
    sequenceNumber: 34,
    name: 'Insurance Claim Notification',
    description: 'Business unit to inform Finance Dept (Sumesh) of any defective for insurance claim',
    explanation: 'To ensure timeous submission of insurance claim, inside the claim window period',
    department: 'Business Unit - Stores',
    etaOffset: 11,
    pprRole: 'Warehouse Manager',
    aprRole: 'TBLE GM',
    dataFields: [
      {
        name: 'insuranceClaimRequired',
        label: 'Insurance Claim Required?',
        type: 'boolean',
        required: true,
      },
      {
        name: 'insuranceClaimDetails',
        label: 'Insurance Claim Details',
        type: 'text',
        required: false,
      },
      {
        name: 'financeNotificationDate',
        label: 'Finance Notification Date',
        type: 'date',
        required: false,
      },
    ],
    dependencies: ['16.0'],
  },
]

/**
 * Get PPR for a step based on division and step definition
 */
export function getPPRForStep(stepNumber: string, division: Division): string {
  const step = WORKFLOW_STEPS.find((s) => s.stepNumber === stepNumber)
  if (!step) return 'Unknown'

  // For Business Unit steps, vary by division
  if (step.department === 'Business Unit' || step.department === 'Business Unit - Stores') {
    if (step.pprRole === 'Rajendran P.' || step.pprRole === 'Warehouse Manager') {
      const divisionPPR: Record<Division, string> = {
        TBLE: 'Rajendran P.',
        LVD: 'TBLE-Rajan',
        HVD: 'TBLE-Hilal',
        Parts: 'Rajendran P.',
      }
      return divisionPPR[division]
    }
    if (step.pprRole === 'Hilal') {
      return 'Hilal' // C&C consultant for TBLE
    }
  }

  // Return the defined PPR role for Finance and C&C steps
  return step.pprRole
}

/**
 * Get APR for a step based on division and step definition
 */
export function getAPRForStep(stepNumber: string, division: Division): string {
  const step = WORKFLOW_STEPS.find((s) => s.stepNumber === stepNumber)
  if (!step) return 'Unknown'

  // For Business Unit steps, vary by division
  if (step.department === 'Business Unit' || step.department === 'Business Unit - Stores') {
    const divisionAPR: Record<Division, string> = {
      TBLE: 'TBLE GM',
      LVD: 'LVD GM',
      HVD: 'HVD GM',
      Parts: 'Parts GM',
    }
    return divisionAPR[division]
  }

  // Return the defined APR role for Finance and C&C steps
  return step.aprRole
}

/**
 * Group steps by department
 */
export function groupStepsByDepartment(
  steps: WorkflowStepDefinition[]
): Record<Department, WorkflowStepDefinition[]> {
  return steps.reduce(
    (acc, step) => {
      if (!acc[step.department]) {
        acc[step.department] = []
      }
      acc[step.department].push(step)
      return acc
    },
    {} as Record<Department, WorkflowStepDefinition[]>
  )
}

/**
 * Get department color for UI
 */
export function getDepartmentColor(department: Department): string {
  switch (department) {
    case 'Business Unit':
      return 'blue'
    case 'Finance':
      return 'green'
    case 'C&C':
      return 'purple'
    case 'Business Unit - Stores':
      return 'lightblue'
    default:
      return 'gray'
  }
}
