import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
// @ts-ignore
import app from './server.js'
import { Server as IOServer } from 'socket.io'

const PORT: number = Number(process.env.PORT || 5000)

const server = http.createServer(app)

// Optionally create socket.io and attach to server when explicitly enabled
if (process.env.ENABLE_SOCKET_IO === 'true') {
  const io = new IOServer(server, { cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' } })
  ;(app as any).io = io
  io.on('connection', socket => {
    console.log('socket connected', socket.id)
    socket.on('disconnect', () => console.log('socket disconnected', socket.id))
  })
} else {
  console.log('Socket.IO disabled (set ENABLE_SOCKET_IO=true to enable)')
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
