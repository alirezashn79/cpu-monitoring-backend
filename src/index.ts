import express from 'express'
import 'dotenv/config'
import http from 'node:http'
import cors from 'cors'

import socket from './socket/socket'
const PORT = process.env.PORT
const FRONT_END_URL = process.env.FRONT_END_URL

const app = express()

const server = http.createServer(app)

socket(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: FRONT_END_URL,
    credentials: true,
  })
)

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
