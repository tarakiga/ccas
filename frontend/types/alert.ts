export interface Alert {
  id: string
  shipmentId: string
  shipmentNumber: string
  type: AlertType
  severity: AlertSeverity
  message: string
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
}

export enum AlertType {
  ETA_APPROACHING = 'eta_approaching',
  STEP_OVERDUE = 'step_overdue',
  DEMURRAGE_RISK = 'demurrage_risk',
  DOCUMENT_MISSING = 'document_missing',
  PAYMENT_DUE = 'payment_due',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}
