import dotenv from "dotenv"
dotenv.config()
import express from "express"
import type { Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Stripe from "stripe"
import archiver from "archiver"
import { z } from "zod"
const app = express()
app.use(express.json({ limit: "2mb", verify: (req: any, res: any, buf: Buffer) => { req.rawBody = buf } }))
app.use(cors({ origin: true, credentials: true }))
app.use(helmet())
app.use(cookieParser())
const prisma = new PrismaClient()
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const JWT_SECRET = process.env.JWT_SECRET || "dev"
function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}
type UserToken = { id: string, role: string }
interface AuthRequest extends Request { user?: UserToken; rawBody?: Buffer }
async function auth(req: any, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    const token = header && header.startsWith("Bearer ") ? header.slice(7) : req.cookies.token
    if (!token) return res.status(401).json({ error: "unauthorized" })
    const decoded = jwt.verify(token, JWT_SECRET) as UserToken
    req.user = decoded
    next()
  } catch (e) {
    res.status(401).json({ error: "unauthorized" })
  }
}
function allowRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" })
    next()
  }
}
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) })
app.post("/api/auth/register", async (req: any, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const { email, password, name } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: "exists" })
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hash, name, role: "EDITOR" } })
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
app.post("/api/auth/login", async (req: any, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: "invalid" })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: "invalid" })
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})
const webookSchema = z.object({ title: z.string().min(1), slug: z.string().min(1), theme: z.any(), priceCents: z.number().int().nonnegative() })
app.post("/api/webooks", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: any) => {
  const parsed = webookSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const data = parsed.data
  const webook = await prisma.webook.create({ data: { ...data, theme: JSON.stringify(data.theme), authorId: req.user.id } })
  res.json(webook)
})
app.get("/api/webooks", auth, async (req: any, res: any) => {
  const list = await prisma.webook.findMany({ where: { authorId: req.user.id }, orderBy: { createdAt: "desc" } })
  res.json(list)
})
app.get("/api/webooks/:slug", async (req: Request, res: Response) => {
  const webook = await prisma.webook.findUnique({ where: { slug: req.params.slug }, include: { chapters: { include: { blocks: true }, orderBy: { order: "asc" } } } })
  if (!webook) return res.status(404).json({ error: "not_found" })
  const authHeader = req.headers.authorization
  const cookieToken = (req as any).cookies?.token
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken
  let userId: string | undefined
  if (token) {
    try { userId = (jwt.verify(token, JWT_SECRET) as any).id } catch {}
  }
  let canAccess = webook.status === "PUBLIC" || webook.priceCents === 0
  if (!canAccess && userId) {
    if (userId === webook.authorId) canAccess = true
    else {
      const purchase = await prisma.purchase.findFirst({ where: { userId, webookId: webook.id, status: "SUCCEEDED" } })
      if (purchase) canAccess = true
    }
  }
  if (!canAccess) return res.status(402).json({ error: "payment_required" })
  const withParsed: any = { ...webook, theme: parseJson(webook.theme) }
  withParsed.chapters = (webook.chapters || []).map((c: any) => ({ ...c, blocks: (c.blocks || []).map((b: any) => ({ ...b, content: parseJson(b.content) })) }))
  res.json(withParsed)
})
app.put("/api/webooks/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const webook = await prisma.webook.update({ where: { id: req.params.id }, data: req.body })
  res.json(webook)
})
app.delete("/api/webooks/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  await prisma.webook.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})
const chapterSchema = z.object({ title: z.string().min(1), order: z.number().int().nonnegative() })
app.post("/api/webooks/:id/chapters", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const parsed = chapterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const chapter = await prisma.chapter.create({ data: { webookId: req.params.id, ...parsed.data } })
  res.json(chapter)
})
app.put("/api/chapters/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const chapter = await prisma.chapter.update({ where: { id: req.params.id }, data: req.body })
  res.json(chapter)
})
app.delete("/api/chapters/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  await prisma.chapter.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})
const blockSchema = z.object({ type: z.enum(["TEXT","IMAGE","VIDEO","AUDIO","EMBED","QUIZ","ACCORDION","TABS","TIMELINE","HOTSPOT","FLIP_CARD","FEEDBACK","CANVAS3D","GAME_EMBED"]), content: z.any(), order: z.number().int().nonnegative(), condition: z.string().optional() })
app.post("/api/chapters/:id/blocks", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const parsed = blockSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const block = await prisma.block.create({ data: { chapterId: req.params.id, type: parsed.data.type, order: parsed.data.order, condition: parsed.data.condition, content: JSON.stringify(parsed.data.content || {}) } })
  res.json({ ...block, content: parseJson(block.content) })
})
app.put("/api/blocks/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const toUpdate: any = {}
  if (req.body.type) toUpdate.type = req.body.type
  if (typeof req.body.content !== "undefined") toUpdate.content = JSON.stringify(req.body.content)
  if (typeof req.body.order !== "undefined") toUpdate.order = req.body.order
  if (typeof req.body.condition !== "undefined") toUpdate.condition = req.body.condition
  const block = await prisma.block.update({ where: { id: req.params.id }, data: toUpdate })
  res.json({ ...block, content: parseJson(block.content) })
})
app.delete("/api/blocks/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: any) => {
  await prisma.block.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})
const quizSchema = z.object({ title: z.string().min(1), questions: z.array(z.object({ text: z.string().min(1), answers: z.array(z.string().min(1)), correctIndex: z.number().int() })) })
app.post("/api/webooks/:id/quizzes", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
  const parsed = quizSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const quiz = await prisma.quiz.create({ data: { webookId: req.params.id, title: parsed.data.title } })
  for (const q of parsed.data.questions) {
    const question = await prisma.quizQuestion.create({ data: { quizId: quiz.id, text: q.text } })
    const answers = await Promise.all(q.answers.map(a => prisma.quizAnswer.create({ data: { questionId: question.id, text: a } })))
    const correct = answers[q.correctIndex]
    await prisma.quizQuestion.update({ where: { id: question.id }, data: { correctAnswerId: correct.id } })
  }
  const result = await prisma.quiz.findUnique({ where: { id: quiz.id }, include: { questions: { include: { answers: true } } } })
  res.json(result)
})
const answerSchema = z.object({ questionId: z.string(), answerId: z.string() })
app.post("/api/quizzes/answer", auth, async (req: any, res: Response) => {
  const parsed = answerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const q = await prisma.quizQuestion.findUnique({ where: { id: parsed.data.questionId } })
  if (!q) return res.status(404).json({ error: "not_found" })
  const ok = q.correctAnswerId === parsed.data.answerId
  await prisma.analyticsEvent.create({ data: { userId: req.user!.id, webookId: (await prisma.quiz.findUnique({ where: { id: q.quizId } }))!.webookId, type: "QUIZ_RESULT", data: JSON.stringify({ questionId: q.id, ok }) } })
  res.json({ ok })
})
const progressSchema = z.object({ webookId: z.string(), chapterId: z.string().optional(), blockId: z.string().optional(), data: z.any() })
app.post("/api/progress", auth, async (req: any, res: Response) => {
  const parsed = progressSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const p = await prisma.progress.create({ data: { userId: req.user!.id, webookId: parsed.data.webookId, chapterId: parsed.data.chapterId, blockId: parsed.data.blockId, data: JSON.stringify(parsed.data.data) } })
  res.json(p)
})
const analyticsSchema = z.object({ webookId: z.string(), type: z.enum(["READ_TIME","SCROLL","CLICK","QUIZ_RESULT"]), data: z.any() })
app.post("/api/analytics", async (req: Request, res: Response) => {
  const parsed = analyticsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const userId = req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? (jwt.verify(req.headers.authorization.slice(7), JWT_SECRET) as any).id : undefined
  const e = await prisma.analyticsEvent.create({ data: { userId, webookId: parsed.data.webookId, type: parsed.data.type, data: JSON.stringify(parsed.data.data) } })
  res.json(e)
})
app.post("/api/payments/create-checkout", auth, async (req: any, res: Response) => {
  if (!stripe) return res.status(500).json({ error: "stripe_disabled" })
  const { webookId } = req.body
  const webook = await prisma.webook.findUnique({ where: { id: webookId } })
  if (!webook) return res.status(404).json({ error: "not_found" })
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency: "usd", product_data: { name: webook.title }, unit_amount: webook.priceCents }, quantity: 1 }],
    success_url: (req.headers.origin || "") + "/payment/success",
    cancel_url: (req.headers.origin || "") + "/dashboard",
    metadata: { userId: req.user.id, webookId: webook.id }
  })
  res.json({ id: session.id, url: session.url })
})
app.post("/api/webhooks/stripe", (req: any, res: Response) => {
  if (!stripe) return res.status(500).send()
  const sig = req.headers["stripe-signature"] as string
  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err) {
    return res.status(400).send()
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const metadata = session.metadata || {}
    const amountCents = session.amount_total || 0
    const currency = session.currency || "usd"
    const paymentIntentId = session.payment_intent || undefined
    if (metadata.userId && metadata.webookId) {
      prisma.purchase.create({ data: { userId: metadata.userId, webookId: metadata.webookId, stripePaymentIntentId: paymentIntentId, amountCents, currency, status: "SUCCEEDED" } }).catch(()=>{})
    }
  }
  res.json({ received: true })
})
app.get("/api/embed/:slug", async (req: Request, res: Response) => {
  const origin = `${req.protocol}://${req.get("host")}`.replace(/\/+$/,"")
  const src = `${origin}/read/${req.params.slug}`
  const code = `<iframe src="${src}" width="100%" height="720" frameborder="0" allowfullscreen></iframe>`
  res.type("text/plain").send(code)
})
const aiSuggestSchema = z.object({ html: z.string().optional(), text: z.string().optional(), style: z.enum(["neutral","formal","concise"]).optional() })
app.post("/api/ai/suggest-text", auth, allowRoles(["ADMIN","EDITOR"]), async (req: any, res: Response) => {
  const parsed = aiSuggestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const src = parsed.data.html || parsed.data.text || ""
  const cleaned = src
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".")
    .replace(/\n{3,}/g, "\n\n")
  const style = parsed.data.style || "neutral"
  let out = cleaned
  if (style === "concise") out = out.replace(/(.{120,}?)\s+/g, "$1 ")
  if (style === "formal") out = out.replace(/\b(cześć|hej)\b/gi, "Dzień dobry")
  res.json({ html: out, notes: ["Poprawiono spacje/punkty", `Styl: ${style}`] })
})
const mailerLiteSchema = z.object({ email: z.string().email(), listId: z.string().optional() })
app.post("/api/integrations/mailerlite/subscribe", async (req: Request, res: Response) => {
  const parsed = mailerLiteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid" })
  const endpoint = process.env.MAILERLITE_ENDPOINT
  if (!endpoint) return res.status(501).json({ error: "not_configured" })
  try {
    const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) })
    const j = await r.json().catch(()=>({ ok: true }))
    res.json(j)
  } catch {
    res.status(500).json({ error: "upstream_failed" })
  }
})
app.post("/api/integrations/zapier/hook", async (req: Request, res: Response) => {
  const url = process.env.ZAPIER_HOOK_URL
  if (!url) return res.status(501).json({ error: "not_configured" })
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body || {}) })
    const j = await r.json().catch(()=>({ ok: true }))
    res.json(j)
  } catch {
    res.status(500).json({ error: "upstream_failed" })
  }
})
app.get("/api/export/html/:slug", async (req: Request, res: Response) => {
  const webook = await prisma.webook.findUnique({ where: { slug: req.params.slug }, include: { chapters: { include: { blocks: true }, orderBy: { order: "asc" } } } })
  if (!webook) return res.status(404).json({ error: "not_found" })
  const html = `<html><head><meta charset="utf-8"><title>${webook.title}</title></head><body>${webook.chapters.map(c=>`<section><h2>${c.title}</h2>${c.blocks.map(b=>renderBlock({ ...b, content: parseJson(b.content) })).join("")}</section>`).join("")}</body></html>`
  res.type("text/html").send(html)
})
app.get("/api/export/epub/:slug", async (req: Request, res: Response) => {
  const webook = await prisma.webook.findUnique({ where: { slug: req.params.slug }, include: { chapters: { include: { blocks: true }, orderBy: { order: "asc" } } } })
  if (!webook) return res.status(404).json({ error: "not_found" })
  const zip = archiver("zip", { zlib: { level: 9 } })
  res.setHeader("Content-Type", "application/epub+zip")
  res.setHeader("Content-Disposition", `attachment; filename="${webook.slug}.epub"`)
  zip.pipe(res)
  zip.append("application/epub+zip", { name: "mimetype", store: true })
  zip.append(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`, { name: "META-INF/container.xml" })
  const items = []
  const manifestItems: string[] = []
  const spineItems: string[] = []
  for (let i=0;i<(webook.chapters||[]).length;i++) {
    const c = webook.chapters[i]
    const id = `chap${i+1}`
    const body = c.blocks.map(b=>renderXhtmlBlock({ ...b, content: parseJson(b.content) })).join("")
    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>${escapeXml(c.title)}</title><meta charset="utf-8"/></head>
  <body><h2>${escapeXml(c.title)}</h2>${body}</body>
</html>`
    zip.append(xhtml, { name: `OEBPS/${id}.xhtml` })
    manifestItems.push(`<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`)
    spineItems.push(`<itemref idref="${id}"/>`)
    items.push({ id, title: c.title })
  }
  const nav = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head><title>Spis treści</title><meta charset="utf-8"/></head>
  <body>
    <nav epub:type="toc">
      <h1>Spis treści</h1>
      <ol>
        ${items.map(i=>`<li><a href="${i.id}.xhtml">${escapeXml(i.title)}</a></li>`).join("")}
      </ol>
    </nav>
  </body>
</html>`
  zip.append(nav, { name: "OEBPS/nav.xhtml" })
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${webook.slug}</dc:identifier>
    <dc:title>${escapeXml(webook.title)}</dc:title>
    <dc:language>pl</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifestItems.join("\n    ")}
  </manifest>
  <spine>
    ${spineItems.join("\n    ")}
  </spine>
</package>`
  zip.append(opf, { name: "OEBPS/content.opf" })
  zip.finalize()
})
function renderBlock(b: any) {
  if (b.type === "TEXT") return `<div>${(b.content||{}).text ?? ""}</div>`
  if (b.type === "IMAGE") return `<img src="${(b.content||{}).url ?? ""}" alt="${(b.content||{}).alt ?? ""}"/>`
  if (b.type === "VIDEO") return `<video controls src="${(b.content||{}).url ?? ""}"></video>`
  if (b.type === "AUDIO") return `<audio controls src="${(b.content||{}).url ?? ""}"></audio>`
  if (b.type === "EMBED") return `<iframe src="${(b.content||{}).url ?? ""}"></iframe>`
  if (b.type === "ACCORDION") return `<div>${((b.content||{}).items||[]).map((i:any)=>`<details><summary>${i.title}</summary><div>${i.content}</div></details>`).join("")}</div>`
  if (b.type === "TABS") return `<div>${((b.content||{}).items||[]).map((i:any)=>`<div><h3>${i.title}</h3><div>${i.content}</div></div>`).join("")}</div>`
  if (b.type === "TIMELINE") return `<ul>${((b.content||{}).items||[]).map((i:any)=>`<li>${i.time} ${i.text}</li>`).join("")}</ul>`
  if (b.type === "QUIZ") return `<div>Quiz</div>`
  if (b.type === "HOTSPOT") return `<div>${((b.content||{}).hotspots||[]).map((h:any)=>`<span>${h.label}</span>`).join("")}</div>`
  if (b.type === "FLIP_CARD") return `<div><div>${(b.content||{}).frontTitle||""}</div><div>${(b.content||{}).backTitle||""}</div></div>`
  if (b.type === "FEEDBACK") return `<form><textarea></textarea></form>`
  if (b.type === "CANVAS3D") return `<div>3D</div>`
  if (b.type === "GAME_EMBED") return `<iframe src="${(b.content||{}).url ?? ""}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`
  return `<div></div>`
}
function renderXhtmlBlock(b: any) {
  const c = b.content || {}
  if (b.type === "TEXT") return c.html || `<p>${escapeXml(c.text || "")}</p>`
  if (b.type === "IMAGE") return `<img src="${escapeXml(c.url || "")}" alt="${escapeXml(c.alt || "")}"/>`
  if (b.type === "VIDEO") return `<div>Video: ${escapeXml(c.url || "")}</div>`
  if (b.type === "AUDIO") return `<div>Audio: ${escapeXml(c.url || "")}</div>`
  if (b.type === "EMBED") return `<div>Embed: ${escapeXml(c.url || "")}</div>`
  if (b.type === "ACCORDION") return (c.items||[]).map((i:any)=>`<details><summary>${escapeXml(i.title||"")}</summary><div>${escapeXml(i.content||"")}</div></details>`).join("")
  if (b.type === "TABS") return (c.items||[]).map((i:any)=>`<div><h3>${escapeXml(i.title||"")}</h3><div>${escapeXml(i.content||"")}</div></div>`).join("")
  if (b.type === "TIMELINE") return `<ul>${(c.items||[]).map((i:any)=>`<li>${escapeXml(i.time||"")} ${escapeXml(i.text||"")}</li>`).join("")}</ul>`
  if (b.type === "QUIZ") return `<div>Quiz</div>`
  return `<div></div>`
}
function escapeXml(s: string) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")
}
function parseJson(s: any) {
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return {} }
}
const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {})
