'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/providers/auth-provider'
import { Button, Input, Loading, Alert } from '@/components/ui'
import { FadeIn } from '@/components/animations'
import { useRouter } from 'next/navigation'
import { TEST_USERS } from '@/lib/mocks/test-users'

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTestUsers, setShowTestUsers] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(username, password)
      if (success) {
        router.push('/')
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickLogin = async (testUsername: string) => {
    setUsername(testUsername)
    setPassword('Test@123')
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(testUsername, 'Test@123')
      if (success) {
        router.push('/')
      } else {
        setError('Login failed')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <FadeIn>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to CCAS</h1>
          <p className="mt-2 text-gray-600">Customs Clearance Automation System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Test Users Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowTestUsers(!showTestUsers)}
            className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
          >
            {showTestUsers ? 'Hide' : 'Show'} Test Users
          </button>

          {showTestUsers && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick Login (All passwords: Test@123)</p>
              {TEST_USERS.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.username)}
                  disabled={isSubmitting}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-600">{user.username} - {user.role}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Test Mode:</strong> All passwords are <code className="bg-blue-100 px-1 rounded">Test@123</code>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          <p>© 2025 Aiqra. All rights reserved.</p>
        </div>
      </div>
    </FadeIn>
  )
}
