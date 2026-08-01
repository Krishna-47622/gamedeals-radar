import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext.jsx'

const links = [
  { to: '/', label: 'Trending', end: true },
  { to: '/compare', label: 'Compare Prices' },
  { to: '/wishlist', label: 'My Wishlist' },
  { to: '/friends', label: 'Friends' },
  { to: '/messages', label: 'Messages' },
  { to: '/profile', label: 'Profile' },
]

export default function Nav() {
  const { profile } = useAuth()

  return (
    <nav className="nav">
      <div className="nav__brand">Deals<span>Radar</span></div>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => 'nav__link' + (isActive ? ' active' : '')}
        >
          {l.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
            alt=""
            style={{ width: 28, height: 28, borderRadius: '50%' }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile.username}</span>
        </div>
      )}
      <button className="btn btn--ghost" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    </nav>
  )
}
