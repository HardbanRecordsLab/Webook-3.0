import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

const router = Router()

// ── GET /api/webooks?userId=... ───────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const { data, error } = await supabase
    .from('webooks')
    .select('*, webook_chapters(count)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ── GET /api/webooks/published ────────────────────────────
router.get('/published', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('webooks')
    .select('id, title, description, cover_url, slug, user_id, profiles(full_name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ── GET /api/webooks/:id ──────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('webooks')
    .select(`
      *,
      profiles(full_name, avatar_url),
      webook_chapters(
        id, title, sort_order, audio_url,
        webook_blocks(id, type, content, props, sort_order)
      )
    `)
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Webook not found' })
  res.json(data)
})

// ── POST /api/webooks ─────────────────────────────────────
const CreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  templateId: z.string().optional(),
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateSchema.parse(req.body)
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

    const { data, error } = await supabase.from('webooks').insert({
      user_id: body.userId,
      title: body.title,
      description: body.description,
      cover_url: body.coverUrl,
      slug,
      is_published: false,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })

    // Create first empty chapter
    await supabase.from('webook_chapters').insert({
      webook_id: data.id,
      title: 'Wstęp',
      sort_order: 0,
    })

    res.status(201).json(data)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Błąd tworzenia Webooka' })
  }
})

// ── PUT /api/webooks/:id ──────────────────────────────────
const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  chapters: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    sortOrder: z.number(),
    blocks: z.array(z.object({
      id: z.string().optional(),
      type: z.string(),
      content: z.string(),
      props: z.record(z.unknown()).optional(),
      sortOrder: z.number(),
    })),
  })).optional(),
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = UpdateSchema.parse(req.body)
    const webookId = req.params.id

    // Update webook metadata
    if (body.title || body.description || body.coverUrl) {
      const { error } = await supabase.from('webooks')
        .update({
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.coverUrl !== undefined && { cover_url: body.coverUrl }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', webookId)

      if (error) return res.status(500).json({ error: error.message })
    }

    // Upsert chapters + blocks
    if (body.chapters) {
      for (const ch of body.chapters) {
        const { data: chData } = await supabase.from('webook_chapters').upsert({
          ...(ch.id ? { id: ch.id } : {}),
          webook_id: webookId,
          title: ch.title,
          sort_order: ch.sortOrder,
        }).select().single()

        if (chData && ch.blocks) {
          for (const bl of ch.blocks) {
            await supabase.from('webook_blocks').upsert({
              ...(bl.id ? { id: bl.id } : {}),
              chapter_id: chData.id,
              type: bl.type,
              content: bl.content,
              props: bl.props || {},
              sort_order: bl.sortOrder,
            })
          }
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Błąd zapisu' })
  }
})

// ── DELETE /api/webooks/:id ───────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { error } = await supabase.from('webooks').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
