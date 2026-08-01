import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'quantumspectre@gmail.com',
  user_metadata: { username: 'QuantumSpectre55' },
}

const DEFAULT_PROFILE = {
  id: '00000000-0000-0000-0000-000000000000',
  username: 'QuantumSpectre55',
  email: 'quantumspectre@gmail.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setSession(data.session)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess) {
        setSession(sess)
      }
    })

    return () => sub.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(DEFAULT_PROFILE)
      return
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data)
      })
      .catch(() => setProfile(DEFAULT_PROFILE))
  }, [session])

  const user = session?.user || DEFAULT_USER

  const value = { session, user, profile, setProfile, loading }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
