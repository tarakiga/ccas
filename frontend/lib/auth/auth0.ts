// Auth0 configuration
// The actual Auth0 setup is handled by the SDK in app/api/auth/[...auth0]/route.ts
export const auth0Config = {
  domain: process.env.AUTH0_ISSUER_BASE_URL || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
}
