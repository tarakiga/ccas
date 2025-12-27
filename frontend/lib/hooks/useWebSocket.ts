'use client'

import { useEffect } from 'react'
import { connectSocket, disconnectSocket } from '@/lib/api/websocket'
import { useAuth } from '@/lib/auth'

export function useWebSocket() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Connect with user token
      const token = localStorage.getItem('auth_token')
      connectSocket(token || undefined)

      return () => {
        disconnectSocket()
      }
    }
  }, [user])
}
