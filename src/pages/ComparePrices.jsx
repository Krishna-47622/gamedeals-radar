import { useState } from 'react'
import { compareGamePrices } from '../lib/dealsApi'
import { addToWishlist } from '../lib/wishlist'
import GameCard from '../components/GameCard.jsx'

export default function ComparePrices() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const res = await compareGamePrices(query.trim())
    setResults(res)
    setLoading(false)
  }

  return (
    <div>
      <div className="eyebrow">Search & compare</div>
      <h1>Compare prices</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        Same game, every store, sorted cheapest first.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <input
          style={{ flex: 1 }}
          placeholder="e.g. Elden Ring"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>No listings found for "{query}".</p>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
        {results.map(r => (
          <GameCard
            key={r.dealID}
            title={r.title}
            thumb={r.thumb}
            salePrice={r.salePrice}
            normalPrice={r.normalPrice}
            savings={r.savings}
            store={r.store}
            url={r.url}
            actions={
              <button
                className="btn"
                onClick={() => addToWishlist({ external_id: r.gameId, title: r.title, cover_url: r.thumb })}
              >
                + Wishlist
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}
