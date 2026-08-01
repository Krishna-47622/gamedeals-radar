import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Header({ searchVal = '', setSearchVal }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [internalSearch, setInternalSearch] = useState(searchVal)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (setSearchVal) {
      setSearchVal(internalSearch)
    } else {
      navigate(`/catalog?q=${encodeURIComponent(internalSearch)}`)
    }
  }

  return (
    <header className="gv-header">
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="gv-search-box">
        <svg className="gv-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search games, deals..."
          value={setSearchVal ? searchVal : internalSearch}
          onChange={(e) => {
            const val = e.target.value
            setInternalSearch(val)
            if (setSearchVal) setSearchVal(val)
          }}
          className="gv-search-input"
        />
      </form>

      {/* Top Header Actions (Icons + Profile) */}
      <div className="gv-header-actions">
        <button className="gv-icon-btn" title="Notifications">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <button className="gv-icon-btn" title="Cart">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>

        {/* User Profile Card */}
        {profile && (
          <div className="gv-user-profile" onClick={() => navigate('/profile')}>
            <img
              src={profile.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`}
              alt="User Avatar"
              className="gv-user-avatar"
            />
            <div className="gv-user-info">
              <span className="gv-user-name">{profile.username || 'QuantumSpectre55'}</span>
              <span className="gv-user-email">{profile.email || 'quantumspectre@gmail.com'}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
