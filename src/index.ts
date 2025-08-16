import express from 'express'
import 'dotenv/config'
import 'dotenv/config'
import http from 'node:http'
import cors from 'cors'
import { FRONT_END_URL } from './constants/constants'
const PORT = process.env.PORT

const app = express()

const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: FRONT_END_URL,
    credentials: true,
  })
)

server.listen(PORT, () => {
  console.log(`server running on port ${FRONT_END_URL}`)
})
