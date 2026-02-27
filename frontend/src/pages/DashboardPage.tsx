import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Eye, Edit3, Trash2, BarChart2, TrendingUp,
  Users, BookOpen, DollarSign, Zap, MoreHorizontal,
  ExternalLink, Copy, Globe, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '../components/AppShell'

const WEBOOKS = [
  {
    id: '1', title: 'Kurs JavaScript 2025', desc: '8 rozdziałów • 24 quizy',
    status: 'published', views: 1247, emoji: '⚡',
    bg: 'from-indigo-950 via-blue-900 to-indigo-800', accent: '#818cf8',
    earned: 75, updated: '2 godziny temu'
  },
  {
    id: '2', title: 'Marketing Automation Guide', desc: '5 rozdziałów • 8 narzędzi AI',
    status: 'draft', views: 0, emoji: '🚀',
    bg: 'from-orange-950 via-red-900 to-orange-800', accent: '#fb923c',
    earned: 0, updated: 'Wczoraj 14:30'
  },
  {
    id: '3', title: 'Analityka dla Twórców', desc: '6 rozdziałów • kalkulatory',
    status: 'published', views: 342, emoji: '📊',
    bg: 'from-teal-950 via-emerald-900 to-teal-800', accent: '#34d399',
    earned: 50, updated: '3 dni temu'
  },
]

const STAT_CARDS = [
  { icon: BookOpen, label: 'Webooki łącznie', value: '3', sub: '+1 w tym miesiącu', color: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.25)' },
  { icon: Eye, label: 'Wyświetlenia', value: '1 589', sub: '↑ 23% vs poprzedni tydzień', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)' },
  { icon: Users, label: 'Czytelnicy', value: '289', sub: '89 nowych w tym tygodniu', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.25)' },
  { icon: DollarSign, label: 'Przychody', value: '$125', sub: '5 zakupów łącznie', color: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.25)' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [webooks, setWebooks] = useState(WEBOOKS)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  function deleteWebook(id: string) {
    setWebooks(w => w.filter(x => x.id !== id))
    toast.success('Webook usunięty')
    setActiveMenu(null)
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`https://webook.studio/r/${id}`)
    toast.success('Link skopiowany!')
    setActiveMenu(null)
  }

  return (
    <AppShell
      title="Dashboard"
      actions={
        <Link to="/editor" className="btn-gold py-1.5 px-4 text-sm">
          <Plus size={14} /> Nowy Webook
        </Link>
      }
    >
      <div className="p-6 space-y-8">

        {/* ─── STATS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ icon: Icon, label, value, sub, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none"
                   style={{ background: glow }} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={17} className="text-white" />
              </div>
              <div className="font-display font-800 text-2xl text-ink mb-0.5">{value}</div>
              <div className="text-xs font-600 text-ink-2 mb-1">{label}</div>
              <div className="text-xs text-ink-3">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── QUICK ACTIONS ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Zap, label: 'AI Generator', desc: 'Stwórz quiz lub narzędzie', action: () => navigate('/editor'), accent: 'brand-gold' },
            { icon: BarChart2, label: 'Analityka', desc: 'Wyniki i statystyki', action: () => {}, accent: 'brand-blue' },
            { icon: Globe, label: 'Marketplace', desc: 'Przeglądaj Webooki', action: () => navigate('/marketplace'), accent: 'brand-blue' },
            { icon: TrendingUp, label: 'Opublikuj', desc: 'Za $25 jednorazowo', action: () => {}, accent: 'brand-gold' },
          ].map(({ icon: Icon, label, desc, action, accent }) => (
            <button
              key={label}
              onClick={action}
              className="card card-hover p-4 text-left group cursor-pointer"
            >
              <Icon size={18} className={`text-${accent} mb-2 group-hover:scale-110 transition-transform`} />
              <div className="font-600 text-sm text-ink">{label}</div>
              <div className="text-xs text-ink-3 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* ─── WEBOOKS GRID ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-700 text-lg text-ink">Moje Webooki</h2>
            <Link to="/editor" className="text-xs text-brand-blue hover:text-brand-gold transition-colors flex items-center gap-1">
              Nowy <Plus size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Create card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate('/editor')}
              className="flex flex-col items-center justify-center h-64 rounded-2xl
                         border-2 border-dashed border-white/[0.1] hover:border-brand-blue/40
                         hover:bg-brand-blue/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1]
                              flex items-center justify-center mb-3
                              group-hover:bg-brand-blue/15 group-hover:border-brand-blue/30 transition-all">
                <Plus size={22} className="text-ink-3 group-hover:text-brand-blue transition-colors" />
              </div>
              <p className="font-display font-700 text-sm text-ink-2 group-hover:text-ink transition-colors">Nowy Webook</p>
              <p className="text-xs text-ink-3 mt-1">Od zera lub z szablonu</p>
            </motion.div>

            {/* Webook cards */}
            {webooks.map(({ id, title, desc, status, views, emoji, bg, accent, earned, updated }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="card card-hover overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className={`relative h-36 bg-gradient-to-br ${bg} flex items-center justify-center`}>
                  {/* Subtle grid */}
                  <div className="absolute inset-0 grid-overlay opacity-30" />
                  {/* Glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full blur-3xl"
                         style={{ background: `${accent}33` }} />
                  </div>
                  <span className="relative text-5xl">{emoji}</span>

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    {status === 'published'
                      ? <span className="badge-published">● Opublikowany</span>
                      : <span className="badge-draft">● Szkic</span>
                    }
                  </div>

                  {/* Menu */}
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === id ? null : id)}
                        className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10
                                   flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {activeMenu === id && (
                        <div className="absolute top-9 right-0 w-44 card border border-white/[0.1] shadow-2xl z-20 py-1 rounded-xl overflow-hidden">
                          <button onClick={() => { navigate(`/reader/${id}`); setActiveMenu(null) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink-2 hover:bg-white/[0.05] hover:text-ink">
                            <Eye size={13} /> Podgląd czytelnika
                          </button>
                          <button onClick={() => copyLink(id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink-2 hover:bg-white/[0.05] hover:text-ink">
                            <Copy size={13} /> Kopiuj link
                          </button>
                          <button onClick={() => { navigate(`/editor/${id}`); setActiveMenu(null) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink-2 hover:bg-white/[0.05] hover:text-ink">
                            <ExternalLink size={13} /> Otwórz w edytorze
                          </button>
                          <div className="border-t border-white/[0.06] my-1" />
                          <button onClick={() => deleteWebook(id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
                            <Trash2 size={13} /> Usuń
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-display font-700 text-sm text-ink mb-0.5 line-clamp-1">{title}</h3>
                  <p className="text-xs text-ink-3 mb-3">{desc}</p>

                  <div className="flex items-center gap-3 text-xs text-ink-3 mb-4">
                    <span className="flex items-center gap-1"><Eye size={11} /> {views.toLocaleString()}</span>
                    {earned > 0 && <span className="flex items-center gap-1 text-brand-gold"><DollarSign size={11} /> {earned}</span>}
                    <span className="ml-auto">{updated}</span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/editor/${id}`)}
                      className="btn-ghost flex-1 justify-center py-1.5 text-xs"
                    >
                      <Edit3 size={12} /> Edytuj
                    </button>
                    {status === 'draft' ? (
                      <button
                        onClick={() => toast.success('Przekierowanie do Stripe...')}
                        className="btn-gold flex-1 justify-center py-1.5 text-xs"
                      >
                        Opublikuj $25
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/reader/${id}`)}
                        className="btn-primary flex-1 justify-center py-1.5 text-xs"
                      >
                        <Eye size={12} /> Podgląd
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── RECENT ACTIVITY ─── */}
        <div className="card p-5">
          <h3 className="font-display font-700 text-sm text-ink mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-brand-blue" />
            Ostatnia aktywność
          </h3>
          <div className="space-y-3">
            {[
              { icon: '🎉', text: 'Ktoś kupił "Kurs JavaScript 2025"', time: '2h temu', accent: 'text-brand-gold' },
              { icon: '👁', text: '23 nowe wyświetlenia "Analityka dla Twórców"', time: '5h temu', accent: 'text-brand-blue' },
              { icon: '✅', text: 'Czytelnik ukończył kurs i otrzymał certyfikat', time: 'wczoraj', accent: 'text-emerald-400' },
              { icon: '❓', text: '89% poprawnych odpowiedzi w quizach JS', time: '2 dni temu', accent: 'text-violet-400' },
            ].map(({ icon, text, time, accent }) => (
              <div key={text} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-ink-2 flex-1">{text}</span>
                <span className="text-xs text-ink-3 flex-shrink-0">{time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
