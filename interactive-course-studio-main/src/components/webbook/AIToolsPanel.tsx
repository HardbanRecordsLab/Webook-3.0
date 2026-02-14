import { useState } from 'react';
import { X, Sparkles, Wand2, Image as ImageIcon, Mic, Zap, BookOpen, Tag } from 'lucide-react';
import { Lesson } from '@/types/webbook';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface AIToolsPanelProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function AIToolsPanel({ lesson, onUpdate, onClose }: AIToolsPanelProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'media'>('overview');

  // ==================== QUIZ ====================
  const handleGenerateQuiz = async () => {
    setIsGenerating('quiz');
    try {
      const result = await aiService.generateQuiz(lesson.content || '');
      
      if (result.success && result.questions) {
        const quiz = {
          title: 'Quiz',
          questions: result.questions,
          passingScore: 70
        };
        
        onUpdate({
          ...lesson,
          quiz
        });
        
        toast({
          title: '✅ Quiz wygenerowany',
          description: `Utworzono ${result.questions.length} pytań`
        });
      } else {
        throw new Error(result.error || 'Błąd generowania');
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
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
          audio: {
            url: result.file,
            provider: result.provider as 'piper' | 'elevenlabs',
            duration: result.duration_estimate
          }
        });
        
        toast({
          title: '✅ Audio wygenerowane',
          description: `Naracja gotowa (${result.provider})`
        });
      } else {
        throw new Error(result.message || 'Błąd generowania');
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
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

      const images = imageResults
        .filter(r => r.success && r.image_url)
        .map(r => ({
          id: `img_${Date.now()}_${Math.random()}`,
          url: r.image_url!,
          prompt: prompts[imageResults.indexOf(r)],
          name: 'Ilustracja AI',
          type: 'image'
        }));

      if (images.length > 0) {
        onUpdate({
          ...lesson,
          multimedia: {
            ...lesson.multimedia,
            images: [...(lesson.multimedia?.images || []), ...images]
          }
        });

        toast({
          title: '✅ Obrazy wygenerowane',
          description: `Dodano ${images.length} obrazów`
        });
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
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
        // Append summary to content for now, or use dedicated field if we add one
        // For now let's just prepend it to content as a blockquote
        const newContent = `> **Streszczenie:** ${result.summary}\n\n${lesson.content}`;
        
        onUpdate({
          ...lesson,
          content: newContent
        });
        
        toast({
          title: '✅ Streszczenie wygenerowane',
          description: 'Dodano do początku lekcji'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
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
        onUpdate({
          ...lesson,
          learningObjectives: result.objectives
        });
        
        toast({
          title: '✅ Cele nauczania wygenerowane',
          description: `Dodano ${result.objectives.length} celów`
        });
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
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
        const terms = Object.entries(result.terms).map(([term, definition]) => ({
          id: `term_${Date.now()}_${Math.random()}`,
          term,
          definition: definition as string
        }));
        
        onUpdate({
          ...lesson,
          glossaryTerms: terms
        });
        
        toast({
          title: '✅ Słowa kluczowe wygenerowane',
          description: `Dodano ${terms.length} słów`
        });
      }
    } catch (error) {
      toast({
        title: '❌ Błąd',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Studio AI</h2>
                <p className="text-sm text-muted-foreground">Twój asystent w tworzeniu kursu</p>
            </div>
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
              {tab === 'overview' && 'Narzędzia Główne'}
              {tab === 'content' && 'Wzbogacanie Treści'}
              {tab === 'media' && 'Multimedia'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quiz */}
              <div className="p-5 border border-border rounded-xl bg-card hover:border-purple-300 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                     <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Generuj Quiz</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatycznie wygeneruj pytania testowe na podstawie treści lekcji.
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating !== null}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'quiz' ? '⏳ Generuję...' : '✨ Generuj Quiz'}
                </button>
              </div>

              {/* Summary */}
              <div className="p-5 border border-border rounded-xl bg-card hover:border-blue-300 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Streszczenie</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Stwórz zwięzłe podsumowanie lekcji (TL;DR) na początek.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating !== null}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'summary' ? '⏳ Generuję...' : '✨ Generuj Streszczenie'}
                </button>
              </div>

              {/* Learning Objectives */}
              <div className="p-5 border border-border rounded-xl bg-card hover:border-green-300 transition-all hover:shadow-md group col-span-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                    <Wand2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Cele Nauczania</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Wygeneruj listę konkretnych umiejętności, które uczeń zdobędzie po tej lekcji.
                </p>
                <button
                  onClick={handleGenerateObjectives}
                  disabled={isGenerating !== null}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
              <div className="p-5 border border-border rounded-xl bg-card hover:border-amber-300 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
                     <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Słownik Pojęć</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatycznie znajdź trudne słowa i stwórz do nich definicje.
                </p>
                <button
                  onClick={handleGenerateTerms}
                  disabled={isGenerating !== null}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'terms' ? '⏳ Generuję...' : '✨ Generuj Słownik'}
                </button>
              </div>
            </div>
          )}

          {/* MEDIA TAB */}
          {activeTab === 'media' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audio */}
              <div className="p-5 border border-border rounded-xl bg-card hover:border-emerald-300 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                    <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Lektor AI</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Zamień tekst lekcji na profesjonalnego lektora (Audiobook).
                </p>
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGenerating !== null}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'audio' ? '⏳ Generuję...' : '✨ Generuj Audio'}
                </button>
              </div>

              {/* Images */}
              <div className="p-5 border border-border rounded-xl bg-card hover:border-cyan-300 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 transition-colors">
                    <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Ilustracje AI</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Stwórz unikalne grafiki i diagramy pasujące do tematu.
                </p>
                <button
                  onClick={handleGenerateImages}
                  disabled={isGenerating !== null}
                  className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGenerating === 'images' ? '⏳ Generuję...' : '✨ Generuj Obrazy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center bg-card flex-shrink-0">
          <div className="text-xs text-muted-foreground">
             Powered by Webook AI Engine
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
