import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, topic, lessonTitle, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "lesson-content":
        systemPrompt = `Jesteś ekspertem w tworzeniu treści edukacyjnych w języku polskim. Tworzysz treści do interaktywnych kursów online (webbook). Pisz w sposób przystępny, angażujący i profesjonalny. Używaj akapitów, list i podtytułów. Nie używaj markdown - pisz czysty tekst z nowymi liniami.`;
        userPrompt = `Napisz treść lekcji na temat: "${topic}"${lessonTitle ? ` (tytuł lekcji: "${lessonTitle}")` : ''}${context ? `\nKontekst kursu: ${context}` : ''}. Napisz 3-5 akapitów z kluczowymi informacjami.`;
        break;

      case "worksheet":
        systemPrompt = `Jesteś ekspertem w tworzeniu kart pracy edukacyjnych w języku polskim. Tworzysz pytania refleksyjne i praktyczne ćwiczenia.`;
        userPrompt = `Stwórz 3-5 pytań do karty pracy na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Odpowiedz w formacie JSON: {"title": "Karta Pracy", "questions": [{"question": "tekst pytania", "type": "textarea"}]}. Tylko JSON, bez dodatkowego tekstu.`;
        break;

      case "quiz":
        systemPrompt = `Jesteś ekspertem w tworzeniu quizów edukacyjnych w języku polskim. Tworzysz pytania testowe z odpowiedziami.`;
        userPrompt = `Stwórz 3 pytania quizowe na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Odpowiedz w formacie JSON: {"title": "Quiz", "questions": [{"question": "tekst pytania", "options": [{"text": "odpowiedź A", "isCorrect": true}, {"text": "odpowiedź B", "isCorrect": false}, {"text": "odpowiedź C", "isCorrect": false}]}]}. Tylko JSON, bez dodatkowego tekstu.`;
        break;

      case "module-outline":
        systemPrompt = `Jesteś ekspertem w projektowaniu kursów online w języku polskim. Tworzysz struktury modułów i lekcji.`;
        userPrompt = `Stwórz outline modułu kursu na temat: "${topic}"${context ? `\nKontekst: ${context}` : ''}. Zaproponuj 3-5 lekcji. Odpowiedz w formacie JSON: {"title": "Tytuł modułu", "description": "opis", "lessons": [{"title": "Tytuł lekcji", "subtitle": "podtytuł"}]}. Tylko JSON, bez dodatkowego tekstu.`;
        break;

      case "intro-pages":
        systemPrompt = `Jesteś ekspertem w tworzeniu profesjonalnych treści do kursów online w języku polskim.`;
        userPrompt = `Wygeneruj treści stron wstępnych dla kursu: "${topic}"${context ? `\nDodatkowy kontekst: ${context}` : ''}. Odpowiedz w formacie JSON:
{
  "aboutAuthor": "Tekst o autorze (2-3 akapity)",
  "copyright": "Tekst praw autorskich",
  "disclaimer": "Tekst disclaimera / zastrzeżeń prawnych",
  "forWhom": "Dla kogo jest ten kurs (lista kryteriów)",
  "howToUse": "Jak korzystać z webbooka (instrukcja)"
}
Tylko JSON, bez dodatkowego tekstu.`;
        break;

      default:
        throw new Error(`Unknown generation type: ${type}`);
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Brak środków na AI. Doładuj kredyty w ustawieniach." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Błąd bramy AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
