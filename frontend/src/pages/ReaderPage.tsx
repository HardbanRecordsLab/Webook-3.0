import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Award } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../assets/logo.png'

const CHAPTERS = [
  {
    title: 'Wstęp do JavaScript',
    blocks: [
      { type: 'heading', content: 'Wstęp do JavaScript' },
      { type: 'text', content: 'JavaScript to jeden z najpopularniejszych języków programowania na świecie. Działa bezpośrednio w przeglądarce i jest niezbędny dla każdego web developera. W tym kursie przejdziesz od absolutnych podstaw do zaawansowanych konceptów asynchroniczności i nowoczesnego ES2025.' },
      { type: 'callout', content: '💡 JavaScript jest jedynym językiem który działa natywnie w każdej przeglądarce na świecie — bez instalacji, bez kompilacji.' },
      { type: 'text', content: 'Historia JavaScript sięga 1995 roku kiedy Brendan Eich w 10 dni stworzył pierwszą wersję dla Netscape. Dziś język ewoluuje szybciej niż kiedykolwiek — co roku nowe funkcje w standardzie ECMAScript.' },
    ]
  },
  {
    title: 'Zmienne i typy danych',
    blocks: [
      { type: 'heading', content: 'Zmienne i typy danych' },
      { type: 'text', content: 'W nowoczesnym JavaScript deklarujemy zmienne używając const i let. Różnica jest prosta: const dla wartości które się nie zmieniają, let gdy zmienna będzie modyfikowana. Stary var jest przestarzały i nie powinien być używany w nowym kodzie.' },
      { type: 'callout', content: '⚠️ Zasada: domyślnie używaj const. Zmień na let tylko gdy naprawdę musisz zmienić wartość. Nigdy nie używaj var.' },
      { type: 'quiz', question: 'Które słowo kluczowe należy użyć dla wartości która się nie zmienia?',
        options: [
          { id:'1', text:'var', isCorrect: false },
          { id:'2', text:'let', isCorrect: false },
          { id:'3', text:'const', isCorrect: true },
          { id:'4', text:'def', isCorrect: false },
        ]
      },
    ]
  },
  {
    title: 'Funkcje i closures',
    blocks: [
      { type: 'heading', content: 'Funkcje i closures' },
      { type: 'text', content: 'Funkcje są fundamentalnym budulcem JavaScript. Mamy kilka sposobów deklaracji: klasyczne function declaration, function expression, oraz zwięzłe arrow functions (=>). Każdy ma swoje zastosowanie i różni się zachowaniem słowa kluczowego this.' },
      { type: 'quiz', question: 'Co zwraca arrow function bez nawiasów klamrowych?',
        options: [
          { id:'1', text:'undefined', isCorrect: false },
          { id:'2', text:'Automatycznie wartość po =>', isCorrect: true },
          { id:'3', text:'Obiekt', isCorrect: false },
          { id:'4', text:'Błąd składni', isCorrect: false },
        ]
      },
    ]
  },
  {
    title: 'Async/Await',
    blocks: [
      { type: 'heading', content: 'Async/Await' },
      { type: 'text', content: 'JavaScript jest jednowątkowy ale obsługuje asynchroniczność przez event loop. Async/await to elegancka składnia budowana na Promises — pozwala pisać kod asynchroniczny jakby był synchroniczny, bez callback hell.' },
    ]
  },
]

export default function ReaderPage() {
  const [chapter, setChapter] = useState(0)
  const [answers, setAnswers] = useState<Record<string, {optId:string; correct:boolean}>>({})
  const [done, setDone] = useState<Set<number>>(new Set())
  const [purchased, setPurchased] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showCert, setShowCert] = useState(false)

  const progress = Math.round(((chapter + 1) / CHAPTERS.length) * 100)
  const cur = CHAPTERS[chapter]

  function goTo(idx: number) {
    if (idx >= 3 && !purchased) { setShowPaywall(true); return }
    setDone(d => new Set([...d, chapter]))
    setChapter(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function answer(qKey: string, optId: string, correct: boolean) {
    if (answers[qKey]) return
    setAnswers(a => ({ ...a, [qKey]: { optId, correct } }))
  }

  function buy() {
    setPurchased(true)
    setShowPaywall(false)
    toast.success('🎉 Dostęp odblokowany! Czytaj dalej.')
    goTo(3)
  }

  function finish() {
    setDone(d => new Set([...d, chapter]))
    setShowCert(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">

      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 flex-shrink-0 bg-surface-1 border-r border-white/[0.06] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs text-ink-3 hover:text-ink-2 mb-4 transition-colors">
            <ArrowLeft size={13} /> Powrót
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
            <div>
              <div className="font-display font-700 text-sm text-ink">Kurs JavaScript 2025</div>
              <div className="text-xs text-ink-3">Jan Kowalski</div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-ink-3">Postęp</span>
              <span className="font-mono text-brand-gold">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-4 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-blue to-brand-gold rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-ink-3 mt-1">{done.size} z {CHAPTERS.length} ukończonych</div>
          </div>
        </div>

        {/* TOC */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {CHAPTERS.map((ch, i) => {
            const isDone = done.has(i)
            const isCurrent = chapter === i
            const isLocked = i >= 3 && !purchased

            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-500 transition-all
                  ${isCurrent ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/25'
                  : isDone ? 'text-ink-2 hover:bg-white/[0.04]'
                  : 'text-ink-2 hover:bg-white/[0.04]'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-800 transition-all
                  ${isCurrent ? 'bg-brand-blue text-white'
                  : isDone ? 'bg-emerald-500/20 text-emerald-400'
                  : isLocked ? 'bg-surface-4 text-ink-3'
                  : 'bg-surface-4 text-ink-2'}`}>
                  {isDone ? '✓' : isLocked ? <Lock size={10}/> : i+1}
                </div>
                <span className="truncate">{ch.title}</span>
                {isLocked && !purchased && (
                  <Lock size={10} className="ml-auto text-ink-3 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Complete button */}
        {chapter === CHAPTERS.length - 1 && purchased && (
          <div className="p-3 border-t border-white/[0.06]">
            <button onClick={finish} className="btn-gold w-full justify-center py-2 text-xs">
              <Award size={14} /> Ukończ i pobierz certyfikat
            </button>
          </div>
        )}
      </aside>

      {/* ─── CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-surface-1 flex-shrink-0">
          <div className="font-display font-700 text-sm text-ink">{cur.title}</div>
          <div className="font-mono text-xs text-ink-3">{String(chapter+1).padStart(2,'0')} / {String(CHAPTERS.length).padStart(2,'0')}</div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto px-8 py-10 space-y-6"
            >
              {cur.blocks.map((block, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {block.type === 'heading' && (
                    <h1 className="font-display font-800 text-3xl text-ink leading-tight">{block.content}</h1>
                  )}
                  {block.type === 'text' && (
                    <p className="text-base text-ink-2 leading-relaxed">{block.content}</p>
                  )}
                  {block.type === 'callout' && (
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-gold to-brand-orange rounded-full"/>
                      <div className="bg-brand-gold/8 border border-brand-gold/20 rounded-2xl px-5 py-4 ml-3 text-sm text-ink-2 leading-relaxed">
                        {block.content}
                      </div>
                    </div>
                  )}
                  {block.type === 'quiz' && (
                    <ReaderQuiz
                      block={block as { type:string; question:string; options:{id:string;text:string;isCorrect:boolean}[] }}
                      qKey={`${chapter}-${i}`}
                      answers={answers}
                      onAnswer={answer}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Nav */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-white/[0.06] bg-surface-1 flex-shrink-0">
          <button
            onClick={() => chapter > 0 && goTo(chapter - 1)}
            disabled={chapter === 0}
            className="btn-ghost py-2 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Poprzedni
          </button>
          <div className="flex gap-1.5">
            {CHAPTERS.map((_, i) => (
              <div key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === chapter ? 'w-6 bg-brand-gold' : done.has(i) ? 'w-3 bg-emerald-500/50' : 'w-3 bg-surface-4'}`}
              />
            ))}
          </div>
          <button
            onClick={() => chapter < CHAPTERS.length - 1 ? goTo(chapter + 1) : finish()}
            className="btn-primary py-2"
          >
            {chapter < CHAPTERS.length - 1 ? <>Następny <ChevronRight size={16}/></> : <><Award size={16}/> Ukończ</>}
          </button>
        </div>
      </div>

      {/* ─── PAYWALL ─── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="card max-w-md w-full p-8 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-gold/15 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="font-display font-800 text-2xl text-ink mb-2">Odblokuj pełny dostęp</h2>
                <p className="text-sm text-ink-2 mb-6 leading-relaxed">
                  Czytasz bezpłatny fragment. Kup dostęp by odblokować wszystkie rozdziały, quizy i certyfikat.
                </p>
                <div className="bg-surface-3 border border-white/[0.08] rounded-2xl p-5 mb-6">
                  <div className="font-display font-800 text-5xl text-gradient mb-1">$25</div>
                  <div className="text-xs text-ink-3">jednorazowo • dostęp na zawsze</div>
                </div>
                <div className="space-y-2 text-left mb-6 text-sm">
                  {['Wszystkie 4 rozdziały','Interaktywne quizy','Certyfikat PDF','Dożywotni dostęp'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-ink-2">
                      <span className="text-brand-gold">✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={buy} className="btn-gold w-full justify-center py-3 text-sm mb-3">
                  💳 Kup dostęp — $25
                </button>
                <button onClick={() => setShowPaywall(false)} className="btn-ghost w-full justify-center text-xs">
                  Zamknij podgląd
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CERTIFICATE MODAL ─── */}
      <AnimatePresence>
        {showCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              className="card max-w-lg w-full overflow-hidden"
            >
              {/* Certificate */}
              <div className="bg-gradient-to-br from-surface-2 via-surface-3 to-surface-2 p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 grid-overlay opacity-40"/>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-blue via-brand-gold to-brand-orange"/>
                <div className="relative z-10">
                  <img src={logo} alt="" className="h-12 w-12 object-contain mx-auto mb-3"/>
                  <div className="text-xs font-mono text-brand-gold/70 tracking-[0.3em] uppercase mb-4">Certyfikat Ukończenia</div>
                  <div className="font-display font-800 text-3xl text-ink mb-1">Jan Kowalski</div>
                  <div className="text-sm text-ink-2 mb-4">ukończył/a z wyróżnieniem:</div>
                  <div className="font-display font-700 text-xl text-gradient mb-4">Kurs JavaScript 2025</div>
                  <div className="text-xs text-ink-3">{new Date().toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' })}</div>
                </div>
              </div>
              <div className="p-5 flex gap-3">
                <button onClick={() => { toast.success('📄 Certyfikat PDF pobrany!') }} className="btn-gold flex-1 justify-center">
                  <Award size={15}/> Pobierz PDF
                </button>
                <button onClick={() => setShowCert(false)} className="btn-ghost flex-1 justify-center">Zamknij</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReaderQuiz({ block, qKey, answers, onAnswer }: {
  block: { question: string; options: {id:string;text:string;isCorrect:boolean}[] }
  qKey: string; answers: Record<string, {optId:string;correct:boolean}>;
  onAnswer: (k:string, id:string, c:boolean) => void
}) {
  const result = answers[qKey]
  const letters = ['A','B','C','D']
  return (
    <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <span className="text-xs">❓</span>
        </div>
        <span className="font-display font-700 text-sm text-ink">{block.question}</span>
      </div>
      <div className="space-y-2">
        {block.options.map((opt, i) => {
          const selected = result?.optId === opt.id
          const shown = !!result
          let cls = 'border-white/[0.08] bg-surface-3 text-ink-2 hover:border-brand-blue/30 hover:bg-brand-blue/5'
          if (shown && opt.isCorrect) cls = 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
          else if (shown && selected && !opt.isCorrect) cls = 'border-red-400/50 bg-red-400/10 text-red-300'
          return (
            <button
              key={opt.id}
              disabled={shown}
              onClick={() => onAnswer(qKey, opt.id, opt.isCorrect)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${cls} disabled:cursor-default`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-800 flex-shrink-0
                ${shown && opt.isCorrect ? 'bg-emerald-400 text-surface-0'
                : shown && selected ? 'bg-red-400 text-surface-0'
                : 'bg-surface-4 text-ink-2'}`}>
                {letters[i]}
              </div>
              {opt.text}
            </button>
          )
        })}
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-600 ${result.correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
        >
          {result.correct ? '✅ Świetnie! Poprawna odpowiedź!' : '❌ Błąd — zapamiętaj poprawną odpowiedź.'}
        </motion.div>
      )}
    </div>
  )
}
