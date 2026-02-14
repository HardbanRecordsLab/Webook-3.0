import axios from 'axios';
import { createId, WorksheetQuestion, QuizQuestion, QuizOption } from '@/types/webbook';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

interface StreamOptions {
  onDelta: (text: string) => void;
  onDone: () => void;
}

// ==================== LEGACY / STREAMING ====================

export async function streamAI(
  body: Record<string, unknown>,
  { onDelta, onDone }: StreamOptions
): Promise<string> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Fallback to generate-content if type is lesson-content
  const endpoint = body.type === 'lesson-content' ? '/api/ai/generate-content' : '/api/ai/generate';
  
  // Adapt body for generate-content
  const payload = body.type === 'lesson-content' 
    ? { title: body.lessonTitle, context: body.topic } 
    : body;

  try {
    // Try axios first for non-streaming endpoints
    if (endpoint === '/api/ai/generate-content') {
       const resp = await axios.post(`${API_URL}${endpoint}`, payload);
       const text = resp.data.content || '';
       onDelta(text);
       onDone();
       return text;
    }

    const resp = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Błąd AI' }));
      throw new Error(err.error || `Błąd ${resp.status}`);
    }

    if (!resp.body) throw new Error('Brak streama');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Simple accumulation for now as real streaming might not be implemented on backend yet
      fullText += chunk;
      onDelta(chunk);
    }

    onDone();
    return fullText;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// ==================== NEW AI METHODS ====================

export interface AudioResponse {
  status: 'success' | 'error';
  file?: string;
  duration_estimate?: number;
  provider?: string;
  message?: string;
}

export interface ImageResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

// QUIZ
export async function generateQuiz(content: string): Promise<any> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-quiz`, {
      content,
      max_tokens: 1000
    });
    
    // Adapt response to expected format
    if (response.data.success && response.data.questions) {
        return {
            title: 'Quiz',
            questions: response.data.questions.map((q: any) => ({
                id: createId(),
                question: q.question,
                options: (q.options || []).map((o: string, idx: number) => ({
                    id: createId(),
                    text: o,
                    isCorrect: idx === q.correct_answer
                }))
            }))
        };
    }
    throw new Error(response.data.error || 'Failed to generate quiz');
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw error;
  }
}

// AUDIO
export async function generateAudio(text: string, lessonId: string): Promise<AudioResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-audio`, {
      text,
      voice: 'pl_PL-ewa-medium',
      lesson_id: lessonId,
      language: 'pl'
    });
    return response.data;
  } catch (error) {
    console.error('Audio generation failed:', error);
    return {
      status: 'error',
      message: 'Nie udało się wygenerować audio'
    };
  }
}

// IMAGE
export async function generateImage(prompt: string, style: string = 'realistic'): Promise<ImageResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-image`, {
      prompt,
      style,
      size: '768x768'
    });
    return response.data;
  } catch (error) {
    console.error('Image generation failed:', error);
    return {
      success: false,
      error: 'Nie udało się wygenerować obrazu'
    };
  }
}

// SUMMARY
export async function generateSummary(content: string): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-summary`, {
      content,
      max_tokens: 300
    });
    return response.data;
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      success: false,
      error: 'Nie udało się wygenerować streszczenia'
    };
  }
}

// LEARNING OBJECTIVES
export async function generateLearningObjectives(content: string): Promise<{ success: boolean; objectives?: string[]; error?: string }> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-learning-objectives`, {
      content,
      max_tokens: 500
    });
    return response.data;
  } catch (error) {
    console.error('Learning objectives generation failed:', error);
    return {
      success: false,
      error: 'Nie udało się wygenerować celów nauczania'
    };
  }
}

// KEY TERMS
export async function generateKeyTerms(content: string): Promise<{ success: boolean; terms?: Record<string, string>; error?: string }> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-key-terms`, {
      content,
      max_tokens: 800
    });
    return response.data;
  } catch (error) {
    console.error('Key terms generation failed:', error);
    return {
      success: false,
      error: 'Nie udało się wygenerować słów kluczowych'
    };
  }
}

// HEALTH CHECK
export async function checkHealth() {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
}

// LEGACY SUPPORT
export async function generateWorksheet(topic: string, context?: string) {
    // Placeholder as worksheet generation endpoint is not explicitly in new backend
    // Could use generate-content with specific prompt
    return {
        title: 'Karta Pracy',
        questions: []
    };
}

export const aiService = {
  generateQuiz,
  generateAudio,
  generateImage,
  generateSummary,
  generateLearningObjectives,
  generateKeyTerms,
  checkHealth
};
