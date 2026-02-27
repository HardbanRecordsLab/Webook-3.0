import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Eye, Save, Zap, Plus, Trash2, ChevronUp, ChevronDown, Layers, Headphones, Gamepad2,
  GripVertical, X, Settings2, BookOpen, Undo2, Redo2,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  FileCode, Monitor, Tablet, Smartphone, Download
} from 'lucide-react'
import { toast } from 'sonner'
import logo from '../../assets/logo.png'
import BlockRenderer from './BlockRenderer'
import BlockPicker from './BlockPicker'
import AIStudio from './AIStudio'
import WorksheetBuilder from './WorksheetBuilder'
import AppBuilder from './AppBuilder'
import AudioNarrator from './AudioNarrator'
import { createBlock, BLOCK_META, uid } from '../../lib/blocks'
import type { Block, Chapter, BlockType, WebookMeta } from '../../lib/blocks'
import { exportToHTML } from '../../lib/exportHTML'

const DEFAULT_META: WebookMeta = {
  title: 'Mój nowy Webook',
  description: '',
  coverEmoji: '\u{1F4DA}',
  coverGradient: 'from-indigo-950 to-blue-900',
  theme: 'dark',
  font: 'default',
  accentColor: '#1E6FDB',
  author: 'Autor',
  language: 'pl',
  tags: [],
}

function makeChapters(): Chapter[] {
  return [
    {
      id: uid(), title: 'Wstep', emoji: '\u{1F44B}',
      blocks: [
        { ...createBlock('h1'), content: 'Witaj w Webook Studio 4.0!' },
        { ...createBlock('paragraph'), content: 'Kliknij dowolny blok by go edytowac. Uzyj paska na dole by dodawac nowe elementy — naglowki, quizy, fiszki, tabele, narzedzia AI i wiele wiecej.' },
        { ...createBlock('callout'), content: 'Skrot: kliknij + przy bloku lub uzyj przycisku Wszystkie bloki na pasku dolnym.', props: { icon: '\u{1F4A1}', color: 'blue' } },
        { ...createBlock('steps'), props: { steps: [
          { id: uid(), title: 'Edytuj tresc', desc: 'Klikaj bloki i wpisuj tresc bezposrednio.' },
          { id: uid(), title: 'Dodaj interaktywnosc', desc: 'Wstaw quiz, fiszki lub narzedzie AI.' },
          { id: uid(), title: 'Opublikuj', desc: 'Za $25 - Webook dostepny z unikalnym linkiem.' },
        ]}},
      ],
    },
    {
      id: uid(), title: 'Przyklad rozdzialu', emoji: '\u{1F4D6}',
      blocks: [
        { ...createBlock('h2'), content: 'Typy blokow dostepne w edytorze' },
        { ...createBlock('paragraph'), content: 'Webook Studio oferuje ponad 25 typow blokow — od prostego tekstu, przez quizy i fiszki, az po zaawansowane narzedzia generowane przez AI.' },
        { ...createBlock('quiz'), content: 'Ktory typ bloku sluzy do nauki przez powtarzanie?',
          props: { options: [
            { id: uid(), text: 'Fiszki (Flashcards)', isCorrect: true, explanation: 'Dokladnie! Fiszki to pary pytanie-odpowiedz idealne do powtorzek.' },
            { id: uid(), text: 'Tabela', isCorrect: false },
            { id: uid(), text: 'Separator', isCorrect: false },
            { id: uid(), text: 'Odstep', isCorrect: false },
          ], feedback: { correct: 'Swietnie!', incorrect: 'Sprobuj jeszcze raz.' }, points: 1 }
        },
        { ...createBlock('stats_card'), props: { stats: [
          { id: uid(), value: '25+', label: 'Typow blokow' },
          { id: uid(), value: '20', label: 'Narzedzi AI' },
          { id: uid(), value: 'infinity', label: 'Mozliwosci' },
        ]}},
      ],
    },
  ]
}

type PreviewMode = 'editor' | 'desktop' | 'tablet' | 'mobile'
const PREVIEW_W: Record<string, number> = { desktop: 1200, tablet: 768, mobile: 390 }

const QUICK_BLOCKS: { type: BlockType; icon: string; color: string }[] = [
  { type: 'h2',               icon: 'H2', color: '#818cf8' },
  { type: 'paragraph',        icon: 'P',  color: '#94a3b8' },
  { type: 'callout',          icon: 'i',  color: '#fbbf24' },
  { type: 'image',            icon: 'IMG',color: '#c084fc' },
  { type: 'video',            icon: 'VID',color: '#f87171' },
  { type: 'quiz',             icon: 'Q',  color: '#f59e0b' },
  { type: 'flashcards',       icon: 'FC', color: '#818cf8' },
  { type: 'poll',             icon: 'POL',color: '#34d399' },
  { type: 'checklist',        icon: 'CL', color: '#34d399' },
  { type: 'sortable',         icon: 'SRT',color: '#f97316' },
  { type: 'matching',         icon: 'MAT',color: '#06b6d4' },
  { type: 'table',            icon: 'TBL',color: '#60a5fa' },
  { type: 'steps',            icon: '123',color: '#38bdf8' },
  { type: 'timeline',         icon: 'TML',color: '#34d399' },
  { type: 'toggle',           icon: 'TOG',color: '#a78bfa' },
  { type: 'keyterm',          icon: 'KEY',color: '#fbbf24' },
  { type: 'stats_card',       icon: 'STA',color: '#8b5cf6' },
  { type: 'comparison',       icon: 'CMP',color: '#06b6d4' },
  { type: 'progress_bar',     icon: 'PRG',color: '#10b981' },
  { type: 'countdown',        icon: 'CDN',color: '#f43f5e' },
  { type: 'codeblock',        icon: 'COD',color: '#6ee7b7' },
  { type: 'quote',            icon: 'QT', color: '#34d399' },
  { type: 'columns2',         icon: 'C2', color: '#7c3aed' },
  { type: 'interactive_tool', icon: 'AI', color: '#fbbf24' },
  { type: 'divider',          icon: '---',color: '#4b5563' },
]

export default function EditorMain() {
  const [meta, setMeta] = useState<WebookMeta>(DEFAULT_META)
  const [chapters, setChapters] = useState<Chapter[]>(makeChapters)
  const [activeChapter, setActiveChapter] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('editor')
  const [previewHtml, setPreviewHtml] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [showWorksheet, setShowWorksheet] = useState(false)
  const [showAppBuilder, setShowAppBuilder] = useState(false)
  const [showNarrator, setShowNarrator] = useState(false)
  const [hist, setHist] = useState<Chapter[][]>(() => [makeChapters()])
  const [histIdx, setHistIdx] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  const cur = chapters[activeChapter] ?? chapters[0]
  const totalBlocks = chapters.reduce((acc, ch) => acc + ch.blocks.length, 0)

  function push(next: Chapter[]) {
    const h = hist.slice(0, histIdx + 1)
    h.push(JSON.parse(JSON.stringify(next)))
    setHist(h); setHistIdx(h.length - 1)
  }
  function undo() { if (histIdx <= 0) return; const i = histIdx - 1; setHistIdx(i); setChapters(JSON.parse(JSON.stringify(hist[i]))) }
  function redo() { if (histIdx >= hist.length - 1) return; const i = histIdx + 1; setHistIdx(i); setChapters(JSON.parse(JSON.stringify(hist[i]))) }

  const updateBlock = useCallback((id: string, content: string, props?: Record<string, unknown>) => {
    setChapters(prev => prev.map((ch, ci) =>
      ci !== activeChapter ? ch : {
        ...ch, blocks: ch.blocks.map(b =>
          b.id === id ? { ...b, content, ...(props !== undefined ? { props } : {}) } : b
        )
      }
    ))
  }, [activeChapter])

  function addBlock(type: BlockType) {
    const nb = createBlock(type)
    setChapters(prev => {
      const next = prev.map((ch, i) => i !== activeChapter ? ch : { ...ch, blocks: [...ch.blocks, nb] })
      push(next); return next
    })
    setSelectedBlock(nb.id)
    setTimeout(() => canvasRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 80)
  }

  function insertBlock(block: Block) {
    setChapters(prev => {
      const next = prev.map((ch, i) => i !== activeChapter ? ch : { ...ch, blocks: [...ch.blocks, block] })
      push(next); return next
    })
    setSelectedBlock(block.id)
    setTimeout(() => canvasRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 80)
  }

  function removeBlock(id: string) {
    setChapters(prev => {
      const next = prev.map((ch, i) => i !== activeChapter ? ch : { ...ch, blocks: ch.blocks.filter(b => b.id !== id) })
      push(next); return next
    })
    if (selectedBlock === id) setSelectedBlock(null)
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setChapters(prev => prev.map((ch, ci) => {
      if (ci !== activeChapter) return ch
      const blocks = [...ch.blocks]
      const i = blocks.findIndex(b => b.id === id)
      const j = i + dir
      if (j < 0 || j >= blocks.length) return ch
      ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
      return { ...ch, blocks }
    }))
  }

  function duplicateBlock(id: string) {
    setChapters(prev => prev.map((ch, ci) => {
      if (ci !== activeChapter) return ch
      const idx = ch.blocks.findIndex(b => b.id === id)
      const dupe: Block = { ...JSON.parse(JSON.stringify(ch.blocks[idx])), id: uid() }
      const blocks = [...ch.blocks.slice(0, idx + 1), dupe, ...ch.blocks.slice(idx + 1)]
      return { ...ch, blocks }
    }))
  }

  function addChapter() {
    const ch: Chapter = { id: uid(), title: "Rozdzial " + (chapters.length + 1), emoji: "P", blocks: [] }
    const next = [...chapters, ch]
    setChapters(next); setActiveChapter(next.length - 1); push(next)
  }

  function renameChapter(id: string, title: string) {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, title } : ch))
  }

  function updateChapterEmoji(id: string, emoji: string) {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, emoji } : ch))
  }

  function removeChapter(id: string) {
    if (chapters.length <= 1) { toast.error('Webook musi miec przynajmniej 1 rozdzial'); return }
    setChapters(prev => {
      const next = prev.filter(ch => ch.id !== id)
      if (activeChapter >= next.length) setActiveChapter(next.length - 1)
      return next
    })
  }

  async function save() {
    setSaving(true); await new Promise(r => setTimeout(r, 600)); setSaving(false)
    toast.success('Webook zapisany!')
  }

  function openPreview(mode: 'desktop' | 'tablet' | 'mobile') {
    setPreviewHtml(exportToHTML(chapters, meta)); setPreviewMode(mode)
  }

  function exportHTML() {
    const html = exportToHTML(chapters, meta)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = meta.title.replace(/\s+/g, '-').toLowerCase() + '.html'
    a.click(); URL.revokeObjectURL(url)
    toast.success('Webook wyeksportowany jako HTML!')
  }

  if (previewMode !== 'editor') {
    const w = PREVIEW_W[previewMode]
    return (
      <div className="flex flex-col h-screen bg-surface-0">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-surface-1 flex-shrink-0">
          <button onClick={() => setPreviewMode('editor')} className="btn-ghost py-1.5 px-3 text-xs">
            <ArrowLeft size={13} /> Powrot do edytora
          </button>
          <span className="text-xs font-600 text-ink truncate">{meta.title}</span>
          <div className="ml-auto flex gap-1.5">
            {(['desktop','tablet','mobile'] as const).map(m => (
              <button key={m} onClick={() => openPreview(m)}
                className={"block-action-btn " + (previewMode === m ? 'bg-brand-blue/20 text-brand-light' : '')}
                title={m}>
                {m === 'desktop' ? <Monitor size={13}/> : m === 'tablet' ? <Tablet size={13}/> : <Smartphone size={13}/>}
              </button>
            ))}
          </div>
          <button onClick={exportHTML} className="btn-gold py-1.5 px-4 text-xs">
            <Download size={12}/> Eksportuj HTML
          </button>
        </div>
        <div className="flex-1 overflow-auto flex justify-center py-8 bg-[#030810]">
          <motion.div animate={{ width: w }} transition={{ duration: 0.3 }} style={{ maxWidth: '100%' }}
            className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
            <div className="bg-surface-1 border-b border-white/[0.06] px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{background:c}}/>)}
              </div>
              <div className="flex-1 bg-surface-3 rounded-lg px-3 py-1 text-[10px] font-mono text-ink-3 text-center truncate">
                webook.studio/{meta.title.toLowerCase().replace(/\s+/g,'-')}
              </div>
            </div>
            <iframe srcDoc={previewHtml} className="w-full border-none" style={{ height: '82vh' }}
              sandbox="allow-scripts allow-forms" title="Webook Preview"/>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-surface-1 flex-shrink-0">
        <Link to="/dashboard" className="block-action-btn flex-shrink-0"><ArrowLeft size={13}/></Link>
        <div className="w-px h-4 bg-white/[0.08]"/>
        <img src={logo} alt="" className="h-6 w-6 object-contain opacity-70 flex-shrink-0"/>
        <input
          value={meta.title}
          onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
          className="flex-1 bg-transparent border-none outline-none font-display font-700 text-sm text-ink placeholder:text-ink-3 min-w-0 max-w-[240px] caret-brand-gold"
          placeholder="Tytul Webooka..."
        />
        <div className="flex gap-0.5">
          <button onClick={undo} disabled={histIdx<=0} className="block-action-btn disabled:opacity-25"><Undo2 size={11}/></button>
          <button onClick={redo} disabled={histIdx>=hist.length-1} className="block-action-btn disabled:opacity-25"><Redo2 size={11}/></button>
        </div>
        <div className="w-px h-4 bg-white/[0.08] hidden sm:block"/>
        <span className={"text-[10px] font-mono flex-shrink-0 hidden sm:block " + (saving ? 'text-brand-gold' : 'text-ink-3')}>
          {saving ? 'Zapisuje...' : 'Zapisano'}
        </span>
        <div className="hidden md:flex gap-0.5 ml-auto">
          <button onClick={() => setSidebarOpen(v=>!v)} className="block-action-btn">
            {sidebarOpen ? <PanelLeftClose size={12}/> : <PanelLeftOpen size={12}/>}
          </button>
          <button onClick={() => setAiOpen(v=>!v)} className="block-action-btn">
            {aiOpen ? <PanelRightClose size={12}/> : <PanelRightOpen size={12}/>}
          </button>
        </div>
        <div className="w-px h-4 bg-white/[0.08] hidden md:block"/>
        <button onClick={save} className="btn-ghost py-1.5 px-3 text-xs hidden md:flex"><Save size={12}/> Zapisz</button>
        <button onClick={() => openPreview('desktop')} className="btn-ghost py-1.5 px-3 text-xs"><Eye size={12}/> Podglad</button>
        <button onClick={exportHTML} className="btn-ghost py-1.5 px-3 text-xs hidden md:flex"><FileCode size={12}/> HTML</button>
        <button onClick={() => setShowWorksheet(true)} className="btn-ghost py-1.5 px-3 text-xs hidden lg:flex flex-shrink-0"><Layers size={12}/> Karta pracy</button>
        <button onClick={() => setShowAppBuilder(true)} className="btn-ghost py-1.5 px-3 text-xs hidden lg:flex flex-shrink-0"><Gamepad2 size={12}/> Mini App</button>
        <button onClick={() => setShowNarrator(true)} className="btn-ghost py-1.5 px-3 text-xs hidden md:flex flex-shrink-0"><Headphones size={12}/> Odsłuch</button>
        <button onClick={() => setShowPublish(true)} className="btn-gold py-1.5 px-4 text-xs flex-shrink-0"><Zap size={12}/> Publikuj $25</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside initial={{width:0,opacity:0}} animate={{width:200,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.18}}
              className="flex-shrink-0 bg-surface-1 border-r border-white/[0.06] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04] flex-shrink-0">
                <span className="text-[9px] font-mono text-ink-3 tracking-widest uppercase">Rozdzialy</span>
                <button onClick={addChapter} className="block-action-btn"><Plus size={11}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {chapters.map((ch, i) => (
                  <div key={ch.id} onClick={() => setActiveChapter(i)}
                    className={"group/ch flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all " +
                      (i === activeChapter ? 'bg-brand-blue/12 border border-brand-blue/20' : 'hover:bg-white/[0.04] border border-transparent')}>
                    <input value={ch.emoji || 'P'} onChange={e => updateChapterEmoji(ch.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-5 bg-transparent border-none outline-none text-sm text-center cursor-pointer flex-shrink-0" maxLength={2}/>
                    <input value={ch.title} onChange={e => renameChapter(ch.id, e.target.value)} onClick={e => e.stopPropagation()}
                      className="flex-1 bg-transparent border-none outline-none text-xs font-500 text-ink-2 min-w-0 cursor-pointer"/>
                    <span className="text-[9px] font-mono text-ink-3 flex-shrink-0 group-hover/ch:hidden">{ch.blocks.length}</span>
                    <button onClick={e => { e.stopPropagation(); removeChapter(ch.id) }}
                      className="hidden group-hover/ch:flex text-ink-3 hover:text-red-400 p-0.5 flex-shrink-0"><Trash2 size={10}/></button>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-white/[0.04] space-y-1 flex-shrink-0">
                <div className="text-[9px] font-mono text-ink-3 px-2 mb-1.5">{chapters.length} rozdz. {totalBlocks} blokow</div>
                <button onClick={() => setShowSettings(true)} className="w-full btn-ghost py-1.5 text-xs justify-start"><Settings2 size={11}/> Ustawienia</button>
                <Link to="/reader/demo" className="w-full btn-ghost py-1.5 text-xs justify-start flex items-center gap-2"><BookOpen size={11}/> Widok czytelnika</Link>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div ref={canvasRef} className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-8">
                <input value={cur.emoji || 'P'} onChange={e => updateChapterEmoji(cur.id, e.target.value)} maxLength={2}
                  className="text-3xl bg-transparent border-none outline-none w-12 text-center cursor-pointer flex-shrink-0"/>
                <div className="flex-1">
                  <input value={cur.title} onChange={e => renameChapter(cur.id, e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-display font-800 text-2xl text-ink placeholder:text-ink-3 caret-brand-gold"
                    placeholder="Tytul rozdzialu..."/>
                  <div className="text-xs font-mono text-ink-3 mt-0.5">
                    Rozdzial {activeChapter+1} z {chapters.length} / {cur.blocks.length} blokow
                  </div>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {cur.blocks.map((block) => {
                  const bm = BLOCK_META[block.type]
                  const isSelected = selectedBlock === block.id
                  return (
                    <motion.div key={block.id} layout
                      initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97,x:-10}}
                      transition={{duration:0.15}}
                      className={"relative group/block mb-3 rounded-2xl transition-all duration-150 " + (isSelected ? 'ring-1 ring-brand-blue/40' : '')}
                      onClick={() => setSelectedBlock(block.id)}>
                      <div className="absolute -top-2.5 left-3 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-surface-0 border border-white/[0.08]" style={{color:bm?.color}}>
                          {bm?.icon} {bm?.label}
                        </span>
                      </div>
                      <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                        <button onClick={e=>{e.stopPropagation();moveBlock(block.id,-1)}} className="block-action-btn"><ChevronUp size={11}/></button>
                        <button onClick={e=>{e.stopPropagation();moveBlock(block.id,1)}} className="block-action-btn"><ChevronDown size={11}/></button>
                        <button onClick={e=>{e.stopPropagation();duplicateBlock(block.id)}} className="block-action-btn" title="Duplikuj">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button onClick={e=>{e.stopPropagation();removeBlock(block.id)}} className="block-action-btn hover:bg-red-500/20 hover:text-red-400"><Trash2 size={11}/></button>
                      </div>
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab text-ink-3">
                        <GripVertical size={12}/>
                      </div>
                      <div className={['h1','h2','h3','paragraph','quote'].includes(block.type) ? 'px-6 py-3' : ''}>
                        <BlockRenderer block={block} onChange={updateBlock} isSelected={isSelected}/>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity">
                        <button onClick={e=>{e.stopPropagation();setShowPicker(true)}}
                          className="w-6 h-6 rounded-full bg-surface-4 border border-white/[0.1] flex items-center justify-center text-ink-3 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/10 transition-all shadow-sm">
                          <Plus size={11}/>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {cur.blocks.length === 0 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-24 text-ink-3">
                  <div className="text-6xl mb-4 opacity-30">+</div>
                  <p className="text-sm mb-6">Ten rozdzial jest pusty</p>
                  <button onClick={() => setShowPicker(true)} className="btn-ghost py-2.5 px-6 text-sm"><Plus size={14}/> Dodaj pierwszy blok</button>
                </motion.div>
              )}
              <div className="h-32"/>
            </div>
          </div>

          <div className="border-t border-white/[0.06] bg-surface-1 px-3 py-2 flex items-center gap-1.5 flex-shrink-0 flex-wrap">
            <span className="text-[9px] font-mono text-ink-3 tracking-widest mr-1 hidden lg:block">DODAJ:</span>
            {QUICK_BLOCKS.map(({ type, icon, color }) => (
              <button key={type} onClick={() => addBlock(type)} title={BLOCK_META[type]?.label}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-600 bg-white/[0.03] border border-white/[0.05] text-ink-2 hover:bg-white/[0.07] hover:text-ink hover:border-white/[0.1] transition-all">
                <span style={{color}} className="font-mono leading-none">{icon}</span>
              </button>
            ))}
            <div className="flex gap-1.5 ml-auto flex-shrink-0">
              <button onClick={() => setShowWorksheet(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-600 bg-white/[0.04] border border-white/[0.07] text-ink-2 hover:text-ink hover:bg-white/[0.07] transition-all">
                <Layers size={11}/> Karta pracy
              </button>
              <button onClick={() => setShowAppBuilder(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-600 bg-white/[0.04] border border-white/[0.07] text-ink-2 hover:text-ink hover:bg-white/[0.07] transition-all">
                <Gamepad2 size={11}/> Mini App
              </button>
              <button onClick={() => setShowNarrator(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-600 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/20 transition-all">
                <Headphones size={11}/> Odsłuch
              </button>
              <button onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-600 bg-brand-blue/10 border border-brand-blue/25 text-brand-light hover:bg-brand-blue/20 transition-all">
                <Plus size={11}/> Bloki
              </button>
            </div>
          </div>
        </main>

        <AnimatePresence initial={false}>
          {aiOpen && (
            <motion.aside initial={{width:0,opacity:0}} animate={{width:284,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.18}}
              className="flex-shrink-0 bg-surface-1 border-l border-white/[0.06] overflow-hidden">
              <AIStudio onInsertBlock={insertBlock} chapterContent={cur.blocks.map(b=>b.content).join(' ')}/>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPicker(false)}>
            <div onClick={e => e.stopPropagation()}>
              <BlockPicker onSelect={(type) => { addBlock(type); setShowPicker(false) }} onClose={() => setShowPicker(false)}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}>
            <motion.div initial={{scale:0.95,y:16}} animate={{scale:1,y:0}} exit={{scale:0.95,y:16}}
              onClick={e => e.stopPropagation()} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-700 text-lg text-ink">Ustawienia Webooka</h3>
                <button onClick={() => setShowSettings(false)} className="block-action-btn"><X size={13}/></button>
              </div>
              <div><label className="label">Tytul</label><input className="input" value={meta.title} onChange={e => setMeta(m=>({...m,title:e.target.value}))}/></div>
              <div><label className="label">Opis</label><textarea className="input resize-none min-h-[60px]" value={meta.description} onChange={e => setMeta(m=>({...m,description:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Autor</label><input className="input" value={meta.author} onChange={e => setMeta(m=>({...m,author:e.target.value}))}/></div>
                <div><label className="label">Jezyk</label>
                  <select className="input" value={meta.language} onChange={e => setMeta(m=>({...m,language:e.target.value}))}>
                    <option value="pl">Polski</option><option value="en">English</option><option value="de">Deutsch</option>
                    <option value="fr">Francais</option><option value="es">Espanol</option><option value="uk">Ukrainska</option>
                  </select></div>
              </div>
              <div><label className="label">Emoji okładki</label>
                <div className="flex gap-2">
                  <input className="input w-20 text-center text-2xl" value={meta.coverEmoji} maxLength={2} onChange={e => setMeta(m=>({...m,coverEmoji:e.target.value}))}/>
                  <div className="flex gap-1.5 flex-wrap">
                    {['📚','🎓','💡','🚀','⚡','🔬','💼','🌍','🎨','🏆'].map(e => (
                      <button key={e} onClick={() => setMeta(m=>({...m,coverEmoji:e}))} className="text-xl hover:scale-110 transition-transform">{e}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowSettings(false); toast.success('Ustawienia zapisane') }} className="btn-gold w-full justify-center">Zapisz ustawienia</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublish && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowPublish(false)}>
            <motion.div initial={{scale:0.92,y:24}} animate={{scale:1,y:0}} exit={{scale:0.92,y:24}}
              onClick={e => e.stopPropagation()} className="card max-w-md w-full p-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"/>
              <button onClick={() => setShowPublish(false)} className="absolute top-4 right-4 block-action-btn"><X size={13}/></button>
              <div className="text-center relative z-10">
                <div className="text-5xl mb-4">{meta.coverEmoji}</div>
                <h3 className="font-display font-800 text-2xl text-ink mb-1">Opublikuj Webook</h3>
                <p className="text-sm text-ink-2 mb-6">"{meta.title}"</p>
                <div className="bg-surface-3 border border-white/[0.08] rounded-2xl p-6 mb-5">
                  <div className="font-display font-800 text-6xl text-gradient mb-1">$25</div>
                  <div className="text-xs text-ink-3">jednorazowo dostep dla czytelnikow na zawsze</div>
                </div>
                <div className="space-y-1.5 text-left mb-5">
                  {[
                    { ok: true, text: chapters.length + " rozdzialow" },
                    { ok: true, text: totalBlocks + " blokow tresci" },
                    { ok: chapters.some(ch => ch.blocks.some(b=>['quiz','flashcards','checklist','interactive_tool','sortable','matching','poll'].includes(b.type))), text: 'Element interaktywny' },
                    { ok: true, text: 'Eksport do interaktywnego HTML' },
                    { ok: true, text: 'Unikalny link i QR kod' },
                    { ok: true, text: 'Certyfikat ukonczenia' },
                  ].map(({ ok, text }) => (
                    <div key={text} className={"text-xs px-3 py-2 rounded-lg flex items-center gap-2 " + (ok ? 'bg-emerald-500/8 text-emerald-400' : 'bg-amber-500/8 text-amber-400')}>
                      <span>{ok ? 'OK' : 'WARN'}</span> {text}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <button onClick={() => { setShowPublish(false); toast.success('Przekierowanie do Stripe Checkout...') }} className="btn-gold w-full justify-center py-3 text-sm">
                    Zapal $25 przez Stripe
                  </button>
                  <button onClick={exportHTML} className="btn-ghost w-full justify-center py-2.5 text-xs">
                    <FileCode size={12}/> Lub pobierz jako standalone HTML
                  </button>
                </div>
                <p className="text-xs text-ink-3 mt-3">Bezpieczna platnosc Stripe Karta BLIK Przelewy24</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorksheet && (
          <WorksheetBuilder
            onInsertBlock={insertBlock}
            onClose={() => setShowWorksheet(false)}
            topic={meta.title}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAppBuilder && (
          <AppBuilder
            onInsertBlock={insertBlock}
            onClose={() => setShowAppBuilder(false)}
            topic={meta.title}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNarrator && (
          <AudioNarrator
            chapters={chapters}
            currentChapterIdx={chapters.findIndex(ch => ch.id === cur.id)}
            onChapterChange={(i) => setChapters(chs => chs)}
            onClose={() => setShowNarrator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
