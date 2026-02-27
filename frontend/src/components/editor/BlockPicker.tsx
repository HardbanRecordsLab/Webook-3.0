import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { BLOCK_META, BLOCK_GROUPS, type BlockType } from '../../lib/blocks'

interface BlockPickerProps {
  onSelect: (type: BlockType) => void
  onClose: () => void
  position?: { top: number; left: number }
}

export default function BlockPicker({ onSelect, onClose, position }: BlockPickerProps) {
  const [q, setQ] = useState('')
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const entries = Object.entries(BLOCK_META) as [BlockType, typeof BLOCK_META[BlockType]][]
  const filtered = entries.filter(([, m]) => {
    if (activeGroup && m.group !== activeGroup) return false
    if (!q) return true
    return m.label.toLowerCase().includes(q.toLowerCase()) ||
           m.group.toLowerCase().includes(q.toLowerCase()) ||
           (m.shortcut || '').includes(q.toLowerCase())
  })

  const groups = activeGroup ? [activeGroup] : BLOCK_GROUPS

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        style={position ? { position: 'fixed', top: position.top, left: position.left, zIndex: 1000 } : { position: 'relative' }}
        className="w-72 bg-surface-2 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
          <Search size={13} className="text-ink-3 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            placeholder="Szukaj bloku lub wpisz /..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && filtered.length > 0) {
                onSelect(filtered[0][0])
                onClose()
              }
            }}
          />
        </div>

        {/* Groups filter */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-600 whitespace-nowrap transition-all
              ${!activeGroup ? 'bg-brand-blue/20 text-brand-light border border-brand-blue/30' : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.05]'}`}
          >
            Wszystkie
          </button>
          {BLOCK_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-600 whitespace-nowrap transition-all
                ${activeGroup === g ? 'bg-brand-blue/20 text-brand-light border border-brand-blue/30' : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.05]'}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Block list */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-3">
          {groups.map(group => {
            const groupBlocks = filtered.filter(([, m]) => m.group === group)
            if (groupBlocks.length === 0) return null
            return (
              <div key={group}>
                {!activeGroup && (
                  <div className="px-2 py-1 text-[10px] font-mono text-ink-3 tracking-widest uppercase">{group}</div>
                )}
                <div className="grid grid-cols-2 gap-1">
                  {groupBlocks.map(([type, meta]) => (
                    <button
                      key={type}
                      onClick={() => { onSelect(type); onClose() }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-left
                                 hover:bg-white/[0.06] transition-all duration-100 group"
                    >
                      <span
                        className="text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-700"
                        style={{ color: meta.color, background: `${meta.color}18` }}
                      >
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-600 text-ink group-hover:text-white truncate">{meta.label}</div>
                        {meta.shortcut && (
                          <div className="text-[9px] font-mono text-ink-3">{meta.shortcut}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-ink-3 text-sm">Brak wyników dla "{q}"</div>
          )}
        </div>

        <div className="border-t border-white/[0.04] px-3 py-2 text-[10px] text-ink-3 flex items-center gap-3">
          <span>↑↓ nawigacja</span>
          <span>↵ wstaw</span>
          <span>Esc zamknij</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
