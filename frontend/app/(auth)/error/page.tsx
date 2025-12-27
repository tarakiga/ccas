'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Alert } from '@/components/ui'
import { FadeIn } from '@/components/animations'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'An authentication error occurred'

  return (
    <FadeIn>
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
              <svg
                className="h-8 w-8 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          </div>

          <Alert type="error" message={error} />

          <div className="mt-6 space-y-3">
            <Button fullWidth onClick={() => (window.location.href = '/api/auth/login')}>
              Try Again
            </Button>
            <Button
              fullWidth
              variant="ghost"
              onClick={() => (window.location.href = '/login')}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
