'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile settings by default
    router.replace('/settings/profile')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text="Loading settings..." />
    </div>
  )
}
