import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any })

// ── POST /api/payments/create-checkout ───────────────────
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
          unit_amount: 2500, // $25.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      metadata: { webookId, userId },
    })

    // Insert pending purchase
    await supabase.from('purchases').insert({
      webook_id: webookId,
      user_id: userId,
      stripe_session_id: session.id,
      amount: 25,
      status: 'pending',
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    console.error('create-checkout error:', err)
    res.status(500).json({ error: 'Błąd tworzenia sesji płatności' })
  }
})

// ── POST /api/payments/webhook ────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook Error')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { webookId } = session.metadata!

    // Update purchase status
    await supabase.from('purchases')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('stripe_session_id', session.id)

    // Publish the webook
    await supabase.from('webooks')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', webookId)

    console.log(`✅ Webook ${webookId} published after payment ${session.id}`)
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    await supabase.from('purchases')
      .update({ status: 'refunded' })
      .eq('stripe_session_id', charge.payment_intent as string)
  }

  res.json({ received: true })
})

// ── GET /api/payments/verify ──────────────────────────────
router.get('/verify', async (req: Request, res: Response) => {
  const { session_id } = req.query
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' })
  }

  const { data } = await supabase.from('purchases')
    .select('status, webook_id')
    .eq('stripe_session_id', session_id)
    .single()

  res.json({ status: data?.status || 'not_found', webookId: data?.webook_id })
})

export default router
