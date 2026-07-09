// server/index.ts
// ResilientSA Express API server

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import giftsRouter from './routes/gifts'
import listingsRouter from './routes/listings'
import stewardRouter from './routes/steward'
import { requireSession } from './middleware/session'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

// Public routes
app.use('/auth', authRoutes)

// Protected routes — all require valid session token
app.use('/api', requireSession)

// Gifts profile
app.use('/gifts-profile', giftsRouter)

// Listings, matches, trade completions, exchange reference
app.use('/', listingsRouter)

// Cell Steward dashboard
app.use('/steward', stewardRouter)

// Health check
app.get('/api/me', (req, res) => {
  const r = req as any
  res.json({ userId: r.userId, role: r.userRole, nodeId: r.nodeId })
})

app.listen(PORT, () => {
  console.log(`ResilientSA API running on http://localhost:${PORT}`)
})

export default app
