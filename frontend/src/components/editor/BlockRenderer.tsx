import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Trash2, Star, GripVertical } from 'lucide-react'
import type { Block, QuizOption } from '../lib/blocks'
import { uid } from '../lib/blocks'

interface BlockRendererProps {
  block: Block
  onChange: (id: string, content: string, props?: Record<string, unknown>) => void
  isSelected?: boolean
}

export default function BlockRenderer({ block, onChange, isSelected }: BlockRendererProps) {
  const set = (content: string, props?: Record<string, unknown>) => onChange(block.id, content, props)
  const setProps = (p: Record<string, unknown>) => onChange(block.id, block.content, { ...block.props, ...p })

  switch (block.type) {
    // ── HEADINGS ──────────────────────────────────────────
    case 'h1':
      return (
        <input
          className="w-full bg-transparent outline-none font-display font-800 text-3xl md:text-4xl text-ink
                     placeholder:text-ink-3/40 border-none caret-brand-gold"
          placeholder="Nagłówek 1..."
          value={block.content}
          onChange={e => set(e.target.value)}
        />
      )
    case 'h2':
      return (
        <input
          className="w-full bg-transparent outline-none font-display font-700 text-2xl md:text-3xl text-ink
                     placeholder:text-ink-3/40 border-none caret-brand-gold"
          placeholder="Nagłówek 2..."
          value={block.content}
          onChange={e => set(e.target.value)}
        />
      )
    case 'h3':
      return (
        <input
          className="w-full bg-transparent outline-none font-display font-600 text-xl text-ink/90
                     placeholder:text-ink-3/40 border-none caret-brand-gold"
          placeholder="Nagłówek 3..."
          value={block.content}
          onChange={e => set(e.target.value)}
        />
      )

    // ── PARAGRAPH ─────────────────────────────────────────
    case 'paragraph':
      return (
        <AutoTextarea
          className="w-full bg-transparent outline-none text-base text-ink-2 leading-relaxed
                     placeholder:text-ink-3/40 border-none resize-none caret-brand-gold"
          placeholder="Zacznij pisać... (użyj / by wstawić blok)"
          value={block.content}
          onChange={v => set(v)}
        />
      )

    // ── QUOTE ─────────────────────────────────────────────
    case 'quote':
      return (
        <div className="flex gap-4">
          <div className="w-1 flex-shrink-0 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
          <div className="flex-1">
            <AutoTextarea
              className="w-full bg-transparent outline-none text-lg italic text-ink-2 leading-relaxed
                         placeholder:text-ink-3/40 border-none resize-none caret-brand-gold"
              placeholder="Cytat lub ważna myśl..."
              value={block.content}
              onChange={v => set(v)}
            />
          </div>
        </div>
      )

    // ── CALLOUT ───────────────────────────────────────────
    case 'callout': {
      const colors: Record<string, string> = {
        amber: 'from-amber-500/10 border-amber-400/30 text-amber-300',
        blue:  'from-blue-500/10 border-blue-400/30 text-blue-300',
        green: 'from-emerald-500/10 border-emerald-400/30 text-emerald-300',
        red:   'from-red-500/10 border-red-400/30 text-red-300',
        purple:'from-violet-500/10 border-violet-400/30 text-violet-300',
      }
      const c = (block.props?.color as string) || 'amber'
      const icon = (block.props?.icon as string) || '💡'
      return (
        <div className={`flex gap-3 p-4 rounded-xl bg-gradient-to-r ${colors[c]} border`}>
          <span className="text-xl flex-shrink-0">{icon}</span>
          <AutoTextarea
            className="w-full bg-transparent outline-none text-sm text-ink-2 leading-relaxed
                       placeholder:text-ink-3/40 border-none resize-none caret-brand-gold"
            placeholder="Ważna wskazówka..."
            value={block.content}
            onChange={v => set(v)}
          />
        </div>
      )
    }

    // ── NOTE ──────────────────────────────────────────────
    case 'note': {
      const icon = (block.props?.icon as string) || '📌'
      return (
        <div className="flex gap-3 p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/20">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <AutoTextarea
            className="w-full bg-transparent outline-none text-sm text-ink-2 leading-relaxed
                       placeholder:text-ink-3/40 border-none resize-none caret-brand-gold"
            placeholder="Notatka marginalna..."
            value={block.content}
            onChange={v => set(v)}
          />
        </div>
      )
    }

    // ── CODEBLOCK ─────────────────────────────────────────
    case 'codeblock': {
      const lang = (block.props?.language as string) || 'javascript'
      return (
        <div className="rounded-xl overflow-hidden border border-white/[0.08]">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-4 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <select
              value={lang}
              onChange={e => setProps({ language: e.target.value })}
              className="bg-transparent border-none outline-none text-xs font-mono text-ink-3 cursor-pointer"
            >
              {['javascript','typescript','python','html','css','sql','bash','json','markdown'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            value={block.content}
            onChange={e => set(e.target.value)}
            placeholder="// Wklej lub wpisz kod..."
            className="w-full bg-[#0a0f1a] text-green-400 font-mono text-sm p-4 outline-none
                       border-none resize-none min-h-[120px] leading-relaxed"
            spellCheck={false}
          />
        </div>
      )
    }

    // ── IMAGE ─────────────────────────────────────────────
    case 'image':
      return (
        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
          <input
            className="w-full bg-surface-3 border-b border-white/[0.06] outline-none text-xs text-ink-2
                       px-4 py-2.5 placeholder:text-ink-3"
            placeholder="URL obrazu (https://...)..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          {block.content ? (
            <img src={block.content} alt="" className="w-full max-h-80 object-cover"
                 onError={e => { e.currentTarget.src = ''; e.currentTarget.style.display='none' }} />
          ) : (
            <div className="h-32 flex items-center justify-center bg-surface-3 text-ink-3 text-sm gap-2">
              🖼 Wklej URL obrazu powyżej
            </div>
          )}
          <input
            className="w-full bg-surface-3 border-t border-white/[0.06] outline-none text-xs text-ink-3
                       px-4 py-2 placeholder:text-ink-3 italic"
            placeholder="Opis obrazu (alt text)..."
            value={(block.props?.alt as string) || ''}
            onChange={e => setProps({ alt: e.target.value })}
          />
        </div>
      )

    // ── VIDEO ─────────────────────────────────────────────
    case 'video': {
      const getEmbed = (url: string) => {
        const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
        const vm = url.match(/vimeo\.com\/(\d+)/)
        if (vm) return `https://player.vimeo.com/video/${vm[1]}`
        return url
      }
      return (
        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
          <input
            className="w-full bg-surface-3 border-b border-white/[0.06] outline-none text-xs text-ink-2
                       px-4 py-2.5 placeholder:text-ink-3"
            placeholder="URL YouTube lub Vimeo..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          {block.content ? (
            <iframe src={getEmbed(block.content)} className="w-full aspect-video border-none" allowFullScreen />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-surface-3 text-ink-3 text-sm gap-2">
              ▶ Wklej link do wideo (YouTube, Vimeo)
            </div>
          )}
        </div>
      )
    }

    // ── AUDIO ─────────────────────────────────────────────
    case 'audio':
      return (
        <div className="p-4 rounded-xl bg-surface-3 border border-white/[0.06] flex flex-col gap-3">
          <input
            className="w-full bg-surface-4 border border-white/[0.06] rounded-lg outline-none text-xs text-ink-2
                       px-3 py-2 placeholder:text-ink-3"
            placeholder="URL pliku audio (.mp3, .ogg, .wav)..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          {block.content && (
            <audio controls className="w-full" style={{ filter: 'hue-rotate(180deg) brightness(0.9)' }}>
              <source src={block.content} />
            </audio>
          )}
          {!block.content && (
            <div className="flex items-center gap-3 text-sm text-ink-3">
              🎙 Wklej URL audio lub nagraj przez mikrofon (v4.1)
            </div>
          )}
        </div>
      )

    // ── EMBED ─────────────────────────────────────────────
    case 'embed':
      return (
        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
          <input
            className="w-full bg-surface-3 border-b border-white/[0.06] outline-none text-xs text-ink-2
                       px-4 py-2.5 placeholder:text-ink-3"
            placeholder="URL do osadzenia (Figma, Miro, Airtable, Google Maps...)..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          {block.content ? (
            <iframe src={block.content} className="w-full h-96 border-none" sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="h-32 flex items-center justify-center bg-surface-3 text-ink-3 text-sm">
              🔗 Wklej URL (Figma, Miro, Loom, Typeform...)
            </div>
          )}
        </div>
      )

    // ── DIVIDER ───────────────────────────────────────────
    case 'divider':
      return (
        <div className="py-4 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="text-ink-3 text-sm">✦</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )

    // ── SPACER ────────────────────────────────────────────
    case 'spacer': {
      const h = (block.props?.height as number) || 40
      return (
        <div className="relative flex items-center justify-center group/sp" style={{ height: h }}>
          <div className="absolute inset-0 border-2 border-dashed border-white/[0.04] rounded-lg opacity-0 group-hover/sp:opacity-100 transition-opacity" />
          <div className="opacity-0 group-hover/sp:opacity-100 flex gap-2 transition-opacity">
            <button onClick={() => setProps({ height: Math.max(20, h - 20) })} className="text-xs text-ink-3 hover:text-ink px-2 py-0.5 bg-surface-4 rounded">−</button>
            <span className="text-xs text-ink-3">{h}px</span>
            <button onClick={() => setProps({ height: Math.min(200, h + 20) })} className="text-xs text-ink-3 hover:text-ink px-2 py-0.5 bg-surface-4 rounded">+</button>
          </div>
        </div>
      )
    }

    // ── 2 COLUMNS ─────────────────────────────────────────
    case 'columns2': {
      const c1 = (block.props?.col1 as string) || ''
      const c2 = (block.props?.col2 as string) || ''
      return (
        <div className="grid grid-cols-2 gap-4">
          {[['col1', c1], ['col2', c2]].map(([key, val]) => (
            <div key={key} className="bg-surface-3 border border-white/[0.06] rounded-xl p-3">
              <AutoTextarea
                className="w-full bg-transparent outline-none text-sm text-ink-2 leading-relaxed
                           placeholder:text-ink-3/50 border-none resize-none"
                placeholder={`Kolumna ${key === 'col1' ? '1' : '2'}...`}
                value={val}
                onChange={v => setProps({ [key]: v })}
              />
            </div>
          ))}
        </div>
      )
    }

    // ── 3 COLUMNS ─────────────────────────────────────────
    case 'columns3': {
      return (
        <div className="grid grid-cols-3 gap-3">
          {['col1','col2','col3'].map((key, i) => (
            <div key={key} className="bg-surface-3 border border-white/[0.06] rounded-xl p-3">
              <AutoTextarea
                className="w-full bg-transparent outline-none text-sm text-ink-2 leading-relaxed
                           placeholder:text-ink-3/50 border-none resize-none"
                placeholder={`Kolumna ${i+1}...`}
                value={(block.props?.[key] as string) || ''}
                onChange={v => setProps({ [key]: v })}
              />
            </div>
          ))}
        </div>
      )
    }

    // ── QUIZ ──────────────────────────────────────────────
    case 'quiz': {
      const opts = (block.props?.options as QuizOption[]) || []
      const fb = block.props?.feedback as Record<string, string>
      return (
        <div className="bg-surface-3 border border-amber-400/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center text-sm">❓</div>
            <span className="text-xs font-mono text-amber-400/70 tracking-wider uppercase">Quiz</span>
            <div className="ml-auto flex items-center gap-1 text-xs text-ink-3">
              <Star size={10} className="text-amber-400" /> {block.props?.points as number || 1} pkt
            </div>
          </div>
          <input
            className="w-full bg-transparent outline-none font-display font-700 text-base text-ink placeholder:text-ink-3/50 border-none caret-brand-gold"
            placeholder="Pytanie quizowe?"
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          <div className="space-y-2">
            {opts.map((opt, i) => (
              <div key={opt.id} className="flex gap-2">
                <button
                  onClick={() => {
                    const newOpts = opts.map(o => ({ ...o, isCorrect: o.id === opt.id }))
                    setProps({ options: newOpts })
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all
                    ${opt.isCorrect ? 'border-emerald-400 bg-emerald-400' : 'border-ink-3 hover:border-brand-blue'}`}
                  title="Zaznacz jako poprawna"
                >
                  {opt.isCorrect && <span className="text-[8px] text-surface-0 font-800">✓</span>}
                </button>
                <div className="flex-1">
                  <input
                    className="w-full bg-surface-4 border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-ink
                               outline-none focus:border-brand-blue/40 placeholder:text-ink-3"
                    placeholder={`Odpowiedź ${['A','B','C','D'][i]}...`}
                    value={opt.text}
                    onChange={e => {
                      const newOpts = opts.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o)
                      setProps({ options: newOpts })
                    }}
                  />
                  {opt.isCorrect && (
                    <input
                      className="w-full mt-1 bg-emerald-400/5 border border-emerald-400/20 rounded-lg px-3 py-1 text-xs text-emerald-300
                                 outline-none placeholder:text-emerald-400/30"
                      placeholder="Wyjaśnienie poprawnej odpowiedzi (opcjonalne)..."
                      value={opt.explanation || ''}
                      onChange={e => {
                        const newOpts = opts.map(o => o.id === opt.id ? { ...o, explanation: e.target.value } : o)
                        setProps({ options: newOpts })
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => setProps({ options: opts.filter(o => o.id !== opt.id) })}
                  className="text-ink-3 hover:text-red-400 transition-colors mt-1 p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProps({ options: [...opts, { id: uid(), text: '', isCorrect: false }] })}
              className="text-xs text-brand-blue hover:text-brand-light flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Dodaj opcję
            </button>
            <div className="ml-auto flex items-center gap-1 text-xs text-ink-3">
              Punkty:
              <input
                type="number" min={1} max={10}
                value={block.props?.points as number || 1}
                onChange={e => setProps({ points: Number(e.target.value) })}
                className="w-12 bg-surface-4 border border-white/[0.06] rounded px-2 py-0.5 text-center outline-none text-xs"
              />
            </div>
          </div>
          {fb && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
              <input
                className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg px-2 py-1.5 text-xs text-emerald-300 outline-none placeholder:text-emerald-400/30"
                placeholder="Komunikat poprawna..."
                value={fb.correct}
                onChange={e => setProps({ feedback: { ...fb, correct: e.target.value } })}
              />
              <input
                className="bg-red-400/5 border border-red-400/20 rounded-lg px-2 py-1.5 text-xs text-red-300 outline-none placeholder:text-red-400/30"
                placeholder="Komunikat błędna..."
                value={fb.incorrect}
                onChange={e => setProps({ feedback: { ...fb, incorrect: e.target.value } })}
              />
            </div>
          )}
        </div>
      )
    }

    // ── POLL ──────────────────────────────────────────────
    case 'poll': {
      const opts = (block.props?.options as string[]) || []
      return (
        <div className="bg-surface-3 border border-emerald-400/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center text-sm">📊</div>
            <span className="text-xs font-mono text-emerald-400/70 tracking-wider uppercase">Ankieta</span>
          </div>
          <input
            className="w-full bg-transparent outline-none font-display font-700 text-base text-ink placeholder:text-ink-3/50 border-none caret-brand-gold"
            placeholder="Pytanie ankiety?"
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          <div className="space-y-2">
            {opts.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded border border-ink-3 flex-shrink-0" />
                <input
                  className="flex-1 bg-surface-4 border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-emerald-400/40 placeholder:text-ink-3"
                  placeholder={`Opcja ${i+1}...`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...opts]; newOpts[i] = e.target.value
                    setProps({ options: newOpts, votes: (block.props?.votes as number[] || []).slice(0, newOpts.length) })
                  }}
                />
                <button onClick={() => setProps({ options: opts.filter((_, j) => j !== i) })} className="text-ink-3 hover:text-red-400 p-1"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setProps({ options: [...opts, ''], votes: [...((block.props?.votes as number[]) || []), 0] })}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <Plus size={12} /> Dodaj opcję
          </button>
        </div>
      )
    }

    // ── CHECKLIST ─────────────────────────────────────────
    case 'checklist': {
      const items = (block.props?.items as { id: string; text: string; done: boolean }[]) || []
      return (
        <div className="bg-surface-3 border border-white/[0.06] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">✅</span>
            <span className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider">Checklista</span>
          </div>
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 group/ci">
              <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer
                ${item.done ? 'bg-emerald-400 border-emerald-400' : 'border-ink-3 hover:border-emerald-400'}`}
                onClick={() => {
                  const newItems = items.map(it => it.id === item.id ? { ...it, done: !it.done } : it)
                  setProps({ items: newItems })
                }}
              >
                {item.done && <span className="text-[8px] font-800 text-surface-0">✓</span>}
              </div>
              <input
                className={`flex-1 bg-transparent outline-none text-sm text-ink border-none placeholder:text-ink-3/50 ${item.done ? 'line-through text-ink-3' : ''}`}
                placeholder={`Punkt ${i+1}...`}
                value={item.text}
                onChange={e => {
                  const newItems = items.map(it => it.id === item.id ? { ...it, text: e.target.value } : it)
                  setProps({ items: newItems })
                }}
              />
              <button onClick={() => setProps({ items: items.filter(it => it.id !== item.id) })}
                className="opacity-0 group-hover/ci:opacity-100 text-ink-3 hover:text-red-400 p-1 transition-all"><Trash2 size={11} /></button>
            </div>
          ))}
          <button onClick={() => setProps({ items: [...items, { id: uid(), text: '', done: false }] })}
            className="text-xs text-brand-blue hover:text-brand-light flex items-center gap-1 mt-1">
            <Plus size={12} /> Dodaj punkt
          </button>
        </div>
      )
    }

    // ── FLASHCARDS ────────────────────────────────────────
    case 'flashcards': {
      const cards = (block.props?.cards as { id: string; front: string; back: string }[]) || []
      return (
        <div className="bg-surface-3 border border-violet-400/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🃏</span>
            <span className="text-xs font-mono text-violet-400/70 uppercase tracking-wider">Fiszki ({cards.length})</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cards.map((card, i) => (
              <div key={card.id} className="bg-surface-4 border border-white/[0.06] rounded-xl p-3 group/fc">
                <div className="flex gap-2 mb-2">
                  <div className="text-[10px] font-mono text-violet-400 pt-1.5 flex-shrink-0">#{i+1}</div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      className="bg-violet-400/5 border border-violet-400/20 rounded-lg px-2 py-1.5 text-xs text-ink outline-none placeholder:text-ink-3"
                      placeholder="Przód fiszki..."
                      value={card.front}
                      onChange={e => {
                        const nc = cards.map(c => c.id === card.id ? { ...c, front: e.target.value } : c)
                        setProps({ cards: nc })
                      }}
                    />
                    <input
                      className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg px-2 py-1.5 text-xs text-ink outline-none placeholder:text-ink-3"
                      placeholder="Tył fiszki..."
                      value={card.back}
                      onChange={e => {
                        const nc = cards.map(c => c.id === card.id ? { ...c, back: e.target.value } : c)
                        setProps({ cards: nc })
                      }}
                    />
                  </div>
                  <button onClick={() => setProps({ cards: cards.filter(c => c.id !== card.id) })}
                    className="opacity-0 group-hover/fc:opacity-100 text-ink-3 hover:text-red-400 pt-1"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setProps({ cards: [...cards, { id: uid(), front: '', back: '' }] })}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            <Plus size={12} /> Dodaj fiszkę
          </button>
        </div>
      )
    }

    // ── SORTABLE ──────────────────────────────────────────
    case 'sortable': {
      const items = (block.props?.items as { id: string; text: string; order: number }[]) || []
      return (
        <div className="bg-surface-3 border border-orange-400/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🔀</span>
            <span className="text-xs font-mono text-orange-400/70 uppercase tracking-wider">Sortowanie</span>
          </div>
          <input
            className="w-full bg-transparent outline-none text-sm font-600 text-ink placeholder:text-ink-3/50 border-none"
            placeholder="Treść polecenia sortowania..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          <div className="space-y-1.5">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2 bg-surface-4 border border-white/[0.06] rounded-lg px-3 py-2 group/si">
                <GripVertical size={14} className="text-ink-3" />
                <span className="text-xs font-mono text-orange-400 w-5">{i+1}</span>
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3"
                  placeholder={`Element ${i+1}...`}
                  value={item.text}
                  onChange={e => {
                    const ni = items.map(it => it.id === item.id ? { ...it, text: e.target.value } : it)
                    setProps({ items: ni })
                  }}
                />
                <button onClick={() => setProps({ items: items.filter(it => it.id !== item.id) })}
                  className="opacity-0 group-hover/si:opacity-100 text-ink-3 hover:text-red-400"><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setProps({ items: [...items, { id: uid(), text: '', order: items.length }] })}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
            <Plus size={12} /> Dodaj element
          </button>
        </div>
      )
    }

    // ── MATCHING ──────────────────────────────────────────
    case 'matching': {
      const pairs = (block.props?.pairs as { id: string; left: string; right: string }[]) || []
      return (
        <div className="bg-surface-3 border border-cyan-400/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🔗</span>
            <span className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">Dopasowanie par</span>
          </div>
          <input
            className="w-full bg-transparent outline-none text-sm font-600 text-ink placeholder:text-ink-3/50 border-none"
            placeholder="Instrukcja: Dopasuj pojęcia..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          <div className="space-y-2">
            {pairs.map((pair, i) => (
              <div key={pair.id} className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 group/mp">
                <input
                  className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-2 py-1.5 text-xs text-ink outline-none placeholder:text-ink-3"
                  placeholder={`Pojęcie ${i+1}...`}
                  value={pair.left}
                  onChange={e => {
                    const np = pairs.map(p => p.id === pair.id ? { ...p, left: e.target.value } : p)
                    setProps({ pairs: np })
                  }}
                />
                <span className="text-ink-3 text-sm">↔</span>
                <div className="flex gap-1.5">
                  <input
                    className="flex-1 bg-emerald-400/5 border border-emerald-400/20 rounded-lg px-2 py-1.5 text-xs text-ink outline-none placeholder:text-ink-3"
                    placeholder="Definicja..."
                    value={pair.right}
                    onChange={e => {
                      const np = pairs.map(p => p.id === pair.id ? { ...p, right: e.target.value } : p)
                      setProps({ pairs: np })
                    }}
                  />
                  <button onClick={() => setProps({ pairs: pairs.filter(p => p.id !== pair.id) })}
                    className="opacity-0 group-hover/mp:opacity-100 text-ink-3 hover:text-red-400 p-1"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setProps({ pairs: [...pairs, { id: uid(), left: '', right: '' }] })}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <Plus size={12} /> Dodaj parę
          </button>
        </div>
      )
    }

    // ── TABLE ─────────────────────────────────────────────
    case 'table': {
      const headers = (block.props?.headers as string[]) || ['Kolumna 1', 'Kolumna 2']
      const rows = (block.props?.rows as string[][]) || [['', '']]
      return (
        <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-4">
                {headers.map((h, i) => (
                  <th key={i} className="border border-white/[0.06] p-0">
                    <input
                      value={h}
                      onChange={e => {
                        const nh = [...headers]; nh[i] = e.target.value
                        setProps({ headers: nh })
                      }}
                      className="w-full bg-transparent px-3 py-2 text-xs font-700 text-brand-gold outline-none placeholder:text-ink-3 text-center"
                    />
                  </th>
                ))}
                <th className="border border-white/[0.06] w-8 bg-surface-4">
                  <button onClick={() => setProps({ headers: [...headers, `Kolumna ${headers.length+1}`], rows: rows.map(r => [...r, '']) })}
                    className="w-full h-full flex items-center justify-center text-ink-3 hover:text-brand-blue p-2"><Plus size={12}/></button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="group/tr hover:bg-surface-4/50 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-white/[0.06] p-0">
                      <input
                        value={cell}
                        onChange={e => {
                          const nr = rows.map((r, rj) => rj === ri ? r.map((c, cj) => cj === ci ? e.target.value : c) : r)
                          setProps({ rows: nr })
                        }}
                        className="w-full bg-transparent px-3 py-2 text-xs text-ink-2 outline-none"
                      />
                    </td>
                  ))}
                  <td className="border border-white/[0.06] w-8">
                    <button onClick={() => setProps({ rows: rows.filter((_, j) => j !== ri) })}
                      className="w-full h-full flex items-center justify-center opacity-0 group-hover/tr:opacity-100 text-ink-3 hover:text-red-400 p-2"><Trash2 size={11}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setProps({ rows: [...rows, headers.map(() => '')] })}
            className="w-full py-2 text-xs text-ink-3 hover:text-brand-blue flex items-center justify-center gap-1 bg-surface-3/50 hover:bg-surface-3 transition-colors border-t border-white/[0.06]">
            <Plus size={11}/> Dodaj wiersz
          </button>
        </div>
      )
    }

    // ── TOGGLE ────────────────────────────────────────────
    case 'toggle': {
      const [open, setOpen] = useState(true)
      const body = (block.props?.body as string) || ''
      return (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-3 cursor-pointer" onClick={() => setOpen(v => !v)}>
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={14} className="text-ink-3" />
            </motion.div>
            <input
              className="flex-1 bg-transparent outline-none text-sm font-600 text-ink border-none"
              placeholder="Tytuł toggleu..."
              value={block.content}
              onChange={e => set(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <AutoTextarea
                  className="w-full bg-surface-3/50 border-t border-white/[0.06] px-6 py-3 outline-none text-sm text-ink-2 leading-relaxed resize-none placeholder:text-ink-3/40"
                  placeholder="Ukryta treść..."
                  value={body}
                  onChange={v => setProps({ body: v })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    // ── TIMELINE ──────────────────────────────────────────
    case 'timeline': {
      const events = (block.props?.events as { id: string; date: string; title: string; desc: string }[]) || []
      return (
        <div className="space-y-0">
          {events.map((ev, i) => (
            <div key={ev.id} className="flex gap-4 group/tl">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-brand-blue border-2 border-brand-blue2 flex-shrink-0 mt-2" />
                {i < events.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-brand-blue/40 to-transparent mt-1" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex gap-3 items-start">
                  <input
                    className="w-20 bg-surface-3 border border-white/[0.06] rounded px-2 py-1 text-xs font-mono text-brand-gold outline-none text-center"
                    placeholder="Data"
                    value={ev.date}
                    onChange={e => {
                      const ne = events.map(ev2 => ev2.id === ev.id ? { ...ev2, date: e.target.value } : ev2)
                      setProps({ events: ne })
                    }}
                  />
                  <div className="flex-1">
                    <input
                      className="w-full bg-transparent outline-none font-600 text-sm text-ink border-none placeholder:text-ink-3/50"
                      placeholder="Tytuł zdarzenia..."
                      value={ev.title}
                      onChange={e => {
                        const ne = events.map(ev2 => ev2.id === ev.id ? { ...ev2, title: e.target.value } : ev2)
                        setProps({ events: ne })
                      }}
                    />
                    <input
                      className="w-full bg-transparent outline-none text-xs text-ink-2 border-none mt-0.5 placeholder:text-ink-3/40"
                      placeholder="Opis..."
                      value={ev.desc}
                      onChange={e => {
                        const ne = events.map(ev2 => ev2.id === ev.id ? { ...ev2, desc: e.target.value } : ev2)
                        setProps({ events: ne })
                      }}
                    />
                  </div>
                  <button onClick={() => setProps({ events: events.filter(ev2 => ev2.id !== ev.id) })}
                    className="opacity-0 group-hover/tl:opacity-100 text-ink-3 hover:text-red-400 p-1 mt-0.5"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setProps({ events: [...events, { id: uid(), date: '', title: '', desc: '' }] })}
            className="text-xs text-brand-blue flex items-center gap-1 ml-7"><Plus size={12}/> Dodaj zdarzenie</button>
        </div>
      )
    }

    // ── STEPS ─────────────────────────────────────────────
    case 'steps': {
      const steps = (block.props?.steps as { id: string; title: string; desc: string }[]) || []
      return (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex gap-3 group/st">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue2
                              flex items-center justify-center text-sm font-800 text-white flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 bg-surface-3 border border-white/[0.06] rounded-xl p-3">
                <input
                  className="w-full bg-transparent outline-none font-600 text-sm text-ink border-none placeholder:text-ink-3/50"
                  placeholder={`Krok ${i+1}...`}
                  value={step.title}
                  onChange={e => {
                    const ns = steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s)
                    setProps({ steps: ns })
                  }}
                />
                <input
                  className="w-full bg-transparent outline-none text-xs text-ink-2 border-none mt-1 placeholder:text-ink-3/40"
                  placeholder="Opis kroku..."
                  value={step.desc}
                  onChange={e => {
                    const ns = steps.map(s => s.id === step.id ? { ...s, desc: e.target.value } : s)
                    setProps({ steps: ns })
                  }}
                />
              </div>
              <button onClick={() => setProps({ steps: steps.filter(s => s.id !== step.id) })}
                className="opacity-0 group-hover/st:opacity-100 text-ink-3 hover:text-red-400 p-1 mt-0.5"><Trash2 size={11}/></button>
            </div>
          ))}
          <button onClick={() => setProps({ steps: [...steps, { id: uid(), title: '', desc: '' }] })}
            className="text-xs text-brand-blue flex items-center gap-1 ml-11"><Plus size={12}/> Dodaj krok</button>
        </div>
      )
    }

    // ── KEYTERM ───────────────────────────────────────────
    case 'keyterm': {
      const def = (block.props?.definition as string) || ''
      return (
        <div className="inline-flex flex-col w-full">
          <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/25 rounded-xl">
            <span className="text-amber-400 text-lg flex-shrink-0">🔑</span>
            <div className="flex-1">
              <input
                className="w-full bg-transparent outline-none font-display font-800 text-base text-amber-300 border-none placeholder:text-amber-400/40"
                placeholder="Termin kluczowy..."
                value={block.content}
                onChange={e => set(e.target.value)}
              />
              <input
                className="w-full bg-transparent outline-none text-sm text-ink-2 border-none mt-1 placeholder:text-ink-3/40"
                placeholder="Definicja lub wyjaśnienie..."
                value={def}
                onChange={e => setProps({ definition: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }

    // ── HIGHLIGHT BOX ─────────────────────────────────────
    case 'highlight_box': {
      const colorMap: Record<string, string> = {
        blue: 'from-blue-500/10 border-blue-400/30',
        green: 'from-emerald-500/10 border-emerald-400/30',
        red: 'from-red-500/10 border-red-400/30',
        purple: 'from-violet-500/10 border-violet-400/30',
        pink: 'from-pink-500/10 border-pink-400/30',
      }
      const c = (block.props?.color as string) || 'blue'
      const icon = (block.props?.icon as string) || '💡'
      return (
        <div className={`p-5 rounded-2xl bg-gradient-to-r ${colorMap[c]} border space-y-2`}>
          <div className="flex items-center gap-2">
            <input
              className="text-xl w-10 bg-transparent outline-none border-none"
              value={icon}
              onChange={e => setProps({ icon: e.target.value })}
            />
            <select
              value={c}
              onChange={e => setProps({ color: e.target.value })}
              className="bg-surface-4 border border-white/[0.08] rounded px-2 py-0.5 text-xs text-ink-2 outline-none"
            >
              {Object.keys(colorMap).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <AutoTextarea
            className="w-full bg-transparent outline-none text-sm text-ink-2 leading-relaxed border-none resize-none placeholder:text-ink-3/40"
            placeholder="Wyróżniona treść, ważna informacja..."
            value={block.content}
            onChange={v => set(v)}
          />
        </div>
      )
    }

    // ── PROGRESS BAR ──────────────────────────────────────
    case 'progress_bar': {
      const val = (block.props?.value as number) ?? 65
      const max = (block.props?.max as number) ?? 100
      const pct = Math.round((val / max) * 100)
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <input
              className="bg-transparent outline-none text-sm font-600 text-ink border-none placeholder:text-ink-3/40"
              placeholder="Etykieta..."
              value={block.content}
              onChange={e => set(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={max}
                value={val}
                onChange={e => setProps({ value: Number(e.target.value) })}
                className="w-14 bg-surface-3 border border-white/[0.06] rounded px-2 py-0.5 text-xs text-brand-gold text-center outline-none font-mono"
              />
              <span className="text-xs text-ink-3">/ {max}</span>
            </div>
          </div>
          <div className="h-3 bg-surface-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-gold"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-ink-3 text-right">{pct}%</div>
        </div>
      )
    }

    // ── RATING ────────────────────────────────────────────
    case 'rating': {
      const max = (block.props?.max as number) || 5
      const val = (block.props?.value as number) || 0
      return (
        <div className="flex flex-col gap-2">
          <input
            className="bg-transparent outline-none text-sm font-600 text-ink border-none placeholder:text-ink-3/40"
            placeholder="Co oceniasz?..."
            value={block.content}
            onChange={e => set(e.target.value)}
          />
          <div className="flex gap-2 items-center">
            {Array.from({ length: max }).map((_, i) => (
              <button key={i} onClick={() => setProps({ value: i + 1 })}
                className={`text-2xl transition-transform hover:scale-110 ${i < val ? 'text-amber-400' : 'text-ink-3/30'}`}>
                ★
              </button>
            ))}
            <span className="text-xs text-ink-3 ml-2">{val}/{max}</span>
          </div>
        </div>
      )
    }

    // ── COUNTDOWN ─────────────────────────────────────────
    case 'countdown': {
      const target = (block.props?.targetDate as string) || ''
      const label = (block.props?.label as string) || 'dni'
      const daysLeft = target ? Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)) : 0
      return (
        <div className="flex items-center gap-4 p-4 bg-surface-3 border border-red-400/20 rounded-xl">
          <div className="text-center">
            <div className="font-display font-800 text-4xl text-gradient-gold">{target ? daysLeft : '—'}</div>
            <div className="text-xs text-ink-3">{label}</div>
          </div>
          <div className="flex-1 space-y-2">
            <input
              className="w-full bg-transparent outline-none text-sm font-600 text-ink border-none placeholder:text-ink-3/40"
              placeholder="Etykieta odliczania..."
              value={block.content}
              onChange={e => set(e.target.value)}
            />
            <div className="flex gap-2">
              <input type="date" value={target}
                onChange={e => setProps({ targetDate: e.target.value })}
                className="flex-1 bg-surface-4 border border-white/[0.06] rounded px-2 py-1 text-xs text-ink outline-none"
              />
              <input
                className="w-20 bg-surface-4 border border-white/[0.06] rounded px-2 py-1 text-xs text-ink outline-none"
                placeholder="Jednostka"
                value={label}
                onChange={e => setProps({ label: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }

    // ── STATS CARD ────────────────────────────────────────
    case 'stats_card': {
      const stats = (block.props?.stats as { id: string; value: string; label: string }[]) || []
      return (
        <div className="grid grid-cols-3 gap-3">
          {stats.map(stat => (
            <div key={stat.id} className="bg-surface-3 border border-white/[0.06] rounded-xl p-4 text-center">
              <input
                className="w-full bg-transparent outline-none font-display font-800 text-2xl text-gradient text-center border-none placeholder:text-ink-3"
                placeholder="95%"
                value={stat.value}
                onChange={e => {
                  const ns = stats.map(s => s.id === stat.id ? { ...s, value: e.target.value } : s)
                  setProps({ stats: ns })
                }}
              />
              <input
                className="w-full bg-transparent outline-none text-xs text-ink-2 text-center border-none mt-0.5 placeholder:text-ink-3/40"
                placeholder="Etykieta..."
                value={stat.label}
                onChange={e => {
                  const ns = stats.map(s => s.id === stat.id ? { ...s, label: e.target.value } : s)
                  setProps({ stats: ns })
                }}
              />
            </div>
          ))}
          <button onClick={() => setProps({ stats: [...stats, { id: uid(), value: '', label: '' }] })}
            className="bg-surface-3/50 border-2 border-dashed border-white/[0.08] rounded-xl p-4 flex items-center justify-center text-ink-3 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
            <Plus size={16} />
          </button>
        </div>
      )
    }

    // ── COMPARISON ────────────────────────────────────────
    case 'comparison': {
      const left = (block.props?.left as { title: string; color: string; items: string[] }) || { title: 'Opcja A', color: 'blue', items: [] }
      const right = (block.props?.right as { title: string; color: string; items: string[] }) || { title: 'Opcja B', color: 'orange', items: [] }
      return (
        <div className="grid grid-cols-2 gap-3">
          {[{ side: left, key: 'left', color: 'brand-blue' }, { side: right, key: 'right', color: 'brand-orange' }].map(({ side, key, color }) => (
            <div key={key} className={`bg-surface-3 border border-${color}/20 rounded-xl p-4`}>
              <input
                className={`w-full bg-transparent outline-none font-700 text-sm text-${color} border-none placeholder:text-ink-3/50 mb-3`}
                placeholder="Tytuł..."
                value={side.title}
                onChange={e => setProps({ [key]: { ...side, title: e.target.value } })}
              />
              {side.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-emerald-400">✓</span>
                  <input
                    className="flex-1 bg-transparent outline-none text-sm text-ink-2 border-none placeholder:text-ink-3/40"
                    placeholder={`Zaleta ${i+1}...`}
                    value={item}
                    onChange={e => {
                      const ni = [...side.items]; ni[i] = e.target.value
                      setProps({ [key]: { ...side, items: ni } })
                    }}
                  />
                </div>
              ))}
              <button onClick={() => setProps({ [key]: { ...side, items: [...side.items, ''] } })}
                className="text-xs text-ink-3 hover:text-brand-blue flex items-center gap-1 mt-1"><Plus size={11}/> Dodaj</button>
            </div>
          ))}
        </div>
      )
    }

    // ── INTERACTIVE TOOL ──────────────────────────────────
    case 'interactive_tool':
      return (
        <div className="rounded-xl overflow-hidden border border-brand-gold/20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-gold/5 border-b border-brand-gold/10">
            <span className="text-xs">⚡</span>
            <span className="text-[10px] font-600 text-brand-gold">{(block.props?.label as string) || 'Narzędzie AI'}</span>
          </div>
          {block.content ? (
            <iframe srcDoc={block.content} className="w-full border-none"
              style={{ height: (block.props?.height as number) || 320 }}
              sandbox="allow-scripts allow-forms" title="AI Tool" />
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-ink-3 gap-2 bg-surface-3">
              <span className="text-2xl">⚡</span>
              <span className="text-xs">Wygeneruj narzędzie z panelu AI Studio</span>
            </div>
          )}
        </div>
      )

    // ── MINI APP ───────────────────────────────────────────
    case 'mini_app':
      return (
        <div className="rounded-xl overflow-hidden border border-violet-500/20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/8 border-b border-violet-500/10">
            <span className="text-xs">📱</span>
            <span className="text-[10px] font-600 text-violet-400">{(block.props?.label as string) || 'Mini Aplikacja'}</span>
            <span className="ml-auto text-[9px] text-violet-400/50 font-mono">App Builder</span>
          </div>
          {block.content ? (
            <iframe srcDoc={block.content} className="w-full border-none"
              style={{ height: (block.props?.height as number) || 480 }}
              sandbox="allow-scripts allow-forms allow-modals" title="Mini App" />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-ink-3 gap-2 bg-surface-3">
              <span className="text-3xl">📱</span>
              <span className="text-xs">Mini App — kliknij App Builder by wygenerować</span>
            </div>
          )}
        </div>
      )

    // ── AUDIO NARRATOR BLOCK ───────────────────────────────
    case 'audio_narrator':
      return (
        <div className="rounded-xl border border-brand-gold/20 bg-[#060E1C] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎧</span>
            </div>
            <div>
              <div className="text-xs font-700 text-ink">Odsłuch rozdziału</div>
              <div className="text-[10px] text-ink-3">Kliknij by słuchać zamiast czytać</div>
            </div>
            <div className="ml-auto">
              <span className="text-[9px] text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-1 rounded-lg font-600">
                🔊 Audio
              </span>
            </div>
          </div>
          <div className="px-4 py-4 text-center text-xs text-ink-3">
            Panel odsłuchu dostępny przez przycisk <strong className="text-ink-2">Odsłuch</strong> w pasku edytora
          </div>
        </div>
      )

    default:
      return <div className="text-xs text-ink-3 p-3 bg-surface-3 rounded-xl">Nieznany blok: {block.type}</div>
  }
}

// ─── AUTO-RESIZE TEXTAREA ─────────────────────────────────
function AutoTextarea({ value, onChange, className, placeholder }: {
  value: string; onChange: (v: string) => void; className: string; placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      className={className}
      placeholder={placeholder}
      value={value}
      rows={1}
      onChange={e => { onChange(e.target.value) }}
      style={{ overflow: 'hidden' }}
    />
  )
}
