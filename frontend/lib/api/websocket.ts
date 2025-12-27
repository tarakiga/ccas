'use client'

import { io, Socket } from 'socket.io-client'
import { env } from '@/lib/constants'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.wsUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  return socket
}

export function connectSocket(token?: string) {
  const socket = getSocket()
  
  if (token) {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}

export function subscribeToShipmentUpdates(
  shipmentId: string,
  callback: (data: any) => void
) {
  const socket = getSocket()
  socket.on(`shipment:${shipmentId}:updated`, callback)
  
  return () => {
    socket.off(`shipment:${shipmentId}:updated`, callback)
  }
}

export function subscribeToAlerts(callback: (data: any) => void) {
  const socket = getSocket()
  socket.on('alert:new', callback)
  
  return () => {
    socket.off('alert:new', callback)
  }
}

export function subscribeToWorkflowUpdates(
  shipmentId: string,
  callback: (data: any) => void
) {
  const socket = getSocket()
  socket.on(`workflow:${shipmentId}:updated`, callback)
  
  return () => {
    socket.off(`workflow:${shipmentId}:updated`, callback)
  }
}
