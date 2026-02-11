import { Router, Request, Response } from "express"
import { z } from "zod"

export function createAiRouter() {
  const router = Router()

  const generateSchema = z.object({
    type: z.string(),
    topic: z.string().optional(),
    lessonTitle: z.string().optional(),
    context: z.string().optional()
  })

  router.post("/generate", async (req: Request, res: Response) => {
    const parsed = generateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" })

    const { type, topic, lessonTitle, context } = parsed.data
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.LOVABLE_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured" })
    }

    let systemPrompt = ""
    let userPrompt = ""

    switch (type) {
      case "lesson-content":
        systemPrompt = `Jesteś ekspertem w tworzeniu treści edukacyjnych w języku polskim. Tworzysz treści do interaktywnych kursów online (webbook). Pisz w sposób przystępny, angażujący i profesjonalny. Używaj akapitów, list i podtytułów. Nie używaj markdown - pisz czysty tekst z nowymi liniami.`
        userPrompt = `Napisz treść lekcji na temat: "${topic}"${lessonTitle ? ` (tytuł lekcji: "${lessonTitle}")` : ''}${context ? `\nKontekst kursu: ${context}` : ''}. Napisz 3-5 akapitów z kluczowymi informacjami.`
        break

      case "worksheet":
        systemPrompt = `Jesteś ekspertem w tworzeniu kart pracy edukacyjnych w języku polskim. Tworzysz pytania refleksyjne i praktyczne ćwiczenia.`
        userPrompt = `Stwórz 3-5 pytań do karty pracy na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Odpowiedz w formacie JSON: {"title": "Karta Pracy", "questions": [{"question": "tekst pytania", "type": "textarea"}]}. Tylko JSON, bez dodatkowego tekstu.`
        break

      case "quiz":
        systemPrompt = `Jesteś ekspertem w tworzeniu quizów edukacyjnych w języku polskim. Tworzysz pytania testowe z odpowiedziami.`
        userPrompt = `Stwórz 3 pytania quizowe na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Odpowiedz w formacie JSON: {"title": "Quiz", "questions": [{"question": "tekst pytania", "options": [{"text": "odpowiedź A", "isCorrect": true}, {"text": "odpowiedź B", "isCorrect": false}, {"text": "odpowiedź C", "isCorrect": false}]}]}. Tylko JSON, bez dodatkowego tekstu.`
        break

      case "module-outline":
        systemPrompt = `Jesteś ekspertem w projektowaniu kursów online w języku polskim. Tworzysz struktury modułów i lekcji.`
        userPrompt = `Stwórz outline modułu kursu na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Zaproponuj 3-5 lekcji. Odpowiedz w formacie JSON: {"title": "Tytuł modułu", "description": "opis", "lessons": [{"title": "Tytuł lekcji", "subtitle": "podtytuł"}]}. Tylko JSON, bez dodatkowego tekstu.`
        break

      case "intro-pages":
        systemPrompt = `Jesteś ekspertem w tworzeniu profesjonalnych treści do kursów online w języku polskim.`
        userPrompt = `Wygeneruj treści stron wstępnych dla kursu: "${topic}"${context ? `\nDodatkowy kontekst: ${context}` : ''}. Odpowiedz w formacie JSON:
{
  "aboutAuthor": "Tekst o autorze (2-3 akapity)",
  "copyright": "Tekst praw autorskich",
  "disclaimer": "Tekst disclaimera / zastrzeżeń prawnych",
  "forWhom": "Dla kogo jest ten kurs (lista kryteriów)",
  "howToUse": "Jak korzystać z webbooka (instrukcja)"
}
Tylko JSON, bez dodatkowego tekstu.`
        break

      default:
        return res.status(400).json({ error: `Unknown generation type: ${type}` })
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    try {
      // Use Gemini API directly if available, or OpenAI compatible
      const apiUrl = process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-1.5-flash", // Default to Gemini Flash, user can override via env if needed
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          stream: true
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("AI API Error:", errorText)
        res.write(`data: ${JSON.stringify({ error: "AI API Error" })}\n\n`)
        res.end()
        return
      }

      if (!response.body) {
        res.end()
        return
      }

      // Stream the response
      // @ts-ignore
      for await (const chunk of response.body) {
        const text = new TextDecoder().decode(chunk)
        res.write(text)
      }
      res.end()

    } catch (error) {
      console.error("AI Generation Error:", error)
      res.write(`data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`)
      res.end()
    }
  })

  return router
}
