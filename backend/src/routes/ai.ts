import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── /api/ai/generate-content ──────────────────────────────
const ContentSchema = z.object({
  type: z.enum(['text', 'heading', 'callout', 'quiz', 'checklist']),
  prompt: z.string().min(3).max(1000),
  context: z.string().optional(),
})

const CONTENT_SYSTEM: Record<string, string> = {
  text: 'Jesteś ekspertem od pisania angażujących treści edukacyjnych po polsku. Pisz w stylu profesjonalnym ale przystępnym. Zwróć tylko treść bloku, bez żadnych dodatkowych komentarzy.',
  heading: 'Jesteś copywriterem. Twórz zwięzłe, angażujące nagłówki po polsku. Zwróć tylko sam nagłówek, jeden wiersz.',
  callout: 'Tworzysz wyróżnione porady i wskazówki po polsku. Zacznij od emoji. Zwróć tylko treść callout, max 2 zdania.',
  quiz: `Generujesz pytania quizowe po polsku. Zwróć JSON w formacie:
{"question":"...","options":[{"text":"...","isCorrect":true},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false}]}
Dokładnie 4 opcje, jedna poprawna.`,
  checklist: 'Generujesz checlistę po polsku. Zwróć JSON: {"items":["pozycja 1","pozycja 2",...]} — 5-8 pozycji.',
}

router.post('/generate-content', async (req, res) => {
  try {
    const body = ContentSchema.parse(req.body)
    const systemPrompt = CONTENT_SYSTEM[body.type] || CONTENT_SYSTEM.text
    const userPrompt = body.context
      ? `Kontekst Webooka: ${body.context}\n\nZadanie: ${body.prompt}`
      : body.prompt

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    let result: unknown = text

    if (body.type === 'quiz' || body.type === 'checklist') {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) result = JSON.parse(jsonMatch[0])
      } catch {
        result = text
      }
    }

    res.json({ result, type: body.type })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    console.error('generate-content error:', err)
    res.status(500).json({ error: 'Błąd generowania treści' })
  }
})

// ── /api/ai/generate-interactive ─────────────────────────
const InteractiveSchema = z.object({
  prompt: z.string().min(3).max(2000),
  context: z.string().optional(),
})

const INTERACTIVE_SYSTEM = `Jesteś ekspertem od tworzenia interaktywnych narzędzi HTML dla Webooków edukacyjnych.

Generuj KOMPLETNY, DZIAŁAJĄCY plik HTML z:
- Ciemnym motywem: body background #060E1C, tekst #F0F4FF
- Kolory akcentów: niebieski #1E6FDB, złoty #F59E0B
- Fontem: DM Sans z Google Fonts lub system-ui
- Pełnym CSS w tagu <style>
- Pełnym JS w tagu <script>
- Responsywnym layoutem (max-width: 100%, padding: 20px)
- Przyjaznym UI — zaokrąglone przyciski, dobre odstępy
- Polskim interfejsem użytkownika

WAŻNE:
- Zwróć TYLKO kod HTML, bez żadnego komentarza
- Nie używaj zewnętrznych bibliotek (tylko vanilla JS)
- Kod musi działać w iframe sandbox="allow-scripts"
- Minimalny rozmiar widgetu: 280px wysokości`

router.post('/generate-interactive', async (req, res) => {
  try {
    const body = InteractiveSchema.parse(req.body)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: INTERACTIVE_SYSTEM,
      messages: [{
        role: 'user',
        content: body.context
          ? `Kontekst Webooka: ${body.context}\n\nStwórz narzędzie: ${body.prompt}`
          : `Stwórz narzędzie: ${body.prompt}`
      }],
    })

    let html = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code blocks if present
    html = html.replace(/^```html?\n?/m, '').replace(/\n?```$/m, '').trim()

    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`
    }

    res.json({ html })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    console.error('generate-interactive error:', err)
    res.status(500).json({ error: 'Błąd generowania narzędzia' })
  }
})

// ── /api/ai/translate ─────────────────────────────────────
const TranslateSchema = z.object({
  blocks: z.array(z.object({ id: z.string(), type: z.string(), content: z.string() })),
  targetLanguage: z.enum(['en', 'de', 'fr', 'es', 'uk']),
})

const LANG_NAMES: Record<string, string> = { en:'angielski', de:'niemiecki', fr:'francuski', es:'hiszpański', uk:'ukraiński' }

router.post('/translate', async (req, res) => {
  try {
    const { blocks, targetLanguage } = TranslateSchema.parse(req.body)
    const textBlocks = blocks.filter(b => ['text','heading','callout'].includes(b.type) && b.content.trim())

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4000,
      system: `Jesteś tłumaczem. Tłumacz treści Webooków edukacyjnych na ${LANG_NAMES[targetLanguage]}. Zachowaj formatowanie i emoji. Zwróć JSON: [{"id":"...","content":"..."}]`,
      messages: [{
        role: 'user',
        content: `Przetłumacz te bloki:\n${JSON.stringify(textBlocks.map(b => ({ id: b.id, content: b.content })))}`
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const translated = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    res.json({ translated })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    console.error('translate error:', err)
    res.status(500).json({ error: 'Błąd tłumaczenia' })
  }
})

// ── /api/ai/proofread ─────────────────────────────────────
const ProofreadSchema = z.object({
  content: z.string().min(10).max(5000),
})

router.post('/proofread', async (req, res) => {
  try {
    const { content } = ProofreadSchema.parse(req.body)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      system: 'Jesteś korektorem polskich tekstów edukacyjnych. Popraw błędy językowe, stylistyczne i interpunkcyjne. Zwróć JSON: {"corrected":"...","changes":[{"original":"...","fixed":"...","reason":"..."}]}',
      messages: [{ role: 'user', content: `Popraw tekst:\n\n${content}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { corrected: content, changes: [] }

    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors })
    console.error('proofread error:', err)
    res.status(500).json({ error: 'Błąd korekty' })
  }
})

export default router
