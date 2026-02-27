import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell'

const TEMPLATES = [
  { id:'1', name:'Kurs Online', emoji:'🎓', cat:'Edukacja', desc:'Idealny dla twórców kursów — z quizami, certyfikatem i postępem nauki.', chapters:8, blocks:40, bg:'from-indigo-950 via-blue-900 to-indigo-800', accent:'#818cf8' },
  { id:'2', name:'Lead Magnet', emoji:'🚀', cat:'Marketing', desc:'Ebook który zbiera leady — z callout, checklistą i CTA.', chapters:5, blocks:22, bg:'from-orange-950 via-red-900 to-orange-800', accent:'#fb923c' },
  { id:'3', name:'Pitch Deck', emoji:'💼', cat:'Biznes', desc:'Prezentacja biznesowa z infografikami i slajdami.', chapters:10, blocks:35, bg:'from-slate-950 via-gray-900 to-slate-800', accent:'#94a3b8' },
  { id:'4', name:'Poradnik', emoji:'📖', cat:'Edukacja', desc:'Przewodnik krok po kroku z obrazami i calloutami.', chapters:6, blocks:28, bg:'from-teal-950 via-emerald-900 to-teal-800', accent:'#34d399' },
  { id:'5', name:'Portfolio', emoji:'🎨', cat:'Kreatywne', desc:'Showcase projektów z galerią i opisami case study.', chapters:4, blocks:18, bg:'from-purple-950 via-violet-900 to-purple-800', accent:'#c084fc' },
  { id:'6', name:'Raport', emoji:'📊', cat:'Biznes', desc:'Raport analityczny z danymi, wykresami i wnioskami.', chapters:7, blocks:32, bg:'from-cyan-950 via-blue-900 to-cyan-800', accent:'#22d3ee' },
]

export default function TemplatesPage() {
  const navigate = useNavigate()
  return (
    <AppShell title="Szablony">
      <div className="p-6">
        <p className="text-ink-2 text-sm mb-6">Wybierz szablon i zacznij tworzyć w kilka sekund.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {TEMPLATES.map(({ id, name, emoji, cat, desc, chapters, blocks, bg, accent }, i) => (
            <motion.div key={id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="card card-hover overflow-hidden cursor-pointer"
              onClick={() => navigate('/editor')}
            >
              <div className={`relative h-40 bg-gradient-to-br ${bg} flex items-center justify-center`}>
                <div className="absolute inset-0 grid-overlay opacity-30"/>
                <div className="w-24 h-24 rounded-full blur-3xl absolute" style={{ background: `${accent}33` }}/>
                <span className="relative text-5xl">{emoji}</span>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-600 bg-black/40 backdrop-blur-sm text-white border border-white/10">{cat}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-700 text-base text-ink mb-1">{name}</h3>
                <p className="text-xs text-ink-2 leading-relaxed mb-3">{desc}</p>
                <div className="flex gap-3 text-xs text-ink-3">
                  <span>{chapters} rozdziałów</span>
                  <span>·</span>
                  <span>{blocks} bloków</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
