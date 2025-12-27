// Base TypeScript types and interfaces
export * from './shipment'
export * from './workflow'
export * from './alert'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  avatar?: string
}

export enum UserRole {
  BUSINESS_UNIT = 'business_unit',
  FINANCE = 'finance',
  CUSTOMS_CLEARANCE = 'customs_clearance',
  MANAGEMENT = 'management',
  ADMIN = 'admin',
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}
