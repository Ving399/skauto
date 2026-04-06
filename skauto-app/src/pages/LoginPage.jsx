// src/pages/LoginPage.jsx
import { supabase } from '../supabaseClient'
import logoSkauto from '../assets/icons/logo.svg'
import userIcon from '../assets/icons/user.svg'

function LoginPage() {

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="login-card__logo" src={logoSkauto} alt="SKAuto" />
        <p className="login-card__subtitle">Iniciá sesión para continuar</p>
        <button className="login-card__button" onClick={handleGoogleLogin}>
          <img className="login-card__button-icon" src={userIcon} alt="" />
          Entrar con Google
        </button>
      </div>
    </div>
  )
}

export default LoginPage
