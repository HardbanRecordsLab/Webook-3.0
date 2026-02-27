import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, BookOpen, Zap, Shield, TrendingUp,
  Globe, Mic, Video, Brain, Award, ChevronRight,
  ArrowRight, Check, Star
} from 'lucide-react'
import logo from '../assets/logo.png'

const FEATURES = [
  { icon: Brain, label: 'AI Generator', desc: 'Quizy, kalkulatory, fiszki — wygeneruj narzędzie w sekundy opisując je po polsku. Napędzane Claude Sonnet.', color: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.3)' },
  { icon: Zap, label: 'Edytor blokowy', desc: 'Drag & drop bloki: tekst, obraz, wideo, quiz, callout, interaktywne narzędzia. WYSIWYG na poziomie Notion.', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)' },
  { icon: Shield, label: 'Ochrona treści', desc: 'Watermark, blokada kopiowania, wyłączony devtools. Twoja praca jest szczelnie chroniona przed kradzieżą.', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.3)' },
  { icon: TrendingUp, label: 'Analityka', desc: 'Śledzenie postępów, wyniki quizów, heatmapy stron, czas sesji. Export CSV. Wiesz co działa.', color: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.3)' },
  { icon: Globe, label: 'Tłumaczenie AI', desc: 'Jeden klik — cały Webook przetłumaczony na dowolny język wraz z quizami i kartami pracy.', color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)' },
  { icon: Award, label: 'Certyfikaty', desc: 'Po ukończeniu czytelnik automatycznie otrzymuje certyfikat PDF z kodem QR do weryfikacji.', color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.3)' },
  { icon: Mic, label: 'Notatki głosowe', desc: 'Nagraj komentarz audio do każdej strony. Idealne dla kursów gdzie wyjaśnienie głosem robi różnicę.', color: 'from-orange-500 to-red-500', glow: 'rgba(239,68,68,0.3)' },
  { icon: Video, label: 'Wideo wstawki', desc: 'Embed YouTube, Vimeo, własnych plików. Wideo odtwarza się w środku Webooka bez opuszczania strony.', color: 'from-sky-500 to-cyan-500', glow: 'rgba(14,165,233,0.3)' },
  { icon: BookOpen, label: 'Progress Tracker', desc: 'Czytelnicy widzą postęp, ukończone rozdziały, wyniki. Buduje nawyk powracania do materiału.', color: 'from-fuchsia-500 to-violet-500', glow: 'rgba(217,70,239,0.3)' },
]

const TEMPLATES = [
  { name: 'Kurs Online', emoji: '🎓', cat: 'Edukacja', bg: 'from-indigo-950 via-blue-900 to-indigo-800', accent: '#818cf8' },
  { name: 'Lead Magnet', emoji: '🚀', cat: 'Marketing', bg: 'from-orange-950 via-red-900 to-orange-800', accent: '#fb923c' },
  { name: 'Pitch Deck', emoji: '💼', cat: 'Biznes', bg: 'from-slate-950 via-gray-900 to-slate-800', accent: '#94a3b8' },
  { name: 'Poradnik', emoji: '📖', cat: 'Edukacja', bg: 'from-teal-950 via-emerald-900 to-teal-800', accent: '#34d399' },
  { name: 'Portfolio', emoji: '🎨', cat: 'Kreatywne', bg: 'from-purple-950 via-violet-900 to-purple-800', accent: '#c084fc' },
]

const STATS = [
  { value: '12k+', label: 'Webooków', sub: 'stworzonych' },
  { value: '5.8k', label: 'Twórców', sub: 'aktywnych' },
  { value: '1.4M', label: 'Interakcji', sub: 'miesięcznie' },
  { value: '4.9★', label: 'Ocena', sub: 'średnia' },
]

const TOOLS_MARQUEE = [
  '🤖 AI Generator narzędzi', '❓ Quizy interaktywne', '🃏 Fiszki Flashcard',
  '📊 Kalkulator ROI', '⏱️ Timer Pomodoro', '✅ Checklista', '🧠 Gra Memory',
  '🎓 Certyfikat PDF', '🔒 Ochrona treści', '🌍 Tłumaczenie AI', '📁 Import PDF',
  '🎙️ Notatki głosowe', '📈 Analityka', '🏪 Marketplace',
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4
                      border-b border-white/[0.06] backdrop-blur-xl bg-surface-0/80">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="Webook Studio" className="h-9 w-9 object-contain drop-shadow-lg
                group-hover:scale-105 transition-transform duration-200" />
          <div>
            <span className="font-display font-800 text-lg tracking-tight text-ink">Webook Studio</span>
            <span className="ml-2 text-xs font-mono text-brand-gold/80 font-500">4.0</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Funkcje', 'Szablony', 'Cennik'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
               className="text-sm text-ink-2 hover:text-ink transition-colors duration-150 font-500">
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="btn-ghost text-sm">Zaloguj się</Link>
          <Link to="/auth" className="btn-primary text-sm">
            Zacznij za darmo <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-100 pointer-events-none" />

        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full
                       bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-ink-2 tracking-wider">WEBOOK STUDIO 4.0 — NOW LIVE</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-800 text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8"
          >
            Twórz&nbsp;
            <span className="relative">
              <span className="text-gradient">Webooki</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8 Q75 2 150 6 Q225 10 298 4" stroke="url(#u1)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="u1" x1="0" y1="0" x2="300" y2="0">
                    <stop stopColor="#1E6FDB"/><stop offset="1" stopColor="#EA6C1E"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            które&nbsp;
            <span className="text-gradient-gold">angażują</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-ink-2 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Platforma do tworzenia interaktywnych ebooków&nbsp;z&nbsp;quizami, wideo, narzędziami&nbsp;AI
            i&nbsp;pięknym designem. Twórz za darmo — płać $25 dopiero gdy publikujesz.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/auth" className="btn-gold text-base px-8 py-3.5 shadow-glow-gold text-base">
              <Sparkles size={18} />
              Stwórz pierwszy Webook
            </Link>
            <Link to="/reader/demo" className="btn-ghost text-base px-8 py-3.5">
              Zobacz demo
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* STATS ROW */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden
                       border border-white/[0.06] max-w-2xl mx-auto"
          >
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="bg-surface-1 px-6 py-5 text-center">
                <div className="font-display font-800 text-2xl text-gradient">{value}</div>
                <div className="text-xs font-600 text-ink mt-0.5">{label}</div>
                <div className="text-xs text-ink-3">{sub}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-3"
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-ink-3/50" />
          <span className="text-xs font-mono tracking-widest">SCROLL</span>
        </motion.div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="relative py-5 border-y border-white/[0.06] overflow-hidden bg-surface-1/50">
        <div className="flex gap-6 animate-marquee w-max">
          {[...TOOLS_MARQUEE, ...TOOLS_MARQUEE].map((t, i) => (
            <span key={i}
              className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full
                         bg-white/[0.04] border border-white/[0.06] text-sm text-ink-2 font-500">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="funkcje" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-brand-blue/80 tracking-[0.3em] uppercase mb-4">// możliwości</p>
          <h2 className="font-display font-800 text-4xl md:text-6xl tracking-tight mb-5">
            Wszystko czego potrzebujesz<br />
            jako <span className="text-gradient">twórca</span>
          </h2>
          <p className="text-ink-2 text-lg max-w-xl mx-auto leading-relaxed">
            Kompletna platforma — od edytora przez AI aż po monetyzację.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, label, desc, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card card-hover relative overflow-hidden p-6 noise"
            >
              {/* Glow spot */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                   style={{ background: glow }} />

              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-display font-700 text-lg mb-2 text-ink">{label}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TEMPLATES ─── */}
      <section id="szablony" className="py-28 px-6 bg-surface-1/30 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-brand-gold/80 tracking-[0.3em] uppercase mb-4">// szablony</p>
            <h2 className="font-display font-800 text-4xl md:text-6xl tracking-tight mb-5">
              Zacznij od gotowego <span className="text-gradient-gold">szablonu</span>
            </h2>
            <p className="text-ink-2 text-lg max-w-xl mx-auto">
              6 profesjonalnych szablonów dla twórców edukacji, biznesu i marketingu.
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {TEMPLATES.map(({ name, emoji, cat, bg, accent }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex-shrink-0 w-64 snap-start group cursor-pointer"
                onClick={() => window.location.href = '/auth'}
              >
                <div className={`relative h-44 rounded-2xl bg-gradient-to-br ${bg} overflow-hidden mb-3
                                border border-white/[0.08] group-hover:border-white/20 transition-all duration-300
                                group-hover:-translate-y-1 group-hover:shadow-2xl`}>
                  {/* Inner glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: `radial-gradient(circle at 50% 50%, ${accent}22, transparent 70%)` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {emoji}
                  </div>
                  {/* Category pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-600
                                  bg-black/40 backdrop-blur-sm text-white border border-white/10">
                    {cat}
                  </div>
                  {/* Use arrow */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm
                                  flex items-center justify-center opacity-0 group-hover:opacity-100
                                  transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
                <p className="font-display font-700 text-sm text-ink">{name}</p>
              </motion.div>
            ))}
            {/* More */}
            <div className="flex-shrink-0 w-64 snap-start flex flex-col items-center justify-center
                            h-44 rounded-2xl border-2 border-dashed border-white/[0.08] text-ink-3
                            hover:border-brand-blue/30 hover:text-ink-2 transition-all duration-300 cursor-pointer mt-0 mb-3"
                 onClick={() => window.location.href = '/auth'}>
              <span className="text-3xl mb-2">+</span>
              <span className="text-sm font-600">Więcej szablonów</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="cennik" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-brand-blue/80 tracking-[0.3em] uppercase mb-4">// cennik</p>
          <h2 className="font-display font-800 text-4xl md:text-6xl tracking-tight mb-5">
            Prosty model — <span className="text-gradient">płacisz raz</span>
          </h2>
          <p className="text-ink-2 text-lg">
            Twórz za darmo bez limitu. Płać $25 gdy Webook jest gotowy.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative card p-10 glow-line-top overflow-hidden noise">
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full
                            bg-brand-blue/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 right-0 w-40 h-40 rounded-full
                            bg-brand-gold/15 blur-[60px] pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                              bg-brand-gold/10 border border-brand-gold/30 mb-6">
                <Star size={13} className="text-brand-gold" />
                <span className="text-xs font-mono text-brand-gold tracking-wider">PER WEBOOK</span>
              </div>

              <div className="font-display font-800 mb-2">
                <span className="text-2xl text-ink-2 align-top mt-4 inline-block">$</span>
                <span className="text-8xl text-gradient leading-none">25</span>
              </div>
              <p className="text-ink-2 text-sm mb-8">jednorazowa opłata za publikację</p>

              <ul className="text-left space-y-3 mb-8">
                {[
                  'Twórz Webooka za darmo — bez limitu',
                  'Podgląd gotowego Webooka przed płatnością',
                  'Zabezpieczenie przed kopiowaniem treści',
                  'Watermark na podglądzie — znika po wykupie',
                  'Każdy projekt zapisany z timestampem',
                  'Pełna analityka po publikacji',
                  'Unikalny link i QR kod do udostępnienia',
                  'Generator certyfikatów ukończenia',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink-2">
                    <Check size={14} className="text-brand-gold mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="btn-gold w-full justify-center text-base py-3.5">
                <Sparkles size={16} />
                Zacznij tworzyć za darmo
              </Link>

              <p className="text-xs text-ink-3 mt-4">Płatność przez Stripe • Bezpieczna transakcja</p>
            </div>
          </div>

          {/* Protection boxes */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Shield, t: 'Prawa autorskie', d: 'Timestamp w bazie' },
              { icon: Zap, t: 'Blokada kopiowania', d: 'Ctrl+C wyłączone' },
              { icon: Globe, t: 'Watermark', d: 'Znika po zakupie' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="card p-4 text-center">
                <Icon size={18} className="text-brand-blue mx-auto mb-2" />
                <p className="text-xs font-600 text-ink mb-0.5">{t}</p>
                <p className="text-xs text-ink-3">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Webook Studio" className="h-8 w-8 object-contain" />
            <span className="font-display font-700 text-ink">Webook Studio</span>
            <span className="text-xs font-mono text-brand-gold/60">4.0</span>
          </Link>
          <p className="text-xs text-ink-3">© 2026 Webook Studio. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            {['Regulamin', 'Prywatność', 'Kontakt'].map(l => (
              <a key={l} href="#" className="text-xs text-ink-3 hover:text-ink-2 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
