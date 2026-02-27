import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import logo from '../assets/logo.png'

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="card max-w-md w-full p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"/>
        <img src={logo} alt="" className="h-10 w-10 object-contain mx-auto mb-4"/>
        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4"/>
        <h1 className="font-display font-800 text-2xl text-ink mb-2">Płatność zaakceptowana! 🎉</h1>
        <p className="text-ink-2 text-sm mb-6">Twój Webook jest teraz opublikowany. Link i QR kod do udostępnienia znajdziesz w dashboardzie.</p>
        <Link to="/dashboard" className="btn-gold w-full justify-center py-3">
          Przejdź do dashboardu <ArrowRight size={16}/>
        </Link>
      </motion.div>
    </div>
  )
}
