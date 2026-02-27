import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

const router = Router()

const EventSchema = z.object({
  webookId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  eventType: z.enum(['page_view', 'quiz_answer', 'chapter_complete', 'time_spent', 'purchase']),
  props: z.record(z.unknown()).optional(),
})

// ── POST /api/analytics/event ─────────────────────────────
router.post('/event', async (req: Request, res: Response) => {
  try {
    const body = EventSchema.parse(req.body)
    await supabase.from('analytics_events').insert({
      webook_id: body.webookId,
      user_id: body.userId,
      event_type: body.eventType,
      props: body.props || {},
    })
    res.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Event tracking failed' })
  }
})

// ── GET /api/analytics/:webookId ─────────────────────────
router.get('/:webookId', async (req: Request, res: Response) => {
  const { webookId } = req.params

  const [views, quizAnswers, completions, purchases] = await Promise.all([
    supabase.from('analytics_events').select('id', { count: 'exact' })
      .eq('webook_id', webookId).eq('event_type', 'page_view'),
    supabase.from('analytics_events').select('props')
      .eq('webook_id', webookId).eq('event_type', 'quiz_answer'),
    supabase.from('analytics_events').select('id', { count: 'exact' })
      .eq('webook_id', webookId).eq('event_type', 'chapter_complete'),
    supabase.from('purchases').select('id', { count: 'exact' })
      .eq('webook_id', webookId).eq('status', 'completed'),
  ])

  const quizData = quizAnswers.data || []
  const correct = quizData.filter(e => (e.props as Record<string, boolean>)?.correct).length
  const quizAccuracy = quizData.length > 0 ? Math.round((correct / quizData.length) * 100) : 0

  res.json({
    totalViews: views.count || 0,
    totalCompletions: completions.count || 0,
    totalPurchases: purchases.count || 0,
    quizAccuracy,
    quizAnswers: quizData.length,
  })
})

export default router
