import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../lib/db'

const router = Router()

const EventSchema = z.object({
  webookId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  eventType: z.enum(['page_view', 'quiz_answer', 'chapter_complete', 'time_spent', 'purchase']),
  props: z.record(z.unknown()).optional(),
})

router.post('/event', async (req: Request, res: Response) => {
  try {
    const body = EventSchema.parse(req.body)
    await db.query(
      `INSERT INTO analytics_events (webook_id, user_id, event_type, props) VALUES ($1,$2,$3,$4)`,
      [body.webookId, body.userId || null, body.eventType, body.props || {}]
    )
    res.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Event tracking failed' })
  }
})

router.get('/:webookId', async (req: Request, res: Response) => {
  const { webookId } = req.params
  try {
    const views = await db.query(
      `SELECT COUNT(*)::int AS c FROM analytics_events WHERE webook_id=$1 AND event_type='page_view'`,
      [webookId]
    )
    const quizAnswers = await db.query(
      `SELECT props FROM analytics_events WHERE webook_id=$1 AND event_type='quiz_answer'`,
      [webookId]
    )
    const completions = await db.query(
      `SELECT COUNT(*)::int AS c FROM analytics_events WHERE webook_id=$1 AND event_type='chapter_complete'`,
      [webookId]
    )
    const purchases = await db.query(
      `SELECT COUNT(*)::int AS c FROM purchases WHERE webook_id=$1 AND status='completed'`,
      [webookId]
    )
    const qa = quizAnswers.rows as Array<{ props: any }>
    const correct = qa.filter((e: { props: any }) => (e.props as any)?.correct).length
    const quizAccuracy = qa.length > 0 ? Math.round((correct / qa.length) * 100) : 0
    res.json({
      totalViews: views.rows[0]?.c || 0,
      totalCompletions: completions.rows[0]?.c || 0,
      totalPurchases: purchases.rows[0]?.c || 0,
      quizAccuracy,
      quizAnswers: qa.length,
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'DB error' })
  }
})

export default router
