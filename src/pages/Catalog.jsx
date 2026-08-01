import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCatalog, getRawgCover, compareGamePrices } from '../lib/dealsApi'
import FilterBar from '../components/FilterBar.jsx'
import Card3D from '../components/Card3D.jsx'
import { addToWishlist } from '../lib/wishlist'

// ---------------------------------------------------------------------------
// CatalogCard — 3D perspective card with cover, prices, & expandable store compare row
// ---------------------------------------------------------------------------
function CatalogCard({ deal }) {
  const [cover, setCover] = useState(deal.thumb)
  const [expanded, setExpanded] = useState(false)
  const [stores, setStores] = useState(null)
  const [loadingStores, setLoadingStores] = useState(false)
  const [wishlistAdded, setWishlistAdded] = useState(false)

  // Try RAWG for better cover art
  useEffect(() => {
    let cancelled = false
    getRawgCover(deal.title).then(img => {
      if (!cancelled && img) setCover(img)
    })
    return () => { cancelled = true }
  }, [deal.title])

  async function toggleCompare(e) {
    e.stopPropagation()
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (stores !== null) return
    setLoadingStores(true)
    const results = await compareGamePrices(deal.title)
    setStores(results)
    setLoadingStores(false)
  }

  async function handleAddToWishlist(e) {
    e.stopPropagation()
    setWishlistAdded(true)
    await addToWishlist({ external_id: deal.gameID, title: deal.title, cover_url: cover || deal.thumb })
    setTimeout(() => setWishlistAdded(false), 2000)
  }

  const discountPct = Math.round(deal.savings)

  return (
    <Card3D className="catalog-card-wrap" maxTilt={12} scale={1.02}>
      <div className="catalog-card glass">
        {/* Cover image with 3D depth layer */}
        <div className="catalog-card__cover">
          <img
            src={cover || deal.thumb}
            alt={deal.title}
            onError={() => setCover(`https://placehold.co/300x170/1B1E27/FF2B55?text=${encodeURIComponent(deal.title?.slice(0, 12) || 'Game')}`)}
          />
          <div className="catalog-card__cover-overlay" />
          
          {discountPct > 0 && (
            <span className="catalog-card__badge-3d">
              ⚡ -{discountPct}%
            </span>
          )}
          
          <span className="catalog-card__store-tag">
            {deal.store || 'Featured'}
          </span>
        </div>

        {/* Info Body */}
        <div className="catalog-card__body">
          <h3 className="catalog-card__title" title={deal.title}>
            {deal.title}
          </h3>

          <div className="catalog-card__prices-row">
            <div className="catalog-card__price-group">
              <span className="catalog-card__sale-price">${deal.salePrice.toFixed(2)}</span>
              {deal.normalPrice > deal.salePrice && (
                <span className="catalog-card__orig-price">${deal.normalPrice.toFixed(2)}</span>
              )}
            </div>
            {discountPct > 0 && (
              <span className="catalog-card__savings-label">
                Save ${(deal.normalPrice - deal.salePrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="catalog-card__actions">
            <a
              className="catalog-btn catalog-btn--primary"
              href={deal.url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              Get deal ↗
            </a>
            <button
              className={`catalog-btn catalog-btn--secondary ${wishlistAdded ? 'added' : ''}`}
              onClick={handleAddToWishlist}
              title="Add to wishlist"
            >
              {wishlistAdded ? '✓ Added' : '+ Wishlist'}
            </button>
            <button
              className={`catalog-btn catalog-btn--compare ${expanded ? 'active' : ''}`}
              onClick={toggleCompare}
            >
              Stores {expanded ? '▲' : '▼'}
            </button>
          </div>

          {/* Cross-store price comparison drawer */}
          {expanded && (
            <div className="catalog-card__compare-drawer" onClick={e => e.stopPropagation()}>
              <div className="catalog-card__compare-header">
                Store Comparison ({stores ? stores.length : '...'})
              </div>

              {loadingStores && (
                <div className="catalog-card__compare-loading">
                  <div className="loading-spinner" />
                  <span>Comparing live prices...</span>
                </div>
              )}

              {stores?.map(s => (
                <a
                  key={s.dealID}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="catalog-card__compare-row"
                >
                  <span className="catalog-card__compare-store">
                    <span className="store-bullet">●</span> {s.store}
                  </span>
                  <div className="catalog-card__compare-price-wrap">
                    <span className="catalog-card__compare-price">${s.salePrice.toFixed(2)}</span>
                    {s.savings > 0.5 && (
                      <span className="catalog-card__compare-badge">-{Math.round(s.savings)}%</span>
                    )}
                  </div>
                </a>
              ))}

              {stores?.length === 0 && (
                <div className="catalog-card__compare-empty">
                  No other store listings found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card3D>
  )
}

// ---------------------------------------------------------------------------
// Catalog page
// ---------------------------------------------------------------------------
export default function Catalog() {
  const [searchParams] = useSearchParams()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const prevKey = useRef('')

  // Build a key from current filter params to detect changes
  const filterKey = searchParams.toString()

  const fetchDeals = useCallback(async (pageNum, reset = false) => {
    setLoading(true)
    try {
      const rawSort = searchParams.get('sortBy') || 'Deal Rating'
      const sortBy = rawSort === '-Price' ? 'Price' : rawSort
      const reversePrice = rawSort === '-Price'

      const results = await getCatalog({
        page: pageNum,
        pageSize: 24,
        sortBy,
        storeID: searchParams.get('storeID') || '',
        upperPrice: Number(searchParams.get('upperPrice') || 70),
        lowerPrice: Number(searchParams.get('lowerPrice') || 0),
        onSale: searchParams.get('onSale') === '1',
        freeOnly: searchParams.get('freeOnly') === '1',
        minSavings: Number(searchParams.get('minSavings') || 0),
      })

      const sorted = reversePrice ? [...results].sort((a, b) => b.salePrice - a.salePrice) : results

      setDeals(prev => reset ? sorted : [...prev, ...sorted])
      setHasMore(results.length === 24)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Re-fetch when filters change
  useEffect(() => {
    if (filterKey === prevKey.current) return
    prevKey.current = filterKey
    setPage(0)
    fetchDeals(0, true)
  }, [filterKey, fetchDeals])

  // Initial load
  useEffect(() => {
    fetchDeals(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchDeals(next, false)
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header__badge">LIVE RADAR • CHEAPSHARK & RAWG</div>
        <h1 className="catalog-header__title">Game Catalog</h1>
        <p className="catalog-header__subtitle">
          Browse real-time deals across Steam, Epic, GOG & major stores in interactive 3D perspective.
        </p>
      </div>

      <FilterBar />

      {loading && deals.length === 0 && (
        <div className="catalog-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="catalog-card catalog-card--skeleton glass" />
          ))}
        </div>
      )}

      <div className="catalog-grid">
        {deals.map(d => (
          <CatalogCard key={d.dealID} deal={d} />
        ))}
      </div>

      {!loading && deals.length === 0 && (
        <div className="catalog-empty glass">
          <div className="catalog-empty__icon">🔍</div>
          <h3>No deals match your selected filters</h3>
          <p>Try clearing or broadening your store, price, or discount selection.</p>
        </div>
      )}

      {hasMore && !loading && deals.length > 0 && (
        <div className="catalog-load-more">
          <button className="catalog-btn catalog-btn--load" onClick={loadMore}>
            Load more deals
          </button>
        </div>
      )}

      {loading && deals.length > 0 && (
        <div className="catalog-loading-more">
          <div className="loading-spinner" />
          <span>Fetching next deals...</span>
        </div>
      )}
    </div>
  )
}
