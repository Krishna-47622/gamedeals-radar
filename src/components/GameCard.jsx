import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

// Skeleton shimmer card — same outer dimensions as GameCard
export function GameCardSkeleton() {
  return (
    <div className="game-card game-card--skeleton" aria-hidden="true">
      <div className="skeleton-thumb" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton-line" style={{ width: '65%' }} />
        <div className="skeleton-line" style={{ width: '35%', height: 10 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton-line" style={{ width: 56, height: 22 }} />
          <div className="skeleton-line" style={{ width: 40, height: 22 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        <div className="skeleton-line" style={{ width: 52, height: 32, borderRadius: 6 }} />
        <div className="skeleton-line" style={{ width: 52, height: 32, borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function GameCard({
  title, thumb, salePrice, normalPrice, savings, store, url, actions,
  gameId,        // CheapShark gameID — enables click-to-detail navigation
  storeCount,    // number of stores carrying this game
  glass = false,
}) {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  function handleCardClick(e) {
    // Don't navigate if clicking a button or link inside the card
    if (e.target.closest('button, a')) return
    if (gameId) navigate(`/game/${gameId}`)
  }

  return (
    <motion.div
      className={`game-card${glass ? ' glass' : ''}`}
      onClick={handleCardClick}
      style={{
        borderColor: glass ? 'var(--glass-border)' : 'var(--line)',
        cursor: gameId ? 'pointer' : 'default',
      }}
      whileHover={shouldReduce ? {} : {
        borderColor: glass ? 'var(--grad-start)' : 'var(--gold)',
        transition: { duration: 0.15 },
      }}
    >
      {/* Cover art */}
      <img src={thumb} alt="" />

      {/* Title + store + prices */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        {store && (
          <div className="eyebrow" style={{ marginTop: 2 }}>
            {store}
            {storeCount > 1 && (
              <span style={{ marginLeft: 6, color: 'var(--teal)', fontWeight: 600 }}>
                +{storeCount - 1} store{storeCount - 1 !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span className="game-card__price">${Number(salePrice).toFixed(2)}</span>
          {normalPrice > salePrice && (
            <span className="game-card__original">${Number(normalPrice).toFixed(2)}</span>
          )}
          {savings > 0.5 && <span className="game-card__discount">-{Math.round(savings)}%</span>}
        </div>
        {gameId && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.03em' }}>
            Click to compare all stores →
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        {url && (
          <a className="btn btn--ghost" href={url} target="_blank" rel="noreferrer">
            View
          </a>
        )}
        {actions && (
          <motion.div
            whileTap={shouldReduce ? {} : { scale: 0.92 }}
            transition={{ duration: 0.1 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
