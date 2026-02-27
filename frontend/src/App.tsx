import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import ReaderPage from './pages/ReaderPage'
import TemplatesPage from './pages/TemplatesPage'
import MarketplacePage from './pages/MarketplacePage'
import PaymentSuccess from './pages/PaymentSuccess'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/reader/:id" element={<ReaderPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  )
}
