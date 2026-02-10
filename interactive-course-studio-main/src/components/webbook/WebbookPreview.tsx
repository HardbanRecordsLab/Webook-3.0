import { useState } from 'react';
import { Webbook } from '@/types/webbook';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WebbookPreviewProps {
  webbook: Webbook;
}

const WebbookPreview = ({ webbook }: WebbookPreviewProps) => {
  const { introPages } = webbook;

  // Build all viewable pages
  type PageItem = { id: string; title: string; section: string; type: 'intro' | 'lesson'; content: React.ReactNode };
  const pages: PageItem[] = [];

  // Intro pages
  if (introPages?.aboutAuthor) pages.push({ id: 'intro-about', title: 'O Autorze', section: 'Wstęp', type: 'intro', content: <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{introPages.aboutAuthor}</div> });
  if (introPages?.copyright) pages.push({ id: 'intro-copyright', title: 'Prawa Autorskie', section: 'Wstęp', type: 'intro', content: <div className="p-4 rounded-lg bg-warning/10 border-l-4 border-warning text-foreground/80 whitespace-pre-wrap">{introPages.copyright}</div> });
  if (introPages?.disclaimer) pages.push({ id: 'intro-disclaimer', title: 'Zastrzeżenia', section: 'Wstęp', type: 'intro', content: <div className="p-4 rounded-lg bg-destructive/10 border-l-4 border-destructive text-foreground/80 whitespace-pre-wrap">{introPages.disclaimer}</div> });
  if (introPages?.forWhom) pages.push({ id: 'intro-forwhom', title: 'Dla Kogo', section: 'Wstęp', type: 'intro', content: <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{introPages.forWhom}</div> });
  if (introPages?.howToUse) pages.push({ id: 'intro-howtouse', title: 'Jak Korzystać', section: 'Wstęp', type: 'intro', content: <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{introPages.howToUse}</div> });

  // Lesson pages
  webbook.modules.forEach((mod) => {
    mod.lessons.forEach((lesson) => {
      pages.push({ id: lesson.id, title: lesson.title, section: mod.title, type: 'lesson', content: null });
    });
  });

  const allLessons = webbook.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleName: m.title })));
  const [currentIndex, setCurrentIndex] = useState(0);
  const { primaryColor, secondaryColor } = webbook.branding;

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  };

  if (pages.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground"><p>Dodaj moduły i lekcje, aby zobaczyć podgląd.</p></div>;
  }

  const currentPage = pages[currentIndex];
  const lessonIndex = currentPage?.type === 'lesson' ? allLessons.findIndex((l) => l.id === currentPage.id) : -1;
  const currentLesson = lessonIndex >= 0 ? allLessons[lessonIndex] : null;
  const lessonCount = allLessons.length;
  const lessonProgress = lessonCount > 0 && lessonIndex >= 0 ? ((lessonIndex + 1) / lessonCount) * 100 : 0;

  return (
    <div className="flex h-full bg-background" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border overflow-y-auto scrollbar-thin flex-shrink-0">
        <div className="p-4 border-b border-border" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
          <h3 className="font-bold text-sm" style={{ color: 'white' }}>{webbook.metadata.title || 'Webbook'}</h3>
        </div>

        {/* Group pages by section */}
        {(() => {
          const sections: { name: string; items: typeof pages }[] = [];
          pages.forEach((p) => {
            const last = sections[sections.length - 1];
            if (last && last.name === p.section) last.items.push(p);
            else sections.push({ name: p.section, items: [p] });
          });
          return sections.map((sec) => (
            <div key={sec.name} className="py-2">
              <div className="px-4 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>{sec.name}</div>
              {sec.items.map((p) => {
                const idx = pages.findIndex((pg) => pg.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`block w-full text-left px-4 py-2 text-sm border-l-[3px] transition-colors ${
                      idx === currentIndex ? 'bg-muted font-semibold' : 'border-transparent text-muted-foreground hover:bg-muted/50'
                    }`}
                    style={idx === currentIndex ? { borderLeftColor: primaryColor, color: primaryColor } : {}}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          ));
        })()}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto p-8">
          {/* Progress for lessons */}
          {currentPage.type === 'lesson' && lessonCount > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground mb-1">
                Postęp: {lessonIndex + 1} z {lessonCount} ({Math.round(lessonProgress)}%)
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${lessonProgress}%`, background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
              </div>
            </div>
          )}

          <div className="border-b border-border pb-4 mb-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{currentPage.section}</div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{currentPage.title}</h1>
            {currentLesson?.subtitle && <p className="text-lg text-muted-foreground mt-1">{currentLesson.subtitle}</p>}
          </div>

          {/* Intro page content */}
          {currentPage.type === 'intro' && currentPage.content}

          {/* Lesson content */}
          {currentLesson && (
            <>
              {currentLesson.content && <div className="mb-8 text-foreground/80 leading-relaxed whitespace-pre-wrap">{currentLesson.content}</div>}

              {/* Images */}
              {currentLesson.multimedia.images && currentLesson.multimedia.images.length > 0 && (
                <div className="mb-8 space-y-4">
                  {currentLesson.multimedia.images.map((img) => (
                    <div key={img.id} className="text-center">
                      <img src={img.url} alt={img.name} className="max-w-full rounded-lg shadow-md mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2 italic">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio */}
              {currentLesson.multimedia.audio && (
                <div className="mb-8 p-4 rounded-lg border bg-muted/30">
                  <p className="font-semibold text-sm mb-2" style={{ color: primaryColor }}>🎧 {currentLesson.multimedia.audio.name}</p>
                  <audio controls className="w-full">
                    <source src={currentLesson.multimedia.audio.url} type={currentLesson.multimedia.audio.type} />
                  </audio>
                </div>
              )}

              {/* Video */}
              {currentLesson.multimedia.video && getYoutubeId(currentLesson.multimedia.video) && (
                <div className="mb-8 rounded-lg overflow-hidden bg-foreground/5 aspect-video">
                  <iframe src={`https://www.youtube.com/embed/${getYoutubeId(currentLesson.multimedia.video)}`} className="w-full h-full" allowFullScreen />
                </div>
              )}

              {/* Worksheet */}
              {currentLesson.worksheet && currentLesson.worksheet.questions.length > 0 && (
                <div className="mb-8 p-6 rounded-lg border-2 border-border bg-card">
                  <h3 className="text-lg font-bold text-foreground mb-4">📋 {currentLesson.worksheet.title}</h3>
                  <div className="space-y-4">
                    {currentLesson.worksheet.questions.map((q) => (
                      <div key={q.id}>
                        <label className="block text-sm font-semibold text-foreground mb-2">{q.question}</label>
                        {q.type === 'textarea' ? (
                          <textarea className="w-full p-3 rounded-lg border border-input bg-background text-foreground min-h-[100px] resize-y text-sm" placeholder="Wpisz odpowiedź..." />
                        ) : (
                          <input className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Wpisz odpowiedź..." />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz */}
              {currentLesson.quiz && currentLesson.quiz.questions.length > 0 && (
                <div className="mb-8 p-6 rounded-lg border-2 border-border bg-card">
                  <h3 className="text-lg font-bold text-foreground mb-4">❓ {currentLesson.quiz.title}</h3>
                  <div className="space-y-6">
                    {currentLesson.quiz.questions.map((q, qi) => (
                      <div key={q.id} className="pb-4 border-b border-border last:border-0">
                        <p className="font-semibold text-sm text-foreground mb-3">{qi + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-sm text-foreground">
                              <input type="radio" name={`preview-q-${q.id}`} className="accent-primary" />
                              {opt.text}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentIndex > 0 && (
              <button onClick={() => setCurrentIndex((i) => i - 1)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted">
                <ArrowLeft className="w-4 h-4" /> Wstecz
              </button>
            )}
            {currentIndex < pages.length - 1 && (
              <button onClick={() => setCurrentIndex((i) => i + 1)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: primaryColor, color: 'white' }}>
                Dalej <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebbookPreview;
