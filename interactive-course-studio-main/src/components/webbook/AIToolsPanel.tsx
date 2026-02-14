import { useState } from 'react';
import { X, Sparkles, Wand2, Image as ImageIcon, Mic, Zap, BookOpen, Tag } from 'lucide-react';
import { Lesson } from '@/types/webbook';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';

interface AIToolsPanelProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function AIToolsPanel({ lesson, onUpdate, onClose }: AIToolsPanelProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'media'>('overview');

  // ==================== QUIZ ====================
  const handleGenerateQuiz = async () => {
    setIsGenerating('quiz');
    try {
      const result = await aiService.generateQuiz(lesson.content || '');
      
      // result is already formatted by generateQuiz adapter in aiService.ts
      if (result && result.questions) {
        onUpdate({
          ...lesson,
          quiz: result
        });
        
        toast.success(`Quiz wygenerowany: ${result.questions.length} pytań`);
      } else {
        throw new Error('Błąd generowania');
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  // ==================== AUDIO ====================
  const handleGenerateAudio = async () => {
    setIsGenerating('audio');
    try {
      const result = await aiService.generateAudio(
        lesson.content || '',
        lesson.id
      );
      
      if (result.status === 'success' && result.file) {
        onUpdate({
          ...lesson,
          multimedia: {
            ...lesson.multimedia,
            audio: {
                id: `audio_${Date.now()}`,
                name: 'Audio Narration',
                url: result.file!,
                type: 'audio/wav',
                provider: result.provider,
                duration: result.duration_estimate
            }
          }
        });
        
        toast.success(`Audio wygenerowane (${result.provider})`);
      } else {
        throw new Error(result.message || 'Błąd generowania');
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  // ==================== IMAGES ====================
  const handleGenerateImages = async () => {
    setIsGenerating('images');
    try {
      const prompts = [
        `Ilustracja do lekcji: "${lesson.title}"`,
        `Diagram pokazujący: ${lesson.content?.slice(0, 100) || 'koncepty z lekcji'}`
      ];

      const imageResults = await Promise.all(
        prompts.map(prompt => aiService.generateImage(prompt))
      );

      const newImages = imageResults
        .filter(r => r.success && r.image_url)
        .map((r, idx) => ({
          id: `img_${Date.now()}_${Math.random()}`,
          name: `AI Image ${idx+1}`,
          url: r.image_url!,
          type: 'image/jpeg',
          prompt: prompts[imageResults.indexOf(r)]
        }));

      if (newImages.length > 0) {
        onUpdate({
          ...lesson,
          multimedia: {
            ...lesson.multimedia,
            images: [...(lesson.multimedia.images || []), ...newImages]
          }
        });

        toast.success(`Dodano ${newImages.length} obrazów`);
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  // ==================== SUMMARY ====================
  const handleGenerateSummary = async () => {
    setIsGenerating('summary');
    try {
      const result = await aiService.generateSummary(lesson.content || '');
      
      if (result.success && result.summary) {
        // Append summary to content or store it in a specific field if available
        // For now, we'll append it to content as a summary block if it's not there
        const summaryHtml = `\n\n### Streszczenie\n${result.summary}`;
        onUpdate({
          ...lesson,
          content: (lesson.content || '') + summaryHtml
        });
        
        toast.success('Streszczenie dodane do lekcji');
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  // ==================== LEARNING OBJECTIVES ====================
  const handleGenerateObjectives = async () => {
    setIsGenerating('objectives');
    try {
      const result = await aiService.generateLearningObjectives(lesson.content || '');
      
      if (result.success && result.objectives) {
        const objsHtml = `\n\n### Cele Nauczania\n<ul>${result.objectives.map(o => `<li>${o}</li>`).join('')}</ul>`;
        onUpdate({
          ...lesson,
          content: (lesson.content || '') + objsHtml
        });
        
        toast.success(`Dodano ${result.objectives.length} celów`);
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  // ==================== KEY TERMS ====================
  const handleGenerateTerms = async () => {
    setIsGenerating('terms');
    try {
      const result = await aiService.generateKeyTerms(lesson.content || '');
      
      if (result.success && result.terms) {
        const termsHtml = `\n\n### Słowa Kluczowe\n<dl>${Object.entries(result.terms).map(([term, def]) => `<dt><strong>${term}</strong></dt><dd>${def}</dd>`).join('')}</dl>`;
        
        onUpdate({
          ...lesson,
          content: (lesson.content || '') + termsHtml
        });
        
        toast.success(`Dodano słowa kluczowe`);
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-serif font-bold text-foreground">Narzędzia AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 flex-shrink-0 bg-card">
          {['overview', 'content', 'media'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' && 'Przegląd'}
              {tab === 'content' && 'Treść'}
              {tab === 'media' && 'Media'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-card">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quiz */}
              <div className="p-4 border border-border rounded-lg hover:border-purple-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-foreground">Generuj Quiz</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatycznie wygeneruj pytania testowe na podstawie treści lekcji
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'quiz' ? '⏳ Generuję...' : '✨ Generuj Quiz'}
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 border border-border rounded-lg hover:border-blue-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-foreground">Streszczenie</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Stwórz streszczenie treści lekcji w 3-4 zdaniach
                </p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'summary' ? '⏳ Generuję...' : '✨ Generuj Streszczenie'}
                </button>
              </div>

              {/* Learning Objectives */}
              <div className="p-4 border border-border rounded-lg hover:border-green-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-foreground">Cele Nauczania</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Wygeneruj cele nauczania dla tej lekcji (3-5 punktów)
                </p>
                <button
                  onClick={handleGenerateObjectives}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'objectives' ? '⏳ Generuję...' : '✨ Generuj Cele'}
                </button>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Key Terms */}
              <div className="p-4 border border-border rounded-lg hover:border-amber-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Słowa Kluczowe</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Wyodrębnij i zdefiniuj główne terminy z lekcji
                </p>
                <button
                  onClick={handleGenerateTerms}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'terms' ? '⏳ Generuję...' : '✨ Generuj Słowa'}
                </button>
              </div>
            </div>
          )}

          {/* MEDIA TAB */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Audio */}
              <div className="p-4 border border-border rounded-lg hover:border-green-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-foreground">Naracja Audio</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Wygeneruj naturalną polską narrację do lekcji
                </p>
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'audio' ? '⏳ Generuję...' : '✨ Generuj Audio'}
                </button>
              </div>

              {/* Images */}
              <div className="p-4 border border-border rounded-lg hover:border-cyan-300 transition-colors bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-foreground">Ilustracje</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Utwórz ilustracje i diagramy do lekcji (AI-powered)
                </p>
                <button
                  onClick={handleGenerateImages}
                  disabled={isGenerating !== null}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'images' ? '⏳ Generuję...' : '✨ Generuj Obrazy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 flex-shrink-0 bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
