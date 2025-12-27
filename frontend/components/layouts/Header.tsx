'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui'
import { UserMenu } from '@/components/features/dashboard'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [, setSearchOpen] = useState(false)
  const notificationCount = 3

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="hidden text-xl font-bold text-gray-900 md:block">CCAS</span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden flex-1 max-w-2xl px-8 md:block">
        <div className="relative">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-left text-sm text-gray-600 transition-all',
              'hover:border-primary-300 hover:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search shipments...</span>
            <kbd className="ml-auto hidden rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 lg:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search Button (Mobile) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Search"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1">
              <Badge variant="error" size="sm" pulse>
                {notificationCount}
              </Badge>
            </span>
          )}
        </button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
