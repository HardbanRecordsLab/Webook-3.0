import { Router } from "express"
import type { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { z } from "zod"
import type { Request, Response, NextFunction } from "express"
import { parseJson } from "../utils/parse"

type UserToken = { id: string, role: string }
interface AuthRequest extends Request { user?: UserToken }

export function createWebooksRouter(prisma: PrismaClient, auth: (req: any, res: Response, next: NextFunction) => void, allowRoles: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void, JWT_SECRET: string) {
  const router = Router()
  const webookSchema = z.object({ title: z.string().min(1), slug: z.string().min(1), theme: z.any(), priceCents: z.number().int().nonnegative() })
  router.post("/", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: any) => {
    const parsed = webookSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "invalid" })
    const data = parsed.data
    const webook = await prisma.webook.create({ data: { ...data, theme: JSON.stringify(data.theme), authorId: req.user.id } })
    res.json(webook)
  })
  router.get("/", auth, async (req: any, res: any) => {
    const list = await prisma.webook.findMany({ where: { authorId: req.user.id }, orderBy: { createdAt: "desc" } })
    res.json(list)
  })
  router.get("/:slug", async (req: Request, res: Response) => {
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
  router.put("/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
    const webook = await prisma.webook.update({ where: { id: req.params.id }, data: req.body })
    res.json(webook)
  })
  router.delete("/:id", auth, allowRoles(["ADMIN", "EDITOR"]), async (req: any, res: Response) => {
    await prisma.webook.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  })
  return router
}
