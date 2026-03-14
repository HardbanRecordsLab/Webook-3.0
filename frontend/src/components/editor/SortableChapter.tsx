import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Chapter } from "../../lib/blocks";

interface SortableChapterProps {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  canDelete: boolean;
  onSelect: (index: number) => void;
  onRename: (id: string, title: string) => void;
  onEmojiChange: (id: string, emoji: string) => void;
  onDelete: (id: string) => void;
}

const SortableChapter = ({
  chapter, index, isActive, canDelete, onSelect, onRename, onEmojiChange, onDelete,
}: SortableChapterProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group/ch flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all border ${
        isActive
          ? "bg-brand-blue/12 border-brand-blue/20"
          : "hover:bg-white/[0.04] border-transparent"
      }`}
      onClick={() => onSelect(index)}
    >
      <div {...listeners} className="text-ink-3/40 shrink-0 opacity-0 group-hover/ch:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
      </div>
      
      <input 
        value={chapter.emoji || 'P'} 
        onChange={e => onEmojiChange(chapter.id, e.target.value)}
        onClick={e => e.stopPropagation()}
        className="w-5 bg-transparent border-none outline-none text-sm text-center cursor-pointer flex-shrink-0" 
        maxLength={2}
      />
      
      <input 
        value={chapter.title} 
        onChange={e => onRename(chapter.id, e.target.value)} 
        onClick={e => e.stopPropagation()}
        className={`flex-1 bg-transparent border-none outline-none text-xs font-500 min-w-0 cursor-pointer ${
          isActive ? "text-ink" : "text-ink-2"
        }`}
      />
      
      <span className="text-[9px] font-mono text-ink-3 flex-shrink-0 group-hover/ch:hidden">
        {chapter.blocks.length}
      </span>
      
      <button 
        onClick={e => { e.stopPropagation(); onDelete(chapter.id) }}
        disabled={!canDelete}
        className={`hidden group-hover/ch:flex p-0.5 flex-shrink-0 transition-colors ${
          canDelete ? "text-ink-3 hover:text-red-400" : "text-ink-3/20 cursor-not-allowed"
        }`}
      >
        <Trash2 size={10}/>
      </button>
    </div>
  );
};

export default SortableChapter;
