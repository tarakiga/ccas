import { Button } from '@/components/ui'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-100">
          <svg
            className="h-10 w-10 text-error-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this resource.
        </p>
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
