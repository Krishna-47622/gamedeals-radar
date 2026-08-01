import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Login() {
  const { user } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: signErr } = await supabase.auth.signUp({ email, password })
        if (signErr) throw signErr
        if (data.user) {
          const { error: profErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            username,
          })
          if (profErr) throw profErr
        }
      } else {
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signErr) throw signErr
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto' }}>
      <div className="eyebrow">GameDeals Radar</div>
      <h1>{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {mode === 'signup' && (
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        {error && <div style={{ color: 'var(--stale-red)', fontSize: 13 }}>{error}</div>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Working…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      <button
        className="btn btn--ghost"
        style={{ marginTop: 12, width: '100%' }}
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
      >
        {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create account'}
      </button>
    </div>
  )
}
