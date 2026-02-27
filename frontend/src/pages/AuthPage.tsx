import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../assets/logo.png'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    if (mode === 'register') toast.success('Konto utworzone! Witamy 🎉')
    else toast.success('Zalogowano pomyślnie!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-1 p-12 relative overflow-hidden border-r border-white/[0.06]">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-brand-blue/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-10 w-60 h-60 bg-brand-gold/8 rounded-full blur-[80px]" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img src={logo} alt="Webook Studio" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-display font-800 text-xl text-ink">Webook Studio</div>
            <div className="text-xs font-mono text-brand-gold/70">4.0</div>
          </div>
        </Link>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="font-display font-700 text-3xl text-ink leading-tight mb-4">
            "Ebook 2.0 — bo czytanie zasługuje na&nbsp;
            <span className="text-gradient">więcej"</span>
          </blockquote>
          <p className="text-ink-2 text-sm">
            Dołącz do&nbsp;5800+ twórców którzy budują interaktywne&nbsp;doświadczenia edukacyjne.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['AI Generator', 'Quizy', 'Certyfikaty', 'Analityka', 'Marketplace'].map(f => (
              <span key={f}
                className="px-3 py-1.5 rounded-full text-xs font-500 bg-white/[0.05] border border-white/[0.08] text-ink-2">
                ✦ {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom avatars */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#6366f1','#f59e0b','#10b981','#ef4444'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-1 flex items-center justify-center text-xs font-700 text-white"
                   style={{ background: c }}>
                {['J','A','M','K'][i]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-600 text-ink">5.8k twórców</p>
            <p className="text-xs text-ink-3">dołączyło w tym miesiącu</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <img src={logo} alt="Webook Studio" className="h-9 w-9 object-contain" />
            <span className="font-display font-700 text-lg">Webook Studio</span>
          </Link>

          {/* Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display font-800 text-3xl text-ink mb-2">
                {mode === 'login' ? 'Witaj z powrotem ✦' : 'Dołącz do twórców ✦'}
              </h1>
              <p className="text-ink-2 text-sm mb-8">
                {mode === 'login'
                  ? 'Zaloguj się by zarządzać swoimi Webookami'
                  : 'Twórz interaktywne Webooki za darmo — bez karty kredytowej'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* FORM */}
          <div className="space-y-4">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="label">Imię i nazwisko</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                  <input
                    className="input pl-10"
                    placeholder="Jan Kowalski"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="label">Adres e-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="ty@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Hasło</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input pl-10 pr-10"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-gold w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Proszę czekać...
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Zaloguj się' : 'Załóż konto za darmo'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-sm text-ink-2 mt-6">
            {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
            <button
              onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
              className="text-brand-gold hover:text-brand-orange font-600 transition-colors"
            >
              {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </p>

          <p className="text-center text-xs text-ink-3 mt-4">
            Rejestrując się akceptujesz{' '}
            <a href="#" className="hover:text-ink-2 underline">Regulamin</a> i{' '}
            <a href="#" className="hover:text-ink-2 underline">Politykę Prywatności</a>
          </p>
        </div>
      </div>
    </div>
  )
}
