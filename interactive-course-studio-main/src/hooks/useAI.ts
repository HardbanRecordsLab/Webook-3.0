import { useState, useCallback } from 'react';
import { aiService } from '@/services/aiService';

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.generateQuiz(content);
      if (!result.success) throw new Error(result.error);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      options.onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const generateAudio = useCallback(async (text: string, lessonId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.generateAudio(text, lessonId);
      if (result.status !== 'success') throw new Error(result.message);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      options.onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const generateImage = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.generateImage(prompt);
      if (!result.success) throw new Error(result.error);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      options.onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    error,
    generateQuiz,
    generateAudio,
    generateImage
  };
}
