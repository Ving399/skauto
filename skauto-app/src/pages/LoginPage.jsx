// src/pages/LoginPage.jsx
//Recuerda que este import es el que usas siempre que quieras usar Supabase
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
    <div>
      <h1>Bienvenido a SKAuto</h1>
      <button onClick={handleGoogleLogin}>
        Entrar con Google
      </button>
    </div>
  )
}

export default LoginPage