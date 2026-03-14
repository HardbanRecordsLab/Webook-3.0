import { Button } from "../AppShell"; // Assuming AppShell has generic buttons or similar UI
import { Plus, BookOpen } from "lucide-react";
import type { Chapter } from "../../lib/blocks";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableChapter from "./SortableChapter";

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterIdx: number;
  onSelectChapter: (index: number) => void;
  onAddChapter: () => void;
  onRenameChapter: (id: string, title: string) => void;
  onEmojiChange: (id: string, emoji: string) => void;
  onDeleteChapter: (id: string) => void;
  onReorderChapters: (chapters: Chapter[]) => void;
}

const ChapterSidebar = ({
  chapters, activeChapterIdx, onSelectChapter, onAddChapter, onRenameChapter, onEmojiChange, onDeleteChapter, onReorderChapters,
}: ChapterSidebarProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = chapters.findIndex((c) => c.id === active.id);
    const newIdx = chapters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(chapters, oldIdx, newIdx);
    onReorderChapters(reordered);
  };

  const activeChapterId = chapters[activeChapterIdx]?.id;

  return (
    <div className="flex-shrink-0 bg-surface-1 border-r border-white/[0.06] flex flex-col overflow-hidden w-full h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04] flex-shrink-0">
        <span className="text-[9px] font-mono text-ink-3 tracking-widest uppercase flex items-center gap-2">
          <BookOpen size={10} className="text-brand-blue" />
          Rozdziały
        </span>
        <button onClick={onAddChapter} className="block-action-btn hover:text-brand-gold transition-colors">
          <Plus size={11}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/[0.05]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {chapters.map((chapter, idx) => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                index={idx}
                isActive={chapter.id === activeChapterId}
                canDelete={chapters.length > 1}
                onSelect={onSelectChapter}
                onRename={onRenameChapter}
                onEmojiChange={onEmojiChange}
                onDelete={onDeleteChapter}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-2 border-t border-white/[0.04] space-y-1 flex-shrink-0 bg-surface-1/50 backdrop-blur-sm">
        <div className="text-[9px] font-mono text-ink-3 px-2 mb-1.5">
          {chapters.length} rozdz. • {chapters.reduce((acc, ch) => acc + ch.blocks.length, 0)} bloków
        </div>
        <button onClick={onAddChapter} className="w-full btn-ghost py-1.5 text-[11px] justify-center border border-dashed border-white/[0.1] hover:border-brand-blue/30 transition-all">
          <Plus size={11}/> Dodaj rozdział
        </button>
      </div>
    </div>
  );
};

export default ChapterSidebar;
