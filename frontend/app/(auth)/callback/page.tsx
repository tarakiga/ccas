'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui'
import { FadeIn } from '@/components/animations'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Auth0 will handle the callback and redirect
    const timer = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <FadeIn>
      <div className="w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-2xl">
        <Loading size="lg" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Signing you in...</h2>
        <p className="mt-2 text-gray-600">Please wait while we complete authentication</p>
      </div>
    </FadeIn>
  )
}
