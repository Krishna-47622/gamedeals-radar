import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './lib/AuthContext.jsx'
import Nav from './components/Nav.jsx'
import Header from './components/Header.jsx'
import { PageTransition } from './components/motion.jsx'
import Login from './pages/Login.jsx'
import Trending from './pages/Trending.jsx'
import ComparePrices from './pages/ComparePrices.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Friends from './pages/Friends.jsx'
import Messages from './pages/Messages.jsx'
import Profile from './pages/Profile.jsx'
import Catalog from './pages/Catalog.jsx'
import GameDetail from './pages/GameDetail.jsx'
import Landing from './pages/Landing.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/landing'
  const isLogin = location.pathname === '/login'

  if (isLanding) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/landing" element={<PageTransition><Landing /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    )
  }

  if (isLogin) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    )
  }

  return (
    <div className="gv-app-shell">
      {user && <Nav />}

      <div className="gv-main-area">
        {user && <Header />}

        <div className="gv-page-body">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Protected><PageTransition><Trending /></PageTransition></Protected>} />
              <Route path="/catalog" element={<Protected><PageTransition><Catalog /></PageTransition></Protected>} />
              <Route path="/compare" element={<Protected><PageTransition><ComparePrices /></PageTransition></Protected>} />
              <Route path="/wishlist" element={<Protected><PageTransition><Wishlist /></PageTransition></Protected>} />
              <Route path="/friends" element={<Protected><PageTransition><Friends /></PageTransition></Protected>} />
              <Route path="/messages" element={<Protected><PageTransition><Messages /></PageTransition></Protected>} />
              <Route path="/messages/:conversationId" element={<Protected><PageTransition><Messages /></PageTransition></Protected>} />
              <Route path="/profile" element={<Protected><PageTransition><Profile /></PageTransition></Protected>} />
              <Route path="/game/:gameId" element={<Protected><PageTransition><GameDetail /></PageTransition></Protected>} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
