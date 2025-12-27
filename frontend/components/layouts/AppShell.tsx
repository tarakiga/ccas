'use client'

import { ReactNode, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => {
            setSidebarOpen(!sidebarOpen)
            setMobileMenuOpen(!mobileMenuOpen)
          }}
        />

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto p-6 transition-all duration-300',
            sidebarOpen ? 'md:ml-0' : 'md:ml-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
