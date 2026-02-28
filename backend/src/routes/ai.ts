import { Router } from 'express'
import { z } from 'zod'

const router = Router()
const AI_PROVIDER = (process.env.AI_PROVIDER || 'groq').toLowerCase()
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

async function callGroq(system: string, user: string, maxTokens: number) {
  if (!GROQ_API_KEY) throw new Error('Missing GROQ_API_KEY')
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  })
  if (!r.ok) throw new Error(`GROQ ${r.status}`)
  const data: any = await r.json()
  return data?.choices?.[0]?.message?.content || ''
}

async function callGemini(system: string, user: string, maxTokens: number) {
  if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${system}\n\n${user}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.4,
      },
    }),
  })
  if (!r.ok) throw new Error(`GEMINI ${r.status}`)
  const data: any = await r.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return text
}

async function callAIDispatch(system: string, user: string, maxTokens: number) {
  if (AI_PROVIDER === 'gemini') return callGemini(system, user, maxTokens)
  return callGroq(system, user, maxTokens)
}

router.get('/debug', (req, res) => {
  res.json({
    provider: AI_PROVIDER,
    groq: {
      model: GROQ_MODEL,
      hasKey: !!GROQ_API_KEY
    },
    gemini: {
      model: GEMINI_MODEL,
      hasKey: !!GEMINI_API_KEY
    }
  })
})

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

    const text = await callAIDispatch(systemPrompt, userPrompt, 800)
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

    const user = body.context
      ? `Kontekst Webooka: ${body.context}\n\nStwórz narzędzie: ${body.prompt}`
      : `Stwórz narzędzie: ${body.prompt}`
    let html = await callAIDispatch(INTERACTIVE_SYSTEM, user, 4000)

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

    const text = await callAIDispatch(
      `Jesteś tłumaczem. Tłumacz treści Webooków edukacyjnych na ${LANG_NAMES[targetLanguage]}. Zachowaj formatowanie i emoji. Zwróć JSON: [{\"id\":\"...\",\"content\":\"...\"}]`,
      `Przetłumacz te bloki:\n${JSON.stringify(textBlocks.map(b => ({ id: b.id, content: b.content })))}`,
      4000
    )
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

    const text = await callAIDispatch(
      'Jesteś korektorem polskich tekstów edukacyjnych. Popraw błędy językowe, stylistyczne i interpunkcyjne. Zwróć JSON: {\"corrected\":\"...\",\"changes\":[{\"original\":\"...\",\"fixed\":\"...\",\"reason\":\"...\"}]}',
      `Popraw tekst:\n\n${content}`,
      2000
    )
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
