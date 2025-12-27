/**
 * Environment variables with type safety
 * All public env vars must be prefixed with NEXT_PUBLIC_
 */

export const env = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',

  // Auth0 Configuration
  auth0: {
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || '',
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'CCAS',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    errorTracking: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true',
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// Validate required environment variables
export function validateEnv() {
  const required = {
    'NEXT_PUBLIC_API_URL': env.apiUrl,
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
