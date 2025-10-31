import express from 'express'
import payload from 'payload'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true
}))

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
  })

  app.listen(PORT, () => {
    console.log(`✅ Backend API démarré sur le port ${PORT}`)
    console.log(`📍 Admin: http://localhost:${PORT}/admin`)
  })
}

start()
