import { Plus, BookOpen, Settings, Layout, Layers, FileText, ChevronRight, ChevronDown, Trash2, Wand2 } from 'lucide-react';
import { Webbook, Module, Lesson } from '@/types/webbook';
import { useState } from 'react';
import { createModule, createLesson } from '@/types/webbook';
import { cn } from '@/lib/utils';

interface BuilderSidebarProps {
  webbook: Webbook;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onUpdateWebbook: (webbook: Webbook) => void;
  onOpenSettings: () => void;
  onOpenIntroPages: () => void;
  onOpenTools: () => void;
}

const BuilderSidebar = ({
  webbook,
  selectedModuleId,
  selectedLessonId,
  onSelectLesson,
  onUpdateWebbook,
  onOpenSettings,
  onOpenIntroPages,
  onOpenTools
}: BuilderSidebarProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    webbook.modules.map(m => m.id)
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAddModule = () => {
    const newModule = createModule(`Moduł ${webbook.modules.length + 1}`);
    onUpdateWebbook({
      ...webbook,
      modules: [...webbook.modules, newModule],
    });
    setExpandedModules(prev => [...prev, newModule.id]);
  };

  const handleAddLesson = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateWebbook({
      ...webbook,
      modules: webbook.modules.map(m => {
        if (m.id === moduleId) {
          const newLesson = createLesson(`Lekcja ${m.lessons.length + 1}`);
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      }),
    });
  };

  const handleDeleteModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten moduł i wszystkie jego lekcje?')) {
      onUpdateWebbook({
        ...webbook,
        modules: webbook.modules.filter(m => m.id !== moduleId),
      });
    }
  };

  return (
    <div className="w-80 border-r border-border bg-sidebar flex flex-col h-full text-sidebar-foreground">
      {/* Branding Header */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center gap-3 mb-1">
           <img src="/logo.png" alt="Logo" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
           <span className="font-bold text-lg text-sidebar-primary-foreground tracking-tight">Studio</span>
        </div>
        <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wider font-semibold pl-1">
          Edytor Kursu
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-3 border-b border-sidebar-border space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
        >
          <Settings className="w-4 h-4" />
          Ustawienia Kursu
        </button>
        <button
          onClick={onOpenIntroPages}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
        >
          <BookOpen className="w-4 h-4" />
          Strony Wstępne
        </button>
        <button
          onClick={onOpenTools}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left text-blue-400 hover:text-blue-300"
        >
          <Wand2 className="w-4 h-4" />
          Narzędzia AI
        </button>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Struktura Kursu
          </span>
          <button
            onClick={handleAddModule}
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
            title="Dodaj moduł"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {webbook.modules.map((module, mIndex) => (
            <div key={module.id} className="space-y-1">
              {/* Module Header */}
              <div
                className={cn(
                  "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                  selectedModuleId === module.id && !selectedLessonId 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
                onClick={() => toggleModule(module.id)}
              >
                <button className="p-0.5 rounded-sm hover:bg-white/10">
                  {expandedModules.includes(module.id) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                <div className="flex-1 min-w-0 font-medium text-sm truncate">
                  <span className="text-sidebar-foreground/50 mr-2 text-xs">M{mIndex + 1}</span>
                  {module.title}
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleAddLesson(module.id, e)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Dodaj lekcję"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteModule(module.id, e)}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                    title="Usuń moduł"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              {expandedModules.includes(module.id) && (
                <div className="ml-4 space-y-0.5 border-l border-sidebar-border/50 pl-2">
                  {module.lessons.map((lesson, lIndex) => (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(module.id, lesson.id)}
                      className={cn(
                        "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-all border border-transparent",
                        selectedLessonId === lesson.id
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <FileText className={cn("w-3 h-3 shrink-0", selectedLessonId === lesson.id ? "text-white" : "text-sidebar-foreground/40")} />
                      <span className="truncate flex-1">
                        <span className="opacity-50 mr-1.5 text-xs">{lIndex + 1}.</span>
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                  {module.lessons.length === 0 && (
                    <div className="px-2 py-2 text-xs text-sidebar-foreground/40 italic">
                      Brak lekcji
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Stats */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
        <div className="flex items-center justify-between text-xs text-sidebar-foreground/60">
          <span>Moduły: {webbook.modules.length}</span>
          <span>Lekcje: {webbook.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default BuilderSidebar;
