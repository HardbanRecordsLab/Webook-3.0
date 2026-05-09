import { useEffect } from 'react'

/**
 * AuthPage — Redirect do centralnego logowania
 * 
 * Logowanie odbywane jest poprzez WordPress:
 * https://hardbanrecordslab.online/login
 * 
 * Po zalogowaniu, token JWT jest dostępny jako cookie na domenie
 * .hardbanrecordslab.online i synchronizowany do wszystkich aplikacji
 */

export default function AuthPage() {
  useEffect(() => {
    // Redirect do WordPress logowania z powrotem do tej aplikacji
    const returnUrl = encodeURIComponent(window.location.origin);
    const wpLoginUrl = import.meta.env.VITE_WP_LOGIN_URL || 'https://hardbanrecordslab.online/login';
    window.location.href = `${wpLoginUrl}?redirect_to=${returnUrl}`;
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(168,85,247,0.3)',
        borderTop: '3px solid #a855f7',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#888', fontSize: '14px' }}>Redirecting to login...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

            Rejestrując się akceptujesz{' '}
            <a href="#" className="hover:text-ink-2 underline">Regulamin</a> i{' '}
            <a href="#" className="hover:text-ink-2 underline">Politykę Prywatności</a>
          </p>
        </div>
      </div>
    </div>
  )
}
