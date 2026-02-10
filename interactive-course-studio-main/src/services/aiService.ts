import { createId, WorksheetQuestion, QuizQuestion, QuizOption } from '@/types/webbook';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`;

interface StreamOptions {
  onDelta: (text: string) => void;
  onDone: () => void;
}

export async function streamAI(
  body: Record<string, unknown>,
  { onDelta, onDone }: StreamOptions
): Promise<string> {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Błąd AI' }));
    throw new Error(err.error || `Błąd ${resp.status}`);
  }

  if (!resp.body) throw new Error('Brak streama');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onDelta(content);
        }
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  onDone();
  return fullText;
}

export async function generateLessonContent(topic: string, lessonTitle?: string, context?: string): Promise<string> {
  let result = '';
  await streamAI(
    { type: 'lesson-content', topic, lessonTitle, context },
    { onDelta: (t) => { result += ''; }, onDone: () => {} }
  );
  // For non-streaming, collect all
  return result || await fetchAISync({ type: 'lesson-content', topic, lessonTitle, context });
}

async function fetchAISync(body: Record<string, unknown>): Promise<string> {
  let full = '';
  await streamAI(body, { onDelta: (t) => { full += t; }, onDone: () => {} });
  return full;
}

export async function generateWorksheet(topic: string, context?: string) {
  const raw = await fetchAISync({ type: 'worksheet', topic, context });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const data = JSON.parse(jsonMatch[0]);
    return {
      title: data.title || 'Karta Pracy',
      questions: (data.questions || []).map((q: any) => ({
        id: createId(),
        question: q.question,
        type: q.type || 'textarea',
      })) as WorksheetQuestion[],
    };
  } catch {
    throw new Error('Nie udało się sparsować odpowiedzi AI');
  }
}

export async function generateQuiz(topic: string, context?: string) {
  const raw = await fetchAISync({ type: 'quiz', topic, context });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const data = JSON.parse(jsonMatch[0]);
    return {
      title: data.title || 'Quiz',
      questions: (data.questions || []).map((q: any) => ({
        id: createId(),
        question: q.question,
        options: (q.options || []).map((o: any) => ({
          id: createId(),
          text: o.text,
          isCorrect: !!o.isCorrect,
        })) as QuizOption[],
      })) as QuizQuestion[],
    };
  } catch {
    throw new Error('Nie udało się sparsować odpowiedzi AI');
  }
}

export async function generateModuleOutline(topic: string, context?: string) {
  const raw = await fetchAISync({ type: 'module-outline', topic, context });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Nie udało się sparsować odpowiedzi AI');
  }
}

export async function generateIntroPages(topic: string, context?: string) {
  const raw = await fetchAISync({ type: 'intro-pages', topic, context });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Nie udało się sparsować odpowiedzi AI');
  }
}
