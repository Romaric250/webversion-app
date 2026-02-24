import { io, Socket } from 'socket.io-client'

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://signova-backend.onrender.com/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

let socket: Socket | null = null

export function getGroupSocket(token: string | null): Socket | null {
  if (!token) return null
  const url = getSocketUrl()
  if (socket?.connected) return socket
  socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
