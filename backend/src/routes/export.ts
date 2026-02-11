import { Router } from "express"
import type { PrismaClient } from "@prisma/client"
import archiver from "archiver"

function escapeXml(s: string) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")
}
function parseJson(s: any) {
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return {} }
}
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

export function createExportRouter(prisma: PrismaClient) {
  const router = Router()
  router.get("/html/:slug", async (req, res) => {
    const webook = await prisma.webook.findUnique({ where: { slug: req.params.slug }, include: { chapters: { include: { blocks: true }, orderBy: { order: "asc" } } } })
    if (!webook) return res.status(404).json({ error: "not_found" })
    const html = `<html><head><meta charset="utf-8"><title>${webook.title}</title></head><body>${webook.chapters.map((c: any)=>`<section><h2>${c.title}</h2>${c.blocks.map((b: any)=>renderBlock({ ...b, content: parseJson(b.content) })).join("")}</section>`).join("")}</body></html>`
    res.type("text/html").send(html)
  })
  router.get("/epub/:slug", async (req, res) => {
    const webook = await prisma.webook.findUnique({ where: { slug: req.params.slug }, include: { chapters: { include: { blocks: true }, orderBy: { order: "asc" } } } })
    if (!webook) return res.status(404).json({ error: "not_found" })
    const zip = archiver("zip", { zlib: { level: 9 } })
    res.setHeader("Content-Type", "application/epub+zip")
    res.setHeader("Content-Disposition", `attachment; filename=\"${webook.slug}.epub\"`)
    zip.pipe(res)
    zip.append("application/epub+zip", { name: "mimetype", store: true })
    zip.append(`<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">
  <rootfiles>
    <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>
  </rootfiles>
</container>`, { name: "META-INF/container.xml" })
    const items: Array<{id:string,title:string}> = []
    const manifestItems: string[] = []
    const spineItems: string[] = []
    for (let i=0;i<(webook.chapters||[]).length;i++) {
      const c = webook.chapters[i]
      const id = `chap${i+1}`
      const body = c.blocks.map((b: any)=>renderXhtmlBlock({ ...b, content: parseJson(b.content) })).join("")
      const xhtml = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
<!DOCTYPE html>
<html xmlns=\"http://www.w3.org/1999/xhtml\">
  <head><title>${escapeXml(c.title)}</title><meta charset=\"utf-8\"/></head>
  <body><h2>${escapeXml(c.title)}</h2>${body}</body>
</html>`
      zip.append(xhtml, { name: `OEBPS/${id}.xhtml` })
      manifestItems.push(`<item id=\"${id}\" href=\"${id}.xhtml\" media-type=\"application/xhtml+xml\"/>`)
      spineItems.push(`<itemref idref=\"${id}\"/>`)
      items.push({ id, title: c.title })
    }
    const nav = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
<!DOCTYPE html>
<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\">
  <head><title>Spis treści</title><meta charset=\"utf-8\"/></head>
  <body>
    <nav epub:type=\"toc\">
      <h1>Spis treści</h1>
      <ol>
        ${items.map(i=>`<li><a href=\"${i.id}.xhtml\">${escapeXml(i.title)}</a></li>`).join("")}
      </ol>
    </nav>
  </body>
</html>`
    zip.append(nav, { name: "OEBPS/nav.xhtml" })
    const opf = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
<package version=\"3.0\" xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"bookid\">
  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">
    <dc:identifier id=\"bookid\">${webook.slug}</dc:identifier>
    <dc:title>${escapeXml(webook.title)}</dc:title>
    <dc:language>pl</dc:language>
  </metadata>
  <manifest>
    <item id=\"nav\" href=\"nav.xhtml\" media-type=\"application/xhtml+xml\" properties=\"nav\"/>
    ${manifestItems.join("\n    ")}
  </manifest>
  <spine>
    ${spineItems.join("\n    ")}
  </spine>
</package>`
    zip.append(opf, { name: "OEBPS/content.opf" })
    zip.finalize()
  })
  return router
}
