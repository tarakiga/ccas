'use client'

import { ReactNode } from 'react'
import { AntdProvider } from './antd-provider'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
// Auth0 disabled for now - will re-enable after fixing blank screen
// import { Auth0ProviderWrapper } from './auth0-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <AntdProvider>{children}</AntdProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

