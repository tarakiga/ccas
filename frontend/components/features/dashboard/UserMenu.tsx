'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/providers/auth-provider'
import { useThemeStore } from '@/lib/store/theme-store'
import { PermissionBadge } from '@/components/auth/PermissionBadge'

export function UserMenu() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {/* Avatar with gradient border */}
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-semibold text-white shadow-inner">
            {getInitials(user.name)}
          </div>
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden min-w-0 flex-1 text-left lg:block">
          <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="truncate text-xs text-gray-500">{user.role}</p>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 lg:block ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu Panel */}
          <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5">
              {/* User Info Header */}
              <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-base font-bold text-white shadow-lg">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-600">{user.email}</p>
                    <p className="mt-1 truncate text-xs font-medium text-gray-500">{user.role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <PermissionBadge type="permission" showIcon={true} />
                      {user.division && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {user.division}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Profile */}
                <button
                  onClick={() => {
                    window.location.href = '/settings/profile'
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Profile Settings</p>
                    <p className="text-xs text-gray-500">Manage your account</p>
                  </div>
                </button>

                {/* Settings - Only for Admin */}
                {user.role === 'Admin' && (
                  <button
                    onClick={() => {
                      window.location.href = '/settings/users'
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-gray-500">Manage users & permissions</p>
                    </div>
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {theme === 'dark' ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
                    <p className="text-xs text-gray-500">Switch appearance</p>
                  </div>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-gray-100"></div>

                {/* Sign Out */}
                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Sign Out</p>
                    <p className="text-xs text-red-500">End your session</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
