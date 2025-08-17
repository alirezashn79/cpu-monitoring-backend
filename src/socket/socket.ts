import http from 'node:http'
import { Server, Socket } from 'socket.io'
import osUtils from 'os-utils'
import os from 'os'

type TimePoint = [number, number]
const FRONT_END_URL = process.env.FRONT_END_URL

export default function socket(server: http.Server): void {
  const io = new Server(server, {
    cors: { origin: FRONT_END_URL },
    transports: ['websocket'],
  })

  const MAX_HISTORY = 10

  let cpuHistory: TimePoint[] = Array.from({ length: MAX_HISTORY }, (_, i) => [
    Date.now() - (MAX_HISTORY - i) * 1000,
    0,
  ])
  let memHistory: TimePoint[] = Array.from({ length: MAX_HISTORY }, (_, i) => [
    Date.now() - (MAX_HISTORY - i) * 1000,
    0,
  ])

  let intervalId: NodeJS.Timeout | null = null

  const startPolling = () => {
    if (intervalId) return

    intervalId = setInterval(() => {
      const now = Date.now()

      osUtils.cpuUsage((cpuFraction) => {
        const cpuPercent = Math.round(cpuFraction * 100)
        cpuHistory = [...cpuHistory.slice(1), [now, cpuPercent]]

        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100)
        memHistory = [...memHistory.slice(1), [now, usedMemPercent]]

        io.emit('cpu', cpuHistory)
        io.emit('memory', memHistory)
      })
    }, 1000)
  }

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.emit('cpu', cpuHistory)
    socket.emit('memory', memHistory)

    if (io.engine.clientsCount === 1) {
      startPolling()
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
      if (io.engine.clientsCount === 0) {
        stopPolling()
      }
    })
  })
}
