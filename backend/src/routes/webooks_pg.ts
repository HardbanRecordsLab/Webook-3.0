import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../lib/db'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'Missing userId' })
  try {
    const q = `
      SELECT w.*,
        (SELECT COUNT(*)::int FROM webook_chapters c WHERE c.webook_id = w.id) AS webook_chapters_count
      FROM webooks w
      WHERE w.user_id = $1
      ORDER BY w.updated_at DESC
    `
    const { rows } = await db.query(q, [userId])
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'DB error' })
  }
})

router.get('/published', async (_req: Request, res: Response) => {
  try {
    const q = `
      SELECT w.id, w.title, w.description, w.cover_url, w.slug, w.user_id, p.full_name
      FROM webooks w
      LEFT JOIN profiles p ON p.id = w.user_id
      WHERE w.is_published = true
      ORDER BY w.published_at DESC
      LIMIT 50
    `
    const { rows } = await db.query(q)
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'DB error' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const webookId = req.params.id
    const wq = `SELECT * FROM webooks WHERE id = $1`
    const wr = await db.query(wq, [webookId])
    if (wr.rows.length === 0) return res.status(404).json({ error: 'Webook not found' })
    const w = wr.rows[0]
    const pr = await db.query(`SELECT full_name, avatar_url FROM profiles WHERE id = $1`, [w.user_id])
    type ChapterRow = { id: string; title: string; sort_order: number; audio_url: string | null }
    const chapters = (await db.query(
      `SELECT id, title, sort_order, audio_url FROM webook_chapters WHERE webook_id = $1 ORDER BY sort_order ASC`,
      [webookId]
    )).rows as ChapterRow[]
    const chIds = chapters.map((c: ChapterRow) => c.id)
    let blocksByChapter: Record<string, any[]> = {}
    if (chIds.length > 0) {
      const bl = (await db.query(
        `SELECT id, chapter_id, type, content, props, sort_order FROM webook_blocks WHERE chapter_id = ANY($1) ORDER BY sort_order ASC`,
        [chIds]
      )).rows
      for (const b of bl) {
        const k = b.chapter_id
        if (!blocksByChapter[k]) blocksByChapter[k] = []
        blocksByChapter[k].push({ id: b.id, type: b.type, content: b.content, props: b.props, sort_order: b.sort_order })
      }
    }
    const payload = {
      ...w,
      profiles: pr.rows[0] || null,
      webook_chapters: chapters.map((c: ChapterRow) => ({
        id: c.id,
        title: c.title,
        sort_order: c.sort_order,
        audio_url: c.audio_url,
        webook_blocks: (blocksByChapter[c.id] || []).map(b => ({
          id: b.id, type: b.type, content: b.content, props: b.props, sort_order: b.sort_order,
        })),
      })),
    }
    res.json(payload)
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'DB error' })
  }
})

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
    const ir = await db.query(
      `INSERT INTO webooks (user_id, title, description, cover_url, slug, is_published)
       VALUES ($1,$2,$3,$4,$5,false) RETURNING *`,
      [body.userId, body.title, body.description || null, body.coverUrl || null, slug]
    )
    const inserted = ir.rows[0]
    await db.query(
      `INSERT INTO webook_chapters (webook_id, title, sort_order) VALUES ($1,$2,$3)`,
      [inserted.id, 'Wstęp', 0]
    )
    res.status(201).json(inserted)
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Błąd tworzenia Webooka' })
  }
})

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
    await db.query('BEGIN')
    if (body.title || body.description !== undefined || body.coverUrl !== undefined) {
      await db.query(
        `UPDATE webooks
         SET title = COALESCE($2, title),
             description = CASE WHEN $3 IS NULL THEN description ELSE $3 END,
             cover_url = CASE WHEN $4 IS NULL THEN cover_url ELSE $4 END,
             updated_at = NOW()
         WHERE id = $1`,
        [webookId, body.title || null, body.description ?? null, body.coverUrl ?? null]
      )
    }
    if (body.chapters) {
      for (const ch of body.chapters) {
        let chapterId = ch.id
        if (chapterId) {
          await db.query(
            `UPDATE webook_chapters SET title=$2, sort_order=$3 WHERE id=$1`,
            [chapterId, ch.title, ch.sortOrder]
          )
        } else {
          const ir = await db.query(
            `INSERT INTO webook_chapters (webook_id, title, sort_order) VALUES ($1,$2,$3) RETURNING id`,
            [webookId, ch.title, ch.sortOrder]
          )
          chapterId = ir.rows[0].id
        }
        for (const bl of ch.blocks) {
          if (bl.id) {
            await db.query(
              `UPDATE webook_blocks SET type=$2, content=$3, props=$4, sort_order=$5 WHERE id=$1`,
              [bl.id, bl.type, bl.content, bl.props || {}, bl.sortOrder]
            )
          } else {
            await db.query(
              `INSERT INTO webook_blocks (chapter_id, type, content, props, sort_order) VALUES ($1,$2,$3,$4,$5)`,
              [chapterId, bl.type, bl.content, bl.props || {}, bl.sortOrder]
            )
          }
        }
      }
    }
    await db.query('COMMIT')
    res.json({ success: true })
  } catch (err: any) {
    try { await db.query('ROLLBACK') } catch {}
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    res.status(500).json({ error: 'Błąd zapisu' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db.query('BEGIN')
    await db.query(
      `DELETE FROM webook_blocks WHERE chapter_id IN (SELECT id FROM webook_chapters WHERE webook_id = $1)`,
      [req.params.id]
    )
    await db.query(`DELETE FROM webook_chapters WHERE webook_id = $1`, [req.params.id])
    await db.query(`DELETE FROM webooks WHERE id = $1`, [req.params.id])
    await db.query('COMMIT')
    res.json({ success: true })
  } catch (e: any) {
    try { await db.query('ROLLBACK') } catch {}
    res.status(500).json({ error: e.message || 'DB error' })
  }
})

export default router
