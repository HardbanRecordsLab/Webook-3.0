import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

import aiRouter from './routes/ai'
import paymentsRouter from './routes/payments_pg'
import webooksRouter from './routes/webooks_pg'
import analyticsRouter from './routes/analytics_pg'

const app = express()
const PORT = Number(process.env.PORT) || 9108

// ── Security ──────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))

// ... (existing middleware)

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'webook-studio-3',
    version: '4.0.0', 
    ts: new Date().toISOString() 
  })
})

app.get('/api/auth', async (req, res) => {
  const email = req.query.email as string
  const ACCESS_MANAGER_URL = process.env.ACCESS_MANAGER_URL || 'http://hrl-webhook-hub-backend:9107'
  if (!email) return res.status(400).json({ error: 'email required' })

  try {
    const response = await fetch(`${ACCESS_MANAGER_URL}/api/auth/profile?email=${email}`)
    if (!response.ok) return res.status(response.status).json({ error: 'Auth Service Error' })
    const data = await response.json()
    res.json(data)
  } catch (e) {
    res.status(503).json({ error: 'Access Manager Connection Error' })
  }
})

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ── Error handler ─────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✅  Webook Studio API running on port ${PORT}`)
})

export default app
