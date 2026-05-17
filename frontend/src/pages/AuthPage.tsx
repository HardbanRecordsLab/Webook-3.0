import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('hrl_local_app_auth', 'hrl-local-app-token')
    navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
      <p className="text-sm text-white/70">Local app access enabled.</p>
    </div>
  )
}