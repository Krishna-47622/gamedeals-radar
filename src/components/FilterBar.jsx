import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getStores } from '../lib/dealsApi'

const SORT_OPTIONS = [
  { value: 'Deal Rating',  label: 'Deal Rating' },
  { value: 'Price',        label: 'Price: Low → High' },
  { value: '-Price',       label: 'Price: High → Low' },
  { value: 'Savings',      label: 'Discount %' },
  { value: 'Release',      label: 'Release Date' },
  { value: 'Title',        label: 'Alphabetical' },
]

const DISCOUNT_THRESHOLDS = [
  { label: '25%+', value: 25 },
  { label: '50%+', value: 50 },
  { label: '75%+', value: 75 },
  { label: '90%+', value: 90 },
]

const STORE_WHITELIST = ['Steam', 'Epic Games Store', 'GOG', 'Humble Store', 'Fanatical']

export default function FilterBar({ onChange }) {
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
  }, []) // eslint-disable-line

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

  return (
    <div className="filter-bar">
      {/* Sort */}
      <div className="filter-group">
        <label className="filter-label">Sort by</label>
        <select
          className="filter-select"
          value={sortBy}
          onChange={e => setParam('sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Store */}
      <div className="filter-group">
        <label className="filter-label">Store</label>
        <div className="filter-chips">
          {stores.map(st => (
            <button
              key={st.storeID}
              className={`filter-chip ${storeID === String(st.storeID) ? 'active' : ''}`}
              onClick={() => toggleStore(st.storeID)}
            >
              {st.storeName}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="filter-group">
        <label className="filter-label">
          Price: ${priceRange[0]} – ${priceRange[1] >= 70 ? '70+' : priceRange[1]}
        </label>
        <div className="filter-range-track">
          <input
            type="range" min={0} max={70} step={1}
            value={priceRange[0]}
            className="filter-range"
            onChange={e => {
              const v = Math.min(Number(e.target.value), priceRange[1] - 1)
              handlePriceChange(v, priceRange[1])
            }}
          />
          <input
            type="range" min={0} max={70} step={1}
            value={priceRange[1]}
            className="filter-range"
            onChange={e => {
              const v = Math.max(Number(e.target.value), priceRange[0] + 1)
              handlePriceChange(priceRange[0], v)
            }}
          />
        </div>
      </div>

      {/* Discount thresholds */}
      <div className="filter-group">
        <label className="filter-label">Discount</label>
        <div className="filter-chips">
          {DISCOUNT_THRESHOLDS.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-chip ${minSavings === value ? 'active' : ''}`}
              onClick={() => toggleDiscount(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="filter-group filter-toggles">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={onSale}
            onChange={e => setParam('onSale', e.target.checked ? '1' : '')}
          />
          On Sale
        </label>
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={e => setParam('freeOnly', e.target.checked ? '1' : '')}
          />
          Free Only
        </label>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button className="filter-clear" onClick={clearAll}>
          Clear filters
        </button>
      )}
    </div>
  )
}
