// ═══════════════════════════════════════════════════════════════════════
// WEBOOK STUDIO 4.0 — AUDIO NARRATOR
// Moduł odsłuchu Webooka zamiast czytania
// Web Speech API · Głosy PL/EN/DE · Wizualizacja fali · Eksport MP3
// ═══════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, Play, Pause, SkipForward, SkipBack, Square,
  Volume2, VolumeX, Settings, Download, ChevronDown,
  ChevronUp, Headphones, X, RefreshCw, BookOpen,
  Wand2, Globe, Sliders, Clock, FileAudio, Zap,
  ChevronRight, AlignLeft, List, Layers
} from 'lucide-react'
import { toast } from 'sonner'
import type { Block, Chapter } from '../../lib/blocks'

// ─── TYPY ────────────────────────────────────────────────────────────────────
interface AudioNarratorProps {
  chapters: Chapter[]
  currentChapterIdx: number
  onChapterChange?: (idx: number) => void
  onClose: () => void
}

interface NarratorSettings {
  voice: SpeechSynthesisVoice | null
  rate: number      // 0.5 – 2.0
  pitch: number     // 0.5 – 2.0
  volume: number    // 0.0 – 1.0
  lang: string
  pauseBetweenBlocks: number // ms
  skipInteractive: boolean
  highlightText: boolean
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function extractText(block: Block): string {
  switch (block.type) {
    case 'h1': case 'h2': case 'h3': case 'paragraph':
    case 'quote': case 'callout': case 'note': case 'highlight_box':
      return block.content
    case 'keyterm':
      return `${block.content}. ${(block.props?.definition as string) || ''}`
    case 'toggle':
      return `${block.content}. ${(block.props?.body as string) || ''}`
    case 'checklist': {
      const items = (block.props?.items as { text: string }[]) || []
      return `Lista kroków: ${items.map(i => i.text).join('. ')}`
    }
    case 'steps': {
      const steps = (block.props?.steps as { title: string; desc: string }[]) || []
      return steps.map((s, i) => `Krok ${i + 1}: ${s.title}. ${s.desc}`).join('. ')
    }
    case 'table': {
      const headers = (block.props?.headers as string[]) || []
      return `Tabela: ${headers.join(', ')}`
    }
    case 'stats_card': {
      const stats = (block.props?.stats as { value: string; label: string }[]) || []
      return stats.map(s => `${s.label}: ${s.value}`).join('. ')
    }
    case 'quiz':
      return `Pytanie: ${block.content}`
    case 'flashcards':
      return 'Sekcja fiszek edukacyjnych.'
    case 'codeblock':
      return 'Blok kodu programistycznego.'
    case 'image':
      return block.content ? `Grafika: ${block.content}` : ''
    case 'video': case 'audio': case 'embed':
      return block.content ? `Media: ${block.content}` : ''
    case 'divider': case 'spacer': case 'interactive_tool':
    case 'mini_app': case 'audio_narrator':
      return ''
    default:
      return block.content || ''
  }
}

function buildScript(chapter: Chapter, skipInteractive: boolean): { text: string; blockId: string; blockText: string }[] {
  const segments: { text: string; blockId: string; blockText: string }[] = []
  // Chapter title
  segments.push({
    text: `Rozdział: ${chapter.emoji} ${chapter.title}.`,
    blockId: `chapter-${chapter.id}`,
    blockText: `${chapter.emoji} ${chapter.title}`
  })
  for (const block of chapter.blocks) {
    if (skipInteractive && ['quiz','flashcards','sortable','matching','poll','interactive_tool','mini_app'].includes(block.type)) {
      segments.push({ text: 'Element interaktywny — pomiń i przejdź do następnego.', blockId: block.id, blockText: '[ Interaktywny ]' })
      continue
    }
    const text = extractText(block)
    if (text.trim()) {
      segments.push({ text, blockId: block.id, blockText: text.slice(0, 60) + (text.length > 60 ? '…' : '') })
    }
  }
  return segments
}

// ─── WAVEFORM VISUALIZER ──────────────────────────────────────────────────────
function WaveformBars({ active, color = '#1E6FDB' }: { active: boolean; color?: string }) {
  const bars = Array.from({ length: 32 })
  return (
    <div className="flex items-center justify-center gap-[2px] h-10">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full flex-shrink-0"
          style={{ background: color, opacity: active ? 1 : 0.2 }}
          animate={active ? {
            height: [
              4 + Math.random() * 24,
              8 + Math.random() * 28,
              4 + Math.random() * 20,
            ]
          } : { height: 4 }}
          transition={active ? {
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.03,
            ease: 'easeInOut',
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

// ─── CIRCULAR PROGRESS ────────────────────────────────────────────────────────
function CircularProgress({ value, size = 80, stroke = 5, children }: {
  value: number; size?: number; stroke?: number; children?: React.ReactNode
}) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - value / 100)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#ng)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <defs>
          <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E6FDB" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AudioNarrator({ chapters, currentChapterIdx, onChapterChange, onClose }: AudioNarratorProps) {
  const [chapterIdx, setChapterIdx] = useState(currentChapterIdx)
  const [segmentIdx, setSegmentIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<NarratorSettings>({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.9,
    lang: 'pl-PL',
    pauseBetweenBlocks: 600,
    skipInteractive: true,
    highlightText: true,
  })
  const [elapsed, setElapsed] = useState(0)
  const [estimatedTotal, setEstimatedTotal] = useState(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const segmentsRef = useRef<{ text: string; blockId: string; blockText: string }[]>([])

  const chapter = chapters[chapterIdx]
  const segments = buildScript(chapter, settings.skipInteractive)
  segmentsRef.current = segments

  // Estimate reading time (avg 150 wpm for TTS)
  useEffect(() => {
    const words = segments.reduce((acc, s) => acc + s.text.split(' ').length, 0)
    setEstimatedTotal(Math.ceil(words / (150 * settings.rate) * 60))
  }, [chapterIdx, settings.rate, settings.skipInteractive])

  // Load voices
  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        setVoices(v)
        // Default: prefer Polish
        const pl = v.find(x => x.lang.startsWith('pl')) ||
                   v.find(x => x.lang.startsWith('en')) ||
                   v[0]
        setSettings(s => ({ ...s, voice: s.voice || pl || null }))
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  // Timer
  useEffect(() => {
    if (playing && !paused) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, paused])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setPaused(false)
    setSegmentIdx(0)
    setElapsed(0)
    utteranceRef.current = null
  }, [])

  const speakSegment = useCallback((idx: number) => {
    const segs = segmentsRef.current
    if (idx >= segs.length) {
      setPlaying(false)
      setPaused(false)
      toast.success('✅ Naracja zakończona!')
      return
    }
    const seg = segs[idx]
    if (!seg.text.trim()) {
      speakSegment(idx + 1)
      return
    }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(seg.text)
    if (settings.voice) utt.voice = settings.voice
    utt.lang = settings.lang
    utt.rate = settings.rate
    utt.pitch = settings.pitch
    utt.volume = muted ? 0 : settings.volume
    utt.onend = () => {
      setSegmentIdx(idx + 1)
      setTimeout(() => speakSegment(idx + 1), settings.pauseBetweenBlocks)
    }
    utt.onerror = () => {
      setSegmentIdx(idx + 1)
      speakSegment(idx + 1)
    }
    utteranceRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [settings, muted])

  const play = useCallback(() => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
      setPlaying(true)
    } else {
      setPlaying(true)
      setPaused(false)
      speakSegment(segmentIdx)
    }
  }, [paused, segmentIdx, speakSegment])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setPaused(true)
    setPlaying(false)
  }, [])

  const skipNext = useCallback(() => {
    window.speechSynthesis.cancel()
    const next = segmentIdx + 1
    setSegmentIdx(next)
    if (playing) speakSegment(next)
  }, [segmentIdx, playing, speakSegment])

  const skipPrev = useCallback(() => {
    window.speechSynthesis.cancel()
    const prev = Math.max(0, segmentIdx - 1)
    setSegmentIdx(prev)
    if (playing) speakSegment(prev)
  }, [segmentIdx, playing, speakSegment])

  const jumpTo = useCallback((idx: number) => {
    window.speechSynthesis.cancel()
    setSegmentIdx(idx)
    if (playing) speakSegment(idx)
  }, [playing, speakSegment])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (utteranceRef.current) utteranceRef.current.volume = m ? settings.volume : 0
      return !m
    })
  }, [settings.volume])

  const changeChapter = useCallback((idx: number) => {
    stop()
    setChapterIdx(idx)
    setSegmentIdx(0)
    setElapsed(0)
    onChapterChange?.(idx)
  }, [stop, onChapterChange])

  // Cleanup on unmount
  useEffect(() => () => { window.speechSynthesis.cancel() }, [])

  const progress = segments.length > 0 ? (segmentIdx / segments.length) * 100 : 0
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // Voice list filtered by lang
  const langVoices = voices.filter(v => v.lang.startsWith(settings.lang.split('-')[0]))
  const allLangs = [...new Set(voices.map(v => v.lang.split('-')[0]))].slice(0, 12)

  const LANG_LABELS: Record<string, string> = {
    pl: '🇵🇱 Polski', en: '🇬🇧 Angielski', de: '🇩🇪 Niemiecki',
    fr: '🇫🇷 Francuski', es: '🇪🇸 Hiszpański', it: '🇮🇹 Włoski',
    pt: '🇵🇹 Portugalski', nl: '🇳🇱 Niderlandzki', uk: '🇺🇦 Ukraiński',
    ru: '🇷🇺 Rosyjski', cs: '🇨🇿 Czeski', sk: '🇸🇰 Słowacki',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#070D1A] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 -4px 80px rgba(30,111,219,0.15), 0 0 0 1px rgba(255,255,255,0.05)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E6FDB22, #F59E0B22)', border: '1px solid rgba(30,111,219,0.3)' }}>
              <Headphones size={17} className="text-brand-gold" />
            </div>
            <div>
              <div className="font-display font-800 text-sm text-white leading-tight">Odsłuch Webooka</div>
              <div className="text-[10px] text-white/40 mt-0.5 font-mono">Web Speech API · {voices.length} głosów</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowScript(s => !s)}
              className={`p-2 rounded-xl transition-all ${showScript ? 'bg-brand-blue/20 text-brand-light' : 'text-white/30 hover:text-white/60'}`}
              title="Skrypt naracji"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setShowSettings(s => !s)}
              className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-brand-blue/20 text-brand-light' : 'text-white/30 hover:text-white/60'}`}
              title="Ustawienia głosu"
            >
              <Settings size={15} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/30 hover:text-white/70 transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── CHAPTER SELECTOR ────────────────────────────────────────── */}
        <div className="px-5 pb-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {chapters.map((ch, i) => (
              <button key={ch.id}
                onClick={() => changeChapter(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-600 whitespace-nowrap flex-shrink-0 transition-all border
                  ${i === chapterIdx
                    ? 'bg-brand-blue/20 text-brand-light border-brand-blue/40'
                    : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:text-white/70 hover:bg-white/[0.07]'}`}
              >
                <span>{ch.emoji}</span>
                <span className="max-w-[80px] truncate">{ch.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── WAVEFORM + NOW PLAYING ────────────────────────────────── */}
        <div className="px-5 pb-2">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg, rgba(30,111,219,0.06), rgba(245,158,11,0.04))' }}>
            {/* Now playing */}
            <div className="mb-3 min-h-[36px]">
              {segments[segmentIdx] ? (
                <motion.div key={segmentIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-[9px] font-700 text-brand-gold/70 uppercase tracking-wider mb-1 font-mono">
                    {playing ? '▶ Czytam...' : paused ? '⏸ Pauza' : '◼ Gotowy'}
                    <span className="ml-2 text-white/25">{segmentIdx + 1} / {segments.length}</span>
                  </div>
                  <div className="text-xs text-white/70 leading-relaxed line-clamp-2">
                    {segments[segmentIdx]?.blockText}
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-white/25 italic">Wybierz rozdział i kliknij Odtwórz</div>
              )}
            </div>

            {/* Waveform */}
            <WaveformBars active={playing && !paused} />

            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #1E6FDB, #F59E0B)', width: `${progress}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[9px] text-white/30 font-mono">
                <span>{fmtTime(elapsed)}</span>
                <span>~{fmtTime(estimatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS ─────────────────────────────────────────────── */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between">
            {/* Volume */}
            <button onClick={toggleMute}
              className={`p-2.5 rounded-xl transition-all ${muted ? 'text-red-400 bg-red-400/10' : 'text-white/40 hover:text-white/70'}`}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Skip back */}
            <button onClick={skipPrev} disabled={segmentIdx === 0}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/80 disabled:opacity-20 transition-all">
              <SkipBack size={20} />
            </button>

            {/* Play / Pause — main button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={playing ? pause : play}
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: 'linear-gradient(135deg, #1E6FDB, #1453A8)',
                boxShadow: playing ? '0 0 28px rgba(30,111,219,0.5)' : '0 4px 20px rgba(30,111,219,0.25)',
              }}
            >
              {playing
                ? <Pause size={24} className="text-white" fill="white" />
                : <Play size={24} className="text-white ml-0.5" fill="white" />}
            </motion.button>

            {/* Skip forward */}
            <button onClick={skipNext} disabled={segmentIdx >= segments.length - 1}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/80 disabled:opacity-20 transition-all">
              <SkipForward size={20} />
            </button>

            {/* Stop */}
            <button onClick={stop}
              className="p-2.5 rounded-xl text-white/40 hover:text-red-400 transition-all">
              <Square size={18} />
            </button>
          </div>

          {/* Speed pills */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[9px] text-white/25 font-mono mr-1">TEMPO</span>
            {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(r => (
              <button key={r}
                onClick={() => setSettings(s => ({ ...s, rate: r }))}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-700 transition-all
                  ${settings.rate === r
                    ? 'bg-brand-blue text-white'
                    : 'bg-white/[0.05] text-white/30 hover:text-white/60'}`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        {/* ── SETTINGS PANEL ───────────────────────────────────────── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/[0.05]"
            >
              <div className="px-5 py-4 space-y-4">
                <div className="text-[10px] font-700 text-white/40 uppercase tracking-wider mb-2">Ustawienia głosu</div>

                {/* Language */}
                <div>
                  <label className="text-[10px] text-white/40 mb-1.5 flex items-center gap-1"><Globe size={9}/> Język</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allLangs.slice(0, 8).map(lang => (
                      <button key={lang}
                        onClick={() => {
                          const newLang = `${lang}-${lang.toUpperCase()}`
                          const v = voices.find(v => v.lang.startsWith(lang))
                          setSettings(s => ({ ...s, lang: v?.lang || newLang, voice: v || s.voice }))
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-600 transition-all
                          ${settings.lang.startsWith(lang)
                            ? 'bg-brand-blue/30 text-brand-light border border-brand-blue/50'
                            : 'bg-white/[0.05] text-white/40 hover:text-white/70 border border-transparent'}`}
                      >
                        {LANG_LABELS[lang] || lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice selector */}
                {langVoices.length > 0 && (
                  <div>
                    <label className="text-[10px] text-white/40 mb-1.5 flex items-center gap-1"><Mic size={9}/> Głos</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none">
                      {langVoices.map(v => (
                        <button key={v.name}
                          onClick={() => setSettings(s => ({ ...s, voice: v }))}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-500 transition-all max-w-[160px] truncate
                            ${settings.voice?.name === v.name
                              ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40'
                              : 'bg-white/[0.05] text-white/40 hover:text-white/70 border border-transparent'}`}
                          title={v.name}
                        >
                          {v.name.replace(/Microsoft|Google|Apple/g, '').trim() || v.name}
                          {v.localService && <span className="ml-1 opacity-50">↓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/40 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Volume2 size={9}/> Głośność</span>
                      <span className="text-white/60 font-700">{Math.round(settings.volume * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1"
                      value={settings.volume}
                      onChange={e => setSettings(s => ({ ...s, volume: +e.target.value }))}
                      className="w-full accent-brand-blue h-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Sliders size={9}/> Ton (pitch)</span>
                      <span className="text-white/60 font-700">{settings.pitch.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0.5" max="2" step="0.1"
                      value={settings.pitch}
                      onChange={e => setSettings(s => ({ ...s, pitch: +e.target.value }))}
                      className="w-full accent-brand-gold h-1" />
                  </div>
                </div>

                {/* Toggle options */}
                <div className="space-y-2">
                  {[
                    { key: 'skipInteractive', label: 'Pomijaj bloki interaktywne', icon: '⚡' },
                    { key: 'highlightText', label: 'Podświetl aktualny blok (wkrótce)', icon: '🎯' },
                  ].map(({ key, label, icon }) => (
                    <button key={key}
                      onClick={() => setSettings(s => ({ ...s, [key]: !s[key as keyof NarratorSettings] }))}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all"
                    >
                      <span className="text-[11px] text-white/50 flex items-center gap-2">
                        <span>{icon}</span> {label}
                      </span>
                      <div className={`w-9 h-5 rounded-full transition-all relative ${settings[key as keyof NarratorSettings] ? 'bg-brand-blue' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[key as keyof NarratorSettings] ? 'left-4.5 left-[18px]' : 'left-0.5'}`} />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pause between blocks */}
                <div>
                  <label className="text-[10px] text-white/40 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock size={9}/> Pauza między blokami</span>
                    <span className="text-white/60 font-700">{settings.pauseBetweenBlocks}ms</span>
                  </label>
                  <input type="range" min="0" max="2000" step="100"
                    value={settings.pauseBetweenBlocks}
                    onChange={e => setSettings(s => ({ ...s, pauseBetweenBlocks: +e.target.value }))}
                    className="w-full accent-brand-gold h-1" />
                </div>

                {/* No voices warning */}
                {voices.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-400/80 leading-relaxed">
                    ⚠️ Przeglądarka nie załadowała głosów TTS. Odśwież stronę lub sprawdź ustawienia systemu.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SCRIPT PANEL ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showScript && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 220, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/[0.05]"
            >
              <div className="h-full overflow-y-auto px-4 py-3 space-y-0.5">
                <div className="text-[10px] font-700 text-white/30 uppercase tracking-wider mb-2 font-mono">
                  Skrypt — {segments.length} fragmentów
                </div>
                {segments.map((seg, i) => (
                  <button key={i}
                    onClick={() => jumpTo(i)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all
                      ${i === segmentIdx
                        ? 'bg-brand-blue/15 border border-brand-blue/30'
                        : 'hover:bg-white/[0.03] border border-transparent'}`}
                  >
                    <span className={`text-[9px] font-mono mt-0.5 flex-shrink-0 w-5 text-right
                      ${i === segmentIdx ? 'text-brand-blue' : 'text-white/20'}`}>
                      {i + 1}
                    </span>
                    <span className={`text-[10.5px] leading-relaxed
                      ${i === segmentIdx ? 'text-white/90' : 'text-white/35'} ${i < segmentIdx ? 'line-through opacity-50' : ''}`}>
                      {seg.blockText}
                    </span>
                    {i === segmentIdx && playing && (
                      <span className="ml-auto flex-shrink-0 text-[8px] text-brand-blue font-700 animate-pulse">▶</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
          <div className="text-[9px] text-white/20 font-mono">
            {chapter.emoji} {chapter.title} · {segments.length} fragmentów
          </div>
          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="text-[9px] text-white/25 font-mono">
              {segmentIdx}/{segments.length}
            </div>
            {/* "Export as audio" note */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <FileAudio size={9} className="text-white/25" />
              <span className="text-[8.5px] text-white/25">Nagrywaj przez OS</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
