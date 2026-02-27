import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '../components/AppShell'

const WEBOOKS = [
  { id:'1', title:'Next.js 15 Masterclass', author:'Anna K.', price:49, rating:4.9, views:1240, emoji:'⚛️', bg:'from-indigo-950 to-blue-900', cat:'Dev' },
  { id:'2', title:'SEO dla Twórców 2025', author:'Marek P.', price:29, rating:4.7, views:890, emoji:'🔍', bg:'from-green-950 to-teal-900', cat:'Marketing' },
  { id:'3', title:'Copywriting który sprzedaje', author:'Zofia M.', price:39, rating:4.8, views:2100, emoji:'✍️', bg:'from-orange-950 to-red-900', cat:'Marketing' },
  { id:'4', title:'Design System od podstaw', author:'Piotr W.', price:59, rating:5.0, views:430, emoji:'🎨', bg:'from-purple-950 to-violet-900', cat:'Design' },
  { id:'5', title:'Excel dla Analityków', author:'Kasia B.', price:25, rating:4.6, views:1800, emoji:'📊', bg:'from-emerald-950 to-teal-900', cat:'Dane' },
  { id:'6', title:'Produktywność AI 2025', author:'Tomek R.', price:35, rating:4.9, views:3200, emoji:'🤖', bg:'from-cyan-950 to-blue-900', cat:'AI' },
]

export default function MarketplacePage() {
  const [q, setQ] = useState('')
  const filtered = WEBOOKS.filter(w => w.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <AppShell title="Marketplace">
      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"/>
          <input className="input pl-10" placeholder="Szukaj Webooków..." value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(({ id, title, author, price, rating, views, emoji, bg, cat }, i) => (
            <motion.div key={id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="card card-hover overflow-hidden"
            >
              <div className={`h-32 bg-gradient-to-br ${bg} flex items-center justify-center relative`}>
                <div className="absolute inset-0 grid-overlay opacity-30"/>
                <span className="text-4xl relative">{emoji}</span>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-600 bg-black/50 text-white">{cat}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-700 text-sm text-ink mb-1">{title}</h3>
                <p className="text-xs text-ink-3 mb-3">by {author} · {views.toLocaleString()} wyświetleń · ⭐ {rating}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-800 text-lg text-brand-gold">${price}</span>
                  <button onClick={() => toast.success('💳 Przekierowanie do płatności...')}
                    className="btn-primary py-1.5 px-3 text-xs">
                    <ShoppingCart size={12}/> Kup
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
