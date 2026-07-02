// server/index.ts
// ResilientSA Express API server
// Env vars loaded via -r dotenv/config preload

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import { requireSession } from './middleware/session'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

// Public routes
app.use('/auth', authRoutes)

// Protected routes — all require valid session token
app.use('/api', requireSession)

// Health check
app.get('/api/me', (req, res) => {
  const r = req as any
  res.json({ userId: r.userId, role: r.userRole, nodeId: r.nodeId })
})

app.listen(PORT, () => {
  console.log(`ResilientSA API running on http://localhost:${PORT}`)
})

export default app
