import { useState, useCallback } from 'react';
import { Webbook, AppView, Lesson } from '@/types/webbook';
import StartScreen from '@/components/webbook/StartScreen';
import BuilderSidebar from '@/components/webbook/BuilderSidebar';
import BuilderHeader from '@/components/webbook/BuilderHeader';
import LessonEditor from '@/components/webbook/LessonEditor';
import WebbookPreview from '@/components/webbook/WebbookPreview';
import SettingsPanel from '@/components/webbook/SettingsPanel';
import IntroPagesEditor from '@/components/webbook/IntroPagesEditor';
import { BookOpen } from 'lucide-react';

const Index = () => {
  const [view, setView] = useState<AppView>('start');
  const [webbook, setWebbook] = useState<Webbook | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showIntroPages, setShowIntroPages] = useState(false);

  const handleStart = useCallback((wb: Webbook) => {
    setWebbook(wb);
    setView('builder');
    if (wb.modules.length > 0 && wb.modules[0].lessons.length > 0) {
      setSelectedModuleId(wb.modules[0].id);
      setSelectedLessonId(wb.modules[0].lessons[0].id);
    }
  }, []);

  const handleSelectLesson = useCallback((moduleId: string, lessonId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
    setShowIntroPages(false);
  }, []);

  const handleUpdateLesson = useCallback(
    (updatedLesson: Lesson) => {
      if (!webbook) return;
      setWebbook({
        ...webbook,
        modules: webbook.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)),
        })),
      });
    },
    [webbook]
  );

  const currentLesson = webbook?.modules
    .find((m) => m.id === selectedModuleId)
    ?.lessons.find((l) => l.id === selectedLessonId);

  if (view === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (view === 'preview' && webbook) {
    return (
      <div className="h-screen flex flex-col">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <span className="text-sm font-medium text-foreground">Podgląd: {webbook.metadata.title}</span>
          <button onClick={() => setView('builder')} className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            Powrót do edytora
          </button>
        </header>
        <div className="flex-1 overflow-hidden">
          <WebbookPreview webbook={webbook} />
        </div>
      </div>
    );
  }

  if (view === 'builder' && webbook) {
    return (
      <div className="h-screen flex flex-col">
        <BuilderHeader webbook={webbook} onPreview={() => setView('preview')} onBack={() => setView('start')} />
        <div className="flex flex-1 overflow-hidden">
          <BuilderSidebar
            webbook={webbook}
            selectedModuleId={selectedModuleId}
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
            onUpdateWebbook={setWebbook}
            onOpenSettings={() => setShowSettings(true)}
            onOpenIntroPages={() => { setShowIntroPages(true); setSelectedLessonId(null); }}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            {showIntroPages && webbook.introPages ? (
              <IntroPagesEditor
                introPages={webbook.introPages}
                onUpdate={(pages) => setWebbook({ ...webbook, introPages: pages })}
                courseTopic={webbook.metadata.title}
              />
            ) : currentLesson ? (
              <LessonEditor lesson={currentLesson} onUpdate={handleUpdateLesson} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-serif">Wybierz lekcję z panelu bocznego</p>
                  <p className="text-sm mt-1">lub dodaj nowy moduł aby rozpocząć</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {showSettings && (
          <SettingsPanel webbook={webbook} onUpdate={setWebbook} onClose={() => setShowSettings(false)} />
        )}
      </div>
    );
  }

  return null;
};

export default Index;
