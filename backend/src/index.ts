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
const PORT = Number(process.env.PORT) || 3001

// ── Security ──────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Raw body for Stripe webhooks (must be before json middleware)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))

// ── Rate limiting ─────────────────────────────────────────
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true })
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'Zbyt wiele requestów AI. Odczekaj chwilę.' } })

app.use('/api', generalLimiter)
app.use('/api/ai', aiLimiter)

// ── Routes ────────────────────────────────────────────────
app.use('/api/ai', aiRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/webooks', webooksRouter)
app.use('/api/analytics', analyticsRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '4.0.0', ts: new Date().toISOString() })
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
