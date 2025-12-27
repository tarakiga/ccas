/**
 * Application route constants
 */

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  CALLBACK: '/callback',
  LOGOUT: '/logout',

  // Dashboard routes
  DASHBOARD: '/',
  
  // Shipment routes
  SHIPMENTS: '/shipments',
  SHIPMENT_DETAIL: (id: string) => `/shipments/${id}`,
  
  // Alert routes
  ALERTS: '/alerts',
  
  // Metrics routes
  METRICS: '/metrics',
  
  // Settings routes
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  
  // Audit routes
  AUDIT: '/audit',
} as const

export type Route = typeof ROUTES[keyof typeof ROUTES]
