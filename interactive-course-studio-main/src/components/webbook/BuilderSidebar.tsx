import { Plus, Trash2, ChevronRight, Book, Settings, FileText } from 'lucide-react';
import { Webbook, createModule, createLesson } from '@/types/webbook';
import { useState } from 'react';

interface BuilderSidebarProps {
  webbook: Webbook;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onUpdateWebbook: (webbook: Webbook) => void;
  onOpenSettings: () => void;
  onOpenIntroPages: () => void;
}

const BuilderSidebar = ({
  webbook,
  selectedModuleId,
  selectedLessonId,
  onSelectLesson,
  onUpdateWebbook,
  onOpenSettings,
  onOpenIntroPages,
}: BuilderSidebarProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(webbook.modules.map((m) => m.id))
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addModule = () => {
    const mod = createModule(`Moduł ${webbook.modules.length + 1}`);
    const updated = { ...webbook, modules: [...webbook.modules, mod] };
    onUpdateWebbook(updated);
    setExpandedModules((prev) => new Set(prev).add(mod.id));
    onSelectLesson(mod.id, mod.lessons[0].id);
  };

  const addLesson = (moduleId: string) => {
    const mod = webbook.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const lesson = createLesson(`Lekcja ${mod.lessons.length + 1}`);
    const updated = {
      ...webbook,
      modules: webbook.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
      ),
    };
    onUpdateWebbook(updated);
    onSelectLesson(moduleId, lesson.id);
  };

  const deleteModule = (moduleId: string) => {
    onUpdateWebbook({ ...webbook, modules: webbook.modules.filter((m) => m.id !== moduleId) });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    onUpdateWebbook({
      ...webbook,
      modules: webbook.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      ),
    });
  };

  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <Book className="w-5 h-5 text-sidebar-primary" />
          <span className="font-serif font-bold text-sidebar-accent-foreground text-lg truncate">
            {webbook.metadata.title || 'Nowy Webbook'}
          </span>
        </div>
        <p className="text-xs text-sidebar-foreground truncate">{webbook.metadata.author || 'Autor'}</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {/* Intro Pages button */}
        <button
          onClick={onOpenIntroPages}
          className="flex items-center gap-2 w-full px-2 py-2 mb-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
        >
          <FileText className="w-4 h-4 text-sidebar-primary" />
          <span className="text-sidebar-accent-foreground font-medium">Strony Wstępne</span>
        </button>

        {webbook.modules.map((mod) => (
          <div key={mod.id} className="mb-1">
            <div className="flex items-center gap-1 px-2 py-2 rounded-md hover:bg-sidebar-accent cursor-pointer group" onClick={() => toggleModule(mod.id)}>
              <ChevronRight className={`w-4 h-4 text-sidebar-foreground transition-transform ${expandedModules.has(mod.id) ? 'rotate-90' : ''}`} />
              <span className="flex-1 text-sm font-medium text-sidebar-accent-foreground truncate">{mod.title}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
            {expandedModules.has(mod.id) && (
              <div className="ml-4 border-l border-sidebar-border pl-2">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group text-sm transition-colors ${
                      selectedLessonId === lesson.id ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'hover:bg-sidebar-accent text-sidebar-foreground'
                    }`}
                    onClick={() => onSelectLesson(mod.id, lesson.id)}
                  >
                    <span className="flex-1 truncate">{lesson.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteLesson(mod.id, lesson.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addLesson(mod.id)} className="flex items-center gap-1 px-2 py-1.5 text-xs text-sidebar-foreground hover:text-sidebar-primary transition-colors w-full">
                  <Plus className="w-3 h-3" /> Dodaj lekcję
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button onClick={addModule} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md bg-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/30 transition-colors">
          <Plus className="w-4 h-4" /> Dodaj Moduł
        </button>
        <button onClick={onOpenSettings} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          <Settings className="w-4 h-4" /> Ustawienia
        </button>
      </div>
    </aside>
  );
};

export default BuilderSidebar;
