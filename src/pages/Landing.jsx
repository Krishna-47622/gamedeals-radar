import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { getTrendingDeals } from '../lib/dealsApi'
import { supabase } from '../lib/supabaseClient'

// Tilt angles for the fanned-deck look
const TILTS = [-6, 4, -3, 5, -4]

// Animated number counter
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (shouldReduce || !target) { setCount(target); return }
    const duration = 1400
    const start = performance.now()
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, shouldReduce])

  if (!target) return <span>—</span>
  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const [deals, setDeals] = useState([])
  const [stats, setStats] = useState({ games: null, deals: null })
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    getTrendingDeals({ pageSize: 8 }).then(setDeals)

    // Real Supabase counts
    Promise.all([
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('wishlist').select('*', { count: 'exact', head: true }),
    ]).then(([gamesRes, wishRes]) => {
      setStats({
        games: gamesRes.count ?? 0,
        deals: wishRes.count ?? 0,
      })
      // Trigger count-up when set
      setTimeout(() => setStatsVisible(true), 200)
    })
  }, [])

  const featured = deals[0]
  const deckDeals = deals.slice(0, 5)

  // Container + card entrance variants
  const deckContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  }
  const cardVariant = (i) => ({
    hidden: { opacity: 0, y: 40, rotate: 0 },
    show:   {
      opacity: 1,
      y: 0,
      rotate: TILTS[i] ?? 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  })

  return (
    <div className="landing">
      {/* ── TOP NAV ── */}
      <nav className="landing-nav">
        <a className="landing-nav__logo" href="/">
          Deals<span>Radar</span>
        </a>
        <ul className="landing-nav__links">
          <li><a href="#trending">Trending</a></li>
          <li><a href="#stats">Stats</a></li>
          <li><a href="#catalog">Catalog</a></li>
        </ul>
        <button className="landing-nav__cta" onClick={() => navigate('/login')}>
          Launch App →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        {/* LEFT: headline + CTA */}
        <motion.div
          className="landing-hero__left"
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-hero__eyebrow">
            ⚡ Real-time deals · 30+ stores tracked
          </div>

          <h1 className="landing-hero__headline">
            Never pay<br />full price<br />for <em>games again</em>
          </h1>

          <p className="landing-hero__sub">
            GameDeals Radar compares prices across every major PC gaming store in real-time,
            alerts you on price drops, and helps you build the perfect wishlist.
          </p>

          <div className="landing-hero__actions">
            <button
              className="landing-hero__btn-primary"
              onClick={() => navigate('/login')}
            >
              Get started free →
            </button>
            <button
              className="landing-hero__btn-ghost"
              onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See trending deals
            </button>
          </div>
        </motion.div>

        {/* RIGHT: floating tilted cover card */}
        <motion.div
          className="landing-hero__right"
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
          animate={shouldReduce ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Pulsing glow blob */}
          <div className={`landing-hero__glow${shouldReduce ? ' no-anim' : ''}`} />

          {featured && (
            <div
              className="landing-hero__cover-card"
              onClick={() => navigate(`/game/${featured.gameID}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={featured.thumb}
                alt={featured.title}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="landing-hero__cover-badge">
                <span className="landing-hero__cover-title">{featured.title}</span>
                <span className="landing-hero__cover-price">
                  ${Number(featured.salePrice).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Floating mini-badge above card */}
          {featured?.savings > 0.5 && (
            <motion.div
              style={{
                position: 'absolute',
                top: '12%',
                right: '8%',
                background: 'linear-gradient(135deg, var(--grad-start), var(--grad-end))',
                color: '#fff',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 999,
                boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
                zIndex: 5,
              }}
              initial={shouldReduce ? {} : { y: 0 }}
              animate={shouldReduce ? {} : { y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              -{Math.round(featured.savings)}% OFF
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <div id="stats" className="stats-strip">
        <div className="stats-strip__item">
          <span className="stats-strip__number">
            {statsVisible
              ? <CountUp target={stats.games || 12000} suffix="+" />
              : '—'}
          </span>
          <span className="stats-strip__label">Games tracked</span>
        </div>
        <div className="stats-strip__item">
          <span className="stats-strip__number">
            <CountUp target={30} suffix="+" />
          </span>
          <span className="stats-strip__label">Stores compared</span>
        </div>
        <div className="stats-strip__item">
          <span className="stats-strip__number">
            {statsVisible
              ? <CountUp target={stats.deals || 500} suffix="+" />
              : '—'}
          </span>
          <span className="stats-strip__label">Wishlists tracked</span>
        </div>
      </div>

      {/* ── FLOATING CARD DECK ── */}
      <section id="trending" className="landing-section">
        <p className="landing-section__label">Trending now</p>
        <h2 className="landing-section__title">
          Top deals this week
        </h2>

        {deckDeals.length > 0 && (
          <motion.div
            className="floating-deck"
            variants={deckContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {deckDeals.map((deal, i) => (
              <motion.div
                key={deal.gameID}
                className="floating-deck__card"
                custom={i}
                variants={cardVariant(i)}
                whileHover={shouldReduce ? {} : {
                  rotate: 0,
                  scale: 1.06,
                  boxShadow: '0 24px 60px rgba(168,85,247,0.35), 0 0 0 1px rgba(168,85,247,0.4)',
                  zIndex: 10,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                onClick={() => navigate(`/game/${deal.gameID}`)}
              >
                <img
                  src={deal.thumb}
                  alt={deal.title}
                  onError={(e) => {
                    e.target.src = `https://placehold.co/200x280/12131C/A855F7?text=${encodeURIComponent(deal.title?.slice(0,8) || 'Game')}`
                  }}
                  style={{ height: 280, objectFit: 'cover' }}
                />
                {deal.savings > 0.5 && (
                  <span className="floating-deck__badge">
                    -{Math.round(deal.savings)}%
                  </span>
                )}
                <div className="floating-deck__card-title">{deal.title}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button
            className="landing-hero__btn-primary"
            onClick={() => navigate('/login')}
            style={{ fontSize: 14, padding: '12px 28px' }}
          >
            View all deals in the app →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '32px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>
          Deals<span style={{
            background: 'linear-gradient(135deg, var(--grad-start), var(--grad-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Radar</span>
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Powered by CheapShark API · Prices update live
        </span>
        <button
          className="landing-nav__cta"
          style={{ fontSize: 13, padding: '8px 18px' }}
          onClick={() => navigate('/login')}
        >
          Sign in
        </button>
      </footer>
    </div>
  )
}
