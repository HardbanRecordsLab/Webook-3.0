import { Router } from "express"
import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

export function createAuthRouter(prisma: PrismaClient, signToken: (payload: any) => string) {
  const router = Router()
  const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) })
  router.post("/register", async (req, res) => {
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
  router.post("/login", async (req, res) => {
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
  return router
}
