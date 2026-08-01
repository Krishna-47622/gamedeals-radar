import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGameDetails } from '../lib/dealsApi'
import { addToWishlist } from '../lib/wishlist'

const defaultScreenshots = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
]

export default function GameDetail() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBgIndex, setSelectedBgIndex] = useState(0)

  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    getGameDetails(gameId)
      .then((data) => {
        setGame(data)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [gameId])

  const title = game?.info?.title || 'Hogwarts Legacy'
  const thumb = game?.info?.thumb || defaultScreenshots[0]
  const cheapestOffer = game?.deals?.[0]
  const salePrice = cheapestOffer?.price || '24.00'
  const normalPrice = cheapestOffer?.retailPrice || '35.99'

  const galleryImages = [
    thumb,
    ...defaultScreenshots
  ]

  const activeHeroBg = galleryImages[selectedBgIndex] || thumb

  return (
    <div className="gv-detail-page">
      {/* Top Bar with Back Button */}
      <div className="gv-detail-top-nav">
        <button className="gv-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Main Hero Frame with Gameplay backdrop & Left Floating Content */}
      <div className="gv-detail-hero-frame">
        <div
          className="gv-detail-hero-bg"
          style={{ backgroundImage: `url(${activeHeroBg})` }}
        />
        <div className="gv-detail-hero-overlay" />

        <div className="gv-detail-content-wrap">
          {/* Left Poster Image */}
          <div className="gv-detail-poster-card">
            <img src={thumb} alt={title} className="gv-detail-poster-img" />
          </div>

          {/* Detailed Info Column */}
          <div className="gv-detail-main-info">
            <div className="gv-detail-header-row">
              <h1 className="gv-detail-title">{title}</h1>
              <div className="gv-detail-rating">
                <span className="gv-rating-star">★</span>
                <span>4.9</span>
              </div>
            </div>

            <p className="gv-detail-desc">
              {title} is an immersive, open-world action RPG set in a rich magical universe. For the first time, experience life in a stunningly detailed environment, forge alliances, and discover secrets.
            </p>

            {/* Platform Badges */}
            <div className="gv-platform-pills">
              <div className="gv-platform-chip">
                <span>💻</span> PC
              </div>
              <div className="gv-platform-chip">
                <span>🎮</span> Series X/S
              </div>
              <div className="gv-platform-chip">
                <span>⚡</span> PS5
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="gv-detail-specs-grid">
              <div className="gv-spec-item">
                <span className="gv-spec-label">Release Date</span>
                <span className="gv-spec-value">February 10, 2023</span>
              </div>
              <div className="gv-spec-item">
                <span className="gv-spec-label">Manufacturer</span>
                <span className="gv-spec-value">Warner Bros. Games</span>
              </div>
              <div className="gv-spec-item">
                <span className="gv-spec-label">Developer</span>
                <span className="gv-spec-value">Avalanche Software</span>
              </div>
              <div className="gv-spec-item">
                <span className="gv-spec-label">Genre</span>
                <span className="gv-spec-value">Action/RPG</span>
              </div>
            </div>

            {/* CTA Group */}
            <div className="gv-hero-cta-group" style={{ marginTop: 8 }}>
              <a
                className="gv-buy-pill-btn"
                href={cheapestOffer ? `https://www.cheapshark.com/redirect?dealID=${cheapestOffer.dealID}` : '#'}
                target="_blank"
                rel="noreferrer"
              >
                <span>Buy now</span>
                <div className="gv-price-split">
                  <span className="gv-price-sale">${Number(salePrice).toFixed(2)}</span>
                  {Number(normalPrice) > Number(salePrice) && (
                    <span className="gv-price-old">${Number(normalPrice).toFixed(2)}</span>
                  )}
                </div>
              </a>

              <button
                className="gv-icon-heart-btn"
                title="Add to wishlist"
                onClick={() => addToWishlist({ external_id: gameId, title, cover_url: thumb })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Screenshot Gallery Carousel */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Gameplay Screenshots</h3>
        <div className="gv-gallery-carousel">
          {galleryImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`gv-gallery-thumb ${selectedBgIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedBgIndex(idx)}
            >
              <img src={imgUrl} alt={`Screenshot ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
