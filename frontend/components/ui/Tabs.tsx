'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="relative border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'relative px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                activeTab === tab.id
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900',
                tab.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'transition-opacity duration-200',
              activeTab === tab.id ? 'block animate-fadeIn' : 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
