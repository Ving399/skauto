// src/pages/LoginPage.jsx
import { supabase } from '../supabaseClient'

function LoginPage() {

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173'
      }
    })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">SKAuto</h1>
        <p className="login-card__subtitle">Iniciá sesión para continuar</p>
        <button className="login-card__button" onClick={handleGoogleLogin}>
          Entrar con Google
        </button>
      </div>
    </div>
  )
}

export default LoginPage
