import { useNavigate } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Card3D from './Card3D.jsx'

// Skeleton shimmer card — same outer dimensions as GameCard
export function GameCardSkeleton() {
  return (
    <div className="game-card game-card--skeleton glass" aria-hidden="true">
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
  glass = true,
}) {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  function handleCardClick(e) {
    // Don't navigate if clicking a button or link inside the card
    if (e.target.closest('button, a')) return
    if (gameId) navigate(`/game/${gameId}`)
  }

  return (
    <Card3D
      maxTilt={shouldReduce ? 0 : 10}
      scale={1.02}
      onClick={handleCardClick}
      disabled={shouldReduce}
      style={{ cursor: gameId ? 'pointer' : 'default' }}
    >
      <div className={`game-card${glass ? ' glass' : ''}`}>
        {/* Cover art with 3D layer */}
        <div className="game-card__media">
          <img src={thumb} alt={title || ''} className="game-card__img" />
          {savings > 0.5 && (
            <span className="game-card__badge-3d">
              -{Math.round(savings)}%
            </span>
          )}
        </div>

        {/* Title + store + prices */}
        <div className="game-card__info">
          <div className="game-card__title" title={title}>{title}</div>
          {store && (
            <div className="game-card__store">
              {store}
              {storeCount > 1 && (
                <span className="game-card__store-count">
                  +{storeCount - 1} store{storeCount - 1 !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          <div className="game-card__prices">
            <span className="game-card__price">${Number(salePrice).toFixed(2)}</span>
            {normalPrice > salePrice && (
              <span className="game-card__original">${Number(normalPrice).toFixed(2)}</span>
            )}
          </div>
          {gameId && (
            <div className="game-card__hint">
              Click to compare stores →
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="game-card__actions">
          {url && (
            <a
              className="catalog-btn catalog-btn--primary"
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              View
            </a>
          )}
          {actions && (
            <motion.div
              whileTap={shouldReduce ? {} : { scale: 0.94 }}
              transition={{ duration: 0.1 }}
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </Card3D>
  )
}
