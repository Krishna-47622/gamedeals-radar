import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Nav from './components/Nav.jsx'
import DealTicker from './components/DealTicker.jsx'
import Login from './pages/Login.jsx'
import Trending from './pages/Trending.jsx'
import ComparePrices from './pages/ComparePrices.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Friends from './pages/Friends.jsx'
import Messages from './pages/Messages.jsx'
import Profile from './pages/Profile.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <div>
      {user && <DealTicker />}
      <div className="app-shell">
        {user && <Nav />}
        <div className="main" style={{ maxWidth: user ? '1100px' : '100%' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Trending /></Protected>} />
            <Route path="/compare" element={<Protected><ComparePrices /></Protected>} />
            <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
            <Route path="/friends" element={<Protected><Friends /></Protected>} />
            <Route path="/messages" element={<Protected><Messages /></Protected>} />
            <Route path="/messages/:conversationId" element={<Protected><Messages /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
