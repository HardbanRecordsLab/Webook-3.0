import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Palette, BarChart2, ShoppingBag,
  Settings, LogOut, Plus, ChevronRight, Bell, Search
} from 'lucide-react'
import logo from '../assets/logo.png'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Moje Webooki', href: '/dashboard/webooks' },
  { icon: Palette, label: 'Szablony', href: '/templates' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace' },
  { icon: BarChart2, label: 'Analityka', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Ustawienia', href: '/dashboard/settings' },
]

interface AppShellProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export default function AppShell({ children, title, actions }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">

      {/* ─── SIDEBAR ─── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-surface-1 border-r border-white/[0.06]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06] group">
          <img src={logo} alt="Webook Studio" className="h-8 w-8 object-contain group-hover:scale-105 transition-transform" />
          <div>
            <div className="font-display font-700 text-sm text-ink leading-tight">Webook Studio</div>
            <div className="text-[10px] font-mono text-brand-gold/60">4.0</div>
          </div>
        </Link>

        {/* New webook */}
        <div className="px-3 py-3 border-b border-white/[0.04]">
          <Link to="/editor" className="btn-gold w-full justify-center py-2 text-xs">
            <Plus size={14} />
            Nowy Webook
          </Link>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, href }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`sidebar-item ${active ? 'active' : ''}`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight size={12} className="ml-auto text-brand-blue/50" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-gold
                            flex items-center justify-center text-xs font-700 text-white flex-shrink-0">
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-600 text-ink truncate">Jan Kowalski</p>
              <p className="text-[10px] text-ink-3">Creator</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <LogOut size={13} className="text-ink-3 hover:text-red-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06]
                           bg-surface-0/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {title && (
              <h1 className="font-display font-700 text-lg text-ink">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {searchOpen ? (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="input text-sm py-1.5 px-3"
                  placeholder="Szukaj..."
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              ) : (
                <button className="btn-ghost py-1.5 px-3" onClick={() => setSearchOpen(true)}>
                  <Search size={15} />
                </button>
              )}
            </AnimatePresence>

            <button className="btn-ghost py-1.5 px-3 relative">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-gold" />
            </button>

            {actions}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
