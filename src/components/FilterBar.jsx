import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getStores } from '../lib/dealsApi'

const SORT_OPTIONS = [
  { value: 'Deal Rating',  label: '🔥 Deal Rating' },
  { value: 'Price',        label: '💲 Price: Low → High' },
  { value: '-Price',       label: '💎 Price: High → Low' },
  { value: 'Savings',      label: '⚡ Discount %' },
  { value: 'Release',      label: '📅 Release Date' },
  { value: 'Title',        label: '🔤 Alphabetical' },
]

const DISCOUNT_THRESHOLDS = [
  { label: '25%+', value: 25 },
  { label: '50%+', value: 50 },
  { label: '75%+', value: 75 },
  { label: '90%+', value: 90 },
]

const STORE_WHITELIST = ['Steam', 'Epic Games Store', 'GOG', 'Humble Store', 'Fanatical']

const STORE_ICONS = {
  Steam: '🎮',
  'Epic Games Store': '⚡',
  GOG: '🌌',
  'Humble Store': '🎁',
  Fanatical: '🔥',
}

export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [stores, setStores] = useState([])
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('lowerPrice') || 0),
    Number(searchParams.get('upperPrice') || 70),
  ])
  const [debounceTimer, setDebounceTimer] = useState(null)

  // Load store list (filtered to major stores only)
  useEffect(() => {
    getStores().then(s => {
      const list = Object.values(s).filter(st =>
        STORE_WHITELIST.some(name =>
          st.storeName?.toLowerCase().includes(name.toLowerCase())
        )
      )
      setStores(list)
    })
  }, [])

  // Sync price range from URL on mount
  useEffect(() => {
    setPriceRange([
      Number(searchParams.get('lowerPrice') || 0),
      Number(searchParams.get('upperPrice') || 70),
    ])
  }, [searchParams])

  // Read current filter state from URL
  const sortBy     = searchParams.get('sortBy')     || 'Deal Rating'
  const storeID    = searchParams.get('storeID')    || ''
  const onSale     = searchParams.get('onSale')     === '1'
  const freeOnly   = searchParams.get('freeOnly')   === '1'
  const minSavings = Number(searchParams.get('minSavings') || 0)

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === null || value === undefined || value === false) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    next.delete('page') // reset to page 0 on filter change
    setSearchParams(next)
  }

  function toggleStore(id) {
    setParam('storeID', storeID === String(id) ? '' : String(id))
  }

  function toggleDiscount(val) {
    setParam('minSavings', minSavings === val ? 0 : val)
  }

  // Debounce price slider
  const handlePriceChange = useCallback((low, high) => {
    setPriceRange([low, high])
    if (debounceTimer) clearTimeout(debounceTimer)
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      next.set('lowerPrice', low)
      next.set('upperPrice', high)
      next.delete('page')
      setSearchParams(next)
    }, 300)
    setDebounceTimer(t)
  }, [searchParams, debounceTimer, setSearchParams])

  function clearAll() {
    setSearchParams(new URLSearchParams())
    setPriceRange([0, 70])
  }

  const hasFilters = sortBy !== 'Deal Rating' || storeID || onSale || freeOnly ||
    minSavings > 0 || priceRange[0] > 0 || priceRange[1] < 70

  // Dynamic style for range fill
  const minPercent = (priceRange[0] / 70) * 100
  const maxPercent = (priceRange[1] / 70) * 100

  return (
    <div className="filter-bar glass">
      {/* Sort */}
      <div className="filter-group">
        <label className="filter-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="14" y2="12"></line>
            <line x1="4" y1="18" x2="8" y2="18"></line>
          </svg>
          Sort by
        </label>
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={sortBy}
            onChange={e => setParam('sortBy', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="filter-select-arrow">▼</span>
        </div>
      </div>

      {/* Store */}
      <div className="filter-group">
        <label className="filter-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Store
        </label>
        <div className="filter-chips">
          {stores.map(st => {
            const isActive = storeID === String(st.storeID)
            const icon = STORE_ICONS[st.storeName] || '🎮'
            return (
              <button
                key={st.storeID}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => toggleStore(st.storeID)}
              >
                <span className="filter-chip__icon">{icon}</span>
                <span>{st.storeName}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price range */}
      <div className="filter-group filter-group--range">
        <div className="filter-label-row">
          <label className="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Price Range
          </label>
          <span className="filter-price-pill">
            ${priceRange[0]} – ${priceRange[1] >= 70 ? '70+' : priceRange[1]}
          </span>
        </div>
        <div className="filter-range-track">
          <div
            className="filter-range-fill"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          <input
            type="range" min={0} max={70} step={1}
            value={priceRange[0]}
            className="filter-range filter-range--lower"
            onChange={e => {
              const v = Math.min(Number(e.target.value), priceRange[1] - 1)
              handlePriceChange(v, priceRange[1])
            }}
          />
          <input
            type="range" min={0} max={70} step={1}
            value={priceRange[1]}
            className="filter-range filter-range--upper"
            onChange={e => {
              const v = Math.max(Number(e.target.value), priceRange[0] + 1)
              handlePriceChange(priceRange[0], v)
            }}
          />
        </div>
      </div>

      {/* Discount thresholds */}
      <div className="filter-group">
        <label className="filter-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="5" x2="5" y2="19"></line>
            <circle cx="6.5" cy="6.5" r="2.5"></circle>
            <circle cx="17.5" cy="17.5" r="2.5"></circle>
          </svg>
          Min Discount
        </label>
        <div className="filter-chips">
          {DISCOUNT_THRESHOLDS.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-chip filter-chip--discount ${minSavings === value ? 'active' : ''}`}
              onClick={() => toggleDiscount(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="filter-group filter-toggles">
        <label className="filter-switch-label">
          <span className="filter-switch">
            <input
              type="checkbox"
              checked={onSale}
              onChange={e => setParam('onSale', e.target.checked ? '1' : '')}
            />
            <span className="filter-switch-slider" />
          </span>
          <span className="filter-switch-text">On Sale</span>
        </label>
        <label className="filter-switch-label">
          <span className="filter-switch">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={e => setParam('freeOnly', e.target.checked ? '1' : '')}
            />
            <span className="filter-switch-slider" />
          </span>
          <span className="filter-switch-text">Free Only 🎉</span>
        </label>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button className="filter-clear" onClick={clearAll} title="Reset all filters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Clear filters
        </button>
      )}
    </div>
  )
}
