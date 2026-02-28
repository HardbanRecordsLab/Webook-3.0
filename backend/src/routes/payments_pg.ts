import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { z } from 'zod'
import { db } from '../lib/db'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any })

const CheckoutSchema = z.object({
  webookId: z.string().uuid(),
  userId: z.string().uuid(),
  webookTitle: z.string(),
})

router.post('/create-checkout', async (req: Request, res: Response) => {
  try {
    const { webookId, userId, webookTitle } = CheckoutSchema.parse(req.body)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Webook: ${webookTitle}`,
            description: 'Jednorazowy dostęp do Webook Studio',
            images: ['https://webook.studio/og.png'],
          },
          unit_amount: 2500,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      metadata: { webookId, userId },
    })
    await db.query(
      `INSERT INTO purchases (webook_id, user_id, stripe_session_id, amount, status)
       VALUES ($1,$2,$3,$4,$5)`,
      [webookId, userId, session.id, 25, 'pending']
    )
    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Błąd tworzenia sesji płatności' })
  }
})

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return res.status(400).send('Webhook Error')
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { webookId } = session.metadata!
    await db.query(
      `UPDATE purchases SET status='completed', completed_at=NOW() WHERE stripe_session_id=$1`,
      [session.id]
    )
    await db.query(
      `UPDATE webooks SET is_published=true, published_at=NOW() WHERE id=$1`,
      [webookId]
    )
  }
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    await db.query(
      `UPDATE purchases SET status='refunded' WHERE stripe_session_id=$1`,
      [charge.payment_intent as string]
    )
  }
  res.json({ received: true })
})

router.get('/verify', async (req: Request, res: Response) => {
  const { session_id } = req.query
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' })
  }
  const r = await db.query(
    `SELECT status, webook_id FROM purchases WHERE stripe_session_id=$1 LIMIT 1`,
    [session_id]
  )
  const row = r.rows[0]
  res.json({ status: row?.status || 'not_found', webookId: row?.webook_id })
})

export default router
