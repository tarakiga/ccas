'use client'

import { ConfigProvider, theme } from 'antd'
import { ReactNode } from 'react'

interface AntdProviderProps {
  children: ReactNode
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0066FF',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#3B82F6',
          borderRadius: 8,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
        components: {
          Button: {
            controlHeight: 40,
            fontSize: 14,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 40,
            fontSize: 14,
          },
          Select: {
            controlHeight: 40,
            fontSize: 14,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
