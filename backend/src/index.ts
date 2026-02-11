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
import { z } from "zod"
import { createExportRouter } from "./routes/export"
import { createEmbedRouter } from "./routes/embed"
import { createAiRouter } from "./routes/ai"
import { createAuthRouter } from "./routes/auth"
import { createWebooksRouter } from "./routes/webooks"
import { parseJson } from "./utils/parse"
import multer from "multer"
import fs from "fs"
import path from "path"

const app = express()

// Upload configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads"
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

app.use("/uploads", express.static(UPLOAD_DIR))

app.use(express.json({ limit: "2mb", verify: (req: any, res: any, buf: Buffer) => { req.rawBody = buf } }))
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s=>s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error("CORS blocked"), false)
  },
  credentials: true
}))
app.use(helmet())
app.use(cookieParser())
const prisma = new PrismaClient()
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev")
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in production environment")
}
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
app.use("/api/auth", createAuthRouter(prisma, signToken))
app.use("/api/ai", auth, createAiRouter())
app.post("/api/upload", auth, upload.single('file'), (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ 
    url: url,
    name: req.file.originalname,
    id: req.file.filename
  })
})
app.use("/api/webooks", createWebooksRouter(prisma, auth, allowRoles, JWT_SECRET))
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
app.use("/api/embed", createEmbedRouter())
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
app.use("/api/export", createExportRouter(prisma))
const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {})
