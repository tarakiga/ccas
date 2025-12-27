'use client'

import { ReactNode } from 'react'
import { AntdProvider } from './antd-provider'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
import { Auth0ProviderWrapper } from './auth0-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <Auth0ProviderWrapper>
        <AuthProvider>
          <QueryProvider>
            <AntdProvider>{children}</AntdProvider>
          </QueryProvider>
        </AuthProvider>
      </Auth0ProviderWrapper>
    </ThemeProvider>
  )
}

