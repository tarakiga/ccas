'use client'

import { ReactNode } from 'react'
import { AntdProvider } from './antd-provider'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
// Temporarily disabled Auth0 for debugging
// import { Auth0ProviderWrapper } from './auth0-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {/* Auth0 temporarily disabled for debugging */}
      <AuthProvider>
        <QueryProvider>
          <AntdProvider>{children}</AntdProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

