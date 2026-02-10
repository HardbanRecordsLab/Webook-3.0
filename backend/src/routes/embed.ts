import { Router } from "express"

export function createEmbedRouter() {
  const router = Router()
  router.get("/:slug", async (req, res) => {
    const origin = `${req.protocol}://${req.get("host")}`.replace(/\/+$/,"")
    const src = `${origin}/read/${req.params.slug}`
    const code = `<iframe src="${src}" width="100%" height="720" frameborder="0" allowfullscreen></iframe>`
    res.type("text/plain").send(code)
  })
  return router
}
