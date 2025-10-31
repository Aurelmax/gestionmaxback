import express from 'express'
import payload from 'payload'
import config from './payload.config'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Initialize Payload
const start = async () => {
  await payload.init({
    config,
    express: app,
  })

  app.listen(PORT, () => {
    console.log(`✅ Backend API Payload démarré sur le port ${PORT}`)
    console.log(`📍 Admin: http://localhost:${PORT}/admin`)
    console.log(`📍 API REST: http://localhost:${PORT}/api`)
    console.log(`📍 GraphQL: http://localhost:${PORT}/api/graphql`)
  })
}

start()
