import { useState } from 'react';
import { Lesson, WorksheetQuestion, QuizQuestion, QuizOption, createId } from '@/types/webbook';
import { Plus, Trash2, FileText, HelpCircle, CheckCircle2, Sparkles, Upload, Image, Music, Loader2 } from 'lucide-react';
import { streamAI, generateWorksheet, generateQuiz } from '@/services/aiService';
import { uploadMedia } from '@/services/storageService';
import { toast } from 'sonner';

interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
}

const LessonEditor = ({ lesson, onUpdate }: LessonEditorProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'worksheet' | 'quiz' | 'media'>('content');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploading, setUploading] = useState(false);

  const updateField = <K extends keyof Lesson>(key: K, value: Lesson[K]) => {
    onUpdate({ ...lesson, [key]: value });
  };

  // AI Generation
  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) { toast.error('Wpisz temat do wygenerowania'); return; }
    setAiLoading(true);
    try {
      let content = '';
      await streamAI(
        { type: 'lesson-content', topic: aiPrompt, lessonTitle: lesson.title },
        {
          onDelta: (t) => { content += t; updateField('content', content); },
          onDone: () => {},
        }
      );
      toast.success('Treść wygenerowana!');
      setAiPrompt('');
    } catch (e: any) {
      toast.error(e.message || 'Błąd generowania');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateWorksheet = async () => {
    const topic = aiPrompt.trim() || lesson.title;
    setAiLoading(true);
    try {
      const ws = await generateWorksheet(topic);
      updateField('worksheet', ws);
      toast.success('Karta pracy wygenerowana!');
    } catch (e: any) {
      toast.error(e.message || 'Błąd generowania');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    const topic = aiPrompt.trim() || lesson.title;
    setAiLoading(true);
    try {
      const quiz = await generateQuiz(topic);
      updateField('quiz', quiz);
      toast.success('Quiz wygenerowany!');
    } catch (e: any) {
      toast.error(e.message || 'Błąd generowania');
    } finally {
      setAiLoading(false);
    }
  };

  // Media upload
  const handleUploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const media = await uploadMedia(file, 'images');
        const images = [...(lesson.multimedia.images || []), { ...media, type: file.type }];
        updateField('multimedia', { ...lesson.multimedia, images });
        toast.success('Obraz dodany!');
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleUploadAudio = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const media = await uploadMedia(file, 'audio');
        updateField('multimedia', { ...lesson.multimedia, audio: { ...media, type: file.type } });
        toast.success('Audio dodane!');
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const removeImage = (id: string) => {
    updateField('multimedia', {
      ...lesson.multimedia,
      images: (lesson.multimedia.images || []).filter((img) => img.id !== id),
    });
  };

  const removeAudio = () => {
    updateField('multimedia', { ...lesson.multimedia, audio: undefined });
  };

  // Worksheet helpers
  const addWorksheetQuestion = () => {
    const ws = lesson.worksheet || { title: 'Karta Pracy', questions: [] };
    const q: WorksheetQuestion = { id: createId(), question: '', type: 'textarea' };
    updateField('worksheet', { ...ws, questions: [...ws.questions, q] });
  };

  const updateWorksheetQuestion = (qId: string, field: keyof WorksheetQuestion, value: string) => {
    if (!lesson.worksheet) return;
    updateField('worksheet', {
      ...lesson.worksheet,
      questions: lesson.worksheet.questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q)),
    });
  };

  const deleteWorksheetQuestion = (qId: string) => {
    if (!lesson.worksheet) return;
    updateField('worksheet', { ...lesson.worksheet, questions: lesson.worksheet.questions.filter((q) => q.id !== qId) });
  };

  // Quiz helpers
  const addQuizQuestion = () => {
    const quiz = lesson.quiz || { title: 'Quiz', questions: [] };
    const q: QuizQuestion = {
      id: createId(),
      question: '',
      options: [
        { id: createId(), text: '', isCorrect: true },
        { id: createId(), text: '', isCorrect: false },
        { id: createId(), text: '', isCorrect: false },
      ],
    };
    updateField('quiz', { ...quiz, questions: [...quiz.questions, q] });
  };

  const updateQuizQuestion = (qId: string, question: string) => {
    if (!lesson.quiz) return;
    updateField('quiz', { ...lesson.quiz, questions: lesson.quiz.questions.map((q) => (q.id === qId ? { ...q, question } : q)) });
  };

  const updateQuizOption = (qId: string, optId: string, text: string) => {
    if (!lesson.quiz) return;
    updateField('quiz', {
      ...lesson.quiz,
      questions: lesson.quiz.questions.map((q) =>
        q.id === qId ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) } : q
      ),
    });
  };

  const setCorrectOption = (qId: string, optId: string) => {
    if (!lesson.quiz) return;
    updateField('quiz', {
      ...lesson.quiz,
      questions: lesson.quiz.questions.map((q) =>
        q.id === qId ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })) } : q
      ),
    });
  };

  const deleteQuizQuestion = (qId: string) => {
    if (!lesson.quiz) return;
    updateField('quiz', { ...lesson.quiz, questions: lesson.quiz.questions.filter((q) => q.id !== qId) });
  };

  const addQuizOption = (qId: string) => {
    if (!lesson.quiz) return;
    updateField('quiz', {
      ...lesson.quiz,
      questions: lesson.quiz.questions.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, { id: createId(), text: '', isCorrect: false }] } : q
      ),
    });
  };

  const tabs = [
    { key: 'content' as const, label: 'Treść', icon: FileText },
    { key: 'media' as const, label: 'Multimedia', icon: Image },
    { key: 'worksheet' as const, label: 'Karta Pracy', icon: HelpCircle },
    { key: 'quiz' as const, label: 'Quiz', icon: CheckCircle2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <input
          value={lesson.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Tytuł lekcji"
          className="w-full text-3xl font-serif font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 mb-2"
        />
        <input
          value={lesson.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="Podtytuł lekcji (opcjonalnie)"
          className="w-full text-lg bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/40"
        />
      </div>

      {/* AI Bar */}
      <div className="px-6 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Opisz temat — AI wygeneruje treść, kartę pracy lub quiz..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateContent()}
            disabled={aiLoading}
          />
          {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          <button onClick={handleGenerateContent} disabled={aiLoading} className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Treść</button>
          <button onClick={handleGenerateWorksheet} disabled={aiLoading} className="px-2 py-1 text-xs rounded bg-primary/80 text-primary-foreground hover:bg-primary/70 disabled:opacity-50">Karta</button>
          <button onClick={handleGenerateQuiz} disabled={aiLoading} className="px-2 py-1 text-xs rounded bg-primary/60 text-primary-foreground hover:bg-primary/50 disabled:opacity-50">Quiz</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Treść lekcji</label>
            <textarea
              value={lesson.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Napisz treść lekcji lub użyj AI..."
              className="w-full min-h-[400px] p-4 rounded-lg border border-input bg-card text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40 text-sm leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Obrazy</h3>
                <button onClick={handleUploadImage} disabled={uploading} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Dodaj obraz
                </button>
              </div>
              {(lesson.multimedia.images || []).length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {(lesson.multimedia.images || []).map((img) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                      <img src={img.url} alt={img.name} className="w-full h-32 object-cover" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-destructive-foreground" />
                      </button>
                      <div className="p-2 text-xs text-muted-foreground truncate">{img.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Brak obrazów. Kliknij "Dodaj obraz".</p>
                </div>
              )}
            </div>

            {/* Audio */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Audio</h3>
                {!lesson.multimedia.audio && (
                  <button onClick={handleUploadAudio} disabled={uploading} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                    Dodaj audio
                  </button>
                )}
              </div>
              {lesson.multimedia.audio ? (
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{lesson.multimedia.audio.name}</span>
                    <button onClick={removeAudio} className="p-1 hover:bg-destructive/10 rounded">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <audio controls className="w-full">
                    <source src={lesson.multimedia.audio.url} type={lesson.multimedia.audio.type} />
                  </audio>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Brak audio. Kliknij "Dodaj audio".</p>
                </div>
              )}
            </div>

            {/* Video */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Wideo YouTube</h3>
              <input
                value={lesson.multimedia.video || ''}
                onChange={(e) => updateField('multimedia', { ...lesson.multimedia, video: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40 text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'worksheet' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                value={lesson.worksheet?.title || 'Karta Pracy'}
                onChange={(e) => updateField('worksheet', { ...(lesson.worksheet || { title: '', questions: [] }), title: e.target.value })}
                className="text-xl font-serif font-bold bg-transparent border-none outline-none text-foreground"
                placeholder="Tytuł karty pracy"
              />
              <button onClick={addWorksheetQuestion} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Dodaj pytanie
              </button>
            </div>
            <div className="space-y-4">
              {(lesson.worksheet?.questions || []).map((q, i) => (
                <div key={q.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-muted-foreground mt-2">{i + 1}.</span>
                    <div className="flex-1">
                      <input value={q.question} onChange={(e) => updateWorksheetQuestion(q.id, 'question', e.target.value)} placeholder="Treść pytania..." className="w-full p-2 text-sm bg-transparent border-b border-border outline-none focus:border-primary text-foreground mb-2" />
                      <select value={q.type} onChange={(e) => updateWorksheetQuestion(q.id, 'type', e.target.value)} className="text-xs p-1 rounded border border-input bg-card text-foreground">
                        <option value="textarea">Długa odpowiedź</option>
                        <option value="text">Krótka odpowiedź</option>
                      </select>
                    </div>
                    <button onClick={() => deleteWorksheetQuestion(q.id)} className="p-1 hover:bg-destructive/10 rounded">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
              {(!lesson.worksheet?.questions || lesson.worksheet.questions.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Brak pytań. Dodaj ręcznie lub użyj AI.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                value={lesson.quiz?.title || 'Quiz'}
                onChange={(e) => updateField('quiz', { ...(lesson.quiz || { title: '', questions: [] }), title: e.target.value })}
                className="text-xl font-serif font-bold bg-transparent border-none outline-none text-foreground"
                placeholder="Tytuł quizu"
              />
              <button onClick={addQuizQuestion} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Dodaj pytanie
              </button>
            </div>
            <div className="space-y-6">
              {(lesson.quiz?.questions || []).map((q, i) => (
                <div key={q.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-sm font-bold text-muted-foreground mt-2">{i + 1}.</span>
                      <input value={q.question} onChange={(e) => updateQuizQuestion(q.id, e.target.value)} placeholder="Treść pytania..." className="flex-1 p-2 text-sm bg-transparent border-b border-border outline-none focus:border-primary text-foreground" />
                    </div>
                    <button onClick={() => deleteQuizQuestion(q.id)} className="p-1 hover:bg-destructive/10 rounded">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="space-y-2 ml-6">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setCorrectOption(q.id, opt.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${opt.isCorrect ? 'border-primary bg-primary' : 'border-border hover:border-primary/50'}`}
                        >
                          {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </button>
                        <input value={opt.text} onChange={(e) => updateQuizOption(q.id, opt.id, e.target.value)} placeholder="Odpowiedź..." className="flex-1 p-2 text-sm bg-transparent border-b border-border outline-none focus:border-primary text-foreground" />
                      </div>
                    ))}
                    <button onClick={() => addQuizOption(q.id)} className="text-xs text-muted-foreground hover:text-primary ml-7">+ Dodaj opcję</button>
                  </div>
                </div>
              ))}
              {(!lesson.quiz?.questions || lesson.quiz.questions.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Brak pytań. Dodaj ręcznie lub użyj AI.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonEditor;
