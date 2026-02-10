import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, Download, Eye, Book, Plus, Trash2, Edit3,
  Settings, Play, Image, Music, Video, CheckCircle2, Save,
  ChevronRight, X, Loader2, AlertCircle, Package, Code, Layout,
  Palette, FileJson, FolderOpen, Sparkles
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Webbook {
  metadata: {
    title: string;
    subtitle: string;
    author: string;
    description: string;
    language: string;
  };
  modules: Module[];
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
  };
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  multimedia: {
    images?: MediaFile[];
    audio?: MediaFile;
    video?: string;
  };
  worksheet?: Worksheet;
  quiz?: Quiz;
}

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface Worksheet {
  title: string;
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea';
  }>;
}

interface Quiz {
  title: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer?: number;
  }>;
}

// ============================================================================
// TEMPLATES
// ============================================================================

const TEMPLATES = [
  {
    id: '7-day',
    name: '7-Dniowy Kurs',
    description: 'Kurs tygodniowy z codziennymi lekcjami',
    modules: [
      {
        id: '1',
        title: 'Tydzień Transformacji',
        description: '7 dni intensywnej nauki',
        lessons: Array.from({ length: 7 }, (_, i) => ({
          id: `day-${i + 1}`,
          title: `Dzień ${i + 1}: ${['Rozpoczęcie', 'Podstawy', 'Praktyka', 'Pogłębianie', 'Mistrzostwo', 'Integracja', 'Podsumowanie'][i]}`,
          subtitle: '',
          content: `To jest treść lekcji dnia ${i + 1}. Uzupełnij swoimi materiałami.`,
          multimedia: {},
          worksheet: {
            title: 'Karta Pracy',
            questions: [
              { id: 'q1', question: 'Co dzisiaj się nauczyłeś?', type: 'textarea' },
              { id: 'q2', question: 'Jakie wyzwania napotkałeś?', type: 'textarea' }
            ]
          }
        }))
      }
    ]
  },
  {
    id: '21-day',
    name: '21-Dniowy Program',
    description: 'Kompleksowy program budowania nawyków',
    modules: [
      {
        id: '1',
        title: 'Część I: Fundamenty (Dni 1-7)',
        description: 'Pierwszy tydzień - podstawy',
        lessons: Array.from({ length: 7 }, (_, i) => ({
          id: `week1-day-${i + 1}`,
          title: `Dzień ${i + 1}: Fundamenty`,
          subtitle: '',
          content: 'Uzupełnij treścią lekcji...',
          multimedia: {},
          worksheet: {
            title: 'Refleksje Dnia',
            questions: [{ id: 'q1', question: 'Twoje notatki:', type: 'textarea' }]
          }
        }))
      },
      {
        id: '2',
        title: 'Część II: Praktyka (Dni 8-14)',
        description: 'Drugi tydzień - praktyka',
        lessons: Array.from({ length: 7 }, (_, i) => ({
          id: `week2-day-${i + 8}`,
          title: `Dzień ${i + 8}: Praktyka`,
          subtitle: '',
          content: 'Uzupełnij treścią lekcji...',
          multimedia: {}
        }))
      },
      {
        id: '3',
        title: 'Część III: Mistrzostwo (Dni 15-21)',
        description: 'Trzeci tydzień - integracja',
        lessons: Array.from({ length: 7 }, (_, i) => ({
          id: `week3-day-${i + 15}`,
          title: `Dzień ${i + 15}: Mistrzostwo`,
          subtitle: '',
          content: 'Uzupełnij treścią lekcji...',
          multimedia: {}
        }))
      }
    ]
  },
  {
    id: 'course',
    name: 'Kurs Modułowy',
    description: '5 modułów tematycznych',
    modules: Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Moduł ${i + 1}: Temat ${i + 1}`,
      description: `Opis modułu ${i + 1}`,
      lessons: Array.from({ length: 3 }, (_, j) => ({
        id: `${i + 1}-${j + 1}`,
        title: `Lekcja ${j + 1}`,
        subtitle: '',
        content: 'Treść lekcji...',
        multimedia: {}
      }))
    }))
  }
];

// ============================================================================
// MAIN APP
// ============================================================================

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'start' | 'builder' | 'preview' | 'settings'>('start');
  const [webbook, setWebbook] = useState<Webbook>({
    metadata: {
      title: 'Nowy Webbook',
      subtitle: '',
      author: '',
      description: '',
      language: 'pl'
    },
    modules: [],
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b'
    }
  });
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const projectInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // PROJECT MANAGEMENT
  // ============================================================================
  
  const saveProject = () => {
    const json = JSON.stringify(webbook, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${webbook.metadata.title.replace(/\s+/g, '-').toLowerCase()}-project.json`;
    a.click();
  };
  
  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setWebbook(data);
        setCurrentView('builder');
      } catch (err) {
        alert('Błąd wczytywania projektu!');
      }
    };
    reader.readAsText(file);
  };

  // ============================================================================
  // START SCREEN
  // ============================================================================
  
  if (currentView === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-16 mb-8">
            <Package size={80} className="mx-auto mb-8 text-amber-500" />
            <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-tight text-center">
              DTR Studio
            </h1>
            <p className="text-2xl text-slate-600">{webbook.metadata.subtitle}</p>
            {webbook.metadata.author && (
              <p className="text-xl text-slate-500 mt-4">Autor: {webbook.metadata.author}</p>
            )}
          </div>
          
          {webbook.modules.map((module, mIdx) => (
            <div key={module.id} className="mb-16">
              <h2 className="text-4xl font-black mb-8 border-l-8 border-blue-500 pl-6">
                {module.title}
              </h2>
              
              {module.lessons.map((lesson, lIdx) => (
                <div key={lesson.id} className="mb-12 bg-slate-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-black mb-4">{lesson.title}</h3>
                  {lesson.subtitle && (
                    <p className="text-lg text-slate-600 mb-6">{lesson.subtitle}</p>
                  )}
                  <div className="prose max-w-none mb-6">
                    <p className="whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
                  </div>
                  
                  {lesson.multimedia.images && lesson.multimedia.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {lesson.multimedia.images.map(img => (
                        <img key={img.id} src={img.url} alt={img.name} className="w-full rounded-xl" />
                      ))}
                    </div>
                  )}
                  
                  {lesson.multimedia.audio && (
                    <div className="bg-blue-50 p-6 rounded-xl mb-6">
                      <p className="font-bold mb-3">🎧 {lesson.multimedia.audio.name}</p>
                      <audio controls className="w-full" src={lesson.multimedia.audio.url} />
                    </div>
                  )}
                  
                  {lesson.multimedia.video && (
                    <div className="mb-6">
                      <iframe
                        width="100%"
                        height="400"
                        src={`https://www.youtube.com/embed/${lesson.multimedia.video}`}
                        className="rounded-xl"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {lesson.worksheet && (
                    <div className="mt-8 bg-white rounded-xl p-6 border-2 border-slate-200">
                      <h4 className="font-bold text-lg mb-4">📋 {lesson.worksheet.title}</h4>
                      {lesson.worksheet.questions.map(q => (
                        <div key={q.id} className="mb-4">
                          <label className="block font-bold mb-2">{q.question}</label>
                          {q.type === 'textarea' ? (
                            <textarea className="w-full p-3 border rounded-lg" rows={4} />
                          ) : (
                            <input type="text" className="w-full p-3 border rounded-lg" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {lesson.quiz && (
                    <div className="mt-8 bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                      <h4 className="font-bold text-lg mb-4">❓ {lesson.quiz.title}</h4>
                      {lesson.quiz.questions.map((q, qIdx) => (
                        <div key={q.id} className="mb-6">
                          <p className="font-bold mb-3">{qIdx + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-100 transition-all">
                                <input type="radio" name={`q-${qIdx}`} />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// ============================================================================
// LESSON EDITOR
// ============================================================================

const LessonEditor: React.FC<{
  lesson: Lesson;
  onChange: (lesson: Lesson) => void;
}> = ({ lesson, onChange }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const newImage: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        url,
        type: file.type
      };
      
      onChange({
        ...lesson,
        multimedia: {
          ...lesson.multimedia,
          images: [...(lesson.multimedia.images || []), newImage]
        }
      });
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const newAudio: MediaFile = {
      id: Date.now().toString(),
      name: file.name,
      url,
      type: file.type
    };
    
    onChange({
      ...lesson,
      multimedia: { ...lesson.multimedia, audio: newAudio }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* BASIC INFO */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h2 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">
          Podstawowe Informacje
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tytuł lekcji"
            value={lesson.title}
            onChange={(e) => onChange({ ...lesson, title: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold text-xl focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Podtytuł (opcjonalnie)"
            value={lesson.subtitle}
            onChange={(e) => onChange({ ...lesson, subtitle: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Treść lekcji..."
            value={lesson.content}
            onChange={(e) => onChange({ ...lesson, content: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl h-64 resize-none focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* MULTIMEDIA */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h2 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">
          Multimedia
        </h2>
        
        <div className="space-y-6">
          {/* IMAGES */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-sm">Obrazy</label>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Image size={16} />
                Dodaj Obraz
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            
            {lesson.multimedia.images && lesson.multimedia.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {lesson.multimedia.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.name} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        onChange({
                          ...lesson,
                          multimedia: {
                            ...lesson.multimedia,
                            images: lesson.multimedia.images?.filter(i => i.id !== img.id)
                          }
                        });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIO */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-sm">Audio</label>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Music size={16} />
                {lesson.multimedia.audio ? 'Zmień Audio' : 'Dodaj Audio'}
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </div>
            
            {lesson.multimedia.audio && (
              <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm mb-2">🎧 {lesson.multimedia.audio.name}</p>
                  <audio controls className="w-full" src={lesson.multimedia.audio.url} />
                </div>
                <button
                  onClick={() => {
                    onChange({
                      ...lesson,
                      multimedia: { ...lesson.multimedia, audio: undefined }
                    });
                  }}
                  className="p-2 bg-red-500 text-white rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* VIDEO */}
          <div>
            <label className="font-bold text-sm block mb-3">Video YouTube</label>
            <input
              type="text"
              placeholder="ID wideo YouTube (np. dQw4w9WgXcQ)"
              value={lesson.multimedia.video || ''}
              onChange={(e) => onChange({
                ...lesson,
                multimedia: { ...lesson.multimedia, video: e.target.value }
              })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-blue-500"
            />
            {lesson.multimedia.video && (
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="300"
                  src={`https://www.youtube.com/embed/${lesson.multimedia.video}`}
                  className="rounded-xl"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WORKSHEET */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Karta Pracy
          </h2>
          {!lesson.worksheet && (
            <button
              onClick={() => onChange({
                ...lesson,
                worksheet: {
                  title: 'Karta Pracy',
                  questions: [{ id: '1', question: '', type: 'textarea' }]
                }
              })}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold"
            >
              + Dodaj Kartę
            </button>
          )}
        </div>
        
        {lesson.worksheet && (
          <div className="space-y-4">
            <input
              type="text"
              value={lesson.worksheet.title}
              onChange={(e) => onChange({
                ...lesson,
                worksheet: { ...lesson.worksheet!, title: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg font-bold"
            />
            
            {lesson.worksheet.questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Pytanie..."
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...lesson.worksheet!.questions];
                      newQuestions[idx].question = e.target.value;
                      onChange({
                        ...lesson,
                        worksheet: { ...lesson.worksheet!, questions: newQuestions }
                      });
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const newQuestions = lesson.worksheet!.questions.filter((_, i) => i !== idx);
                      onChange({
                        ...lesson,
                        worksheet: { ...lesson.worksheet!, questions: newQuestions }
                      });
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <select
                  value={q.type}
                  onChange={(e) => {
                    const newQuestions = [...lesson.worksheet!.questions];
                    newQuestions[idx].type = e.target.value as 'text' | 'textarea';
                    onChange({
                      ...lesson,
                      worksheet: { ...lesson.worksheet!, questions: newQuestions }
                    });
                  }}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="text">Krótka odpowiedź</option>
                  <option value="textarea">Długa odpowiedź</option>
                </select>
              </div>
            ))}
            
            <button
              onClick={() => {
                const newQuestions = [
                  ...lesson.worksheet!.questions,
                  { id: Date.now().toString(), question: '', type: 'textarea' as const }
                ];
                onChange({
                  ...lesson,
                  worksheet: { ...lesson.worksheet!, questions: newQuestions }
                });
              }}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-500"
            >
              + Dodaj Pytanie
            </button>
          </div>
        )}
      </div>

      {/* QUIZ */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Quiz
          </h2>
          {!lesson.quiz && (
            <button
              onClick={() => onChange({
                ...lesson,
                quiz: {
                  title: 'Quiz',
                  questions: [{
                    id: '1',
                    question: '',
                    options: ['Opcja A', 'Opcja B', 'Opcja C'],
                    correctAnswer: 0
                  }]
                }
              })}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold"
            >
              + Dodaj Quiz
            </button>
          )}
        </div>
        
        {lesson.quiz && (
          <div className="space-y-4">
            <input
              type="text"
              value={lesson.quiz.title}
              onChange={(e) => onChange({
                ...lesson,
                quiz: { ...lesson.quiz!, title: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg font-bold"
            />
            
            {lesson.quiz.questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-purple-50 rounded-xl">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Pytanie..."
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...lesson.quiz!.questions];
                      newQuestions[qIdx].question = e.target.value;
                      onChange({
                        ...lesson,
                        quiz: { ...lesson.quiz!, questions: newQuestions }
                      });
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg font-bold"
                  />
                  <button
                    onClick={() => {
                      const newQuestions = lesson.quiz!.questions.filter((_, i) => i !== qIdx);
                      onChange({
                        ...lesson,
                        quiz: { ...lesson.quiz!, questions: newQuestions }
                      });
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => {
                          const newQuestions = [...lesson.quiz!.questions];
                          newQuestions[qIdx].correctAnswer = oIdx;
                          onChange({
                            ...lesson,
                            quiz: { ...lesson.quiz!, questions: newQuestions }
                          });
                        }}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newQuestions = [...lesson.quiz!.questions];
                          newQuestions[qIdx].options[oIdx] = e.target.value;
                          onChange({
                            ...lesson,
                            quiz: { ...lesson.quiz!, questions: newQuestions }
                          });
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newQuestions = [...lesson.quiz!.questions];
                      newQuestions[qIdx].options.push(`Opcja ${String.fromCharCode(65 + q.options.length)}`);
                      onChange({
                        ...lesson,
                        quiz: { ...lesson.quiz!, questions: newQuestions }
                      });
                    }}
                    className="w-full py-2 border border-dashed rounded-lg text-sm text-purple-600"
                  >
                    + Dodaj Opcję
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                const newQuestions = [
                  ...lesson.quiz!.questions,
                  {
                    id: Date.now().toString(),
                    question: '',
                    options: ['Opcja A', 'Opcja B', 'Opcja C'],
                    correctAnswer: 0
                  }
                ];
                onChange({
                  ...lesson,
                  quiz: { ...lesson.quiz!, questions: newQuestions }
                });
              }}
              className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-sm text-purple-600 hover:border-purple-500"
            >
              + Dodaj Pytanie
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// WEBBOOK GENERATOR
// ============================================================================

function generateWebbook(webbook: Webbook): string {
  const modulesHTML = webbook.modules.map((module, mIdx) => 
    module.lessons.map((lesson, lIdx) => `
      <div class="page ${mIdx === 0 && lIdx === 0 ? 'active' : ''}" id="page-${mIdx}-${lIdx}">
        <div class="page-header">
          <h1>${lesson.title}</h1>
          ${lesson.subtitle ? `<p class="subtitle">${lesson.subtitle}</p>` : ''}
        </div>
        
        <div class="content">
          <p style="white-space: pre-wrap; line-height: 1.8;">${lesson.content}</p>
        </div>
        
        ${lesson.multimedia.images && lesson.multimedia.images.length > 0 ? `
        <div class="media-gallery">
          ${lesson.multimedia.images.map(img => `
            <img src="${img.url}" alt="${img.name}" />
          `).join('')}
        </div>
        ` : ''}
        
        ${lesson.multimedia.audio ? `
        <div class="audio-player">
          <p class="audio-title">🎧 ${lesson.multimedia.audio.name}</p>
          <audio controls src="${lesson.multimedia.audio.url}"></audio>
        </div>
        ` : ''}
        
        ${lesson.multimedia.video ? `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${lesson.multimedia.video}" allowfullscreen></iframe>
        </div>
        ` : ''}
        
        ${lesson.worksheet ? `
        <div class="worksheet">
          <h3>${lesson.worksheet.title}</h3>
          ${lesson.worksheet.questions.map(q => `
            <div class="form-group">
              <label>${q.question}</label>
              ${q.type === 'textarea' 
                ? '<textarea rows="4"></textarea>' 
                : '<input type="text" />'
              }
            </div>
          `).join('')}
          <button class="btn btn-save" onclick="alert('Odpowiedzi zapisane!')">Zapisz odpowiedzi</button>
        </div>
        ` : ''}
        
        ${lesson.quiz ? `
        <div class="quiz">
          <h3>${lesson.quiz.title}</h3>
          ${lesson.quiz.questions.map((q, qIdx) => `
            <div class="quiz-question">
              <p class="question-text">${qIdx + 1}. ${q.question}</p>
              <div class="quiz-options">
                ${q.options.map((opt, oIdx) => `
                  <label class="quiz-option">
                    <input type="radio" name="q${mIdx}-${lIdx}-${qIdx}" value="${oIdx}" />
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <button class="btn btn-primary" onclick="alert('Quiz ukończony!')">Sprawdź odpowiedzi</button>
        </div>
        ` : ''}
        
        <div class="navigation-buttons">
          ${lIdx > 0 || mIdx > 0 ? '<button class="btn btn-secondary" onclick="showPage(\'page-' + (lIdx > 0 ? mIdx : mIdx - 1) + '-' + (lIdx > 0 ? lIdx - 1 : ((webbook.modules[mIdx - 1] && webbook.modules[mIdx - 1].lessons.length - 1) || 0)) + '\')">← Poprzednia</button>' : ''}
          ${lIdx < module.lessons.length - 1 || mIdx < webbook.modules.length - 1 ? '<button class="btn btn-primary" onclick="showPage(\'page-' + (lIdx < module.lessons.length - 1 ? mIdx : mIdx + 1) + '-' + (lIdx < module.lessons.length - 1 ? lIdx + 1 : 0) + '\')">Następna →</button>' : ''}
        </div>
      </div>
    `).join('')
  ).join('');

  const sidebarHTML = webbook.modules.map((module, mIdx) => `
    <div class="sidebar-section">
      <div class="sidebar-title">${module.title}</div>
      ${module.lessons.map((lesson, lIdx) => `
        <a href="#" class="sidebar-link ${mIdx === 0 && lIdx === 0 ? 'active' : ''}" 
           onclick="showPage('page-${mIdx}-${lIdx}'); return false;">
          ${lesson.title}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="${webbook.metadata.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${webbook.metadata.title}</title>
  <meta name="description" content="${webbook.metadata.description || webbook.metadata.subtitle}">
  <meta name="author" content="${webbook.metadata.author}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; line-height: 1.6; }
    
    .header { 
      background: linear-gradient(135deg, ${webbook.branding.primaryColor}, ${webbook.branding.secondaryColor}); 
      color: white; 
      padding: 1.5rem 2rem; 
      position: sticky; 
      top: 0; 
      z-index: 100; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .logo { font-size: 1.5rem; font-weight: bold; }
    
    .container { display: flex; min-height: calc(100vh - 70px); }
    .sidebar { 
      width: 280px; 
      background: white; 
      border-right: 1px solid #ddd; 
      overflow-y: auto; 
      position: sticky;
      top: 70px;
      height: calc(100vh - 70px);
    }
    .sidebar-section { padding: 1.5rem 0; border-bottom: 1px solid #eee; }
    .sidebar-title { 
      padding: 0 1.5rem; 
      font-weight: bold; 
      color: ${webbook.branding.primaryColor}; 
      font-size: 0.85rem; 
      text-transform: uppercase; 
      margin-bottom: 0.75rem; 
    }
    .sidebar-link { 
      display: block; 
      padding: 0.75rem 1.5rem; 
      color: #666; 
      text-decoration: none; 
      border-left: 3px solid transparent; 
      transition: all 0.3s; 
    }
    .sidebar-link:hover, .sidebar-link.active { 
      background: #f0f7ff; 
      border-left-color: ${webbook.branding.primaryColor}; 
      color: ${webbook.branding.primaryColor}; 
      font-weight: 500;
    }
    
    main { flex: 1; padding: 3rem 2rem; }
    .page { display: none; max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s; }
    .page.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .page-header { margin-bottom: 2rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 1.5rem; }
    .page-header h1 { font-size: 2.5rem; color: #1f2937; margin-bottom: 0.5rem; }
    .subtitle { color: #666; font-size: 1.1rem; }
    
    .content { line-height: 1.8; color: #333; margin-bottom: 2rem; }
    
    .media-gallery { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 1rem; 
      margin: 2rem 0; 
    }
    .media-gallery img { 
      width: 100%; 
      height: 200px; 
      object-fit: cover; 
      border-radius: 12px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .audio-player { 
      background: #f0f7ff; 
      padding: 1.5rem; 
      border-radius: 12px; 
      margin: 2rem 0; 
      border: 1px solid #bfdbfe;
    }
    .audio-title { font-weight: 600; color: ${webbook.branding.primaryColor}; margin-bottom: 1rem; }
    .audio-player audio { width: 100%; margin-top: 0.5rem; }
    
    .video-container { 
      position: relative; 
      width: 100%; 
      padding-bottom: 56.25%; 
      height: 0; 
      overflow: hidden; 
      border-radius: 12px; 
      margin: 2rem 0; 
    }
    
    .worksheet { 
      background: #f9fafb; 
      padding: 2rem; 
      border-radius: 12px; 
      margin: 2rem 0; 
      border: 2px solid #e5e7eb; 
    }
    .worksheet h3 { margin-bottom: 1.5rem; color: ${webbook.branding.primaryColor}; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
    .form-group input, .form-group textarea { 
      width: 100%; 
      padding: 0.75rem; 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      font-family: inherit; 
    }
    
    .quiz { 
      background: #faf5ff; 
      padding: 2rem; 
      border-radius: 12px; 
      margin: 2rem 0; 
      border: 2px solid #e9d5ff; 
    }
    .quiz h3 { margin-bottom: 1.5rem; color: #7c3aed; }
    .quiz-question { margin-bottom: 2rem; }
    .question-text { font-weight: 600; margin-bottom: 1rem; }
    .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }
    .quiz-option { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 0.75rem; 
      background: white; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      cursor: pointer; 
      transition: all 0.3s; 
    }
    .quiz-option:hover { background: #faf5ff; border-color: #7c3aed; }
    
    .btn { 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.3s; 
      font-family: inherit;
    }
    .btn-primary { background: ${webbook.branding.primaryColor}; color: white; }
    .btn-primary:hover { background: ${webbook.branding.secondaryColor}; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .btn-secondary:hover { background: #d1d5db; }
    .btn-save { background: #10b981; color: white; }
    .btn-save:hover { background: #059669; }
    
    .navigation-buttons { margin-top: 3rem; display: flex; gap: 1rem; justify-content: space-between; }
    
    @media (max-width: 768px) {
      .sidebar { 
        position: fixed;
        left: -280px;
        top: 70px;
        transition: left 0.3s;
        z-index: 99;
      }
      .sidebar.open { left: 0; }
      main { padding: 1.5rem; }
      .page-header h1 { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${webbook.metadata.title}</div>
  </div>
  
  <div class="container">
    <aside class="sidebar" id="sidebar">
      ${sidebarHTML}
    </aside>
    
    <main>
      ${modulesHTML}
    </main>
  </div>
  
  <script>
    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      
      const page = document.getElementById(pageId);
      if (page) {
        page.classList.add('active');
        const link = document.querySelector('[onclick*="' + pageId + '"]');
        if (link) link.classList.add('active');
        window.scrollTo(0, 0);
      }
    }
  </script>
</body>
</html>`;
}

export default App;="text-2xl text-blue-200 mb-4 font-bold text-center">Professional Webbook Creator</p>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed text-center max-w-2xl mx-auto">
              Twórz profesjonalne webbooki z lekcjami, audio, wideo, kartami pracy i quizami.<br/>
              Eksport do HTML • Pełna responsywność • Unlimited możliwości
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-12">
              <button
                onClick={() => setCurrentView('builder')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 transition-all text-center group"
              >
                <Plus size={48} className="mx-auto mb-4 text-green-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Nowy Projekt</h3>
                <p className="text-sm text-slate-400">Zacznij od zera</p>
              </button>
              
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 rounded-2xl p-8 transition-all text-center group"
              >
                <Sparkles size={48} className="mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Szablon</h3>
                <p className="text-sm text-slate-400">Gotowe struktury</p>
              </button>
              
              <button
                onClick={() => projectInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 transition-all text-center group"
              >
                <FolderOpen size={48} className="mx-auto mb-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Wczytaj</h3>
                <p className="text-sm text-slate-400">Otwórz projekt</p>
                <input
                  ref={projectInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={loadProject}
                />
              </button>
            </div>

            {showTemplates && (
              <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-black/20 rounded-2xl">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setWebbook({ ...webbook, modules: template.modules });
                      setCurrentView('builder');
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-6 text-left transition-all"
                  >
                    <h4 className="font-bold text-white mb-2">{template.name}</h4>
                    <p className="text-xs text-slate-400">{template.description}</p>
                    <div className="mt-3 text-xs text-blue-300">
                      {template.modules.length} modułów • {template.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lekcji
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4 text-left">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-white/10">
                <Layout size={24} className="text-blue-400 mb-2" />
                <p className="text-xs text-white font-bold">Moduły & Lekcje</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-white/10">
                <Play size={24} className="text-green-400 mb-2" />
                <p className="text-xs text-white font-bold">Audio & Video</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-white/10">
                <FileText size={24} className="text-amber-400 mb-2" />
                <p className="text-xs text-white font-bold">Karty & Quizy</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl p-4 border border-white/10">
                <Download size={24} className="text-pink-400 mb-2" />
                <p className="text-xs text-white font-bold">Export HTML</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================
  
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setCurrentView('builder')}
              className="px-4 py-2 bg-white rounded-lg font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <ChevronRight size={20} className="rotate-180" />
              Powrót
            </button>
            <h1 className="text-3xl font-black">Ustawienia Projektu</h1>
            <div className="w-24"></div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <Palette size={24} />
              Kolory & Branding
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Kolor Główny</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={webbook.branding.primaryColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, primaryColor: e.target.value }
                    })}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={webbook.branding.primaryColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, primaryColor: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Kolor Pomocniczy</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={webbook.branding.secondaryColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, secondaryColor: e.target.value }
                    })}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={webbook.branding.secondaryColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, secondaryColor: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Kolor Akcentu</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={webbook.branding.accentColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, accentColor: e.target.value }
                    })}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={webbook.branding.accentColor}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      branding: { ...webbook.branding, accentColor: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-xl">
              <p className="text-sm font-bold mb-4">Podgląd kolorów:</p>
              <div className="flex gap-4">
                <div className="flex-1 h-20 rounded-xl" style={{ backgroundColor: webbook.branding.primaryColor }}></div>
                <div className="flex-1 h-20 rounded-xl" style={{ backgroundColor: webbook.branding.secondaryColor }}></div>
                <div className="flex-1 h-20 rounded-xl" style={{ backgroundColor: webbook.branding.accentColor }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <FileJson size={24} />
              Projekt
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={saveProject}
                className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Save size={20} />
                Zapisz Projekt (.json)
              </button>
              
              <p className="text-sm text-slate-600 text-center">
                Zapisz projekt aby móc go później wczytać i kontynuować pracę
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // BUILDER
  // ============================================================================
  
  if (currentView === 'builder') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('start')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{webbook.metadata.title}</h1>
                <p className="text-sm text-slate-500">
                  {webbook.modules.length} modułów • {webbook.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lekcji
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('settings')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                <Settings size={20} />
                Ustawienia
              </button>
              <button
                onClick={() => setCurrentView('preview')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                <Eye size={20} />
                Podgląd
              </button>
              <button
                onClick={async () => {
                  setIsGenerating(true);
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  const html = generateWebbook(webbook);
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${webbook.metadata.title.replace(/\s+/g, '-').toLowerCase()}.html`;
                  a.click();
                  setIsGenerating(false);
                }}
                disabled={isGenerating}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generuję...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Eksport HTML
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-80 bg-white border-r border-slate-200 h-[calc(100vh-73px)] overflow-y-auto">
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">
                  Dane Webbooka
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tytuł webbooka"
                    value={webbook.metadata.title}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      metadata: { ...webbook.metadata, title: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Podtytuł"
                    value={webbook.metadata.subtitle}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      metadata: { ...webbook.metadata, subtitle: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Autor"
                    value={webbook.metadata.author}
                    onChange={(e) => setWebbook({
                      ...webbook,
                      metadata: { ...webbook.metadata, author: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Moduły
                  </h3>
                  <button
                    onClick={() => {
                      setWebbook({
                        ...webbook,
                        modules: [...webbook.modules, {
                          id: Date.now().toString(),
                          title: `Moduł ${webbook.modules.length + 1}`,
                          description: '',
                          lessons: []
                        }]
                      });
                    }}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {webbook.modules.map((module, mIdx) => (
                    <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setSelectedModule(selectedModule === mIdx ? null : mIdx)}
                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left flex justify-between items-center transition-all"
                      >
                        <span className="font-bold text-sm">{module.title}</span>
                        <span className="text-xs text-slate-500">{module.lessons.length} lekcji</span>
                      </button>
                      
                      {selectedModule === mIdx && (
                        <div className="p-3 bg-white space-y-2">
                          {module.lessons.map((lesson, lIdx) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lIdx)}
                              className={`w-full px-3 py-2 text-left rounded-lg text-sm transition-all ${
                                selectedLesson === lIdx 
                                  ? 'bg-blue-50 text-blue-700 font-bold' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              {lesson.title}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              const newModules = [...webbook.modules];
                              newModules[mIdx].lessons.push({
                                id: Date.now().toString(),
                                title: `Lekcja ${module.lessons.length + 1}`,
                                subtitle: '',
                                content: '',
                                multimedia: {}
                              });
                              setWebbook({ ...webbook, modules: newModules });
                            }}
                            className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                          >
                            + Dodaj Lekcję
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
            {selectedModule !== null && selectedLesson !== null ? (
              <LessonEditor
                lesson={webbook.modules[selectedModule].lessons[selectedLesson]}
                onChange={(updated) => {
                  const newModules = [...webbook.modules];
                  newModules[selectedModule].lessons[selectedLesson] = updated;
                  setWebbook({ ...webbook, modules: newModules });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Book size={80} className="mx-auto mb-6 text-slate-300" />
                  <p className="text-xl text-slate-500 mb-2 font-bold">Wybierz lekcję z menu</p>
                  <p className="text-slate-400">lub dodaj nowy moduł/lekcję</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PREVIEW
  // ============================================================================
  
  if (currentView === 'preview') {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
          <div className="px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentView('builder')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-2"
            >
              <ChevronRight size={20} className="rotate-180" />
              Powrót
            </button>
            <h2 className="text-lg font-bold text-slate-600">Podgląd Webbooka</h2>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="mb-16 text-center border-b-4 border-slate-900 pb-12">
            <h1 className="text-6xl font-black mb-6">{webbook.metadata.title}</h1>
            <p className