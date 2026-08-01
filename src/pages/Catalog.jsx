import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCatalog, getRawgCover, compareGamePrices } from '../lib/dealsApi'
import FilterBar from '../components/FilterBar.jsx'
import { addToWishlist } from '../lib/wishlist'

// ---------------------------------------------------------------------------
// CatalogCard — rich card with cover, prices, expandable store compare row
// ---------------------------------------------------------------------------
function CatalogCard({ deal }) {
  const [cover, setCover] = useState(deal.thumb)
  const [expanded, setExpanded] = useState(false)
  const [stores, setStores] = useState(null)
  const [loadingStores, setLoadingStores] = useState(false)

  // Try RAWG for better cover art
  useEffect(() => {
    let cancelled = false
    getRawgCover(deal.title).then(img => {
      if (!cancelled && img) setCover(img)
    })
    return () => { cancelled = true }
  }, [deal.title])

  async function toggleCompare() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (stores !== null) return
    setLoadingStores(true)
    const results = await compareGamePrices(deal.title)
    setStores(results)
    setLoadingStores(false)
  }

  const discountPct = Math.round(deal.savings)

  return (
    <div className="catalog-card glass">
      {/* Cover */}
      <div className="catalog-card__cover">
        <img
          src={cover || deal.thumb}
          alt={deal.title}
          onError={() => setCover(`https://placehold.co/300x170/1B1E27/E8B84B?text=${encodeURIComponent(deal.title?.slice(0, 12) || 'Game')}`)}
        />
        {discountPct > 0 && (
          <span className="catalog-card__badge">-{discountPct}%</span>
        )}
      </div>

      {/* Info */}
      <div className="catalog-card__body">
        <div className="catalog-card__title" title={deal.title}>{deal.title}</div>
        <div className="catalog-card__store eyebrow">{deal.store}</div>

        <div className="catalog-card__prices">
          <span className="game-card__price">${deal.salePrice.toFixed(2)}</span>
          {deal.normalPrice > deal.salePrice && (
            <span className="game-card__original">${deal.normalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="catalog-card__actions">
          <a
            className="btn btn--ghost"
            href={deal.url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, padding: '6px 10px' }}
          >
            View deal ↗
          </a>
          <button
            className="btn"
            style={{ fontSize: 12, padding: '6px 10px' }}
            onClick={() => addToWishlist({ external_id: deal.gameID, title: deal.title, cover_url: cover || deal.thumb })}
          >
            + Wishlist
          </button>
          <button
            className={`btn btn--ghost catalog-card__compare-btn ${expanded ? 'active' : ''}`}
            style={{ fontSize: 12, padding: '6px 10px' }}
            onClick={toggleCompare}
          >
            Compare stores {expanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Cross-store compare row */}
        {expanded && (
          <div className="catalog-card__compare">
            {loadingStores && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Loading stores…</div>
            )}
            {stores?.map(s => (
              <a
                key={s.dealID}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="catalog-card__compare-row"
              >
                <span className="catalog-card__compare-store">{s.store}</span>
                <span className="catalog-card__compare-price">${s.salePrice.toFixed(2)}</span>
                {s.savings > 0.5 && (
                  <span className="game-card__discount">-{Math.round(s.savings)}%</span>
                )}
              </a>
            ))}
            {stores?.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                No other store listings found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
      // Map URL params → getCatalog options
      const rawSort = searchParams.get('sortBy') || 'Deal Rating'
      // CheapShark doesn't support descending via prefix; handle Price desc specially
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
    <div>
      <div className="eyebrow">Powered by CheapShark + RAWG</div>
      <h1>Game Catalog</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        Browse deals across every major store. Filter, sort, and compare prices.
      </p>

      <FilterBar />

      {loading && deals.length === 0 && (
        <div className="catalog-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="catalog-card catalog-card--skeleton" />
          ))}
        </div>
      )}

      <div className="catalog-grid">
        {deals.map(d => (
          <CatalogCard key={d.dealID} deal={d} />
        ))}
      </div>

      {!loading && deals.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginTop: 32, textAlign: 'center' }}>
          No deals match your filters. Try adjusting the search.
        </p>
      )}

      {hasMore && !loading && deals.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn btn--ghost" onClick={loadMore} style={{ padding: '10px 32px' }}>
            Load more
          </button>
        </div>
      )}

      {loading && deals.length > 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
          Loading…
        </p>
      )}
    </div>
  )
}
