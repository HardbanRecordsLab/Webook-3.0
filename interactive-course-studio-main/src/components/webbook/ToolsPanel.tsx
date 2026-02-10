import { X, Download, BarChart3, Eye, Sparkles } from 'lucide-react'
import { Webbook, Lesson } from '@/types/webbook'

interface ToolsPanelProps {
  webbook: Webbook
  currentLesson?: Lesson | null
  onClose: () => void
}

function wordsCount(text: string) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length
}

function readingTimeMinutes(text: string) {
  const wpm = 200
  const words = wordsCount(text)
  return Math.max(1, Math.round(words / wpm))
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

function relativeLuminance({ r, g, b }: { r: number, g: number, b: number }) {
  const srgb = [r, g, b].map(v => v / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = relativeLuminance(hexToRgb(hex1))
  const l2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function scoreContrast(ratio: number) {
  if (ratio >= 7) return { label: "AAA", color: "text-green-600" }
  if (ratio >= 4.5) return { label: "AA", color: "text-emerald-500" }
  if (ratio >= 3) return { label: "AA Large", color: "text-yellow-500" }
  return { label: "Niski", color: "text-red-500" }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ToolsPanel({ webbook, currentLesson, onClose }: ToolsPanelProps) {
  const titleLen = (webbook.metadata.title || "").length
  const descLen = (webbook.metadata.description || "").length
  const hasAuthor = !!webbook.metadata.author
  const lessonText = currentLesson?.content?.text || ""
  const wc = wordsCount(lessonText)
  const rt = readingTimeMinutes(lessonText)
  const primary = webbook.branding.primaryColor || "#0ea5e9"
  const background = "#ffffff"
  const ratio = contrastRatio(primary, background)
  const cr = scoreContrast(ratio)
  const emptyLessons = webbook.modules.flatMap(m => m.lessons).filter(l => !l.content?.text || l.content.text.trim().length === 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-serif font-bold text-foreground">Narzędzia</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Analiza SEO metadanych</h3>
            </div>
            <ul className="text-sm space-y-2">
              <li>Tytuł: {titleLen} znaków {titleLen >= 10 && titleLen <= 65 ? "✓" : "–"}</li>
              <li>Opis: {descLen} znaków {descLen >= 50 && descLen <= 160 ? "✓" : "–"}</li>
              <li>Autor: {hasAuthor ? "✓" : "–"}</li>
              <li>Puste lekcje: {emptyLessons.length}</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Czytelność lekcji</h3>
            </div>
            <div className="text-sm space-y-2">
              <div>Słowa: {wc}</div>
              <div>Szacowany czas czytania: {rt} min</div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Kontrast kolorów</h3>
            </div>
            <div className="text-sm space-y-2">
              <div>Primary: <span className="font-mono">{primary}</span></div>
              <div>Kontrast do tła: {ratio.toFixed(2)} <span className={`${cr.color} font-medium`}>({cr.label})</span></div>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded" style={{ backgroundColor: primary, color: background }}>Tekst</span>
                <span className="px-3 py-1 rounded border" style={{ backgroundColor: background, color: primary }}>Tekst</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Eksport danych</h3>
            </div>
            <div className="text-sm space-y-2">
              <button onClick={() => downloadJson("webbook.json", webbook)} className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                Pobierz webbook.json
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}
