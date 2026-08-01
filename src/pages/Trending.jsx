import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTrendingDeals } from '../lib/dealsApi'
import { addToWishlist } from '../lib/wishlist'
import Card3D from '../components/Card3D.jsx'

const categories = ['Magic', 'Fantasy', 'Open World', 'Adventure', 'RPG', 'Action']

export default function Trending() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Magic')
  const navigate = useNavigate()
  const gridRef = useRef(null)

  useEffect(() => {
    getTrendingDeals({ pageSize: 30 })
      .then((d) => setDeals(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Featured game for Hero
  const heroDeal = deals.find(d => d.title?.toLowerCase().includes('hogwarts')) || deals[0] || {
    gameID: '254884',
    title: 'Hogwarts Legacy',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    salePrice: '24.00',
    normalPrice: '35.99',
    description: 'Hogwarts Legacy is an immersive, open-world action RPG set in the world first introduced in the Harry Potter books.'
  }

  const scrollGrid = (direction) => {
    if (gridRef.current) {
      gridRef.current.scrollBy({
        left: direction === 'left' ? -350 : 350,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="gv-home-view">
      {/* Category Tag Pills */}
      <div className="gv-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`gv-tag-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Hero Banner */}
      {heroDeal && (
        <Card3D maxTilt={6} scale={1.01} className="gv-hero-card-3d">
          <div className="gv-hero-card">
            <div
              className="gv-hero-bg"
              style={{
                backgroundImage: `url(${heroDeal.thumb?.replace('capsule_sm_120', 'header') || heroDeal.thumb})`
              }}
            />
            <div className="gv-hero-overlay" />

            <div className="gv-hero-content">
              <span className="gv-hero-badge">FEATURED DEAL</span>
              <h1 className="gv-hero-title">{heroDeal.title}</h1>
              <p className="gv-hero-desc">
                {heroDeal.description || `${heroDeal.title} is an immersive action experience set in a rich gaming world. Explore vast landscapes, engage in intense combat, and define your destiny.`}
              </p>

              <div className="gv-hero-cta-group">
                <button
                  className="gv-buy-pill-btn"
                  onClick={() => navigate(`/game/${heroDeal.gameID}`)}
                >
                  <span>Buy now</span>
                  <div className="gv-price-split">
                    <span className="gv-price-sale">${Number(heroDeal.salePrice).toFixed(2)}</span>
                    {heroDeal.normalPrice > heroDeal.salePrice && (
                      <span className="gv-price-old">${Number(heroDeal.normalPrice).toFixed(2)}</span>
                    )}
                  </div>
                </button>

                <button
                  className="gv-icon-heart-btn"
                  title="Add to wishlist"
                  onClick={() => addToWishlist({ external_id: heroDeal.gameID, title: heroDeal.title, cover_url: heroDeal.thumb })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Card3D>
      )}

      {/* "Actual games" Section Header & Carousel */}
      <div className="gv-section-bar" style={{ marginTop: 28 }}>
        <h2 className="gv-section-heading">Trending Deals</h2>
        <div className="gv-carousel-arrows">
          <button className="gv-arrow-btn" onClick={() => scrollGrid('left')} title="Scroll left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="gv-arrow-btn" onClick={() => scrollGrid('right')} title="Scroll right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Games Cards Grid / Carousel */}
      {loading ? (
        <div className="gv-games-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="gv-game-card catalog-card--skeleton glass" style={{ height: 280 }} />
          ))}
        </div>
      ) : (
        <div
          ref={gridRef}
          className="gv-games-grid"
        >
          {deals.map((deal) => (
            <Card3D
              key={deal.dealID || deal.gameID}
              maxTilt={12}
              scale={1.03}
              onClick={() => navigate(`/game/${deal.gameID}`)}
            >
              <div className="gv-game-card glass">
                <div className="gv-card-media">
                  <img
                    src={deal.thumb?.replace('capsule_sm_120', 'header') || deal.thumb}
                    alt={deal.title}
                    className="gv-card-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="gv-card-price-tag">
                    ${Number(deal.salePrice).toFixed(2)}
                  </div>
                  {deal.savings > 0 && (
                    <div className="catalog-card__badge-3d" style={{ top: 10, right: 10, left: 'auto' }}>
                      -{Math.round(deal.savings)}%
                    </div>
                  )}
                </div>
                <div className="gv-card-info">
                  <h3 className="gv-card-title">{deal.title}</h3>
                  <div className="gv-card-meta">
                    <span>{deal.store || 'Steam'}</span>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      )}
    </div>
  )
}
